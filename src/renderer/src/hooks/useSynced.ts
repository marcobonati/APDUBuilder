import { useState } from 'react'

/**
 * Local editing state for a structured view of a hex value. The local value is
 * kept while it still encodes to the current hex (so partial input such as
 * "97" for a currency code is not reformatted while typing) and is reset when
 * the hex changes from outside (hex field, undo, examples).
 */
export function useSynced<T>(
  hex: string,
  toLocal: (hex: string) => T,
  fromLocal: (local: T) => string | null
): [T, (v: T) => void] {
  const [local, setLocal] = useState<T>(() => toLocal(hex))
  const [seenHex, setSeenHex] = useState(hex)
  if (hex !== seenHex) {
    setSeenHex(hex)
    if (fromLocal(local) !== hex) setLocal(toLocal(hex))
  }
  return [local, setLocal]
}
