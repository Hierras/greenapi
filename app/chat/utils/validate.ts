import type { Contact } from "@/shared/lib/types";

/**
 * Проверяет, что строка — валидный chatId формата `<phone>@c.us`.
 * phone — только цифры, без плюса, пробелов и разделителей.
 */
export function isValidChatId(value: string): boolean {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.length === 0) return false;

  const re = /^(\d+)@c\.us$/;
  const match = re.exec(trimmed);
  if (!match) return false;

  const phone = match[1];
  if (phone.length < 7 || phone.length > 15) return false;

  return true;
}

/**
 * Превращает любой ввод телефона в валидный chatId формата `<digits>@c.us`.
 * Убирает всё, кроме цифр; опционально нормализует под РФ.
 */
export function toChatId(
  input: string,
  opts: {
    normalizeRu?: boolean;
    suffix?: string;
  } = {}
): string | null {
  if (typeof input !== "string") return null;

  const { normalizeRu = true, suffix = "c.us" } = opts;

  let digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (normalizeRu) {
    // 8XXXXXXXXXX → 7XXXXXXXXXX
    if (digits.length === 11 && digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }
    if (digits.length === 10) {
      digits = "7" + digits;
    }
  }

  if (digits.length < 7 || digits.length > 15) return null;

  if (normalizeRu && !/^7\d{10}$/.test(digits)) return null;
  return `${digits}@${suffix}`;
}

/**
 * 
 * @param chatId - string
 * 
 * приводит chatId к формату телефонного номера
 */
export function clearPhoneNumber(chatId: string) {
    return "+" + chatId.replace("@c.us", "");
}

/**
 * Возвращает канонический chatId для контакта.
 * Приоритет: сохранённый chatId → сконструированный из телефона.
 */
export function resolveChatId(contact: Contact): string {
  if (contact.chatId) return contact.chatId;

  const fromPhone = toChatId(contact.phone);
  if (fromPhone) return fromPhone;

  // fallback: сырой телефон (для TG-инстансов, где chatId — просто число)
  return contact.phone;
}