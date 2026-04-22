"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username] = useState(() => "User_" + Math.floor(Math.random() * 1000));
  const [isConnected, setIsConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const startSocket = async () => {
      await fetch("/api/socket");
      if (isCancelled) return;

      const socket = io(window.location.origin, {
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("receive_message", (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });
    };

    startSocket();

    return () => {
      isCancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("receive_message");
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket || !isConnected) {
      return;
    }

    if (input.trim()) {
      const message = {
        sender: username,
        content: input,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send_message", message);
      setInput("");
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
      <section className="mx-auto flex h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Chat Room</h1>
            <p className="text-xs text-slate-500">
              {isConnected ? "Connected" : "Connecting..."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-slate-700">
              {username}
            </span>
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-100"
            >
              Home
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center rounded-xl  p-6 text-center">
              <p className="text-sm text-slate-500">No messages yet</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender === username;
              return (
                <article
                  key={idx}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm sm:max-w-[70%] ${
                      isMine
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="mb-1 text-xs font-medium opacity-80">
                      {msg.sender}
                    </p>
                    <p className="break-words">{msg.content}</p>
                    <p className="mt-1 text-[11px] opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </article>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        <footer className="border-t border-slate-200 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !input.trim()}
              className="h-11 shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              Send
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
