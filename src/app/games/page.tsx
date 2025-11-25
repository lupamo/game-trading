import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { FiltersSidebar } from '@/components/FiltersSidebar'
import { GameCard } from '@/components/GameCard'

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
  const params = new URLSearchParams()
  
  if (searchParams.platform) params.append('platform', searchParams.platform)
  if (searchParams.search) params.append('search', searchParams.search)
  if (searchParams.condition) params.append('condition', searchParams.condition)
  if (searchParams.page) params.append('page', searchParams.page)

  const res = await fetch(`http://localhost:3000/api/games?${params.toString()}`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch games')
  }

  return res.json()
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }
  const resolvedSearchParams = await searchParams;

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
                  <Pagination pagination={data.pagination} />
                </>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

function Pagination({ pagination }: { pagination: GamesResponse['pagination'] }) {
  const { page, totalPages } = pagination

  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex justify-center gap-2">
      {page > 1 && (
        <Link
          href={`?page=${page - 1}`}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous
        </Link>
      )}

      <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`?page=${p}`}
            className={`px-4 py-2 rounded-md ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p}
          </Link>
        ))}
      </div>

      {page < totalPages && (
        <Link
          href={`?page=${page + 1}`}
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
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
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