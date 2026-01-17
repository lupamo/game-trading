export const config = {
	apiUrl: process.env.NEXT_PUBLIC_API_URL || 
		(typeof window !== 'undefined' ? window.location.origin : ''),
	baseUrl: process.env.NEXTAUTH_URL ||
		process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
}