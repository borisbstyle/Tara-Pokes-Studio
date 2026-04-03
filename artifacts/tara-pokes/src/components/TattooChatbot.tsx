import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mail, Loader2, CheckCircle } from "lucide-react";
import { useCreateOpenaiConversation, useEmailConversationSummary } from "@workspace/api-client-react";
import { useLang } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

export default function TattooChatbot() {
  const { t, lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const createConversation = useCreateOpenaiConversation();
  const sendEmailSummary = useEmailConversationSummary();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Reset messages when language changes so welcome message updates
  const prevLangRef = useRef(t.chatbot.welcome);
  useEffect(() => {
    if (prevLangRef.current !== t.chatbot.welcome) {
      prevLangRef.current = t.chatbot.welcome;
      if (messages.length > 0 && messages[0].role === "assistant") {
        setMessages((prev) => [{ role: "assistant", content: t.chatbot.welcome }, ...prev.slice(1)]);
      }
    }
  }, [t.chatbot.welcome]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.chatbot.welcome }]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const ensureConversation = async (): Promise<number> => {
    if (conversationId) return conversationId;
    const conv = await createConversation.mutateAsync({ data: { title: "Tattoo Consultation" } });
    setConversationId(conv.id);
    return conv.id;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsStreaming(true);

    try {
      const id = await ensureConversation();
      const response = await fetch(`${BASE}/api/openai/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, lang }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
            if (data.done) break;
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t.chatbot.errorGeneric }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSendEmail = async () => {
    if (!email.trim() || !conversationId) return;
    setEmailError("");
    try {
      const result = await sendEmailSummary.mutateAsync({ id: conversationId, data: { recipientEmail: email.trim() } });
      if (result.success) {
        setEmailSent(true);
      } else {
        setEmailError(result.message || t.chatbot.errorGeneric);
      }
    } catch {
      setEmailError(t.chatbot.errorGeneric);
    }
  };

  const hasEnoughConversation = messages.filter((m) => m.role === "user").length >= 3;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="chatbot-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="fixed bottom-24 right-4 md:right-8 z-50 w-[min(380px,calc(100vw-2rem))] flex flex-col"
            style={{
              height: "min(560px, calc(100vh - 120px))",
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "1rem",
              boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <div>
                <p className="text-xs tracking-[0.2em] uppercase mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {t.chatbot.studioName}
                </p>
                <h3 className="text-sm font-medium" style={{ color: "hsl(var(--foreground))", fontFamily: "var(--font-serif)" }}>
                  {t.chatbot.title}
                </h3>
              </div>
              <button
                data-testid="button-close-chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full transition-opacity hover:opacity-60"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed"
                    style={{
                      borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: msg.role === "user" ? "hsl(var(--primary))" : "hsl(var(--card))",
                      color: msg.role === "user" ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                      border: msg.role === "assistant" ? "1px solid hsl(var(--border))" : "none",
                    }}
                  >
                    {msg.content || (
                      <span className="flex gap-1 items-center">
                        <span className="animate-bounce inline-block w-1 h-1 rounded-full bg-current" style={{ animationDelay: "0ms" }} />
                        <span className="animate-bounce inline-block w-1 h-1 rounded-full bg-current" style={{ animationDelay: "150ms" }} />
                        <span className="animate-bounce inline-block w-1 h-1 rounded-full bg-current" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Email Summary Section */}
            {hasEnoughConversation && !emailSent && (
              <div className="px-4 pb-2 flex-shrink-0">
                {!showEmailForm ? (
                  <button
                    data-testid="button-show-email-form"
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
                    style={{ color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem" }}
                  >
                    <Mail size={12} />
                    {t.chatbot.emailPrompt}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      data-testid="input-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.chatbot.emailPlaceholder}
                      className="w-full px-3 py-2 text-sm outline-none"
                      style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--foreground))" }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                    />
                    {emailError && <p className="text-xs" style={{ color: "hsl(var(--destructive))" }}>{emailError}</p>}
                    <button
                      data-testid="button-send-email"
                      onClick={handleSendEmail}
                      disabled={sendEmailSummary.isPending || !email.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs tracking-widest uppercase transition-opacity disabled:opacity-40"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderRadius: "0.5rem" }}
                    >
                      {sendEmailSummary.isPending ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                      {t.chatbot.sendEmail}
                    </button>
                  </div>
                )}
              </div>
            )}

            {emailSent && (
              <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 text-xs" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", color: "hsl(var(--muted-foreground))" }}>
                <CheckCircle size={14} style={{ color: "hsl(var(--primary))" }} />
                {t.chatbot.emailSent}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <input
                ref={inputRef}
                data-testid="input-chat-message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chatbot.placeholder}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40 disabled:opacity-40"
                style={{ color: "hsl(var(--foreground))" }}
              />
              <button
                data-testid="button-send-message"
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="p-1.5 rounded-full transition-opacity disabled:opacity-30 hover:opacity-70"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        data-testid="button-open-chat"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 md:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg"
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={18} />
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.span
              key={t.chatbot.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs tracking-widest uppercase overflow-hidden whitespace-nowrap"
            >
              {t.chatbot.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
