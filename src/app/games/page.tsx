import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { FiltersSidebar } from '@/components/FiltersSidebar'
import { GameCard } from '@/components/GameCard'
import { Prisma } from '@prisma/client'

interface Game {
  id: string
  title: string
  platform: string
  genre: string[]
  condition: string
  description: string | null
  images: string[]
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
    location: string | null
  }
}

interface GamesResponse {
  games: Game[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

async function getGames(searchParams: {
  platform?: string
  search?: string
  condition?: string
  page?: string
}): Promise<GamesResponse> {
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const where: Prisma.GameWhereInput = {}

  if (searchParams.platform) {
    where.platform = searchParams.platform
  }
  if (searchParams.search) {
    where.title = {
      contains: searchParams.search,
      mode: 'insensitive'
    }
  }
  if (searchParams.condition) {
    where.condition = searchParams.condition
  }

  try {
    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              location: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.game.count({ where })
    ])

    return {
      games: games.map(game => ({
        ...game,
        createdAt: game.createdAt.toISOString()
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching games:', error)
    return {
      games: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    }
  }
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }
  
  const resolvedSearchParams = await searchParams

  const params = {
    platform: typeof resolvedSearchParams.platform === 'string' ? resolvedSearchParams.platform : undefined,
    search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
    condition: typeof resolvedSearchParams.condition === 'string' ? resolvedSearchParams.condition : undefined,
    page: typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1',
  }

  const data = await getGames(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold font-press-start text-[#E66B1A]">Browse Games</h1>
            </div>
            <Link
              href="/games/add"
              className="bg-[#E66B1A] text-white px-6 py-2 rounded-lg hover:bg-[#D55A1A] transition"
            >
              + Add Game
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <FiltersSidebar currentParams={params} />
          </aside>
          <main className="flex-1">
            <Suspense fallback={<LoadingSkeleton />}>
              {data.games.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {data.games.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                  <Pagination pagination={data.pagination} currentParams={params} />
                </>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

function Pagination({ 
  pagination, 
  currentParams 
}: { 
  pagination: GamesResponse['pagination']
  currentParams: { platform?: string; search?: string; condition?: string; page?: string }
}) {
  const { page, totalPages } = pagination

  if (totalPages <= 1) return null

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (currentParams.platform) params.set('platform', currentParams.platform)
    if (currentParams.search) params.set('search', currentParams.search)
    if (currentParams.condition) params.set('condition', currentParams.condition)
    params.set('page', newPage.toString())
    return `?${params.toString()}`
  }

  return (
    <div className="mt-8 flex justify-center gap-2">
      {page > 1 && (
        <Link
          href={buildUrl(page - 1)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </Link>
      )}

      <div className="flex gap-2">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (page <= 3) {
            pageNum = i + 1
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = page - 2 + i
          }
          
          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`px-4 py-2 rounded-md ${
                pageNum === page
                  ? 'bg-[#E66B1A] text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {page < totalPages && (
        <Link
          href={buildUrl(page + 1)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎮</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No games found
      </h3>
      <p className="text-gray-600 mb-6">
        Try adjusting your filters or be the first to add a game!
      </p>
      <Link
        href="/games/add"
        className="inline-block bg-[#E66B1A] text-white px-6 py-3 rounded-lg hover:bg-[#D55A1A] transition"
      >
        Add Your First Game
      </Link>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center pt-3 border-t">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}