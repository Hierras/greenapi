"use client";

import type { Contact, Message } from "./types";

const CONTACTS_KEY = "ga_contacts";
const MESSAGES_KEY = "ga_messages";

export const storage = {
  getContacts(): Contact[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? (JSON.parse(raw) as Contact[]) : [];
  },
  setContacts(c: Contact[]) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(c));
  },

  getMessages(): Message[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  },
  setMessages(m: Message[]) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(m));
  },
};