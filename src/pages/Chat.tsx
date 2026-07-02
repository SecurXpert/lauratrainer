import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Search, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Thread {
  thread_id: number;
  course_id: number;
  unread_count: number;
  student?: {
    id: number;
    name: string;
  };
}

interface Message {
  id: number;
  sender_role: string;
  content?: string;
  created_at: string;
  thread_id: number;
  file_name?: string;
  file_data?: string;
  file_type?: string;
  message_type?: string;
}

const API_BASE = "http://192.168.0.122:10000";
const WS_BASE = "ws://192.168.0.122:10000";

const Chat = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // per-thread cache stored in state and persisted to session storage
  const [messagesByThread, setMessagesByThread] = useState<Record<number, Message[]>>(() => {
    try {
      const stored = sessionStorage.getItem("chat_cache");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🔥 Broadcast states
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastFile, setBroadcastFile] = useState<File | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const token = localStorage.getItem("access_token");

  const api = async (path: string) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  // ================= LOAD THREADS =================
  useEffect(() => {
    if (!token) return;
    api("/chat/trainer/threads")
      .then(setThreads)
      .catch(console.error);
  }, []);

  // ================= LOAD MESSAGES =================
  // helper to merge two message arrays without duplicates, sorted by time
  const mergeMessages = (existing: Message[], incoming: Message[]) => {
    const map = new Map<number, Message>();
    existing.forEach((m) => map.set(m.id, m));
    incoming.forEach((m) => map.set(m.id, m));
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  const persistCache = (cache: Record<number, Message[]>) => {
    try {
      sessionStorage.setItem("chat_cache", JSON.stringify(cache));
    } catch {}
  };

  const loadMessages = async (threadId: number, beforeId?: number) => {
    try {
      let url = `/chat/thread/${threadId}/messages?limit=50`;
      if (beforeId) url += `&before_id=${beforeId}`;
      const data = await api(url);

      const formatted = (data || []).map((msg: any) => {
        if (msg.message_type === "file" && msg.file_data) {
          if (!msg.file_data.startsWith("data:")) {
            msg.file_data = `${API_BASE}/${msg.file_data}`;
          }
        }
        return msg;
      });

      let mergedList: Message[] = [];
      setMessagesByThread((prev) => {
        const existing = prev?.[threadId] || [];
        mergedList = mergeMessages(existing, formatted);
        const next = { ...(prev || {}), [threadId]: mergedList };
        persistCache(next);
        return next;
      });

      if (selectedThread?.thread_id === threadId) {
        setMessages(mergedList);
      }
      return mergedList;
    } catch (err) {
      console.error("failed to load messages", err);
      return [];
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ================= CONNECT WS =================
  const connectWS = (threadId: number) => {
    wsRef.current?.close();

    const ws = new WebSocket(
      `${WS_BASE}/ws/chat/${threadId}?token=${encodeURIComponent(token || "")}`
    );

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (!msg || msg.type !== "message") return;
      const msgThreadId = msg.thread_id as number;
      if (!msgThreadId) return;

      setMessagesByThread((prev) => {
        const existing = prev?.[msgThreadId] || [];
        const merged = mergeMessages(existing, [msg]);
        const next = { ...(prev || {}), [msgThreadId]: merged };
        persistCache(next);
        return next;
      });

      if (msgThreadId === threadId) {
        setMessages((prev) => mergeMessages(prev, [msg]));
      }
    };

    wsRef.current = ws;
  };

  const handleSelectThread = async (thread: Thread) => {
    setSelectedThread(thread);
    const cached = messagesByThread?.[thread.thread_id];
    if (cached && cached.length) {
      setMessages(cached);
      loadMessages(thread.thread_id).catch(console.error);
    } else {
      await loadMessages(thread.thread_id);
    }
    connectWS(thread.thread_id);
  };

  const loadEarlier = async () => {
    if (!selectedThread) return;
    const current = messagesByThread[selectedThread.thread_id] || [];
    if (current.length === 0) return;
    const oldest = current[0];
    const more = await loadMessages(selectedThread.thread_id, oldest.id);
    if (more && more.length) {
      setMessages((prev) => mergeMessages(more, prev));
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // ================= SEND NORMAL MESSAGE =================
  const handleSend = async () => {
    if (!selectedThread || !wsRef.current) return;

    const now = new Date().toISOString();

    // FILE
    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile);

      const newMsg: Message = {
        id: Date.now(),
        sender_role: "trainer",
        created_at: now,
        thread_id: selectedThread.thread_id,
        message_type: "file",
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_data: base64,
      };

      setMessages((prev) => mergeMessages(prev, [newMsg]));
      setMessagesByThread((prev) => {
        const t = selectedThread.thread_id;
        const existing = prev?.[t] || [];
        const next = { ...(prev || {}), [t]: mergeMessages(existing, [newMsg]) };
        persistCache(next);
        return next;
      });

      wsRef.current.send(
        JSON.stringify({
          type: "message",
          message_type: "file",
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_data: base64,
          thread_id: selectedThread.thread_id,
        })
      );

      setSelectedFile(null);
      return;
    }

    // TEXT
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      sender_role: "trainer",
      content: message,
      created_at: now,
      thread_id: selectedThread.thread_id,
      message_type: "text",
    };

    // update both visible and cache
    setMessages((prev) => mergeMessages(prev, [newMsg]));
    setMessagesByThread((prev) => {
      const t = selectedThread!.thread_id;
      const existing = prev?.[t] || [];
      const next = { ...(prev || {}), [t]: mergeMessages(existing, [newMsg]) };
      persistCache(next);
      return next;
    });

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        message_type: "text",
        content: message,
        thread_id: selectedThread.thread_id,
      })
    );

    setMessage("");
  };

  // ================= SEND BROADCAST =================
  const handleBroadcastSend = async () => {
  if (!selectedThread) return;
  if (!broadcastText) {
    alert("Please enter announcement text");
    return;
  }

  try {
    const payload = {
      content: broadcastText,
      file_key: null,
      file_name: null,
      file_mime: null,
      file_size: null,
    };

    const res = await fetch(
      `${API_BASE}/chat/broadcast/${selectedThread.course_id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Broadcast failed");
      return;
    }

    // ✅ Add to UI
    const newBroadcast: Message = {
      id: Date.now(),
      sender_role: "trainer",
      content: broadcastText,
      created_at: new Date().toISOString(),
      thread_id: selectedThread.thread_id,
      message_type: "text",
    };

    setMessages((prev) => mergeMessages(prev, [newBroadcast]));
    setMessagesByThread((prev) => {
      const next: Record<number, Message[]> = {};
      Object.entries(prev || {}).forEach(([k, arr]) => {
        next[+k] = mergeMessages(arr, [newBroadcast]);
      });
      if (selectedThread) {
        const t = selectedThread.thread_id;
        next[t] = mergeMessages(prev?.[t] || [], [newBroadcast]);
      }
      persistCache(next);
      return next;
    });

    alert(`Broadcast sent to ${data.students} students`);

    setBroadcastText("");
    setShowBroadcast(false);

  } catch (error) {
    console.error(error);
    alert("Broadcast failed");
  }
};

  const filteredThreads = threads.filter((t) =>
    t.student?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER WITH BROADCAST BUTTON */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chat</h1>
        <Button
          onClick={() => {
            if (!selectedThread) return alert("Select thread first");
            setShowBroadcast(true);
          }}
        >
          Broadcast to Course
        </Button>
      </div>

      {/* BROADCAST MODAL */}
      {showBroadcast && selectedThread && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-xl w-[450px] space-y-4 shadow-xl">
            <h2 className="text-lg font-semibold">
              Broadcast to Course {selectedThread.course_id}
            </h2>

            <textarea
              className="w-full border rounded-md p-3 h-28"
              placeholder="Type announcement..."
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
            />

            <input
              type="file"
              onChange={(e) =>
                setBroadcastFile(e.target.files?.[0] || null)
              }
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowBroadcast(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBroadcastSend}>
                Send Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">

        {/* THREAD LIST */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>

          <CardContent className="p-4">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>

          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-420px)]">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.thread_id}
                  className="p-4 border-b cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSelectThread(thread)}
                >
                  <div className="flex justify-between">
                    <span>{thread.student?.name}</span>
                    {thread.unread_count > 0 && (
                      <Badge>{thread.unread_count}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CHAT WINDOW */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              <CardHeader>
                <CardTitle>{selectedThread.student?.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-500px)] p-4">
                  <div className="space-y-4">
                    <button
                      className="text-sm underline mb-2"
                      onClick={loadEarlier}
                      disabled={messages.length === 0}
                    >
                      Load earlier messages
                    </button>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t flex gap-2 items-center">
                <label className="cursor-pointer">
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                </label>

                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />

                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              Select a chat
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg }: { msg: Message }) => {
  const isTrainer = msg.sender_role === "trainer";

  return (
    <div className={`flex ${isTrainer ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[70%] rounded-lg p-3 bg-muted">
        {msg.message_type === "text" && (
          <p className="text-sm">{msg.content}</p>
        )}

        {msg.message_type === "file" &&
          msg.file_type?.startsWith("image") && (
            <img
              src={msg.file_data}
              alt={msg.file_name}
              className="max-w-xs rounded-md"
            />
          )}

        {msg.message_type === "file" &&
          !msg.file_type?.startsWith("image") && (
            <a
              href={msg.file_data}
              download={msg.file_name}
              className="text-blue-600 underline text-sm"
            >
              📄 {msg.file_name}
            </a>
          )}

        <p className="text-xs mt-1 opacity-70">
          {new Date(msg.created_at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Chat;


// import { useEffect, useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Send, Search, Paperclip } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// interface Thread {
//   thread_id: number;
//   course_id: number;
//   unread_count: number;
//   student?: {
//     id: number;
//     name: string;
//   };
// }

// interface Message {
//   id: number;
//   sender_role: string;
//   content?: string;
//   created_at: string;
//   thread_id: number;
//   file_key?: string;
//   file_name?: string;
//   file_mime?: string;
//   message_type?: string;
// }

// const API_BASE = "http://192.168.0.122:10000";
// const WS_BASE = "ws://192.168.0.122:10000";

// const Chat = () => {
//   const [threads, setThreads] = useState<Thread[]>([]);
//   const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [message, setMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pendingFile, setPendingFile] = useState<File | null>(null);

//   const wsRef = useRef<WebSocket | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   const token = localStorage.getItem("access_token");


//   const SecureImage = ({ fileKey }: { fileKey: string }) => {
//   const [src, setSrc] = useState<string | null>(null);
//   const token = localStorage.getItem("access_token");

//   useEffect(() => {
//     const loadImage = async () => {
//       try {
//         const res = await fetch(
//           `${API_BASE}/chat/file/${fileKey}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!res.ok) throw new Error("Image load failed");

//         const blob = await res.blob();
//         const url = URL.createObjectURL(blob);
//         setSrc(url);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     loadImage();
//   }, [fileKey]);

//   if (!src) return <div className="text-xs">Loading image...</div>;

//   return (
//     <img
//       src={src}
//       alt="chat-img"
//       className="rounded-lg max-h-72 object-cover"
//     />
//   );
// };

//   // ================= API =================
//   const api = async (path: string) => {
//     const res = await fetch(`${API_BASE}${path}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (!res.ok) throw new Error(await res.text());
//     return res.json();
//   };

//   const uploadAttachment = async (threadId: number, file: File) => {
//     const fd = new FormData();
//     fd.append("upload", file);

//     const res = await fetch(
//       `${API_BASE}/chat/thread/${threadId}/upload`,
//       {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       }
//     );

//     if (!res.ok) throw new Error(await res.text());
//     return res.json();
//   };

//   // ================= Load Threads =================
//   useEffect(() => {
//     if (!token) return;
//     api("/chat/trainer/threads")
//       .then(setThreads)
//       .catch(console.error);
//   }, []);

//   const loadMessages = async (threadId: number) => {
//     const data = await api(`/chat/thread/${threadId}/messages`);
//     setMessages(data);
//   };

//   // ================= WebSocket =================
//   const connectWS = (threadId: number) => {
//     if (wsRef.current) wsRef.current.close();

//     const ws = new WebSocket(
//       `${WS_BASE}/ws/chat/${threadId}?token=${encodeURIComponent(token || "")}`
//     );

//     ws.onmessage = (event) => {
//       const msg = JSON.parse(event.data);
//       if (msg.type === "message") {
//         setMessages((prev) => [...prev, msg]);
//       }
//     };

//     wsRef.current = ws;
//   };

//   const handleSelectThread = (thread: Thread) => {
//     setSelectedThread(thread);
//     loadMessages(thread.thread_id);
//     connectWS(thread.thread_id);
//   };

//   // ================= SEND =================
//   const handleSend = async () => {
//     if (!selectedThread) return;
//     if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

//     // ===== FILE SEND =====
//     if (pendingFile) {
//       try {
//         const fileData = await uploadAttachment(
//           selectedThread.thread_id,
//           pendingFile
//         );

//         wsRef.current.send(
//           JSON.stringify({
//             type: "message",
//             content: null,
//             file_key: fileData.file_key,
//             file_name: fileData.file_name,
//             file_mime: fileData.file_mime,
//             message_type: pendingFile.type.startsWith("image/")
//               ? "image"
//               : "file",
//           })
//         );

//         setPendingFile(null);
//       } catch (err: any) {
//         alert(err.message);
//       }
//       return;
//     }

//     // ===== TEXT SEND =====
//     if (!message.trim()) return;

//     wsRef.current.send(
//       JSON.stringify({
//         type: "message",
//         content: message,
//         message_type: "text",
//       })
//     );

//     setMessage("");
//   };

//   // Auto scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const filteredThreads = threads.filter((t) =>
//     t.student?.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Chat</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">

//         {/* LEFT SIDE */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Messages</CardTitle>
//           </CardHeader>

//           <CardContent className="p-4">
//             <div className="relative mb-4">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
//               <Input
//                 placeholder="Search..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </CardContent>

//           <CardContent className="p-0">
//             <ScrollArea className="h-[calc(100vh-420px)]">
//               {filteredThreads.map((thread) => (
//                 <div
//                   key={thread.thread_id}
//                   className={`p-4 border-b cursor-pointer ${
//                     selectedThread?.thread_id === thread.thread_id
//                       ? "bg-muted"
//                       : "hover:bg-muted/50"
//                   }`}
//                   onClick={() => handleSelectThread(thread)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Avatar>
//                       <AvatarFallback>
//                         {thread.student?.name?.charAt(0)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="flex-1">
//                       <h4 className="font-semibold">
//                         {thread.student?.name}
//                       </h4>
//                       {thread.unread_count > 0 && (
//                         <Badge>{thread.unread_count}</Badge>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </ScrollArea>
//           </CardContent>
//         </Card>

//         {/* RIGHT SIDE */}
//         <Card className="lg:col-span-2 flex flex-col">
//           {selectedThread ? (
//             <>
//               <CardHeader>
//                 <CardTitle>{selectedThread.student?.name}</CardTitle>
//               </CardHeader>

//               <CardContent className="flex-1 p-4 overflow-auto">
//                 <div className="space-y-4">
//                   {messages.map((msg) => (
//                     <div
//                       key={msg.id}
//                       className={`flex ${
//                         msg.sender_role === "trainer"
//                           ? "justify-end"
//                           : "justify-start"
//                       }`}
//                     >
//                       <div className="max-w-[75%] rounded-xl p-3 bg-muted shadow">

//                         {/* IMAGE */}
//                         {msg.file_key && msg.message_type === "image" && (
//   <SecureImage fileKey={msg.file_key} />
// )}

//                         {/* FILE */}
//                         {msg.file_key && msg.message_type === "file" && (
//                           <a
//                             href={`${API_BASE}/chat/file/${msg.file_key}`}
//                             target="_blank"
//                             rel="noreferrer"
//                             className="underline text-blue-600 font-medium"
//                           >
//                             {msg.file_name}
//                           </a>
//                         )}

//                         {/* TEXT */}
//                         {!msg.file_key && (
//                           <p className="text-sm whitespace-pre-wrap">
//                             {msg.content}
//                           </p>
//                         )}

//                         <p className="text-xs mt-2 opacity-60 text-right">
//                           {new Date(msg.created_at).toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </div>
//                     </div>
//                   ))}

//                   <div ref={bottomRef} />
//                 </div>
//               </CardContent>

//               {/* INPUT */}
//               <div className="p-4 border-t flex gap-2 items-center">
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   hidden
//                   onChange={(e) =>
//                     setPendingFile(e.target.files?.[0] || null)
//                   }
//                 />

//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <Paperclip className="w-4 h-4" />
//                 </Button>

//                 <Input
//                   placeholder="Type your message..."
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSend()}
//                 />

//                 <Button onClick={handleSend}>
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </div>

//               {pendingFile && (
//                 <div className="px-4 pb-2 text-sm text-muted-foreground">
//                   Attached: {pendingFile.name}
//                 </div>
//               )}
//             </>
//           ) : (
//             <CardContent className="flex items-center justify-center h-full">
//               Select a chat
//             </CardContent>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Chat;