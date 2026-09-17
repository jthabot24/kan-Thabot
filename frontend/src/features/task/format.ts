import type { Numeric } from '../../api/types'

export function toNumber(value: Numeric | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? 0 : n
}

export function isTruthy(value: Numeric | null | undefined): boolean {
  return toNumber(value) !== 0
}

export function formatDateTime(timestamp: Numeric | null | undefined): string {
  const seconds = toNumber(timestamp)
  if (!seconds) return ''
  return new Date(seconds * 1000).toLocaleString()
}

export function formatDate(timestamp: Numeric | null | undefined): string {
  const seconds = toNumber(timestamp)
  if (!seconds) return ''
  return new Date(seconds * 1000).toLocaleDateString()
}

/** Unix timestamp => value usable by `<input type="datetime-local">` (local time). */
export function timestampToInputValue(timestamp: Numeric | null | undefined): string {
  const seconds = toNumber(timestamp)
  if (!seconds) return ''
  const date = new Date(seconds * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * `<input type="datetime-local">` value => string accepted by the server date parser
 * (`Y-m-d H:i` is one of the formats produced by DateParser::getParserFormats()).
 */
export function inputValueToServerDate(value: string): string {
  if (!value) return ''
  return value.replace('T', ' ')
}

export function formatBytes(size: Numeric): string {
  let bytes = toNumber(size)
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unit = 0
  while (bytes >= 1024 && unit < units.length - 1) {
    bytes /= 1024
    unit++
  }
  return `${unit === 0 ? bytes : bytes.toFixed(1)} ${units[unit]}`
}

export function formatHours(value: Numeric): string {
  const n = toNumber(value)
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}

export function displayName(name: string | null | undefined, username: string | null | undefined): string {
  return name || username || ''
}

export function fileExtension(filename: string): string {
  const index = filename.lastIndexOf('.')
  return index >= 0 ? filename.slice(index + 1).toLowerCase() : ''
}

const PREVIEWABLE_TEXT = new Set([
  'txt', 'md', 'markdown', 'json', 'xml', 'yml', 'yaml', 'csv', 'log', 'ini', 'conf', 'sh', 'php', 'js', 'ts', 'css',
  'html', 'htm', 'sql', 'py', 'rb', 'go', 'java', 'c', 'h', 'cpp', 'hpp', 'rs',
])

export type PreviewType = 'image' | 'markdown' | 'text' | 'pdf' | null

export function previewType(filename: string, isImage: boolean): PreviewType {
  if (isImage) return 'image'
  const extension = fileExtension(filename)
  if (extension === 'md' || extension === 'markdown') return 'markdown'
  if (extension === 'pdf') return 'pdf'
  if (PREVIEWABLE_TEXT.has(extension)) return 'text'
  return null
}

export function mimeType(filename: string, isImage: boolean): string {
  const extension = fileExtension(filename)
  if (isImage) {
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
    if (extension === 'gif') return 'image/gif'
    if (extension === 'svg') return 'image/svg+xml'
    if (extension === 'webp') return 'image/webp'
    return 'image/png'
  }
  if (extension === 'pdf') return 'application/pdf'
  return 'application/octet-stream'
}

export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

export function base64ToText(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
