"use client";

import Sidebar from "@/app/chat/ui/Sidebar";
import { useTokenRefresh } from "@/shared/hooks/useTokenRefresh";
import { useChat } from "./store/useChat";
import ChatWindow from "./ui/ChatWindow";
import { useContacts } from "./store/useContacts";
import { useNotifications } from "./hooks/useNotifications";

export default function ChatIndex() {
  useTokenRefresh();

  useNotifications(true);

  const currentChat = useChat(state => state.currentChat);

  const currentContact = useContacts(s => s.contacts.find(c => c.phone === currentChat));

  return (
    <>
      <Sidebar />
      {currentContact ?
        <ChatWindow contact={currentContact} /> :
        <section className="flex-1 flex items-center justify-center bg-[#ffff]">        
          <p className="text-[#7d8b99] text-sm">
            Выберите контакт слева или добавьте новый
          </p>
        </section>
      }
    </>
  );
}