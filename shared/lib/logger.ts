const isDev = process.env.NODE_ENV === 'development'

// Уровни логирования
type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const levelColors: Record<LogLevel, string> = {
  debug: '\x1b[36m',   // Cyan
  info: '\x1b[32m',    // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
}
const resetColor = '\x1b[0m'

// Форматирование времени
const getTimestamp = () => {
  return new Date().toISOString()
}

// Основная функция логирования
function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const timestamp = getTimestamp()
  const color = levelColors[level]
  
  // В продакшене логируем только error и warn (если не переопределено)
  if (!isDev && level === 'debug') return
  
  const logLine = [
    `${color}[${level.toUpperCase()}]${resetColor}`,
    `${timestamp}`,
    message,
    data ? JSON.stringify(data, null, isDev ? 2 : 0) : '',
  ].filter(Boolean).join(' ')
  
  if (level === 'error') {
    console.error(logLine)
  } else if (level === 'warn') {
    console.warn(logLine)
  } else {
    console.log(logLine)
  }
}

// Экспортируем методы
export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => 
    log('debug', message, data),
  info: (message: string, data?: Record<string, unknown>) => 
    log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => 
    log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => 
    log('error', message, data),
  
  // Дочерний логгер (с контекстом)
  child: (context: string) => ({
    debug: (msg: string, data?: Record<string, unknown>) => 
      log('debug', `[${context}] ${msg}`, data),
    info: (msg: string, data?: Record<string, unknown>) => 
      log('info', `[${context}] ${msg}`, data),
    warn: (msg: string, data?: Record<string, unknown>) => 
      log('warn', `[${context}] ${msg}`, data),
    error: (msg: string, data?: Record<string, unknown>) => 
      log('error', `[${context}] ${msg}`, data),
  }),
}

export const logError = (error: unknown, context?: string) => {
  if (error instanceof Error) {
    logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
      name: error.name,
      stack: isDev ? error.stack : undefined,
    })
  } else {
    logger.error(`${context ? `[${context}] ` : ''}Unknown error`, { error })
  }
}

export default logger