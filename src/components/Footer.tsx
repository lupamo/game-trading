'use client'
import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="bg-[#f4f6fa] border-t mt-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center">
				<p className="text-sm text-gray-600 font-press-start mb-4 sm:mb-0">
					&copy; {new Date().getFullYear()} GameTrade. All rights reserved.
				</p>
				<div className="flex space-x-4">
					<Link href="/about" className="text-[14px] text-gray-600 font-press-start hover:text-[#E66B1A]">
						About Us
					</Link>
					<Link href="/contact" className="text-[14px] text-gray-600 font-press-start hover:text-[#E66B1A]">
						Contact Us
					</Link>
					<Link href="/privacy" className="text-[14px] text-gray-600 font-press-start hover:text-[#E66B1A]">
						Privacy Policy
					</Link>
				</div>
			</div>
		</footer>
	)
}
