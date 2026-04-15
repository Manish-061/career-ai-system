import { useState, useCallback, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCareer } from "../../context/CareerContext"
import { generateInteractiveContent } from "../../services/api"
import Button from "../../components/ui/Button"
import ErrorBanner from "../../components/ui/ErrorBanner"
import EmptyState from "../../components/ui/EmptyState"
import PageTransition from "../../components/ui/PageTransition"
import MarkdownRenderer from "../../components/ui/MarkdownRenderer"

const EXAMPLE_PROMPTS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: "Build a 30-day roadmap",
    prompt: "Create a 30-day roadmap tailored to my current recommendation, missing skills, and readiness level.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    label: "Portfolio project ideas",
    prompt: "Generate portfolio-ready project ideas that close my biggest skill gaps for this recommendation.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 12a4 4 0 1 0-8 0" />
      </svg>
    ),
    label: "Explore career alternatives",
    prompt: "Show nearby career alternatives that still fit my strengths and explain how they compare with the main recommendation.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    label: "Resume tips for my role",
    prompt: "Give me specific resume tips and bullet point examples tailored to my target role and current skills.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: "Interview prep questions",
    prompt: "What are the most common interview questions for my target role, and how should I answer them based on my experience?",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    label: "Skill gap analysis",
    prompt: "Analyze my skill gaps in detail and rank them by priority. Suggest the fastest way to close each one.",
  },
]

const createFreshState = () => ({
  action: "chat",
  prompt: "",
  title: "Career Chat",
  messages: [],
  suggestions: [],
  model: "",
  warning: null,
  autoGenerate: false,
})

export default function GenerationStudio() {
  const navigate = useNavigate()
  const { profile, result, generationState, setGenerationState } = useCareer()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)

  const currentState = generationState || createFreshState()
  const messages = currentState.messages || []

  const clearError = useCallback(() => setError(""), [])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, 192) + "px"
    }
  }, [chatInput])

  const goResult = () => navigate("/result")

  const handleNewChat = () => {
    setGenerationState(createFreshState())
    setChatInput("")
    setError("")
  }

  const handleGenerate = async (promptText) => {
    if (!promptText.trim() || loading) return

    try {
      setLoading(true)
      setError("")
      setChatInput("")

      const newMessages = [...messages, { role: "user", content: promptText }]
      setGenerationState({
        ...currentState,
        messages: newMessages,
      })

      // Build conversation history for context
      const conversationContext = messages
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n")

      const response = await generateInteractiveContent({
        action: "chat",
        prompt: promptText,
        profile,
        recommendation: result,
        existingOutput: conversationContext,
      })

      setGenerationState({
        ...currentState,
        action: "chat",
        title: response.title,
        messages: [
          ...newMessages,
          { role: "assistant", content: response.content },
        ],
        suggestions: response.suggestions,
        model: response.model,
        warning: response.warning,
        autoGenerate: false,
      })
    } catch (err) {
      setError(err.message || "Unable to generate content right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    handleGenerate(suggestion)
  }

  const handleExampleClick = (prompt) => {
    handleGenerate(prompt)
  }

  if (!profile || !result) {
    return (
      <PageTransition>
        <section className="mx-auto max-w-3xl py-16">
          <div className="soft-panel rounded-[32px] p-8 sm:p-10">
            <EmptyState
              icon={
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              }
              title="No Generation Context"
              description="Open the result page first to launch the AI workspace."
              action={<Button onClick={goResult}>Back to Results</Button>}
            />
          </div>
        </section>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <section className="generation-studio mx-auto max-w-5xl py-4 h-[calc(100vh-80px)] flex flex-col" style={{ gap: "0.75rem" }}>
        {/* Header */}
        <div className="soft-panel animate-fade-in-up rounded-[32px] p-5 sm:p-6 flex-shrink-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="compact" onClick={goResult}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </Button>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                AI Career Studio
              </h2>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="chat-new-btn"
                  title="Start new conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Chat
                </button>
              )}
              <div className="chat-status-badge">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="font-semibold text-slate-900">{result.role}</span>
                </div>
                {/* <div className="w-px h-4 bg-slate-200"></div> */}
                {/* <span>{currentState.model || "Ready"}</span> */}
              </div>
            </div>
          </div>
        </div>

        <ErrorBanner message={error} onDismiss={clearError} />

        {/* Chat UI Container */}
        <div className="result-card chat-container flex flex-col flex-1 min-h-0 relative animate-fade-in-up delay-1 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 sm:px-8 scroll-smooth" style={{ gap: "1.5rem", display: "flex", flexDirection: "column" }}>
            {messages.length === 0 ? (
              <div className="chat-welcome animate-fade-in">
                {/* Welcome Hero */}
                <div className="chat-welcome-hero">
                  <div className="chat-welcome-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <h3 className="chat-welcome-title">
                    How can I help you today?
                  </h3>
                  <p className="chat-welcome-subtitle">
                    Ask me anything about your career path, skills, interview prep, resume tips, or get a personalized roadmap.
                  </p>
                </div>

                {/* Example Prompts Grid */}
                <div className="chat-examples-grid">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example.prompt)}
                      className="chat-example-card"
                      style={{ animationDelay: `${index * 0.06}s` }}
                    >
                      <span className="chat-example-icon">{example.icon}</span>
                      <span className="chat-example-label">{example.label}</span>
                      <svg className="chat-example-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message-row ${msg.role === "user" ? "chat-message-row-user" : "chat-message-row-assistant"}`}
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  {msg.role === "assistant" && (
                    <div className="chat-avatar chat-avatar-ai">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
                    {msg.role === "user" ? (
                      <p className="text-[0.95rem] whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="chat-avatar chat-avatar-user">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="chat-message-row chat-message-row-assistant animate-fade-in">
                <div className="chat-avatar chat-avatar-ai">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="chat-bubble chat-bubble-assistant">
                  <div className="chat-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions Bar */}
          {!loading && currentState.suggestions?.length > 0 && messages.length > 0 && (
            <div className="chat-suggestions-bar">
              {currentState.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="chat-suggestion-chip"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="chat-input-wrapper">
              <textarea
                ref={textareaRef}
                id="chatPrompt"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about your career..."
                className="chat-input-field"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerate(chatInput)
                  }
                }}
              />
              <button
                onClick={() => handleGenerate(chatInput)}
                disabled={!chatInput.trim() || loading}
                className="chat-send-btn"
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="chat-disclaimer">
                AI can make mistakes. Verify important information.
              </span>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
