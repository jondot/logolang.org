/* eslint-disable no-console */
import create from 'zustand'
import shallow from 'zustand/shallow'
import type { StateStorage } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import pako from 'pako'
import { toByteArray as decode64, fromByteArray as encode64 } from 'base64-js'
import { house } from './programs'
import type { Theme } from './styles'
import { defaultTheme } from './styles'
export { shallow }

const hashStorage: StateStorage = {
  getItem: (key): string => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    const storedValue = searchParams.get(key)
    return JSON.parse(pako.inflate(decode64(storedValue), { to: 'string' }))
  },
  setItem: (key, newValue): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.set(key, encode64(pako.deflate(JSON.stringify(newValue))))
    location.hash = searchParams.toString()
  },
  removeItem: (key): void => {
    const searchParams = new URLSearchParams(location.hash.slice(1))
    searchParams.delete(key)
    location.hash = searchParams.toString()
  },
}

const filterStateForHashStorage = (state) =>
  Object.fromEntries(
    Object.entries(state).filter(([key]) => ['code'].includes(key))
  )

const filterStateForStorage = (state) =>
  Object.fromEntries(
    Object.entries(state).filter(
      ([key]) => !['localcode', 'result'].includes(key)
    )
  )
const hashPersistConfig = {
  name: 'store', // unique name
  partialize: filterStateForHashStorage,
  getStorage: () => hashStorage,
  onRehydrateStorage: (_state) => {
    console.log('hydration starts')

    // optional
    return (state, error) => {
      // sync local code from storage, just one way, one time after initializing.
      state.localcode = state.code

      if (error) {
        console.log('an error happened during hydration', error)
      } else {
        console.log('hydration finished', state)
      }
    }
  },
}
const localStoragePersistConfig = {
  name: 'logo-store',
  partialize: filterStateForStorage,
}
export interface DrawResult {
  time?: number
  error?: any
}
interface AppState {
  direction: string
  setDirection: (direction: string) => void
  code: string
  setCode: (code: string) => void
  layout: string
  setLayout: (layout: string) => void
  codemini: boolean
  setCodemini: (v: boolean) => void
  theme: Theme
  setTheme: (t: Theme) => void
  langpack: string
  setLangpack: (langpack: string) => void

  localcode: string
  setLocalcode: (localcode: string) => void
  result: DrawResult
  setResult: (result: DrawResult) => void
}

export const useStore = create<AppState>()(
  persist(
    persist(
      (set) => ({
        direction: 'ltr',
        setDirection: (direction) => set((_state) => ({ direction })),
        code: house,
        setCode: (code) => set((_state) => ({ code })),
        layout: 'auto',
        setLayout: (layout) => set((_state) => ({ layout })),
        codemini: false,
        setCodemini: (codemini) => set((_state) => ({ codemini })),
        theme: defaultTheme,
        setTheme: (theme) => set((_state) => ({ theme })),
        langpack: 'logo',
        setLangpack: (langpack) => set((_state) => ({ langpack })),
        localcode: house,
        setLocalcode: (localcode) => set((_state) => ({ localcode })),
        result: null,
        setResult: (result) => set((_state) => ({ result })),
      }),
      localStoragePersistConfig
    ),
    hashPersistConfig
  )
)
