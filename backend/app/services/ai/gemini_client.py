import json
import os
import time
from pathlib import Path
from typing import Any
from urllib import error, parse, request

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[3] / ".env")


RETRIABLE_STATUS_CODES = {429, 500, 503, 504}
DEFAULT_TIMEOUT_SECONDS = 45
DEFAULT_MAX_RETRIES = 3


class GeminiClientError(RuntimeError):
    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        provider_message: str | None = None,
        retriable: bool = False,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.provider_message = provider_message
        self.retriable = retriable


class GeminiClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        primary_model = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview").strip()
        fallback_models = os.getenv(
            "GEMINI_FALLBACK_MODELS",
            "gemini-3.1-flash-lite-preview,gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash",
        ).strip()
        self.models = self._build_model_chain(primary_model, fallback_models)
        self.last_model_used = self.models[0] if self.models else primary_model

    @staticmethod
    def _build_model_chain(primary_model: str, fallback_models: str) -> list[str]:
        ordered_models: list[str] = []
        for model in [primary_model, *fallback_models.split(",")]:
            cleaned = model.strip()
            if cleaned and cleaned not in ordered_models:
                ordered_models.append(cleaned)
        return ordered_models

    def ensure_configured(self) -> None:
        if not self.api_key:
            raise GeminiClientError(
                "Gemini API key not configured. Add GEMINI_API_KEY to backend/.env.",
                retriable=False,
            )

    def _make_2_0_schema_compatible(self, schema: Any) -> Any:
        if isinstance(schema, dict):
            adjusted = {
                key: self._make_2_0_schema_compatible(value)
                for key, value in schema.items()
            }
            properties = adjusted.get("properties")
            if isinstance(properties, dict) and "propertyOrdering" not in adjusted:
                adjusted["propertyOrdering"] = list(properties.keys())
            return adjusted

        if isinstance(schema, list):
            return [self._make_2_0_schema_compatible(item) for item in schema]

        return schema

    def _build_request_payload(self, model: str, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        request_schema = (
            self._make_2_0_schema_compatible(schema)
            if model.startswith("gemini-2.0")
            else schema
        )
        return {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json",
                "responseJsonSchema": request_schema,
            },
        }

    def _build_request(self, model: str, prompt: str, schema: dict[str, Any]) -> request.Request:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?{parse.urlencode({'key': self.api_key})}"
        )
        payload = self._build_request_payload(model, prompt, schema)
        return request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

    @staticmethod
    def _extract_provider_error(raw_body: str | None) -> str | None:
        if not raw_body:
            return None

        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError:
            cleaned = raw_body.strip()
            return cleaned or None

        message = ((payload.get("error") or {}).get("message") or "").strip()
        return message or None

    def _request_json(self, http_request: request.Request) -> dict[str, Any]:
        try:
            with request.urlopen(http_request, timeout=DEFAULT_TIMEOUT_SECONDS) as response:
                raw_body = response.read().decode("utf-8")
        except error.HTTPError as exc:
            raw_body = exc.read().decode("utf-8", errors="replace")
            provider_message = self._extract_provider_error(raw_body)
            raise GeminiClientError(
                provider_message or "Gemini request failed.",
                status_code=exc.code,
                provider_message=provider_message,
                retriable=exc.code in RETRIABLE_STATUS_CODES,
            ) from exc
        except error.URLError as exc:
            raise GeminiClientError(
                "Gemini could not be reached. Please try again shortly.",
                provider_message=str(exc.reason),
                retriable=True,
            ) from exc

        try:
            return json.loads(raw_body)
        except json.JSONDecodeError as exc:
            raise GeminiClientError(
                "Gemini returned an unreadable response.",
                provider_message=raw_body[:500],
                retriable=True,
            ) from exc

    def _extract_text_from_response(self, response_data: dict[str, Any]) -> str:
        prompt_feedback = response_data.get("promptFeedback") or {}
        block_reason = prompt_feedback.get("blockReason")
        if block_reason and not response_data.get("candidates"):
            raise GeminiClientError(
                f"Gemini blocked the request: {block_reason}.",
                provider_message=json.dumps(prompt_feedback),
                retriable=False,
            )

        candidates = response_data.get("candidates") or []
        if not candidates:
            raise GeminiClientError(
                "Gemini returned no candidates for this request.",
                provider_message=json.dumps(response_data)[:500],
                retriable=True,
            )

        texts: list[str] = []
        finish_reasons: list[str] = []

        for candidate in candidates:
            finish_reason = candidate.get("finishReason")
            if finish_reason:
                finish_reasons.append(str(finish_reason))

            content = candidate.get("content") or {}
            parts = content.get("parts") or []
            for part in parts:
                if not isinstance(part, dict):
                    continue
                text = part.get("text")
                if isinstance(text, str) and text.strip():
                    texts.append(text.strip())

        if texts:
            return "\n".join(texts)

        if finish_reasons:
            unique_reasons = ", ".join(sorted(set(finish_reasons)))
            raise GeminiClientError(
                f"Gemini did not return text content. Finish reason: {unique_reasons}.",
                provider_message=json.dumps(response_data)[:500],
                retriable="STOP" not in unique_reasons,
            )

        raise GeminiClientError(
            "Gemini returned an empty response.",
            provider_message=json.dumps(response_data)[:500],
            retriable=True,
        )

    @staticmethod
    def _strip_code_fences(value: str) -> str:
        cleaned = value.strip()
        if cleaned.startswith("```") and cleaned.endswith("```"):
            lines = cleaned.splitlines()
            if len(lines) >= 3:
                return "\n".join(lines[1:-1]).strip()
        return cleaned

    def _extract_json_blob(self, value: str) -> str:
        cleaned = self._strip_code_fences(value)

        try:
            json.loads(cleaned)
            return cleaned
        except json.JSONDecodeError:
            pass

        for opener, closer in (("{", "}"), ("[", "]")):
            start = cleaned.find(opener)
            end = cleaned.rfind(closer)
            if start == -1 or end == -1 or end <= start:
                continue

            candidate = cleaned[start : end + 1].strip()
            try:
                json.loads(candidate)
                return candidate
            except json.JSONDecodeError:
                continue

        raise GeminiClientError(
            "Gemini returned text, but it was not valid JSON.",
            provider_message=cleaned[:500],
            retriable=True,
        )

    @staticmethod
    def _sleep_before_retry(attempt: int) -> None:
        time.sleep(min(2**attempt, 8))

    def generate_json(self, prompt: str, schema: dict[str, Any]) -> tuple[dict[str, Any], str]:
        self.ensure_configured()
        last_error: GeminiClientError | None = None

        for model in self.models:
            for attempt in range(DEFAULT_MAX_RETRIES):
                http_request = self._build_request(model, prompt, schema)

                try:
                    response_data = self._request_json(http_request)
                    response_text = self._extract_text_from_response(response_data)
                    json_blob = self._extract_json_blob(response_text)
                    self.last_model_used = model
                    return json.loads(json_blob), model
                except GeminiClientError as exc:
                    last_error = exc
                    if not exc.retriable or attempt == DEFAULT_MAX_RETRIES - 1:
                        break
                    self._sleep_before_retry(attempt)

        if last_error is not None:
            raise last_error

        raise GeminiClientError(
            "Gemini request failed unexpectedly.",
            retriable=True,
        )


gemini_client = GeminiClient()
