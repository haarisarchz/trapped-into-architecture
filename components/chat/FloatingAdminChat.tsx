"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Smile,
  Paperclip,
  Image as ImageIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Loader2
} from "lucide-react";

interface ChatMsg {
  id?: string;
  sender: "visitor" | "admin" | "system";
  message: string;
  image_url?: string | null;
  created_at?: string;
}

const QUICK_STARTERS = [
  { text: "🔍 Looking for Architecture Jobs", prompt: "Hi! I am looking for verified architecture jobs in Chennai / Bangalore. Can you guide me?" },
  { text: "🏢 Want to Post a Job / Hire", prompt: "Hello, I want to post an architecture job opening for my studio." },
  { text: "📁 Portfolio & Resume Guidance", prompt: "Hi! I need guidance regarding portfolio reviews and architecture applications." },
  { text: "💡 Platform Query / Feedback", prompt: "Hi! I have a question regarding Trapped Into Architecture features." }
];

const QUICK_EMOJIS = ["👋", "💼", "📁", "👍", "🙏", "✨", "🏢", "❤️"];

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Attachments / Screenshot upload state
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Progressive contact capture state
  const [hasProvidedContact, setHasProvidedContact] = useState(false);
  const [dismissedContactPrompt, setDismissedContactPrompt] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorContact, setVisitorContact] = useState("");
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isGuestSliderVisible, setIsGuestSliderVisible] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef(0);

  // Web Audio chime generator
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // 1. Initialize persistent session & load history
  useEffect(() => {
    let sId = localStorage.getItem("ti2a_chat_session_id");
    if (!sId) {
      sId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("ti2a_chat_session_id", sId);
    }
    setSessionId(sId);

    // Auto-detect logged-in user profile if available
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (currentUser) {
        const loggedName = currentUser.full_name || currentUser.username || "";
        const loggedContact = currentUser.email || currentUser.phone || "";
        if (loggedName) setVisitorName(loggedName);
        if (loggedContact) {
          setVisitorContact(loggedContact);
          setHasProvidedContact(true);
        }
      }
    } catch (e) {}

    const savedName = localStorage.getItem("ti2a_chat_visitor_name") || "";
    const savedContact = localStorage.getItem("ti2a_chat_visitor_contact") || "";
    if (savedName) setVisitorName(savedName);
    if (savedContact) {
      setVisitorContact(savedContact);
      setHasProvidedContact(true);
    }

    // Fetch conversation history from API
    fetchHistory(sId, true);
  }, []);

  const fetchHistory = async (sId: string, initial = false) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/chat?sessionId=${sId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        if (!initial && data.messages.length > lastMessageCountRef.current) {
          const latest = data.messages[data.messages.length - 1];
          if (latest.sender === "admin") {
            playChime();
          }
        }
        setMessages(data.messages);
        lastMessageCountRef.current = data.messages.length;
        if (data.messages.length > 0 && initial) {
          setShowPromptPill(false);
        }
      }
    } catch (err) {}
  };

  // Live polling: Check for admin replies every 6s when chat window is open
  useEffect(() => {
    if (!isOpen || !sessionId) return;
    const interval = setInterval(() => {
      fetchHistory(sessionId, false);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  // Listen to guest slider visibility to yield on mobile screens
  useEffect(() => {
    const handleSliderState = (e: any) => {
      setIsGuestSliderVisible(!!e.detail?.visible);
    };
    window.addEventListener("ti2a_guest_slider_state", handleSliderState);
    return () => window.removeEventListener("ti2a_guest_slider_state", handleSliderState);
  }, []);

  // When live chat opens, tell guest engagement slider to hide so it doesn't distract
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent("ti2a_chat_opened"));
    }
  }, [isOpen]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, pendingImagePreview]);

  // Clipboard Paste Support (Ctrl+V for screenshots)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          setPendingImage(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            setPendingImagePreview(event.target?.result as string);
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please attach an image file (PNG, JPG, WebP, etc.)");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert("Image must be smaller than 8MB");
        return;
      }
      setPendingImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPendingImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to ImageKit via /api/upload
  const uploadImageAttachment = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "/chat-screenshots");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        return data.url || null;
      }
    } catch (err) {
      console.warn("Screenshot upload error:", err);
    }
    return null;
  };

  // Handle message send
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if ((!text && !pendingImage) || isSending || !sessionId) return;

    setIsSending(true);
    let uploadedImageUrl: string | null = null;

    if (pendingImage) {
      setIsUploadingImage(true);
      uploadedImageUrl = await uploadImageAttachment(pendingImage);
      setIsUploadingImage(false);
    }

    const optimisticMsg: ChatMsg = {
      sender: "visitor",
      message: text,
      image_url: uploadedImageUrl,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setInputValue("");
    setPendingImage(null);
    setPendingImagePreview(null);
    setShowEmojiPicker(false);
    playChime();

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          sender: "visitor",
          senderName: visitorName || null,
          senderContact: visitorContact || null,
          imageUrl: uploadedImageUrl
        })
      });
      lastMessageCountRef.current += 1;
    } catch (err) {
      console.warn("Error sending chat message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle saving contact & registering details in Stage 2
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorContact.trim() || !sessionId) return;

    setIsSavingContact(true);
    try {
      if (visitorName.trim()) localStorage.setItem("ti2a_chat_visitor_name", visitorName.trim());
      if (visitorContact.trim()) localStorage.setItem("ti2a_chat_visitor_contact", visitorContact.trim());

      await fetch("/api/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          senderName: visitorName.trim() || null,
          senderContact: visitorContact.trim()
        })
      });

      setHasProvidedContact(true);
    } catch (err) {
      console.warn("Error updating visitor contact:", err);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Start a new fresh chat
  const handleResetChat = () => {
    if (!confirm("Start a new fresh conversation? Your past messages will be saved.")) return;
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("ti2a_chat_session_id", newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    lastMessageCountRef.current = 0;
  };

  const visitorMessageCount = messages.filter(m => m.sender === "visitor").length;
  const showContactCapture = visitorMessageCount >= 1 && !hasProvidedContact && !dismissedContactPrompt;
  const showRegisterNudge = visitorMessageCount >= 4;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden ${isGuestSliderVisible && !isOpen ? "hidden sm:flex" : "flex"}`}>
      
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
                Admin Ti2A • Online
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPromptPill(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 2. EXPANDED LIVE CHAT WINDOW */}
      {isOpen && (
        <div className="w-[340px] sm:w-[390px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-3 animate-in fade-in zoom-in-95 duration-200">
          
          {/* CHAT HEADER */}
          <div className="bg-slate-950 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-xs shadow-xs">
                  Ti2A
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white">Admin Ti2A</h3>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Now • Verified Architecture Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title={soundEnabled ? "Mute audio chime" : "Enable audio chime"}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              <button 
                type="button"
                onClick={handleResetChat}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Start a new chat"
              >
                <RotateCcw size={13} />
              </button>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Minimize chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGE STREAM */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
            
            {/* INITIAL GREETING BUBBLE */}
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                Ti2A
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-200 text-gray-800 shadow-2xs max-w-[85%] leading-relaxed">
                <p className="font-semibold text-gray-900 mb-0.5">Admin Ti2A</p>
                Hi, how can I help you? I am Admin Ti2A. Looking for job drops, firm details, portfolio advice, or have a suggestion?
              </div>
            </div>

            {/* 1-TAP QUICK CONVERSATION STARTERS (When conversation is fresh) */}
            {messages.length <= 1 && (
              <div className="pt-1 pb-1 space-y-1.5 animate-in fade-in duration-200">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400 px-1">
                  Quick Starters
                </p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_STARTERS.map((starter, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSendMessage(starter.prompt)}
                      className="text-left text-[11px] font-semibold text-gray-700 bg-white hover:bg-black hover:text-white border border-gray-200 hover:border-black p-2.5 rounded-xl transition cursor-pointer shadow-2xs flex items-center justify-between group"
                    >
                      <span>{starter.text}</span>
                      <ArrowRight size={11} className="opacity-40 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    
                    {/* Render text if present */}
                    {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}

                    {/* Render attached screenshot / image if present */}
                    {m.image_url && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/20 bg-black/10 cursor-pointer">
                        <img 
                          src={m.image_url} 
                          alt="Attached Screenshot"
                          onClick={() => setActiveLightboxImg(m.image_url || null)}
                          className="max-h-48 w-full object-cover hover:scale-102 transition" 
                        />
                      </div>
                    )}

                    <span className={`block text-[9px] mt-1 text-right ${isVisitor ? "text-gray-400" : "text-gray-400"}`}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Delivered"}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* RESPONSE TIME & WHATSAPP QUICK ASSISTANCE CARD (Appears after visitor message) */}
            {messages.some(m => m.sender === "visitor") && (
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 text-emerald-950 shadow-2xs animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs mb-1">
                  <MessageCircle size={13} className="text-emerald-700" />
                  <span>Looking for a quick reply?</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  It may take some time for Admin to reply here. For an instant response or immediate guidance, please contact Admin directly on WhatsApp:
                </p>
                <div className="mt-2">
                  <a
                    href="https://wa.me/918608609661?text=Hi%20Admin%20Ti2A%2C%20I%20have%20an%20inquiry%20from%20the%20website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    <MessageCircle size={12} />
                    <span>Chat on WhatsApp (+91 8608609661)</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}

            {/* STAGE 2: CONTACT CAPTURE & REGISTRATION PROMPT (Appears after 1st visitor query) */}
            {showContactCapture && (
              <div className="bg-white border border-emerald-200/90 rounded-2xl p-3.5 shadow-xs animate-in fade-in duration-300">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Save this chat &amp; register profile</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-normal mb-2.5">
                  Please share your details so Admin can contact you back and save your conversation for registration:
                </p>
                <form onSubmit={handleSaveContact} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Ar. Priya Sharma)"
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
                      {isSavingContact ? "Saving..." : "Save Details"}
                    </button>
                  </div>
                </form>

                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Need instant direct chat?</span>
                  <a
                    href="https://wa.me/918608609661?text=Hi%20Ti2A%2C%20I%20have%20an%20inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <MessageCircle size={12} className="text-emerald-600" />
                    <span>Contact us on WhatsApp</span>
                    <ArrowRight size={11} />
                  </a>
                </div>
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

          {/* PENDING SCREENSHOT PREVIEW BANNER */}
          {pendingImagePreview && (
            <div className="px-3 py-2 bg-slate-100 border-t border-gray-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={pendingImagePreview} 
                  alt="Screenshot preview" 
                  className="w-10 h-10 object-cover rounded-lg border border-gray-300 shrink-0" 
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 truncate">
                    {pendingImage?.name || "Screenshot ready to send"}
                  </p>
                  <p className="text-[10px] text-gray-500">Will upload when you hit send</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPendingImage(null);
                  setPendingImagePreview(null);
                }}
                className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition cursor-pointer shrink-0"
                title="Remove screenshot"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* QUICK EMOJI BAR */}
          {showEmojiPicker && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center justify-between gap-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {QUICK_EMOJIS.map((emoji, eIdx) => (
                  <button
                    key={eIdx}
                    type="button"
                    onClick={() => {
                      setInputValue(prev => prev + emoji);
                      inputRef.current?.focus();
                    }}
                    className="w-7 h-7 text-sm hover:scale-125 transition flex items-center justify-center rounded-md hover:bg-gray-100 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="text-[10px] text-gray-400 hover:text-black font-semibold px-1.5 py-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* CHAT INPUT AREA */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-1.5 shrink-0"
          >
            {/* Hidden native file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            {/* Screenshot / File attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Attach screenshot or photo (or paste Ctrl+V)"
            >
              <Paperclip size={15} />
            </button>

            {/* Emoji toggle button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0 ${
                showEmojiPicker ? "bg-amber-100 text-amber-800" : "text-gray-500 hover:text-black hover:bg-gray-100"
              }`}
              title="Quick emojis"
            >
              <Smile size={16} />
            </button>

            <input 
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPaste={handlePaste}
              placeholder={pendingImage ? "Add a caption (optional)..." : "Type a message or paste screenshot..."}
              disabled={isSending}
              className="flex-1 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={(!inputValue.trim() && !pendingImage) || isSending}
              className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-30 shrink-0 cursor-pointer shadow-xs"
              title="Send Message"
            >
              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>

        </div>
      )}

      {/* 3. LIGHTBOX MODAL (Clicking on any screenshot) */}
      {activeLightboxImg && (
        <div 
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-white hover:text-black transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <img 
              src={activeLightboxImg} 
              alt="Screenshot full size" 
              className="max-h-[85vh] max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* 4. FLOATING TRIGGER BUTTON (Always visible at bottom-right) */}
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