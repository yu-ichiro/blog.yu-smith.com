declare global {
  interface Array<T> {
    split(
      this: T[],
      predicate: (item: T, index: number, arr: T[]) => boolean
    ): [T[], T[]]
  }
}

;(Array.prototype as unknown as Array<unknown>).split = function <T>(
  this: T[],
  predicate: (item: T, index: number, arr: T[]) => boolean
) {
  return this.reduce(
    (acc, item, idx, arr) => {
      if (predicate(item, idx, arr)) {
        acc[0].push(item)
      } else {
        acc[1].push(item)
      }
      return acc
    },
    [[], []] as [T[], T[]]
  )
}

export default null
