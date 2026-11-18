"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  MessageCircle, 
  X, 
  Send, 
  Check, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Smile
} from "lucide-react";

interface ChatMsg {
  id?: string;
  sender: "visitor" | "admin" | "system";
  message: string;
  created_at?: string;
}

export default function FloatingAdminChat() {
  const pathname = usePathname();

  // Hide inside admin panel to prevent cluttering administrative pages
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [showPromptPill, setShowPromptPill] = useState(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Progressive contact capture state
  const [hasProvidedContact, setHasProvidedContact] = useState(false);
  const [dismissedContactPrompt, setDismissedContactPrompt] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize persistent session & load history
  useEffect(() => {
    let sId = localStorage.getItem("ti2a_chat_session_id");
    if (!sId) {
      sId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("ti2a_chat_session_id", sId);
    }
    setSessionId(sId);

    const savedName = localStorage.getItem("ti2a_chat_visitor_name") || "";
    const savedContact = localStorage.getItem("ti2a_chat_visitor_contact") || "";
    if (savedName) setVisitorName(savedName);
    if (savedContact) {
      setVisitorContact(savedContact);
      setHasProvidedContact(true);
    }

    // Fetch conversation history from API
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sId}`);
        const data = await res.json();
        if (data && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          // If history exists, dismiss the floating bubble prompt pill so it doesn't disturb
          setShowPromptPill(false);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    fetchHistory();
  }, []);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle message send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSending || !sessionId) return;

    const newMsg: ChatMsg = {
      sender: "visitor",
      message: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          sender: "visitor",
          senderName: visitorName || null,
          senderContact: visitorContact || null
        })
      });
    } catch (err) {
      console.warn("Error sending chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle saving contact in Stage 2
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorContact.trim() || !sessionId) return;

    setIsSavingContact(true);
    try {
      localStorage.setItem("ti2a_chat_visitor_name", visitorName.trim());
      localStorage.setItem("ti2a_chat_visitor_contact", visitorContact.trim());

      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          senderName: visitorName.trim(),
          senderContact: visitorContact.trim()
        })
      });

      setHasProvidedContact(true);
    } catch (err) {
      console.warn("Error updating contact:", err);
    } finally {
      setIsSavingContact(false);
    }
  };

  const visitorMessageCount = messages.filter(m => m.sender === "visitor").length;
  const showContactCapture = visitorMessageCount >= 2 && !hasProvidedContact && !dismissedContactPrompt;
  const showRegisterNudge = visitorMessageCount >= 5;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      
      {/* 1. FLOATING GREETING PILL (Visible when chat is closed) */}
      {!isOpen && showPromptPill && (
        <div className="mb-3 mr-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div 
            onClick={() => {
              setIsOpen(true);
              setShowPromptPill(false);
            }}
            className="group bg-white border border-gray-200/90 shadow-xl rounded-2xl py-2.5 px-4 flex items-center gap-3 cursor-pointer hover:border-black transition hover:shadow-2xl hover:-translate-y-0.5"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                Ti2A
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="text-left pr-2">
              <p className="text-xs font-bold text-gray-900 leading-tight">
                Hi, how can I help you?
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                I am admin Ti2A • Online
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPromptPill(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPANDED LIVE CHAT WINDOW */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-3 animate-in fade-in zoom-in-95 duration-200">
          
          {/* CHAT HEADER */}
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-xs">
                  Ti2A
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Admin Ti2A</h3>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active now • Live Helpdesk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGE STREAM */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
            
            {/* INITIAL ADMIN GREETING BUBBLE */}
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                Ti2A
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-200 text-gray-800 shadow-2xs max-w-[85%] leading-relaxed">
                <p className="font-semibold text-gray-900 mb-0.5">Admin Ti2A</p>
                Hi, how can I help you? I am admin Ti2A. Looking for job drops, firm details, or have a suggestion?
              </div>
            </div>

            {/* MESSAGE HISTORY */}
            {messages.map((m, idx) => {
              const isVisitor = m.sender === "visitor";
              return (
                <div 
                  key={idx}
                  className={`flex ${isVisitor ? "justify-end" : "justify-start items-start gap-2"}`}
                >
                  {!isVisitor && (
                    <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Ti2A
                    </div>
                  )}
                  <div 
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed shadow-2xs break-words ${
                      isVisitor 
                        ? "bg-slate-900 text-white rounded-tr-sm" 
                        : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
                    }`}
                  >
                    {!isVisitor && <p className="font-semibold text-gray-900 mb-0.5">Admin Ti2A</p>}
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    <span className={`block text-[9px] mt-1 text-right ${isVisitor ? "text-gray-400" : "text-gray-400"}`}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Delivered"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* STAGE 2: GENTLE CONTACT CAPTURE PROMPT (Appears after 2+ queries) */}
            {showContactCapture && (
              <div className="bg-white border border-emerald-200/90 rounded-2xl p-3.5 shadow-xs animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Save this conversation</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-normal mb-2.5">
                  To ensure our chat is backed up and we can follow up with your queries:
                </p>
                <form onSubmit={handleSaveContact} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp number or Email"
                    required
                    value={visitorContact}
                    onChange={(e) => setVisitorContact(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-black"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setDismissedContactPrompt(true)}
                      className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Skip for now
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingContact}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      {isSavingContact ? "Saving..." : "Save Contact"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STAGE 3: WARM REGISTRATION NUDGE (Appears after 5+ messages) */}
            {showRegisterNudge && (
              <div className="bg-gray-100 rounded-2xl p-3 text-center border border-gray-200/70">
                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                  Great chatting with you! You can also create a free profile to bookmark jobs &amp; get priority WhatsApp drop alerts.
                </p>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
                >
                  <span>Open / Create Profile</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT AREA */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-30 shrink-0 cursor-pointer shadow-xs"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

      {/* 3. FLOATING TRIGGER BUTTON (Always visible at bottom-right) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowPromptPill(false);
        }}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition duration-200 cursor-pointer relative ${
          isOpen 
            ? "bg-slate-900 text-white hover:bg-slate-800" 
            : "bg-slate-950 text-white hover:scale-105 hover:shadow-black/25"
        }`}
        title={isOpen ? "Close Chat" : "Chat with Admin Ti2A"}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={24} />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </>
        )}
      </button>

    </div>
  );
}
