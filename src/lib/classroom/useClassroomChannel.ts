"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SlideChangePayload, SessionStatusPayload } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type UseClassroomChannelOptions = {
  sessionId: string;
  role: "TEACHER" | "STUDENT";
  onSlideChange: (slideIndex: number) => void;
  onStatusChange?: (status: SessionStatusPayload["status"]) => void;
};

export function useClassroomChannel({
  sessionId,
  role,
  onSlideChange,
  onStatusChange,
}: UseClassroomChannelOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastReceivedTimestamp = useRef(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`classroom:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "slide:change" }, ({ payload }) => {
        const data = payload as SlideChangePayload;
        // Ignore stale messages
        if (data.timestamp <= lastReceivedTimestamp.current) return;
        lastReceivedTimestamp.current = data.timestamp;
        onSlideChange(data.slideIndex);
      })
      .on("broadcast", { event: "session:status" }, ({ payload }) => {
        const data = payload as SessionStatusPayload;
        onStatusChange?.(data.status);
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    // State recovery: if student, fetch current state from API
    if (role === "STUDENT") {
      fetch(`/api/classroom/${sessionId}/state`)
        .then((r) => r.json())
        .then((data) => {
          if (data.currentSlide !== undefined) {
            onSlideChange(data.currentSlide);
          }
          if (data.status && onStatusChange) {
            onStatusChange(data.status);
          }
        })
        .catch(() => {}); // Silently fail — initial props are the fallback
    }

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, role]);

  const broadcastSlideChange = useCallback(
    (slideIndex: number) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "slide:change",
        payload: { slideIndex, timestamp: Date.now() } satisfies SlideChangePayload,
      });
    },
    []
  );

  const broadcastStatus = useCallback(
    (status: SessionStatusPayload["status"]) => {
      channelRef.current?.send({
        type: "broadcast",
        event: "session:status",
        payload: { status, timestamp: Date.now() } satisfies SessionStatusPayload,
      });
    },
    []
  );

  return { broadcastSlideChange, broadcastStatus, isConnected };
}
