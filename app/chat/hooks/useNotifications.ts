"use client";

import { useNotificationPolling } from "@/shared/hooks/useNotificationPolling";
import {
  isIncomingMessage,
  isOutgoingStatus,
  isOutgoingAPIMessage,
  isOutgoingMessage,
  isTextMessage,
} from "@/shared/lib/green-api/types";
import type { ChatMessage } from "@/shared/lib/green-api/types";
import { useChat } from "../store/useChat";
import { useContacts } from "../store/useContacts";
import { toast } from "react-toastify";

export function useNotifications(enabled: boolean) {

  useNotificationPolling({
    enabled,
    onNotification: (n) => {
      const chat = useChat.getState();
      const contacts = useContacts.getState();

      /* ---------- Входящие ---------- */
      if (isIncomingMessage(n.body)) {
        const { messageData, senderData, idMessage, timestamp } = n.body;
        const { chatId, sender, phone } = senderData;

        const digits = phone?.toString() ?? sender.replace(/\D/g, "");
        const contact = contacts.findByChatIdOrPhone(chatId, digits);

        if (!contact) return;

        if (!contact.chatId) {
          contacts.updateContact(contact.phone, { chatId });
        }

        const text = isTextMessage(messageData)
          ? messageData.textMessageData.textMessage
          : `[${messageData.typeMessage}]`;

        const msg: ChatMessage = {
          type: "incoming",
          idMessage: idMessage!,
          timestamp,
          typeMessage: messageData.typeMessage,
          chatId,
          chatType: senderData.senderType ?? "user",
          textMessage: isTextMessage(messageData)
            ? messageData.textMessageData.textMessage
            : undefined,
          caption:
            "caption" in messageData ? messageData.caption : undefined,
          senderName: senderData.senderName,
          senderContactName: senderData.senderContactName,
        };

        chat.addMessage(msg);

        if (chat.currentChat !== chatId) {
          toast.info(`${contact.name} - ${text}`);
        }
      }

      /* ---------- Исходящие через API ---------- */
      if (isOutgoingAPIMessage(n.body)) {
        const { messageData, senderData, idMessage, timestamp } = n.body;
        const { chatId } = senderData;

        const contact = contacts.findByChatIdOrPhone(chatId);
        if (!contact) return;

        const msg: ChatMessage = {
          type: "outgoing",
          idMessage: idMessage!,
          timestamp,
          typeMessage: messageData.typeMessage,
          chatId,
          chatType: senderData.senderType ?? "user",
          textMessage: isTextMessage(messageData)
            ? messageData.textMessageData.textMessage
            : undefined,
          caption:
            "caption" in messageData ? messageData.caption : undefined,
          sendByApi: true,
        };

        const existing = chat.messagesByChat[chatId] ?? [];
        const alreadyThere = existing.some(
          (m) => m.idMessage === msg.idMessage
        );
        if (!alreadyThere) chat.addMessage(msg);
      }

      /* ---------- Исходящие с телефона ---------- */
      if (isOutgoingMessage(n.body)) {
        const { messageData, senderData, idMessage, timestamp } = n.body;
        const { chatId } = senderData;

        const contact = contacts.findByChatIdOrPhone(chatId);
        if (!contact) return;

        const msg: ChatMessage = {
          type: "outgoing",
          idMessage: idMessage!,
          timestamp,
          typeMessage: messageData.typeMessage,
          chatId,
          chatType: senderData.senderType ?? "user",
          textMessage: isTextMessage(messageData)
            ? messageData.textMessageData.textMessage
            : undefined,
          caption:
            "caption" in messageData ? messageData.caption : undefined,
          sendByApi: false,
        };

        chat.addMessage(msg);
      }

      /* ---------- Статусы ---------- */
      if (isOutgoingStatus(n.body)) {
        const contact = contacts.findByChatIdOrPhone(n.body.chatId);
        if (!contact) return;

        chat.updateStatus(
          n.body.chatId,
          n.body.idMessage!,
          n.body.status
        );
      }
    },
    onError: (e) => console.error("Polling error", e),
  });
}