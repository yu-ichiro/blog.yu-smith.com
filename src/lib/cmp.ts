const cmpRes = (n: number | bigint): -1 | 0 | 1 =>
  n === 0 ? 0 : n < 0 ? -1 : 1

const cmp = function <T = unknown, U = unknown>(a: T, b: U): -1 | 0 | 1 {
  if (typeof a === "string" && typeof b === "string")
    return cmpRes(a.localeCompare(b))
  if (typeof a === "number" && typeof b === "number") return cmpRes(a - b)
  if (typeof a === "bigint" && typeof b === "bigint") return cmpRes(a - b)
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const res = cmp(a[i], b[i])
      if (res !== 0) return res
    }
    return cmpRes(a.length - b.length)
  }
  return cmp(`${a}`, `${b}`)
}

export const key_to_cmp = function <T, U>(f: (v: T) => U) {
  return (a: T, b: T) => cmp(f(a), f(b))
}
