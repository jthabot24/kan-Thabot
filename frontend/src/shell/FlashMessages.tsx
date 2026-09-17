import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { FlashMessage } from '@/api/types'

interface FlashContextValue {
  messages: FlashMessage[]
  push: (message: FlashMessage) => void
  clear: () => void
}

const FlashContext = createContext<FlashContextValue | null>(null)

export function FlashProvider({ initial, children }: { initial: FlashMessage[]; children: ReactNode }) {
  const [messages, setMessages] = useState<FlashMessage[]>(initial)
  const push = useCallback((message: FlashMessage) => setMessages((m) => [...m, message]), [])
  const clear = useCallback(() => setMessages([]), [])
  const value = useMemo(() => ({ messages, push, clear }), [messages, push, clear])
  return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>
}

/** `const flash = useFlash(); flash.push({ type: 'success', message: '...' })` */
export function useFlash(): FlashContextValue {
  const ctx = useContext(FlashContext)
  if (!ctx) throw new Error('useFlash must be used inside <FlashProvider>')
  return ctx
}

/** Mirrors the flash block in app/Template/layout.php */
export function FlashMessages() {
  const { messages, clear } = useFlash()
  if (messages.length === 0) return null

  return (
    <div id="react-flash">
      {messages.map((m, i) => (
        <div
          key={`${m.type}-${i}`}
          role={m.type === 'failure' ? 'alert' : 'status'}
          className={`alert alert-fade-out ${m.type === 'success' ? 'alert-success' : 'alert-error'}`}
          onClick={clear}
        >
          {m.message}
        </div>
      ))}
    </div>
  )
}
