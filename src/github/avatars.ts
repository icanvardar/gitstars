const cache = new Map<string, Promise<string | null>>()

export function sizedAvatarUrl(url: string, size: number): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.set('s', String(size))
    if (!parsed.searchParams.has('v')) parsed.searchParams.set('v', '4')
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Resolves to a same-origin object URL so the export canvas is never tainted
 * by a cross-origin image. Resolves to null if the image can't be loaded.
 */
export function loadAvatar(url: string): Promise<string | null> {
  let pending = cache.get(url)
  if (!pending) {
    pending = fetch(url, { mode: 'cors' })
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => null)
    cache.set(url, pending)
  }
  return pending
}
