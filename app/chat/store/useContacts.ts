// shared/store/useContacts.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Contact } from "@/shared/lib/types";

interface ContactsState {
  contacts: Contact[];

  addContact: (contact: Contact) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  /** Удобный хелпер: найти контакт по chatId или phone. */
  findByChatIdOrPhone: (chatId: string, phone?: string) => Contact | undefined;
  deleteContact: (id: string) => void;
  clear: () => void;
}

export const useContacts = create<ContactsState>()(
  persist(
    (set, get) => ({
      contacts: [],

      addContact: (contact) =>
        set((s) => {
          const digits = contact.phone.replace(/\D/g, "");
          const exists = s.contacts.some(
            (c) =>
              (contact.chatId && c.chatId === contact.chatId) ||
              c.phone.replace(/\D/g, "") === digits
          );
          if (exists) return s;
          return { contacts: [...s.contacts, contact] };
        }),

      updateContact: (id, patch) =>
        set((s) => {
          const idx = s.contacts.findIndex((c) => c.phone === id);
          if (idx === -1) return s;

          const current = s.contacts[idx];
          // не перезаписываем поля пустыми значениями
          const clean = Object.fromEntries(
            Object.entries(patch).filter(([, v]) => v !== undefined)
          ) as Partial<Contact>;

          const next = { ...current, ...clean };
          const contacts = [...s.contacts];
          contacts[idx] = next;
          return { contacts };
        }),

      findByChatIdOrPhone: (chatId, phone) => {
        const list = get().contacts;

        if (chatId) {
          const byChat = list.find((c) => c.chatId === chatId);
          if (byChat) return byChat;
        }

        if (phone) {
          const digits = phone.replace(/\D/g, "");
          return list.find((c) => c.phone.replace(/\D/g, "") === digits);
        }

        return undefined;
      },

      deleteContact: (id) =>
        set((s) => ({
          contacts: s.contacts.filter((c) => c.phone !== id),
        })),

      clear: () => set({ contacts: [] }),
    }),
    {
        name: "ga_contacts",
        storage: createJSONStorage(() => localStorage),
        version: 2,
        migrate: (persisted, version) => {
            if (version === 1) {
                return persisted as ContactsState;
            }
            return persisted as ContactsState;
        },
    }
  )
);