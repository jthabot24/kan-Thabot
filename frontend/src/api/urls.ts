export function legacyUrl(base: string, path: string) {
  return `${base.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`
}
