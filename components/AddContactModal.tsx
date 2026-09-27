"use client";

import { useState } from "react";
import type { Contact } from "@/shared/lib/types";

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

  const submit = (e: React.ChangeEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^\d]/g, "");
    if (!name.trim() || cleanPhone.length < 10) {
      setError("Введите ФИО и корректный номер (минимум 10 цифр)");
      return;
    }
    onSubmit({
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: cleanPhone,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-sm bg-[#17212b] rounded-2xl p-6 border border-[#243447]"
      >
        <h2 className="text-lg font-semibold mb-4">Новый контакт</h2>

        <label className="block text-sm text-[#7d8b99] mb-1">ФИО</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#242f3d] outline-none focus:ring-2 focus:ring-[#2aabee]"
        />

        <label className="block text-sm text-[#7d8b99] mb-1">Номер телефона</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="79991234567"
          className="w-full mb-2 px-3 py-2 rounded-lg bg-[#242f3d] outline-none focus:ring-2 focus:ring-[#2aabee]"
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-[#242f3d] hover:bg-[#2b3a4d]"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-[#2aabee] hover:bg-[#229ed9] font-medium"
          >
            Добавить
          </button>
        </div>
      </form>
    </div>
  );
}