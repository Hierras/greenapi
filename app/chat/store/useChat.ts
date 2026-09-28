"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
    ChatMessage,
    OutgoingMessageStatusType,
} from "@/shared/lib/green-api/types";

interface ChatState {
    currentChat: string | null;
    messagesByChat: Record<string, ChatMessage[]>;
    loadingByChat: Record<string, boolean>;

    setChat: (chatId: string | null) => void;
    addMessage: (msg: ChatMessage) => void;
    addMessages: (chatId: string, msgs: ChatMessage[]) => void;
    updateStatus: (
        chatId: string,
        idMessage: string,
        status: OutgoingMessageStatusType
    ) => void;
    replaceMessageId: (chatId: string, oldId: string, newId: string) => void;
    setLoading: (chatId: string, loading: boolean) => void;
}

const EMPTY: ChatMessage[] = [];

export const useChat = create<ChatState>()(
    persist(
        (set) => ({
            currentChat: null,
            messagesByChat: {},
            loadingByChat: {},

            setChat: (chatId) => set({ currentChat: chatId }),

            setLoading: (chatId, loading) =>
                set((s) => ({
                    loadingByChat: { ...s.loadingByChat, [chatId]: loading },
                })),

            addMessage: (msg) =>
                set((s) => {
                    const list = s.messagesByChat[msg.chatId] ?? [];
                    if (list.some((m) => m.idMessage === msg.idMessage)) return s;
                    return {
                        messagesByChat: {
                            ...s.messagesByChat,
                            [msg.chatId]: [...list, msg].sort(
                                (a, b) => a.timestamp - b.timestamp
                            ),
                        },
                    };
                }),

            addMessages: (chatId, msgs) =>
                set((s) => {
                    const list = s.messagesByChat[chatId] ?? [];
                    const known = new Set(list.map((m) => m.idMessage));
                    const fresh = msgs.filter((m) => !known.has(m.idMessage));
                    if (fresh.length === 0) return s;
                    return {
                        messagesByChat: {
                            ...s.messagesByChat,
                            [chatId]: [...list, ...fresh].sort(
                                (a, b) => a.timestamp - b.timestamp
                            ),
                        },
                    };
                }),

            updateStatus: (chatId, idMessage, status) =>
                set((s) => {
                    const list = s.messagesByChat[chatId];
                    if (!list) return s;
                    return {
                        messagesByChat: {
                            ...s.messagesByChat,
                            [chatId]: list.map((m) =>
                                m.idMessage === idMessage
                                ? { ...m, statusMessage: status }
                                : m
                            ),
                        },
                    };
                }),

            replaceMessageId: (chatId, oldId, newId) =>
                set((s) => {
                    const list = s.messagesByChat[chatId];
                    if (!list) return s;
                    return {
                        messagesByChat: {
                            ...s.messagesByChat,
                            [chatId]: list.map((m) =>
                                m.idMessage === oldId ? { ...m, idMessage: newId } : m
                            ),
                        },
                };
            }),
        }),
        {
        name: "ga_chat",
        storage: createJSONStorage(() => localStorage),
        version: 1,
        }
    )
);

export const selectMessages = (chatId: string | null) => (s: ChatState) =>
    chatId ? s.messagesByChat[chatId] ?? EMPTY : EMPTY;   