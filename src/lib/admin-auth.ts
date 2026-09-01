/**
 * Admin auth utilities — Edge Runtime compatible
 * Uses atob/btoa (Web API) instead of Buffer (Node.js only)
 */

export function verifyAuth(request: Request): { authenticated: boolean; userId?: string; email?: string } {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { authenticated: false }
  try {
    const token = authHeader.slice(7)
    const decoded = JSON.parse(atob(token))
    if (decoded.role === 'admin') {
      return { authenticated: true, userId: decoded.id, email: decoded.email }
    }
    return { authenticated: false }
  } catch {
    return { authenticated: false }
  }
}

export function createToken(payload: Record<string, string>): string {
  return btoa(JSON.stringify(payload))
}
