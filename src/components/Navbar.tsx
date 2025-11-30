'use client'
import { useState } from 'react';
import Link from 'next/link';
import AuthButton from './AuthButton';

const navLinks = [
	{ href: '/games', label: 'Browse Games' },
	{ href: '/games/add', label: 'Add Game' },
	{ href: '/messages', label: 'Messages' },
	{ href: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const toggleMenu = () => {
		setIsOpen(!isOpen);
	}

	return (
		<nav className='shadow-sm border-b bg-[#f4f6fa]'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16 items-center'>
					<Link href="/" className='text-md font-press-start text-[#E66B1A]'>
						GameTrade
					</Link>
					<div className='sm:hidden'>
						<button
							type='button'
							onClick={toggleMenu}
							className='font-press-startinline-flex items-center justify-center p-2 rounded-md text-[#16181c]'
							aria-expanded={isOpen}
						>
							<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								{isOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
								) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
					<div className='hidden sm:flex sm:items-center sm:gap-6'>
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className='text-[#16181c] text-sm font-press-start hover:text-[#E66B1A]'>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</div>
			<div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
				<div className="pt-2 pb-3 space-y-1 px-2">
					{navLinks.map((link) => (
						<Link 
						key={link.href}
						href={link.href} 
						onClick={() => setIsOpen(false)}
						className="block px-3 py-2 rounded-sm text-[#2e3136] text-sm font-press-start hover:bg-gray-50 hover:text-[#E66B1A]"
						>
						{link.label}
						</Link>
					))}
					<div className='px-3 py-2'>
						<AuthButton />
					</div>
				</div>
			</div>
		</nav>
	)
}