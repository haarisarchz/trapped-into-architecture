"use client";

import { MessageCircle, Send, ExternalLink, ChevronRight, Bell } from "lucide-react";

export default function ArchitectureChannelsCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bell size={15} />
          </div>
          <h3 className="font-bold text-sm text-gray-900">Follow & Connect</h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Instant Alerts
        </span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Join our dedicated architecture broadcast channels for instant alerts on new vacancies, studio calls, and design competitions.
      </p>

      <div className="space-y-2">
        {/* WhatsApp Channel */}
        <a
          href="https://chat.whatsapp.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/80 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageCircle size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950 group-hover:text-emerald-900">
                WhatsApp Architecture Channel
              </p>
              <p className="text-[11px] text-emerald-700">
                Official broadcasts & studio calls
              </p>
            </div>
          </div>
          <ExternalLink size={13} className="text-emerald-700 group-hover:translate-x-0.5 transition" />
        </a>

        {/* Main Telegram Channel */}
        <a
          href="https://t.me/ArchitectJobsTi2A"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/80 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Send size={15} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950 group-hover:text-blue-900">
                Telegram Main Hub (@ArchitectJobsTi2A)
              </p>
              <p className="text-[11px] text-blue-700">
                National architectural job updates
              </p>
            </div>
          </div>
          <ExternalLink size={13} className="text-blue-700 group-hover:translate-x-0.5 transition" />
        </a>

        {/* State-wise Telegram Hubs dropdown / links */}
        <div className="pt-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Regional State Channels (Telegram)
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <a
              href="https://t.me/tamilnaduarchitectjobs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium flex items-center justify-between border border-gray-100"
            >
              <span>Tamil Nadu</span>
              <ExternalLink size={11} className="text-gray-400" />
            </a>
            <a
              href="https://t.me/keralaarchitectjobs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium flex items-center justify-between border border-gray-100"
            >
              <span>Kerala</span>
              <ExternalLink size={11} className="text-gray-400" />
            </a>
            <a
              href="https://t.me/karnatakaarchitectjobs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium flex items-center justify-between border border-gray-100"
            >
              <span>Karnataka</span>
              <ExternalLink size={11} className="text-gray-400" />
            </a>
            <a
              href="https://t.me/andhratelenganaarchitectjobs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium flex items-center justify-between border border-gray-100"
            >
              <span>AP & Telangana</span>
              <ExternalLink size={11} className="text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
