export const COOKIE_OPTIONS = {
  name: 'sb-mfgfbwhznqpdjumtsrus-auth-token',
  domain: process.env.NODE_ENV === 'production' ? '.familybank.chat' : undefined,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 31536000,
  httpOnly: false, // Critical for client-side access
}
