"use client";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND, getWebSocketUrl } from "@/config";
import type { CanvasElement } from "./types";
const serialize = (shape: CanvasElement) => JSON.parse(JSON.stringify(shape, (key, value) => key === "image" ? undefined : value)) as CanvasElement;
export function applyShape(elements: CanvasElement[], shape: CanvasElement): CanvasElement[] {
  if (shape.isDeleted) return elements.filter(e => e.id !== shape.id);
  const index = elements.findIndex(e => e.id === shape.id);
  return index < 0 ? [...elements, shape] : elements.map(e => e.id === shape.id ? shape : e);
}
export function useCollaboration(
  roomId: string | undefined, elements: CanvasElement[],
  setElements: Dispatch<SetStateAction<CanvasElement[]>>,
  onInitial: (elements: CanvasElement[]) => void,
  onRemote: (shape: CanvasElement) => void,
) {
  const router = useRouter();
  const [status, setStatus] = useState("Loading canvas...");
  const [ready, setReady] = useState(false);
  const known = useRef(new Map<string, CanvasElement>());
  const pending = useRef(new Map<string, CanvasElement>());
  const schedule = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!roomId) return;
    let active = true, cursor = 0, flushing = false, retry = 1000;
    let socket: WebSocket | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    let flushTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let fetching = false;
    const clientId = crypto.randomUUID();
    const token = localStorage.getItem("token");
    const login = () => router.replace("/signin?next=" + encodeURIComponent("/canvas/" + roomId));
    if (!token) { login(); return; }
    const request = async (path: string, options: RequestInit = {}) => {
      const response = await fetch(HTTP_BACKEND + "/api/v1" + path, {
        ...options, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token, ...options.headers },
        signal: AbortSignal.timeout(15000), cache: "no-store",
      });
      if (response.status === 401) { localStorage.removeItem("token"); login(); throw new Error("Please sign in again."); }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not sync. Your changes will retry.");
      }
      return response.json();
    };
    const apply = (message: string) => {
      const data = JSON.parse(message) as { shape: CanvasElement; clientId?: string };
      if (!data.shape?.id || pending.current.has(data.shape.id)) return;
      if (data.shape.isDeleted) known.current.delete(data.shape.id);
      else known.current.set(data.shape.id, data.shape);
      if (data.clientId !== clientId) onRemote(data.shape);
      setElements(previous => applyShape(previous, data.shape));
    };
    const read = async (initial: boolean) => {
      if (fetching) return;
      fetching = true;
      try {
        let initialElements: CanvasElement[] = [];
        let more = true;
        while (active && more) {
          const data = await request("/chats/" + roomId + "?after=" + cursor);
          for (const event of data.messages) {
            if (initial) initialElements = applyShape(initialElements, JSON.parse(event.message).shape);
            else if (event.id > cursor) apply(event.message);
          }
          cursor = Math.max(cursor, data.nextCursor);
          more = data.hasMore;
        }
        if (initial && active) {
          known.current = new Map(initialElements.map(e => [e.id, e]));
          pending.current.clear();
          onInitial(initialElements);
          setElements(initialElements);
          setReady(true);
        }
      } finally { fetching = false; }
    };
    const flush = async () => {
      if (flushing || !active) return;
      flushing = true;
      try {
        for (const [id, shape] of pending.current) {
          if (!active) break;
          setStatus("Saving...");
          await request("/events/" + roomId, { method: "POST", body: JSON.stringify({ shape, clientId }) });
          if (shape.isDeleted) known.current.delete(id); else known.current.set(id, shape);
          if (pending.current.get(id) === shape) pending.current.delete(id);
        }
        if (active) setStatus(socket?.readyState === WebSocket.OPEN ? "Live - saved" : "Saved - reconnecting");
      } catch (error) {
        if (active) {
          setStatus(error instanceof Error ? error.message : "Sync unavailable");
          flushTimer = setTimeout(() => void flush(), 2000);
        }
      } finally {
        flushing = false;
        if (active && pending.current.size) { clearTimeout(flushTimer); flushTimer = setTimeout(() => void flush(), 1000); }
      }
    };
    schedule.current = () => { clearTimeout(flushTimer); flushTimer = setTimeout(() => void flush(), 150); };
    const connect = () => {
      if (!active) return;
      socket = new WebSocket(getWebSocketUrl());
      socket.onopen = () => socket?.send(JSON.stringify({ type: "auth", token }));
      socket.onmessage = event => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === "authenticated") socket?.send(JSON.stringify({ type: "join_room", roomId, after: cursor }));
          else if (data.type === "joined") { retry = 1000; setStatus(pending.current.size ? "Saving..." : "Live - saved"); }
          else if (data.type === "chat" && data.id > cursor) { apply(data.message); cursor = data.id; }
        } catch { socket?.close(); }
      };
      socket.onclose = () => { if (active) { reconnect = setTimeout(connect, retry); retry = Math.min(retry * 2, 10000); } };
      socket.onerror = () => socket?.close();
    };
    const fallback = async () => {
      if (!active) return;
      if (socket?.readyState !== WebSocket.OPEN) {
        try { await read(false); if (active && !pending.current.size) setStatus("Saved - reconnecting"); }
        catch (error) { if (active) setStatus(error instanceof Error ? error.message : "Sync unavailable"); }
      }
      if (active) pollTimer = setTimeout(() => void fallback(), 1500);
    };
    void (async () => {
      try {
        await request("/rooms/" + roomId + "/join", { method: "POST", body: "{}" });
        await read(true);
        if (active) { connect(); void fallback(); }
      } catch (error) { if (active) setStatus(error instanceof Error ? error.message : "Could not load canvas. Please reload."); }
    })();
    const unload = (event: BeforeUnloadEvent) => { if (pending.current.size) event.preventDefault(); };
    window.addEventListener("beforeunload", unload);
    return () => {
      active = false; socket?.close();
      clearTimeout(reconnect); clearTimeout(flushTimer); clearTimeout(pollTimer);
      schedule.current = null;
      window.removeEventListener("beforeunload", unload);
    };
  }, [roomId, router, onInitial, onRemote, setElements]);
  useEffect(() => {
    if (!ready) return;
    const current = new Map(elements.map(shape => [shape.id, serialize(shape)]));
    for (const [id, shape] of current) {
      if (JSON.stringify(known.current.get(id)) !== JSON.stringify(shape)) pending.current.set(id, shape);
    }
    for (const [id, shape] of known.current) {
      if (!current.has(id)) pending.current.set(id, { ...shape, isDeleted: true });
    }
    if (pending.current.size) schedule.current?.();
  }, [elements, ready]);
  return { ready, status };
}
