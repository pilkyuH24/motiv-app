export { default } from 'next-auth/middleware'

export const config = { matcher: [
    '/dashboard',
    '/missions',
    // '/app/:path*',
]}