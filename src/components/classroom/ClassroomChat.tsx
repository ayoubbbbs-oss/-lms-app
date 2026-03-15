"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MessageCircle, Minus, Send } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

type ChatMessage = {
  senderName: string;
  senderRole: "TEACHER" | "STUDENT";
  text: string;
  timestamp: number;
};

type Props = {
  lessonId: string;
  userName: string;
  userRole: "TEACHER" | "STUDENT";
};

export default function ClassroomChat({ lessonId, userName, userRole }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Real-time (UNTOUCHED) ──
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`chat-${lessonId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "chat:message" }, ({ payload }) => {
        const msg = payload as ChatMessage;
        setMessages((prev) => [...prev, msg]);
        setUnread((prev) => (open ? 0 : prev + 1));
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [lessonId, open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !channelRef.current) return;

    const msg: ChatMessage = {
      senderName: userName,
      senderRole: userRole,
      text,
      timestamp: Date.now(),
    };

    channelRef.current.send({
      type: "broadcast",
      event: "chat:message",
      payload: msg,
    });

    setMessages((prev) => [...prev, msg]);
    setInput("");
  }, [input, userName, userRole]);
  // ── End real-time ──

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start">
      {/* Expanded chat */}
      {open && (
        <div className="mb-2 w-56 h-72 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-sky-600 px-3 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-white text-[11px] font-bold tracking-wide uppercase">
              Classroom Chat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <Minus size={14} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {messages.length === 0 && (
              <p className="text-[10px] text-slate-400 text-center mt-8">
                No messages yet
              </p>
            )}
            {messages.map((msg, i) => {
              const isOwn =
                msg.senderName === userName && msg.senderRole === userRole;
              const isTeacher = msg.senderRole === "TEACHER";
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                >
                  <span className="text-[9px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[180px] px-2.5 py-1.5 rounded-lg text-xs leading-snug ${
                      isTeacher
                        ? "bg-sky-100 text-sky-900"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-1.5 flex-shrink-0 flex gap-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message"
              className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
            />
            <button
              onClick={sendMessage}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors flex-shrink-0"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-sky-600 hover:bg-sky-700 text-white pl-3 pr-3.5 py-2 rounded-full text-xs font-semibold shadow-lg transition-all duration-150 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
      >
        <MessageCircle size={14} />
        Chat {open ? "−" : "+"}
        {!open && unread > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center -mr-1">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}
