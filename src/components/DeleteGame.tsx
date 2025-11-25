'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { set } from 'zod'

export function DeleteGame({ gameId }: { gameId: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		if(!confirm('Are you sure you want to delete this game?')) {
			return
		}
		setIsDeleting(true)
		try {
			const res = await fetch(`/api/games/${gameId}`, {
				method: 'DELETE',
			})
			if (res.ok) {
				router.push('/games')
        		router.refresh()
			} else {
				alert('Failed to delete game.')
				setIsDeleting(false)
			}
		} catch (error) {
			console.error('Error deleting game:', error)
			alert('Failed to delete game. Please try again.')
			setIsDeleting(false)
		}
	}
	return (
		<button onClick={handleDelete}
			disabled={isDeleting}
			className='px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
		>
			{isDeleting ? 'Deleting...' : 'Delete'}

		</button>
	)
}
