"use client";

import { useState } from "react";
import type { Contact } from "@/shared/lib/types";
import AddContactModal from "./AddContactModal";
import { logoutAction } from "@/app/chat/actions/logoutAction";
import { useChat } from "../store/useChat";
import { clearPhoneNumber, isValidChatId } from "../utils/validate";
import { toast } from "react-toastify";
import { useContacts } from "../store/useContacts";

export default function Sidebar() {
  const { currentChat, setChat } = useChat(s => s);
  const { contacts, addContact, deleteContact } = useContacts(s => s);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleAddContact = (c: Contact) => {
    addContact(c);
    setOpen(false);
  };

  const handleDeleteContact = (phone: string) => {
    deleteContact(phone);
  };


  const selectChat = (phone: string) => {
    if (!isValidChatId(phone)) {
      toast.warning("Ошибка формата номер телефона! Попробуйте пересоздать контакт");
      return;
    }
    setChat(phone);
  }

  const logout = async () => {
    await logoutAction();
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <aside className="w-85 shrink-0 bg-[#F7FAF4] border-r border-[#D8E5CC] flex flex-col">
      {/* header */}
      <div className="p-3 flex items-center gap-2 border-b border-[#D8E5CC]">
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="w-full bg-white border border-[#D8E5CC] rounded-full px-9 py-2 text-sm text-[#1A2A12] outline-none placeholder:text-[#8FA882] focus:ring-2 focus:ring-[#3B9702] focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA882]">
            🔍
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          title="Добавить контакт"
          className="w-9 h-9 rounded-full bg-[#3B9702] hover:bg-[#4CB505] text-white cursor-pointer flex items-center justify-center text-xl leading-none transition shadow-sm"
        >
          +
        </button>
        <button
          onClick={logout}
          title="Выйти"
          className="w-9 h-9 rounded-full bg-white border border-[#D8E5CC] hover:bg-[#EEF5E8] cursor-pointer text-[#5E7353] flex items-center justify-center transition"
        >
          ⎋
        </button>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-[#5E7353] text-sm mt-8 px-6">
            Нет контактов. Нажмите «+», чтобы добавить.
          </p>
        )}
        {filtered.map((c) => {
          const active = c.phone === currentChat;
          return (
            <div
              key={c.phone}
              className={`group relative flex items-center border-l-4 transition ${
                active
                  ? "bg-[#DFF0D0] border-[#3B9702]"
                  : "hover:bg-[#EEF5E8] border-transparent"
              }`}
            >
              <button
                onClick={() => selectChat(c.phone)}
                className="flex-1 min-w-0 cursor-pointer text-left px-3 py-3 flex items-center gap-3"
              >
                <div className="w-11 h-11 shrink-0 rounded-full bg-linear-to-br from-[#4CB505] to-[#2F7A02] flex items-center justify-center text-lg font-medium text-white shadow-sm">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-[#1A2A12]">{c.name}</div>
                  <div className="text-xs text-[#5E7353] truncate">{clearPhoneNumber(c.phone)}</div>
                </div>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContact(c.phone);
                }}
                title="Удалить контакт"
                aria-label={`Удалить ${c.name}`}
                className={`mr-2 w-8 h-8 cursor-pointer shrink-0 rounded-full flex items-center justify-center text-[#8FA882] hover:text-white hover:bg-red-500 transition ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>

      {open && (
        <AddContactModal onClose={() => setOpen(false)} onSubmit={handleAddContact} />
      )}
    </aside>
  );
}