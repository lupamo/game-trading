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
				className="text-xs px-3 py-1 border font-press-start border-[#E66B1A] text-[#E66B1A] rounded hover:bg-red-50 transition"
			>
				Sign Out
			</button>
		);
	}
	return (
		<Link
			href="/login"
			className='text-xs px-3 py-1 border font-press-start border-[#E66B1A] text-[#E66B1A] rounded hover:bg-red-50 transition'
		>
			Login
		</Link>
	);
}