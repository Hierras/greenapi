"use client";

import { useEffect, useRef, useState } from "react";
import type { Contact } from "@/shared/lib/types";
import type { ChatMessage } from "@/shared/lib/green-api/types";
import { sendMessageAction } from "../actions/sendMessageAction";
import { getMessagesAction } from "../actions/getMessagesAction";
import { selectMessages, useChat } from "../store/useChat";
import { clearPhoneNumber, resolveChatId, toChatId } from "../utils/validate";
import { uuid } from "../utils/uuid";

const isFromMe = (m: ChatMessage) => m.type === "outgoing";

const getText = (m: ChatMessage): string => {
  if (
    m.typeMessage === "textMessage" ||
    m.typeMessage === "extendedTextMessage"
  ) {
    return m.textMessage ?? "";
  }
  return m.caption ?? `[${m.typeMessage}]`;
};

export default function ChatWindow({ contact }: { contact: Contact }) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatId = resolveChatId(contact);
  
  const messages = useChat(selectMessages(chatId));
  const addMessage = useChat((s) => s.addMessage);
  const addMessages = useChat((s) => s.addMessages);
  const updateStatus = useChat((s) => s.updateStatus);
  const replaceMessageId = useChat((s) => s.replaceMessageId);
  const isLoading = useChat((s) => s.loadingByChat[chatId] ?? false);
  const setLoading = useChat((s) => s.setLoading);

  // подгрузка истории при заходе в чат
  useEffect(() => {
    if (!chatId) return;

    const existing = useChat.getState().messagesByChat[chatId];
    if (existing && existing.length > 0) return;

    let cancelled = false;
    setLoading(chatId, true);

    getMessagesAction(chatId, 100)
      .then((history) => {
        if (cancelled || !history) return;

        // приводим ChatMessage[] из API к ChatMessage[] стора
        const mapped: ChatMessage[] = history.map((m) => ({
          type: m.type,
          idMessage: m.idMessage,
          timestamp: m.timestamp,
          typeMessage: m.typeMessage,
          chatId: m.chatId,
          chatType: m.chatType,
          textMessage: m.textMessage,
          senderName: m.senderName,
          senderContactName: m.senderContactName,
          statusMessage: m.statusMessage,
          sendByApi: m.sendByApi,
          downloadUrl: m.downloadUrl,
          caption: m.caption,
          fileName: m.fileName,
          jpegThumbnail: m.jpegThumbnail,
          mimeType: m.mimeType,
          isAnimated: m.isAnimated,
          deletedMessageId: m.deletedMessageId,
          editedMessageId: m.editedMessageId,
          isEdited: m.isEdited,
          isDeleted: m.isDeleted,
        }));

        addMessages(chatId, mapped);
      })
      .finally(() => {
        if (!cancelled) setLoading(chatId, false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, addMessages, setLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const localId = uuid();

    const optimistic: ChatMessage = {
      type: "outgoing",
      idMessage: localId,
      timestamp: Math.floor(Date.now() / 1000),
      typeMessage: "textMessage",
      chatId,
      chatType: "user",
      textMessage: value,
      sendByApi: true,
      statusMessage: "sent",
    };

    addMessage(optimistic);
    setText("");

    const res = await sendMessageAction(contact.phone, value);
    if (!res.ok || !res.idMessage) {
      updateStatus(chatId, localId, "failed");
      return;
    }
    replaceMessageId(chatId, localId, res.idMessage);
  };

  const fmtTime = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="flex-1 flex flex-col bg-white">
      <header className="h-15 px-4 flex items-center gap-3 bg-[#F7FAF4] border-b border-[#D8E5CC]">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#4CB505] to-[#2F7A02] flex items-center justify-center font-medium text-white shadow-sm">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium leading-tight text-[#1A2A12]">
            {contact.name}
          </div>
          <div className="text-xs text-[#5E7353]">
            {clearPhoneNumber(contact.phone)}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading && messages.length === 0 && (
          <p className="text-center text-[#5E7353] text-sm mt-10">
            Загрузка истории…
          </p>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="text-center text-[#5E7353] text-sm mt-10">
            Начните переписку
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.idMessage}
            className={`flex ${isFromMe(m) ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm border ${
                isFromMe(m)
                  ? "bg-[#DCF3C8] border-[#C6E8AC] text-[#1A2A12] rounded-br-md"
                  : "bg-[#F1F5EC] border-[#E1E9DA] text-[#1A2A12] rounded-bl-md"
              }`}
            >
              <div className="whitespace-pre-wrap wrap-break-word">
                {getText(m)}
              </div>
              <div className="text-[10px] text-right text-[#5E7353] mt-0.5">
                {fmtTime(m.timestamp)}
                {isFromMe(m) && m.statusMessage === "failed" && (
                  <span className="ml-1 text-red-500">⚠</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="p-3 bg-[#F7FAF4] border-t border-[#D8E5CC] flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 bg-white border border-[#D8E5CC] rounded-full px-4 py-2.5 text-[#1A2A12] outline-none placeholder:text-[#8FA882] focus:ring-2 focus:ring-[#3B9702] focus:border-transparent"
        />
        <button
          type="submit"
          className="w-11 h-11 rounded-full bg-[#3B9702] hover:bg-[#4CB505] text-white flex items-center justify-center text-lg transition shadow-sm"
          title="Отправить"
        >
          ➤
        </button>
      </form>
    </section>
  );
}