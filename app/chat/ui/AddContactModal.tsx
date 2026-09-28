"use client";

import { useState } from "react";
import type { Contact } from "@/shared/lib/types";
import { checkAccountAction } from "../actions/checkAccountAction";
import { toChatId } from "../utils/validate";

export default function AddContactModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (c: Contact) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const submit = async (e: React.ChangeEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!name.trim() || cleanPhone.length < 10) {
      setError("Введите ФИО и корректный номер (минимум 10 цифр)");
      return;
    }

    setIsChecking(true);
    setError("");

    const res = await checkAccountAction(cleanPhone);
    setIsChecking(false);

    if (!res.ok || !res.chatId) {
      setError(res.error ?? "Не удалось проверить аккаунт");
      return;
    }

    const specPhoneNumber = toChatId(cleanPhone) ?? cleanPhone;

    onSubmit({
      name: name.trim(),
      phone: specPhoneNumber,
      chatId: res.chatId,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-2xl p-6 border border-[#D8E5CC] shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4 text-[#1A2A12]">
          Новый контакт
        </h2>

        <label className="block text-sm text-[#5E7353] mb-1">ФИО</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          disabled={isChecking}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#F7FAF4] border border-[#D8E5CC] text-[#1A2A12] outline-none placeholder:text-[#8FA882] focus:ring-2 focus:ring-[#3B9702] focus:border-transparent disabled:opacity-50"
        />

        <label className="block text-sm text-[#5E7353] mb-1">
          Номер телефона
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="79991234567"
          disabled={isChecking}
          className="w-full mb-2 px-3 py-2 rounded-lg bg-[#F7FAF4] border border-[#D8E5CC] text-[#1A2A12] outline-none placeholder:text-[#8FA882] focus:ring-2 focus:ring-[#3B9702] focus:border-transparent disabled:opacity-50"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isChecking}
            className="flex-1 py-2 rounded-lg bg-white border border-[#D8E5CC] hover:bg-[#EEF5E8] text-[#1A2A12] transition disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isChecking}
            className="flex-1 py-2 rounded-lg bg-[#3B9702] hover:bg-[#4CB505] text-white font-medium transition shadow-sm disabled:opacity-50"
          >
            {isChecking ? "Проверка…" : "Добавить"}
          </button>
        </div>
      </form>
    </div>
  );
}