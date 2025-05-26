// This file is no longer needed for Clerk authentication.
// Firebase authentication is handled client-side and via the FirebaseAuthProvider.
// If you need server-side route protection with Firebase, you would typically use
// Next.js Route Handlers or Server Components to verify Firebase ID tokens.

// For now, this file can be removed or left empty if your deployment expects it.
// To remove it completely, ensure it's not referenced in `next.config.ts` if it ever was.

// export default function middleware() {
//   // No-op
// }

// export const config = {
//   matcher: [], // No routes matched
// };

// Keeping the file empty or with minimal export to avoid build issues if platform expects it.
export default function middleware() {}
export const config = { matcher: [] };
