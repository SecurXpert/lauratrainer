import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Send, Search, Paperclip, Trash2, X, Plus, AlertCircle, Info, Download, Check, CheckCheck, Eye, EyeOff, Radio, CornerUpLeft, Trash
} from "lucide-react";

interface Thread {
  thread_id: number;
  course_id: number;
  unread_count: number;
  student?: {
    id: number;
    name: string;
  };
  last_message?: {
    created_at: string;
  };
}

interface Message {
  id: number;
  sender_role: string;
  content?: string;
  created_at: string;
  thread_id: number;
  file_name?: string;
  file_url?: string;
  file_mime?: string;
  file_size?: number;
  message_type?: string;
  iv?: string;
  ciphertext?: string;
  is_broadcast?: boolean;
  reply_to_message_id?: number | null;
}

const Chat = () => {
  const token = localStorage.getItem("access_token") || "";

  // ================= STATE =================
  const [apiBase, setApiBase] = useState(() => {
    return localStorage.getItem("chat_api_base") || "https://lauratek.in:8000";
  });
  const [wsBase, setWsBase] = useState(() => {
    return localStorage.getItem("chat_ws_base") || "wss://lauratek.in:8000";
  });
  const [jwtToken, setJwtToken] = useState(token);
  const [wsStatus, setWsStatus] = useState("Disconnected");
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);

  // Multi-select & Hide Mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState<Set<number>>(new Set());

  // Broadcast Modal State
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastPendingFile, setBroadcastPendingFile] = useState<File | null>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedBroadcastCourseId, setSelectedBroadcastCourseId] = useState<number | null>(null);

  // Cryptography Keys & Decrypted Message Cache
  const [threadKeys, setThreadKeys] = useState<Map<number, any>>(new Map());
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const broadcastFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync WS URL with API base when API base changes (if not edited manually)
  const handleApiBaseChange = (val: string) => {
    setApiBase(val);
    localStorage.setItem("chat_api_base", val);
    try {
      const url = new URL(val);
      const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
      const computedWs = `${wsProtocol}//${url.host}`;
      setWsBase(computedWs);
      localStorage.setItem("chat_ws_base", computedWs);
    } catch {
      // Ignore invalid URL
    }
  };

  const handleWsBaseChange = (val: string) => {
    setWsBase(val);
    localStorage.setItem("chat_ws_base", val);
  };

  const handleTokenChange = (val: string) => {
    setJwtToken(val);
  };

  // ================= CRYPTOGRAPHY HELPERS =================
  const b64ToBytes = (b64: string) => {
    try {
      return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    } catch {
      return new Uint8Array();
    }
  };

  const importThreadKey = async (base64Key: string) => {
    const keyBytes = b64ToBytes(base64Key);
    return await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  };

  const encryptText = async (text: string, threadId: number) => {
    const key = threadKeys.get(threadId);
    if (!key) throw new Error("Encryption Key not ready for this thread.");
    const data = new TextEncoder().encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return {
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    };
  };

  const decryptText = async (ivB64: string, ciphertextB64: string, threadId: number) => {
    const key = threadKeys.get(threadId);
    if (!key) return "[key not ready]";
    const iv = b64ToBytes(ivB64);
    const ct = b64ToBytes(ciphertextB64);
    try {
      const dec = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ct
      );
      return new TextDecoder().decode(dec);
    } catch (e) {
      console.error(e);
      return "[decryption failed]";
    }
  };

  // ================= API HELPERS =================
  const apiCall = async (path: string, opts: any = {}) => {
    const headers = {
      ...(opts.headers || {}),
      Authorization: `Bearer ${jwtToken}`,
    };
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(apiBase + path, {
      ...opts,
      headers,
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("Unauthorized - Check JWT Token");
      const text = await res.text();
      throw new Error(text || "API error");
    }
    return res.json();
  };

  const uploadAttachment = async (threadId: number, file: File) => {
    const fd = new FormData();
    fd.append("upload", file);
    const res = await fetch(`${apiBase}/chat/thread/${threadId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtToken}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.text()) || "Upload failed");
    return res.json();
  };

  const uploadBroadcastFile = async (courseId: number, file: File) => {
    const fd = new FormData();
    fd.append("upload", file);
    const res = await fetch(`${apiBase}/chat/broadcast/${courseId}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwtToken}` },
      body: fd,
    });
    if (!res.ok) throw new Error((await res.text()) || "Broadcast upload failed");
    return res.json();
  };

  // ================= DATA LOADING =================
  const loadCourses = async () => {
    try {
      const data = await apiCall("/trainer/courses");
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  const loadThreads = async () => {
    try {
      const data = await apiCall("/chat/trainer/threads");
      setThreads(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load threads");
    }
  };

  const loadHistory = async (threadId: number) => {
    try {
      const data = await apiCall(`/chat/thread/${threadId}/messages`);
      setMessages(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load chat history");
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load threads on initial render
  useEffect(() => {
    if (jwtToken) {
      loadThreads();
      loadCourses();
    }
  }, [jwtToken, apiBase]);

  // When showBroadcast becomes true, set selectedBroadcastCourseId
  useEffect(() => {
    if (showBroadcast) {
      setSelectedBroadcastCourseId(activeCourseId);
    }
  }, [showBroadcast, activeCourseId]);

  // Trigger decryption of messages when key or message list changes
  useEffect(() => {
    const decryptAll = async () => {
      if (!activeThreadId) return;
      const key = threadKeys.get(activeThreadId);
      if (!key) return;

      const updatedDecrypted: Record<number, string> = { ...decryptedMessages };
      let changed = false;

      for (const msg of messages) {
        if (msg.iv && msg.ciphertext && !msg.is_broadcast) {
          const cacheVal = decryptedMessages[msg.id];
          if (!cacheVal || cacheVal === "[key not ready]") {
            const plain = await decryptText(msg.iv, msg.ciphertext, activeThreadId);
            updatedDecrypted[msg.id] = plain;
            changed = true;
          }
        }
      }

      if (changed) {
        setDecryptedMessages(updatedDecrypted);
      }
    };
    decryptAll();
  }, [messages, threadKeys, activeThreadId]);

  // ================= WEBSOCKET =================
  const connectWS = (threadId: number) => {
    if (wsRef.current) wsRef.current.close();
    setWsStatus("Connecting...");

    const socketUrl = `${wsBase}/ws/chat/${threadId}?token=${encodeURIComponent(jwtToken)}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      setWsStatus("Connected");
      ws.send(JSON.stringify({ type: "request_thread_key", thread_id: threadId }));
    };

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "thread_key_init") {
        try {
          const key = await importThreadKey(msg.key);
          setThreadKeys((prev) => {
            const next = new Map(prev);
            next.set(msg.thread_id, key);
            return next;
          });
        } catch (err) {
          console.error("Key import failed:", err);
        }
        return;
      }
      if (msg.type === "message") {
        setMessages((prev) => [...prev, msg]);
      }
      if (msg.type === "delete_everyone") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.message_id
              ? { ...m, content: "[This message was deleted]", sender_role: "system" }
              : m
          )
        );
      }
    };

    ws.onclose = () => {
      setWsStatus("Disconnected");
    };

    wsRef.current = ws;
  };

  const handleThreadSelect = (thread: Thread) => {
    setActiveThreadId(thread.thread_id);
    setActiveCourseId(thread.course_id);
    setSelectMode(false);
    setSelectedPlaceholders(new Set());
    loadHistory(thread.thread_id);
    connectWS(thread.thread_id);
  };

  // Cleanup WS on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // ================= ACTIONS & COMPOSER =================
  const handleSendNormal = async () => {
    if (!activeThreadId) return;

    // Send Attachment first if exists
    if (pendingFile) {
      try {
        await uploadAttachment(activeThreadId, pendingFile);
        setPendingFile(null);
        toast.success("Attachment sent successfully!");
        loadHistory(activeThreadId);
      } catch (err: any) {
        toast.error(err.message || "Failed to send file.");
      }
      return;
    }

    // Send Text message
    const text = messageInput.trim();
    if (!text) return;

    try {
      const enc = await encryptText(text, activeThreadId);
      const payload: any = {
        type: "message",
        iv: enc.iv,
        ciphertext: enc.ciphertext,
        message_type: "text",
      };

      if (replyingToId) {
        payload.reply_to_message_id = replyingToId;
        setReplyingToId(null);
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
        setMessageInput("");
      } else {
        toast.error("WebSocket connection is closed. Reconnecting...");
        connectWS(activeThreadId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to encrypt/send message.");
    }
  };

  const handleSendBroadcast = async () => {
    const courseIdToUse = selectedBroadcastCourseId || activeCourseId;
    const text = broadcastText.trim();
    if (!text && !broadcastPendingFile) {
      toast.error("Enter announcement content or attach a file.");
      return;
    }

    try {
      setBroadcastLoading(true);

      // Collect target course IDs
      let courseIds: number[] = [];
      if (selectedBroadcastCourseId === -1) {
        courseIds = courses.map((c) => c.id);
      } else if (courseIdToUse) {
        courseIds = [courseIdToUse];
      }

      if (courseIds.length === 0) {
        toast.error("Please select a course or All Students to broadcast to.");
        setBroadcastLoading(false);
        return;
      }

      // Upload file first if present (use the first course ID for upload)
      let fileData = null;
      if (broadcastPendingFile) {
        fileData = await uploadBroadcastFile(courseIds[0], broadcastPendingFile);
      }

      const payload = {
        content: text || null,
        file_key: fileData ? fileData.file_key : null,
        file_name: fileData ? fileData.file_name : null,
        file_mime: fileData ? fileData.file_mime : null,
        file_size: fileData ? fileData.file_size : null,
      };

      // Dispatch broadcasts in parallel
      const promises = courseIds.map((id) =>
        apiCall(`/chat/broadcast/${id}`, {
          method: "POST",
          body: payload,
        }).catch((err) => {
          console.error(`Broadcast failed for course ${id}:`, err);
          return { students: 0, failed: true };
        })
      );

      const results = await Promise.all(promises);
      const totalStudents = results.reduce((sum, r) => sum + (r.students || 0), 0);
      const hasFailed = results.some((r) => r.failed);

      if (hasFailed) {
        toast.warning(`Broadcast sent to ${totalStudents} students (some courses failed).`);
      } else {
        toast.success(`Broadcast successfully sent to ${totalStudents} students!`);
      }

      setBroadcastText("");
      setBroadcastPendingFile(null);
      setShowBroadcast(false);
      if (activeThreadId) {
        loadHistory(activeThreadId);
      }
    } catch (err: any) {
      toast.error(err.message || "Broadcast failed.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteEveryone = async (msgId: number) => {
    if (!confirm("Are you sure you want to delete this message for everyone?")) return;
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "delete_everyone",
          message_id: msgId,
        }));
      }
      await apiCall(`/chat/message/${msgId}`, { method: "DELETE" }).catch(() => {});
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: "[This message was deleted]", sender_role: "system" }
            : m
        )
      );
      toast.success("Message deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Delete failed.");
    }
  };

  // Multi-Select Handlers
  const handleBubbleClick = (msgId: number) => {
    if (!selectMode) return;
    setSelectedPlaceholders((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const handleHideSelected = async () => {
    if (selectedPlaceholders.size === 0) {
      toast.error("No placeholders selected.");
      return;
    }
    if (!confirm(`Hide ${selectedPlaceholders.size} placeholder(s) permanently?`)) return;

    try {
      await apiCall(`/chat/thread/${activeThreadId}/hide_placeholders`, {
        method: "POST",
        body: Array.from(selectedPlaceholders),
      });

      toast.success(`Permanently hidden ${selectedPlaceholders.size} placeholder(s).`);
      setSelectedPlaceholders(new Set());
      setSelectMode(false);
      if (activeThreadId) {
        loadHistory(activeThreadId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to hide placeholders.");
    }
  };

  const handleDownloadFile = async (url: string, name: string) => {
    try {
      const res = await fetch(apiBase + url, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error("Download error");
      const blob = await res.blob();
      const linkUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = linkUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(linkUrl);
    } catch (err) {
      toast.error("File download failed.");
    }
  };

  // Filter threads based on query
  const filteredThreads = threads.filter((t) =>
    (t.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="w-full flex h-[calc(100vh-100px)] gap-5 text-[#e9edef] overflow-hidden">
      {/* ================= SIDEBAR PANEL ================= */}
      <aside className="w-[360px] flex-shrink-0 bg-[#111B21] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#e9edef] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A884]" />
            Trainer Panel
          </h2>
          <p className="text-[11.5px] text-[#8696A0] mt-1">
            Click thread to open chat • Select Mode to hide deleted items.
          </p>
        </div>

        {/* Server & Token Config Inputs */}
        <div className="hidden space-y-2.5 bg-black/20 p-3 rounded-2xl border border-white/5">
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8696A0] tracking-wider">API Base URL</label>
            <Input
              value={apiBase}
              onChange={(e) => handleApiBaseChange(e.target.value)}
              className="h-8 text-xs bg-black/40 border-white/10 text-white rounded-lg focus:ring-1 focus:ring-[#00A884]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8696A0] tracking-wider">WS Base URL</label>
            <Input
              value={wsBase}
              onChange={(e) => handleWsBaseChange(e.target.value)}
              className="h-8 text-xs bg-black/40 border-white/10 text-white rounded-lg focus:ring-1 focus:ring-[#00A884]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8696A0] tracking-wider">JWT Token</label>
            <Input
              value={jwtToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              type="password"
              className="h-8 text-xs bg-black/40 border-white/10 text-white rounded-lg focus:ring-1 focus:ring-[#00A884]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={loadThreads}
            className="flex-1 h-9 rounded-xl bg-[#00A884] hover:bg-[#008F72] text-white text-xs font-bold transition-all shadow-sm"
          >
            Load My Threads
          </Button>
          <Button
            onClick={() => setShowBroadcast(true)}
            className="flex-1 h-9 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold transition-all shadow-sm"
          >
            Broadcast
          </Button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs">
          <span className="text-[#8696A0]">WebSocket Status:</span>
          <span
            className={`font-semibold ${
              wsStatus === "Connected" ? "text-[#00E676]" : "text-[#FF1744]"
            }`}
          >
            {wsStatus}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#8696A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search student threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-[#202C33] border-none text-[#e9edef] placeholder:text-[#8696A0] text-xs rounded-xl focus:ring-1 focus:ring-[#00A884]"
          />
        </div>

        {/* Scrollable Threads List */}
        <ScrollArea className="flex-1 pr-1.5 -mr-1.5">
          <div className="space-y-1.5">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#8696A0]">No active threads</div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = thread.thread_id === activeThreadId;
                return (
                  <div
                    key={thread.thread_id}
                    onClick={() => handleThreadSelect(thread)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                      isActive
                        ? "bg-[#2A3942] border-[#00A884]/30"
                        : "bg-transparent border-transparent hover:bg-[#202C33]"
                    }`}
                  >
                    <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                      <AvatarFallback className="bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white font-bold text-xs">
                        {getInitials(thread.student?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold truncate text-[#e9edef]">
                          {thread.student?.name || `Student ${thread.student?.id}`}
                        </span>
                        {thread.unread_count > 0 && (
                          <Badge className="bg-[#00E676] hover:bg-[#00E676] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                            {thread.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#8696A0] truncate mt-0.5">
                        Course {thread.course_id} • {thread.last_message ? new Date(thread.last_message.created_at).toLocaleDateString() : "No messages"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Multi-Select Hide Mode Controls */}
        <div className="pt-2 border-t border-white/5 flex gap-2">
          <Button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelectedPlaceholders(new Set());
            }}
            className={`flex-1 h-9 text-xs rounded-xl font-bold ${
              selectMode ? "bg-[#ef4444] hover:bg-[#dc2626] text-white" : "bg-[#202C33] hover:bg-[#2F3E46] text-[#e9edef]"
            }`}
          >
            {selectMode ? "Cancel Select" : "Select Mode"}
          </Button>
          {selectMode && (
            <Button
              onClick={handleHideSelected}
              disabled={selectedPlaceholders.size === 0}
              className="flex-1 h-9 text-xs rounded-xl font-bold bg-[#ef4444] hover:bg-[#dc2626] text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hide ({selectedPlaceholders.size})
            </Button>
          )}
        </div>
      </aside>

      {/* ================= MAIN CHAT DISPLAY ================= */}
      <section className="flex-1 bg-[#0B141A] border border-white/5 rounded-3xl flex flex-col overflow-hidden relative shadow-2xl">
        {activeThreadId ? (
          <>
            {/* Chat Area Header */}
            <div className="h-16 bg-[#202C33] px-5 flex items-center justify-between border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white/5">
                  <AvatarFallback className="bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] text-white font-bold text-xs">
                    {getInitials(threads.find((t) => t.thread_id === activeThreadId)?.student?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-[#e9edef]">
                    {threads.find((t) => t.thread_id === activeThreadId)?.student?.name || "Student"}
                  </h3>
                  <p className="text-[11px] text-[#8696A0] mt-0.5">
                    Thread: {activeThreadId} • Course: {activeCourseId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-[#202C33] hover:bg-[#202C33] text-[#00A884] border border-[#00A884]/20 rounded-full py-0.5 px-2.5 text-xs font-semibold">
                  Course Active
                </Badge>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1 bg-[#0b141a]/95 p-5 relative overflow-y-auto no-scrollbar">
              <div className="space-y-3.5">
                {messages.map((msg) => {
                  const isMe = msg.sender_role === "trainer";
                  const isSystem = msg.sender_role === "system" || msg.content?.includes("deleted");
                  const decryptedContent = decryptedMessages[msg.id];
                  const displayContent = msg.content || decryptedContent || "...";
                  const isSelected = selectedPlaceholders.has(msg.id);

                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleBubbleClick(msg.id)}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                        selectMode ? "cursor-pointer" : ""
                      }`}
                    >
                      <div
                        className={`group relative max-w-[70%] p-3.5 rounded-2xl border transition-all duration-200 ${
                          isMe
                            ? "bg-[#005C4C] border-[#00A884]/20 text-[#e9edef]"
                            : "bg-[#202C33] border-white/5 text-[#e9edef]"
                        } ${isSelected ? "border-2 border-dashed border-[#ef4444] opacity-70" : ""} ${
                          isSystem ? "italic text-[#8696A0] bg-black/10 border-dashed border-white/10" : ""
                        }`}
                      >
                        {/* Reply Indicator if message is replying to another message */}
                        {msg.reply_to_message_id && (
                          <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-4 border-[#00A884] text-xs text-[#8696A0]">
                            Replying to message #{msg.reply_to_message_id}
                          </div>
                        )}

                        {/* Broadcast indicator */}
                        {msg.is_broadcast && (
                          <Badge className="bg-[#f59e0b] hover:bg-[#f59e0b] text-black font-extrabold text-[9px] mb-1.5">
                            Broadcast
                          </Badge>
                        )}

                        {/* Text Message */}
                        {(!msg.message_type || msg.message_type === "text") && (
                          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap word-break">{displayContent}</p>
                        )}

                        {/* Image message */}
                        {msg.message_type === "image" && msg.file_url && (
                          <div className="space-y-1.5">
                            <img
                              src={apiBase + msg.file_url}
                              alt={msg.file_name || "image"}
                              className="max-w-full max-h-[220px] rounded-xl object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(apiBase + msg.file_url, "_blank")}
                            />
                            {msg.content && <p className="text-xs mt-1 text-[#e9edef]">{msg.content}</p>}
                          </div>
                        )}

                        {/* Document/File message */}
                        {msg.message_type === "file" && msg.file_url && (
                          <div className="flex items-center justify-between gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5">
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-bold text-white truncate">{msg.file_name || "Attachment"}</p>
                              <p className="text-[10px] text-[#8696A0] uppercase mt-0.5">
                                {msg.file_mime?.split("/")[1] || "file"} • {msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : ""}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownloadFile(msg.file_url!, msg.file_name || "download")}
                              className="h-8 w-8 text-[#00A884] hover:text-[#008F72] hover:bg-[#202C33] rounded-lg shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {/* Metadata line: time, actions on hover */}
                        <div className="flex justify-between items-center gap-3 mt-1.5 text-[10px] text-[#8696A0]">
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          
                          {/* Message Actions visible on hover */}
                          {!selectMode && !isSystem && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setReplyingToId(msg.id);
                                  setMessageInput(`Replying to #${msg.id}: `);
                                }}
                                className="text-[#8696A0] hover:text-white"
                                title="Reply"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                              {isMe && (
                                <button
                                  onClick={() => handleDeleteEveryone(msg.id)}
                                  className="text-red-400 hover:text-red-500"
                                  title="Delete for Everyone"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Composer/Input Bar */}
            <div className="p-4 bg-[#202C33] border-t border-white/5 flex flex-col gap-2 shrink-0">
              {/* Attachment Preview Bar */}
              {pendingFile && (
                <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Paperclip className="w-4 h-4 text-[#00A884]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{pendingFile.name}</p>
                      <p className="text-[10px] text-[#8696A0] mt-0.5">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB • Ready to send</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setPendingFile(null)}
                    className="w-7 h-7 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Reply Indicator Bar */}
              {replyingToId && (
                <div className="flex items-center justify-between px-3 py-2 bg-[#0b141a]/60 border border-[#00A884]/20 rounded-xl text-xs">
                  <span className="text-[#8696A0]">Replying to message #{replyingToId}</span>
                  <button onClick={() => { setReplyingToId(null); setMessageInput(""); }} className="text-[#8696A0] hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* File Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                {/* Input Text Box */}
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendNormal()}
                  placeholder={pendingFile ? "Press Send to upload attachment..." : "Type a message..."}
                  className="flex-1 h-10 bg-[#2A3942] border-none text-[#e9edef] placeholder:text-[#8696A0] rounded-xl focus:ring-0"
                />

                {/* Send Button */}
                <Button
                  onClick={handleSendNormal}
                  className="w-10 h-10 rounded-xl bg-[#00A884] hover:bg-[#008F72] text-white flex items-center justify-center p-0 shrink-0"
                >
                  <Send className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0B141A]">
            <Radio className="w-16 h-16 text-[#00A884] opacity-25 animate-pulse mb-4" />
            <h3 className="text-lg font-bold text-[#e9edef] tracking-wide">No Active Chat Selected</h3>
            <p className="text-xs text-[#8696A0] max-w-sm mt-1 leading-relaxed">
              Choose a student from the sidebar thread list to connect, view chat logs, send message announcements or files.
            </p>
          </div>
        )}
      </section>

      {/* ================= BROADCAST OVERLAY MODAL ================= */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] border border-white/10 p-6 rounded-3xl w-full max-w-[460px] space-y-4 shadow-2xl relative">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#f59e0b]" />
                {selectedBroadcastCourseId === -1
                  ? "Broadcast to All Students"
                  : `Broadcast to Course ${selectedBroadcastCourseId || activeCourseId || ""}`}
              </h3>
              <p className="text-xs text-[#8696A0] mt-0.5">
                This announcement will be dispatched to all students enrolled in this course.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8696A0] uppercase tracking-wider mb-2">Select Course</label>
              <select
                value={selectedBroadcastCourseId === -1 ? "-1" : selectedBroadcastCourseId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBroadcastCourseId(val === "-1" ? -1 : val ? Number(val) : null);
                }}
                className="w-full h-10 border border-white/10 rounded-xl px-3 bg-[#0F172A] text-white text-sm outline-none focus:ring-1 focus:ring-[#f59e0b]"
              >
                <option value="">-- Choose Target --</option>
                <option value="-1">All Students (All Courses)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || `Course ${course.id}`}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              className="w-full border border-white/10 rounded-2xl p-3 h-28 bg-[#0F172A] text-white outline-none focus:ring-1 focus:ring-[#f59e0b] text-sm resize-none"
              placeholder="Type your course announcement here..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
            />

            <div className="space-y-2">
              <input
                type="file"
                ref={broadcastFileInputRef}
                onChange={(e) => setBroadcastPendingFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <Button
                onClick={() => broadcastFileInputRef.current?.click()}
                className="w-full h-10 border border-white/10 bg-[#0F172A] hover:bg-black/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Paperclip className="w-3.5 h-3.5 text-[#f59e0b]" />
                {broadcastPendingFile ? "Change File / Image" : "Attach File or Image"}
              </Button>

              {broadcastPendingFile && (
                <div className="bg-[#0F172A] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{broadcastPendingFile.name}</p>
                    <p className="text-[10px] text-[#8696A0] mt-0.5">{(broadcastPendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    {broadcastPendingFile.type.startsWith("image/") && (
                      <div className="mt-2 max-h-[140px] overflow-hidden rounded-lg">
                        <img
                          src={URL.createObjectURL(broadcastPendingFile)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setBroadcastPendingFile(null)}
                    className="w-7 h-7 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setBroadcastPendingFile(null);
                  setShowBroadcast(false);
                }}
                className="h-10 px-5 rounded-xl text-xs font-bold border border-white/5 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendBroadcast}
                disabled={broadcastLoading}
                className="h-10 px-6 rounded-xl text-xs font-bold bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center gap-2"
              >
                {broadcastLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Send Broadcast"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;