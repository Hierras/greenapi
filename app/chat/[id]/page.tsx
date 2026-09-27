"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { storage } from "@/shared/lib/store";
import type { Contact } from "@/shared/lib/types";

export default function ChatByIdPage() {
  const params = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = storage.getContacts().find((c) => c.id === params.id);
    // if (found) setContact(found);
    // else setNotFound(true);
  }, [params.id]);

  return (
    <>
      <Sidebar />
      {contact ? (
        <ChatWindow contact={contact} />
      ) : (
        <section className="flex-1 flex items-center justify-center bg-[#0e1621] text-[#7d8b99] text-sm">
          {notFound ? "Контакт не найден" : "Загрузка..."}
        </section>
      )}
    </>
  );
}