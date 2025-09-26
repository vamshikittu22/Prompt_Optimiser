import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncate(str: string, length: number) {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function getModelName(modelId: string) {
  const modelMap: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gemini-pro': 'Gemini Pro',
    'claude-2': 'Claude 2',
    'claude-instant': 'Claude Instant',
    'openrouter/auto': 'Auto (Best Available)',
  }
  return modelMap[modelId] || modelId
}

export function copyToClipboard(text: string) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject)
    } else {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        resolve(undefined)
      } catch (e) {
        reject(e)
      }
    }
  })
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function (...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function isClient() {
  return typeof window !== 'undefined'
}

export function getFromLocalStorage(key: string, defaultValue: any = null) {
  if (!isClient()) return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error getting from localStorage', error)
    return defaultValue
  }
}

export function setToLocalStorage(key: string, value: any) {
  if (!isClient()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error setting to localStorage', error)
  }
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || ''}${path}`
}
