"use client";

import { useEffect, useRef, useState } from "react";
import { storage } from "@/shared/lib/store";
import type { Contact, Message } from "@/shared/lib/types";

export default function ChatWindow({ contact }: { contact: Contact }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const all = storage.getMessages();
    // setMessages(all.filter((m) => m.contactId === contact.id));
  }, [contact.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = (e: React.ChangeEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      contactId: contact.id,
      text: text.trim(),
      fromMe: true,
      ts: Date.now(),
    };
    const all = [...storage.getMessages(), msg];
    storage.setMessages(all);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="flex-1 flex flex-col bg-[#0e1621]">
      {/* header */}
      <header className="h-[60px] px-4 flex items-center gap-3 bg-[#17212b] border-b border-[#101921]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2aabee] to-[#229ed9] flex items-center justify-center font-medium">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium leading-tight">{contact.name}</div>
          <div className="text-xs text-[#7d8b99]">+{contact.phone}</div>
        </div>
      </header>

      {/* messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #17212b 0, transparent 40%), radial-gradient(circle at 80% 80%, #1b2937 0, transparent 40%)",
        }}
      >
        {messages.length === 0 && (
          <p className="text-center text-[#7d8b99] text-sm mt-10">
            Начните переписку
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow ${
                m.fromMe
                  ? "bg-[#2b5278] rounded-br-md"
                  : "bg-[#182533] rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{m.text}</div>
              <div className="text-[10px] text-right text-[#7d8b99] mt-0.5">
                {fmtTime(m.ts)}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* composer */}
      <form
        onSubmit={send}
        className="p-3 bg-[#17212b] border-t border-[#101921] flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 bg-[#242f3d] rounded-full px-4 py-2.5 outline-none placeholder:text-[#7d8b99]"
        />
        <button
          type="submit"
          className="w-11 h-11 rounded-full bg-[#2aabee] hover:bg-[#229ed9] flex items-center justify-center text-lg"
          title="Отправить"
        >
          ➤
        </button>
      </form>
    </section>
  );
}