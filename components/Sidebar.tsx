"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storage } from "@/shared/lib/store";
import type { Contact } from "@/shared/lib/types";
import AddContactModal from "./AddContactModal";

export default function Sidebar() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const activeId = params?.id;

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setContacts(storage.getContacts());
  }, []);

  const addContact = (c: Contact) => {
    const next = [...contacts, c];
    setContacts(next);
    storage.setContacts(next);
    setOpen(false);
    router.push(`/chat/${c.id}`);
  };

  const logout = () => {
    storage.clearAuth();
    router.replace("/");
  };

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <aside className="w-[340px] shrink-0 bg-[#17212b] border-r border-[#101921] flex flex-col">
      {/* header */}
      <div className="p-3 flex items-center gap-2 border-b border-[#101921]">
        <div className="flex-1 relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            className="w-full bg-[#242f3d] rounded-full px-9 py-2 text-sm outline-none placeholder:text-[#7d8b99]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7d8b99]">
            🔍
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          title="Добавить контакт"
          className="w-9 h-9 rounded-full bg-[#2aabee] hover:bg-[#229ed9] flex items-center justify-center text-xl leading-none"
        >
          +
        </button>
        <button
          onClick={logout}
          title="Выйти"
          className="w-9 h-9 rounded-full bg-[#242f3d] hover:bg-[#2b3a4d] flex items-center justify-center"
        >
          ⎋
        </button>
      </div>

      {/* list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-center text-[#7d8b99] text-sm mt-8 px-6">
            Нет контактов. Нажмите «+», чтобы добавить.
          </p>
        )}
        {filtered.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              className={`w-full text-left px-3 py-3 flex items-center gap-3 transition ${
                active ? "bg-[#2b5278]" : "hover:bg-[#202b36]"
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2aabee] to-[#229ed9] flex items-center justify-center text-lg font-medium">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-[#7d8b99] truncate">+{c.phone}</div>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <AddContactModal onClose={() => setOpen(false)} onSubmit={addContact} />
      )}
    </aside>
  );
}