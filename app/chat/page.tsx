"use client";

import Sidebar from "@/components/Sidebar";
import { useTokenRefresh } from "@/shared/hooks/useTokenRefresh";

export default function ChatIndex() {
  useTokenRefresh();

  return (
    <>
      <header>Тут будут id инстанса и кнопка выхода</header>
      <Sidebar />
      <section className="flex-1 flex items-center justify-center bg-[#0e1621]">
        <p className="text-[#7d8b99] text-sm">
          Выберите контакт слева или добавьте новый
        </p>
      </section>
    </>
  );
}