'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthButton() {
	const { data: session, status } = useSession();

	if (status == 'loading') {
		return <div className='text-sm'>...</div>
	}

	if (session?.user) {
		return(
			<button
				onClick={() => signOut({ callbackUrl: '/'})}
				className="text-sm px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50 transition"
			>
				Sign Out
			</button>
		);
	}
	return (
		<Link
			href="/login"
			className='text-sm px-3 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 transition'
		>
			Login
		</Link>
	);
}