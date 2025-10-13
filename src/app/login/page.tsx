'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
				callbackUrl: '/dashboard'
			})

			if (result?.error) {
				setError('Invalid email or password')
			} else if (result?.ok) {
				router.push('/dashboard')
				router.refresh()
			}
		} catch (error) {
			setError('An error occurred. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 p-8">
				<h2 className="text-3xl font-bold text-center">Login</h2>
				
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="email" className="block text-sm font-medium">
							Email
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="your@email.com"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							placeholder="••••••••"
						/>
					</div>

					{error && (
						<div className="text-red-500 text-sm text-center">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{isLoading ? 'Logging in...' : 'Login'}
					</button>
				</form>
			</div>
		</div>
	)
}