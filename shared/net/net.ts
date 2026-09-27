/**
 * Оставляет только символы из whitelist.
 * @param value исходная строка
 * @param allowed строка разрешённых символов (по умолчанию: A-Za-z0-9-._~)
 */
export function sanitizeUrlSegment(
  value: string,
  allowed = "A-Za-z0-9\\-._~"
): string {
  const re = new RegExp(`[^${allowed}]`, "g");
  return value.replace(re, "");
}

/**
 * Проверяет, что строка — валидный URL вида `protocol://host` без пути.
 * Подходит для проверки базовых адресов API.
 */
export function isValidBaseUrl(
  value: string,
  opts: {
    /** Разрешённые протоколы. По умолчанию только http и https. */
    protocols?: string[];
    /** Разрешать ли IP-адреса. По умолчанию true. */
    allowIp?: boolean;
    /** Разрешать ли localhost. По умолчанию true. */
    allowLocalhost?: boolean;
    /** Требовать ли наличие порта. По умолчанию false. */
    requirePort?: boolean;
  } = {}
): boolean {
  const {
    protocols = ["http:", "https:"],
    allowIp = true,
    allowLocalhost = true,
    requirePort = false,
  } = opts;

  const trimmed = value.trim();
  if (!trimmed) return false;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  // протокол
  if (!protocols.includes(url.protocol)) return false;

  // путь: разрешаем только пустой, "/" или отсутствие
  if (url.pathname !== "") return false;

  // query и hash запрещены
  if (url.search !== "" || url.hash !== "") return false;

  // host обязателен
  if (!url.hostname) return false;

  // порт
  if (requirePort && !url.port) return false;

  // localhost
  if (!allowLocalhost && isLocalhost(url.hostname)) return false;

  // IP
  if (!allowIp && isIp(url.hostname)) return false;

  // домен: должен быть либо IP, либо валидное доменное имя
  if (!isIp(url.hostname) && !isDomain(url.hostname)) return false;

  return true;
}

function isLocalhost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function isIp(host: string): boolean {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return host.split(".").every((n) => {
      const x = Number(n);
      return x >= 0 && x <= 255 && String(x) === n;
    });
  }
  // IPv6 (грубо — наличие ":" и hex-групп)
  if (/^[0-9a-f:]+$/i.test(host) && host.includes(":")) {
    return true;
  }
  return false;
}

function isDomain(host: string): boolean {
  // не длиннее 253 символов, метки 1..63, только буквы/цифры/дефис,
  // не начинается и не заканчивается дефисом, есть хотя бы одна точка
  if (host.length > 253) return false;
  const labels = host.split(".");
  if (labels.length < 2) return false;
  return labels.every(
    (l) =>
      l.length >= 1 &&
      l.length <= 63 &&
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(l)
  );
}