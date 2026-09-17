import type { Bootstrap } from './api/types'

declare global {
  interface Window {
    __KANBOARD__?: Bootstrap
  }
}

export {}
