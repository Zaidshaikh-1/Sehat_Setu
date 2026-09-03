import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2,
    ChevronDown,
    Zap,
} from "lucide-react";
import { api } from "../../utils/api.js";

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
                <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
                    <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                    <span>{rendered}</span>
                </div>
            );
        }

        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
            return (
                <div key={lineIdx} className="flex items-start gap-1.5 ml-1 my-0.5">
                    <span className="text-teal-600 font-mono text-[10px] mt-0.5 shrink-0">
                        {trimmed.match(/^\d+/)[0]}.
                    </span>
                    <span>{rendered}</span>
                </div>
            );
        }

        return (
            <div key={lineIdx} className={lineIdx > 0 ? "mt-1" : ""}>
                {rendered}
            </div>
        );
    });
}

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Namaste! 🙏 I'm **Setu AI**, your healthcare assistant. I can help you with clinical guidance, government schemes, ASHA protocols, drug information, and Sehat Setu platform features.\n\nHow can I assist you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState([]);
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

    // Load suggested prompts
    useEffect(() => {
        async function loadPrompts() {
            try {
                const res = await api.get("/chatbot/prompts");
                if (res.data?.data) {
                    setSuggestedPrompts(res.data.data);
                }
            } catch {
                // Fallback prompts
                setSuggestedPrompts([
                    { category: "Maternal", text: "Danger signs during pregnancy?", icon: "🤰" },
                    { category: "Newborn", text: "HBNC visit schedule?", icon: "👶" },
                    { category: "Emergency", text: "When to call 108?", icon: "🚑" },
                    { category: "ORS", text: "ORS preparation steps?", icon: "💊" },
                ]);
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
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setInput("");
            setIsLoading(true);
            setShowPrompts(false);

            try {
                // Build history for context
                const history = messages
                    .filter((m) => m.role !== "system")
                    .map((m) => ({ role: m.role, content: m.content }));

                const res = await api.post("/chatbot/chat", {
                    message: text,
                    history,
                });

                const reply = res.data?.data?.reply || "Sorry, I couldn't process that.";

                const aiMessage = {
                    role: "assistant",
                    content: reply,
                    timestamp: new Date(),
                };

                setMessages((prev) => [...prev, aiMessage]);

                if (!isOpen) {
                    setHasUnread(true);
                }
            } catch (err) {
                const errorMessage = {
                    role: "assistant",
                    content:
                        "I'm having trouble connecting right now. Please check your internet connection and try again. If this persists, use the **Teleconsult** feature to reach a doctor directly.",
                    timestamp: new Date(),
                    isError: true,
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

    const handlePromptClick = (promptText) => {
        sendMessage(promptText);
    };

    return (
        <>
            {/* ═══ Floating Chat Widget Button ═══ */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer border-none group ${isOpen
                        ? "bg-slate-800 rotate-0 scale-95"
                        : "bg-gradient-to-br from-teal-600 to-teal-800 hover:from-teal-500 hover:to-teal-700 hover:scale-105 hover:shadow-xl"
                    }`}
                aria-label="Toggle AI Assistant"
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <>
                        <MessageCircle className="w-5.5 h-5.5 text-white" />
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </>
                )}
            </button>

            {/* ═══ Chat Panel ═══ */}
            {isOpen && (
                <div
                    className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-[#D3D4C0] flex flex-col overflow-hidden"
                    style={{
                        height: "min(600px, calc(100vh - 8rem))",
                        animation: "chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }}
                >
                    {/* ─── Header ─── */}
                    <div className="bg-gradient-to-r from-[#1f2229] to-[#2d3140] px-5 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center relative">
                            <Bot className="w-4.5 h-4.5 text-teal-400" />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1f2229]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                Setu AI Assistant
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Healthcare Guidance · ASHA Support · 24/7
                            </p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer border-none"
                        >
                            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                        </button>
                    </div>

                    {/* ─── Messages Area ─── */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#FAF7F2]"
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                                style={{
                                    animation: `chatFadeIn 0.25s ease-out ${Math.min(idx * 0.05, 0.3)}s both`,
                                }}
                            >
                                {/* Avatar */}
                                <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${msg.role === "user"
                                            ? "bg-[#1f2229]"
                                            : msg.isError
                                                ? "bg-rose-100 border border-rose-200"
                                                : "bg-teal-100 border border-teal-200"
                                        }`}
                                >
                                    {msg.role === "user" ? (
                                        <User className="w-3.5 h-3.5 text-white" />
                                    ) : (
                                        <Bot
                                            className={`w-3.5 h-3.5 ${msg.isError ? "text-rose-600" : "text-teal-700"
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`max-w-[80%] px-3.5 py-2.5 text-[12.5px] leading-relaxed rounded-2xl ${msg.role === "user"
                                            ? "bg-[#1f2229] text-white rounded-tr-md"
                                            : msg.isError
                                                ? "bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-md"
                                                : "bg-white text-slate-700 border border-[#D3D4C0] rounded-tl-md shadow-xs"
                                        }`}
                                >
                                    {msg.role === "user" ? msg.content : formatMessage(msg.content)}
                                    <div
                                        className={`text-[9px] mt-1.5 font-mono ${msg.role === "user" ? "text-slate-400" : "text-slate-400"
                                            }`}
                                    >
                                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 flex-row" style={{ animation: "chatFadeIn 0.2s ease-out both" }}>
                                <div className="w-7 h-7 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-3.5 h-3.5 text-teal-700" />
                                </div>
                                <div className="bg-white border border-[#D3D4C0] px-4 py-3 rounded-2xl rounded-tl-md shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span
                                                className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                                                style={{ animation: "dotBounce 1.4s ease-in-out infinite" }}
                                            />
                                            <span
                                                className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                                                style={{
                                                    animation: "dotBounce 1.4s ease-in-out 0.2s infinite",
                                                }}
                                            />
                                            <span
                                                className="w-1.5 h-1.5 bg-teal-500 rounded-full"
                                                style={{
                                                    animation: "dotBounce 1.4s ease-in-out 0.4s infinite",
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            Thinking...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Suggested Prompts */}
                        {showPrompts && suggestedPrompts.length > 0 && messages.length <= 1 && (
                            <div className="mt-2 flex flex-col gap-1.5">
                                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase px-1">
                                    Quick Questions
                                </span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {suggestedPrompts.slice(0, 6).map((p, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handlePromptClick(p.text)}
                                            className="flex items-start gap-2 p-2.5 bg-white text-left border border-[#D3D4C0] rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer group"
                                        >
                                            <span className="text-sm mt-0.5">{p.icon}</span>
                                            <div>
                                                <div className="text-[9px] font-mono font-bold text-teal-700 uppercase">
                                                    {p.category}
                                                </div>
                                                <div className="text-[10.5px] text-slate-600 leading-snug mt-0.5 group-hover:text-teal-800">
                                                    {p.text}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ─── Input Area ─── */}
                    <div className="px-4 py-3 border-t border-[#D3D4C0] bg-white shrink-0">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything about health, schemes, protocols..."
                                    rows={1}
                                    className="w-full resize-none px-3.5 py-2.5 text-xs text-slate-800 bg-[#FAF7F2] border border-[#D3D4C0] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all placeholder:text-slate-400"
                                    style={{
                                        minHeight: "40px",
                                        maxHeight: "100px",
                                        overflow: "auto",
                                    }}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || isLoading}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-none shrink-0 ${input.trim() && !isLoading
                                        ? "bg-teal-700 hover:bg-teal-600 text-white shadow-xs"
                                        : "bg-[#FAF7F2] text-slate-300 border border-[#D3D4C0]"
                                    }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[8px] text-slate-400 font-mono flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5" />
                                Powered by Setu AI · Groq
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">
                                Press Enter to send
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Inline Animations ═══ */}
            <style>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
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
