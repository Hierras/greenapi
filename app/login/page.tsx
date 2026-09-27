"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { loginAction } from "./action";

export default function LoginPage() {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");

  const onSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault();

    const validatedIdInstance = idInstance.trim();
    const validatedApiToken = apiTokenInstance.trim();

    if (!validatedIdInstance || !validatedApiToken) {
      toast.error("Заполните все поля!");
      return;
    }

    if (validatedApiToken.length > 64 || validatedApiToken.length < 1) {
      toast.error("Неверный формат токена!");
      return;
    }

    if (validatedIdInstance.length > 32 || validatedIdInstance.length < 1) {
      toast.error("Неверный формат ID!");
      return;
    }

    await loginAction({
      apiTokenInstance: validatedApiToken,
      idInstance: validatedIdInstance,
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm bg-[#FFFF] rounded-2xl p-8 shadow-xl border border-[#d2d7dd]"
    >
        <label className="block text-sm text-[#7d8b99] mb-1">ID инстанса</label>
        <input
          type="text"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          placeholder="1101000000"
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#ffff] border border-[#3B9702] outline-none focus:ring-2 focus:ring-[#307c00]"
        />

        <label className="block text-sm text-[#7d8b99] mb-1">API токен инстанса</label>
        <input
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#ffff] border border-[#3B9702] outline-none focus:ring-2 focus:ring-[#307c00]"
        />

        <button
          type="submit"
          className="w-full color text-white mt-4 py-2 rounded-lg bg-[#3B9702] hover:bg-[#307c00] hover:cursor-pointer transition font-medium"
        >
          Войти
        </button>
    </form>
  );
}