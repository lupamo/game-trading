'use client'

import  { useEffect, useState } from 'react';

export function RetroColor({ text, className = '' }: { text: string; className?: string }) {
	const [colorIndex, setColorIndex] = useState(0);
	const colors = [
		'#E66B1A',
		'#FF1744',
		'#F06292',
		'#AB47BC',
		'#5C6BC0',
		'#42A5F5',
		'#26C6DA',
		'#66BB6A',
		'#FFEE58',
	]

	useEffect(() => {
		const interval = setInterval(() => {
			setColorIndex((prev) => (prev + 1) % colors.length);
		}, 200)
		return () => clearInterval(interval);
	}, [])
	return (
		<h3
		className={`font-press-start text-center text-3xl mb-3 transition-colors duration-300 ${className}`}
		style={{ color: colors[colorIndex] }}
		>
			{text}
		</h3>
	)
}