import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Game {
  id: string
  title: string
  platform: string
  condition: string
  description: string | null
  images: string[]
  genre: string[]
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    location: string | null
  }
}

async function getGameById(id: string): Promise<Game | null> {
  try {
    const game = await prisma.game.findUnique({
      where: {
        id: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            location: true
          }
        }
      }
    })

    return game
  } catch (error) {
    console.error('Error fetching game:', error)
    return null
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const resolvedParams = await params
  const game = await getGameById(resolvedParams.id)

  if (!game) {
    notFound()
  }

  const formattedDate = new Date(game.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      {/* Header */}
      <div className="bg-[#f4f6fa] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            href="/games" 
            className="font-press-start text-sm text-[#E66B1A] hover:text-[#E66B1A] flex items-center gap-2"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-[#1E1E1E]-500 rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Images */}
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#1E1E1E]-200">
                {game.images && game.images.length > 0 ? (
                  <Image
                    src={game.images[0]}
                    alt={game.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="relative flexitems-center justify-center h-full text-[#E66B1A]">
                    <Image
                      src="/no-image.png"
                      alt='no image available'
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {game.images && game.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {game.images.slice(1, 5).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden bg-[#1E1E1E]"
                    >
                      <Image
                        src={image}
                        alt={`${game.title} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-[#E66B1A] mb-4">
                  {game.title}
                </h1>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {game.genre.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Platform and Condition */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Platform</p>
                    <p className="font-semibold text-gray-900">{game.platform}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="font-semibold text-gray-900">{game.condition}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {game.description || 'No description provided.'}
                  </p>
                </div>

                {/* Listed Date */}
                <div className="text-sm text-gray-500 mb-6">
                  Listed on {formattedDate}
                </div>
              </div>

              {/* Owner Information */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Game Owner
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  {game.user.avatar ? (
                    <Image
                      src={game.user.avatar}
                      alt={game.user.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                      {game.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{game.user.name}</p>
                    {game.user.location && (
                      <p className="text-sm text-gray-600">📍 {game.user.location}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    Request Trade
                  </button>
                  <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold">
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}