"use client";

import Sidebar from "@/components/Sidebar";
import { useNotificationPolling } from "@/shared/hooks/useNotificationPolling";
import { useTokenRefresh } from "@/shared/hooks/useTokenRefresh";
import { isIncomingMessage, isTextMessage } from "@/shared/lib/green-api/types";
import logger from "@/shared/lib/logger";

export default function ChatIndex() {
  useTokenRefresh();

  useNotificationPolling({
    onNotification: (n) => {

      if (isIncomingMessage(n.body) && isTextMessage(n.body.messageData)) {
        const message = n.body?.messageData?.textMessageData?.textMessage;
        logger.info("Новое уведомление: " + message);
      }
      console.log(n)
    },
    onError: (e) => console.error("Polling error", e),
  });

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