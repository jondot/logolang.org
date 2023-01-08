import { swaps } from './dict.json'
export const passthrough = (code) => code

export const transpile = (code: string) => {
  Object.keys(swaps).forEach((k) => {
    swaps[k].forEach((v) => {
      code = code.replaceAll(v, k)
    })
  })
  return code
}
