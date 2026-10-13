"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, ExternalLink, X, MessageSquareQuote } from "lucide-react";

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  postText: string;
}

export default function WhatsAppChannelModal({ isOpen, onClose, postText }: WhatsAppChannelModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Attempt automatic copy on open
      handleCopy();
    } else {
      setCopied(false);
      setCopyFailed(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postText);
        setCopied(true);
        setCopyFailed(false);
        setTimeout(() => setCopied(false), 3000);
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      console.warn("Clipboard write failed, using textarea fallback", err);
      setCopyFailed(true);
      if (textareaRef.current) {
        textareaRef.current.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setCopyFailed(false);
          setTimeout(() => setCopied(false), 3000);
        } catch (e) {
          setCopyFailed(true);
        }
      }
    }
  };

  const handleOpenWhatsApp = () => {
    const targetUrl = isMobile ? "whatsapp://" : "https://web.whatsapp.com/";
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  if (!isOpen || typeof document === "undefined") return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
              <MessageSquareQuote size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Share to WhatsApp Channel</h3>
              <p className="text-xs text-gray-500">Administrator Channel Workflow</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mt-5">
          {copied ? (
            <div className="flex items-center gap-2.5 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-medium">
              <Check size={18} className="text-green-600 shrink-0" />
              <span>Job post copied to clipboard with all details & emojis!</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-sm">
              <span>Ready to copy into your WhatsApp Channel.</span>
              <button
                onClick={handleCopy}
                className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                Copy Post
              </button>
            </div>
          )}
        </div>

        {/* Clear Instructions */}
        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-600 space-y-2">
          <p className="font-semibold text-gray-800 text-xs uppercase tracking-wider">How to publish to your Channel:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>WhatsApp does not allow websites to post directly into channels automatically.</li>
            <li>Click <strong>Open WhatsApp</strong> below.</li>
            <li>Go to the <strong>Updates</strong> tab (Channels).</li>
            <li>Open your Channel and <strong>Paste</strong> (<kbd className="bg-white border rounded px-1 text-xs">Ctrl+V</kbd> or tap paste) to publish.</li>
          </ol>
        </div>

        {/* Fallback Text Preview (selectable) */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Post Preview & Manual Copy Fallback:</label>
          <textarea
            ref={textareaRef}
            readOnly
            value={postText}
            rows={5}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-green-500 focus:bg-white transition text-gray-700 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCopy}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied Again!" : "Copy Post"}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow-md shadow-green-600/20 transition"
          >
            <ExternalLink size={16} />
            {isMobile ? "Open WhatsApp" : "Open WhatsApp Web"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
