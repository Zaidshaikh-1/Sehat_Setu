import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  ChevronDown
} from "lucide-react";
import { api } from "../../utils/api.js";
import { useTranslation } from "../../context/AuthContext.jsx";

// ─── Markdown-lite renderer for bold, bullets, and line breaks ───
function formatMessage(text) {
  if (!text) return null;

  return text.split("\n").map((line, lineIdx) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    // Bullet points
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-slate-900 font-bold mt-0.5 shrink-0">•</span>
          <span>{rendered}</span>
        </div>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-slate-700 font-mono text-xs mt-0.5 shrink-0">
            {trimmed.match(/^\d+/)[0]}.
          </span>
          <span>{rendered}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className={lineIdx > 0 ? "mt-1.5" : ""}>
        {rendered}
      </div>
    );
  });
}

const FALLBACK_PROMPTS = [
  { text: "What are maternal danger signs during pregnancy?", category: "Maternal" },
  { text: "HBNC home visit schedule for newborns?", category: "Newborn" },
  { text: "When should ASHA call 108 emergency?", category: "Emergency" },
  { text: "How does Janani Suraksha Yojana work?", category: "Schemes" }
];

export function ChatbotWidget() {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        language === "hi"
          ? "नमस्ते! 🙏 मैं **सेतु AI सहायक** हूँ। मैं स्वास्थ्य मार्गदर्शन, सरकारी योजनाओं, आशा प्रोटोकॉल और डॉक्टर परामर्श में आपकी सहायता कर सकता हूँ।\n\nआप मुझसे क्या पूछना चाहते हैं?"
          : language === "mr"
          ? "नमस्कार! 🙏 मी **सेतू AI सहाय्यक** आहे. मी आरोग्य मार्गदर्शन, शासकीय योजना, आशा नियमावली आणि डॉक्टर सल्ल्याविषयी मदत करू शकतो.\n\nमी आपल्याला कशी मदत करू?"
          : "Namaste! 🙏 I'm **Setu AI**, your clinical assistant. I can help with symptom guidance, government health schemes (JSY, PMMVY), ASHA protocols, and teleconsultations.\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState(FALLBACK_PROMPTS);
  const [showPrompts, setShowPrompts] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Load suggested prompts from API
  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await api.get("/chatbot/prompts");
        if (res.data?.data) {
          setSuggestedPrompts(res.data.data);
        }
      } catch {
        setSuggestedPrompts(FALLBACK_PROMPTS);
      }
    }
    loadPrompts();
  }, []);

  const sendMessage = useCallback(
    async (messageText) => {
      const text = messageText || input.trim();
      if (!text || isLoading) return;

      const userMessage = {
        role: "user",
        content: text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setShowPrompts(false);

      try {
        const history = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await api.post("/chatbot/chat", {
          message: text,
          history
        });

        const reply = res.data?.data?.reply || "I'm sorry, I couldn't process that right now.";

        const aiMessage = {
          role: "assistant",
          content: reply,
          timestamp: new Date()
        };

        setMessages((prev) => [...prev, aiMessage]);

        if (!isOpen) {
          setHasUnread(true);
        }
      } catch (err) {
        const errorMessage = {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check your network connection or use the **Contact ASHA** page to connect with a doctor directly.",
          timestamp: new Date(),
          isError: true
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, isOpen]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer border-none ${
          isOpen
            ? "bg-slate-900 rotate-0 scale-95"
            : "bg-slate-900 hover:bg-slate-800 hover:scale-105 hover:shadow-xl"
        }`}
        aria-label="Toggle Setu AI"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            height: "min(620px, calc(100vh - 7.5rem))",
            animation: "chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative text-white">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white leading-tight">
                  {t("chatbotTitle")}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {t("chatbotSubtitle")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fafafc]"
            style={{ scrollBehavior: "smooth" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
                style={{
                  animation: `chatFadeIn 0.25s ease-out ${Math.min(idx * 0.05, 0.3)}s both`
                }}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white"
                      : msg.isError
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-200 text-slate-800"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[82%] px-4 py-3 text-[13px] leading-relaxed rounded-2xl ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-md shadow-xs"
                      : msg.isError
                      ? "bg-rose-50 text-rose-900 rounded-tl-md"
                      : "bg-white text-slate-800 rounded-tl-md shadow-xs"
                  }`}
                >
                  {msg.role === "user" ? msg.content : formatMessage(msg.content)}
                </div>
              </div>
            ))}

            {/* Loading Animation */}
            {isLoading && (
              <div className="flex gap-2.5 flex-row">
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 bg-slate-600 rounded-full"
                      style={{ animation: "dotBounce 1.4s ease-in-out infinite" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-slate-600 rounded-full"
                      style={{ animation: "dotBounce 1.4s ease-in-out 0.2s infinite" }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-slate-600 rounded-full"
                      style={{ animation: "dotBounce 1.4s ease-in-out 0.4s infinite" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Question Chips */}
            {showPrompts && suggestedPrompts.length > 0 && messages.length <= 1 && (
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  {t("quickQuestionsTitle")}
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestedPrompts.slice(0, 4).map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(p.text)}
                      className="p-3 bg-white hover:bg-slate-100 text-left rounded-xl shadow-xs transition-all cursor-pointer border-none text-xs font-semibold text-slate-800"
                    >
                      {p.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3.5 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chatbotPlaceholder")}
                rows={1}
                className="flex-1 resize-none px-4 py-3 text-xs text-slate-900 bg-slate-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400 max-h-24"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${
                  input.trim() && !isLoading
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
