import json
import os
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

try:
    from google import genai
    from google.genai import errors as genai_errors
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_errors = None
    genai_types = None


load_dotenv(Path(__file__).resolve().parents[3] / ".env")


RETRIABLE_STATUS_CODES = {429, 500, 503, 504}
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
        self.api_version = os.getenv("GEMINI_API_VERSION", "v1beta").strip() or "v1beta"
        primary_model = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview").strip()
        fallback_models = os.getenv(
            "GEMINI_FALLBACK_MODELS",
            "gemini-3.1-flash-lite-preview,gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash",
        ).strip()
        self.models = self._build_model_chain(primary_model, fallback_models)
        self.last_model_used = self.models[0] if self.models else primary_model
        self._client = self._create_client()

    @staticmethod
    def _build_model_chain(primary_model: str, fallback_models: str) -> list[str]:
        ordered_models: list[str] = []
        for model in [primary_model, *fallback_models.split(",")]:
            cleaned = model.strip()
            if cleaned and cleaned not in ordered_models:
                ordered_models.append(cleaned)
        return ordered_models

    def _create_client(self):
        if genai is None or genai_types is None:
            return None
        if not self.api_key:
            return None
        return genai.Client(
            api_key=self.api_key,
            http_options=genai_types.HttpOptions(api_version=self.api_version),
        )

    def ensure_configured(self) -> None:
        if genai is None or genai_types is None or genai_errors is None:
            raise GeminiClientError(
                "google-genai is not installed. Run `pip install -r requirements.txt` in backend/.",
                retriable=False,
            )

        if not self.api_key:
            raise GeminiClientError(
                "Gemini API key not configured. Add GEMINI_API_KEY to backend/.env.",
                retriable=False,
            )

        if self._client is None:
            self._client = self._create_client()

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

    def _build_config(self, model: str, schema: dict[str, Any]):
        request_schema = (
            self._make_2_0_schema_compatible(schema)
            if model.startswith("gemini-2.0")
            else schema
        )
        return genai_types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=2048,
            response_mime_type="application/json",
            response_json_schema=request_schema,
        )

    @staticmethod
    def _extract_text_from_response(response: Any) -> str:
        text = getattr(response, "text", None)
        if isinstance(text, str) and text.strip():
            return text.strip()

        candidates = getattr(response, "candidates", None) or []
        finish_reasons: list[str] = []
        parts_text: list[str] = []

        for candidate in candidates:
            finish_reason = getattr(candidate, "finish_reason", None)
            if finish_reason is not None:
                finish_reasons.append(str(finish_reason))

            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            for part in parts:
                part_text = getattr(part, "text", None)
                if isinstance(part_text, str) and part_text.strip():
                    parts_text.append(part_text.strip())

        if parts_text:
            return "\n".join(parts_text)

        if finish_reasons:
            unique_reasons = ", ".join(sorted(set(finish_reasons)))
            raise GeminiClientError(
                f"Gemini did not return text content. Finish reason: {unique_reasons}.",
                provider_message=unique_reasons,
                retriable="STOP" not in unique_reasons,
            )

        raise GeminiClientError(
            "Gemini returned an empty response.",
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

    def _coerce_json_payload(self, response: Any) -> dict[str, Any]:
        parsed = getattr(response, "parsed", None)
        if isinstance(parsed, dict):
            return parsed
        if parsed is not None and hasattr(parsed, "model_dump"):
            return parsed.model_dump()

        text = self._extract_text_from_response(response)
        cleaned = self._strip_code_fences(text)

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        for opener, closer in (("{", "}"), ("[", "]")):
            start = cleaned.find(opener)
            end = cleaned.rfind(closer)
            if start == -1 or end == -1 or end <= start:
                continue
            candidate = cleaned[start : end + 1].strip()
            try:
                return json.loads(candidate)
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
                try:
                    response = self._client.models.generate_content(
                        model=model,
                        contents=prompt,
                        config=self._build_config(model, schema),
                    )
                    payload = self._coerce_json_payload(response)
                    self.last_model_used = model
                    return payload, model
                except genai_errors.APIError as exc:
                    status_code = getattr(exc, "code", None)
                    message = getattr(exc, "message", None) or str(exc)
                    last_error = GeminiClientError(
                        message,
                        status_code=status_code,
                        provider_message=message,
                        retriable=status_code in RETRIABLE_STATUS_CODES,
                    )
                    if not last_error.retriable or attempt == DEFAULT_MAX_RETRIES - 1:
                        break
                    self._sleep_before_retry(attempt)
                except GeminiClientError as exc:
                    last_error = exc
                    if not exc.retriable or attempt == DEFAULT_MAX_RETRIES - 1:
                        break
                    self._sleep_before_retry(attempt)
                except Exception as exc:
                    last_error = GeminiClientError(
                        f"Gemini SDK request failed: {exc}",
                        provider_message=str(exc),
                        retriable=attempt < DEFAULT_MAX_RETRIES - 1,
                    )
                    if attempt == DEFAULT_MAX_RETRIES - 1:
                        break
                    self._sleep_before_retry(attempt)

        if last_error is not None:
            raise last_error

        raise GeminiClientError(
            "Gemini request failed unexpectedly.",
            retriable=True,
        )


gemini_client = GeminiClient()
