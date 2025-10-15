'use client'

import Link from 'next/link'

interface Game {
  id: string
  title: string
  platform: string
  condition: string
  description: string | null
  images: string[]
  genre: string[]
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    location: string | null
  }
}

export function GameCard({ game }: { game: Game }) {
  // Use a valid placeholder or data URI
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'
  
  const imageUrl = game.images[0] || placeholderImage

  return (
    <Link href={`/games/${game.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
        {/* Game Image */}
        <div className="relative h-48 bg-gray-200">
          <img
            src={imageUrl}
            alt={game.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Use data URI instead of file path
              e.currentTarget.src = placeholderImage
            }}
          />
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
            {game.platform}
          </div>
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
            {game.condition}
          </div>
        </div>

        {/* Game Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
            {game.title}
          </h3>
          
          {game.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {game.description}
            </p>
          )}

          {/* Genres */}
          {game.genre.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {game.genre.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center pt-3 border-t border-gray-200">
            <div className="flex-shrink-0">
              {game.user.avatar ? (
                <img
                  src={game.user.avatar}
                  alt={game.user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {game.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {game.user.name}
              </p>
              {game.user.location && (
                <p className="text-xs text-gray-500 truncate">
                  {game.user.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}