import Image from "next/image";
import { GameCard } from "../components/GameCard";

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
  genre?: string
  condition?: string
  page?: string
  limit?: string
}): Promise<GamesResponse> {
  const params = new URLSearchParams()
  
  if (searchParams.platform) params.append('platform', searchParams.platform)
  if (searchParams.search) params.append('search', searchParams.search)
  if (searchParams.genre) params.append('genre', searchParams.genre)
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

export default async function Home() {
  const data = await getGames({ limit: '4'})

  return (    
    <div className="font-sans min-h-screen pb-20 bg-[#f4f6fa]">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-gray-100 to-gray-50 py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-press-start text-[#E66B1A] text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg">
                Welcome to GameTrade
              </h1>
              <p className="text-lg md:text-md mt-4 font-press-start text-[#16181c] drop-shadow-md">
                Trade your games with other gamers easily.
              </p>
            </div>
            
            <div className="flex-1 w-full max-w-md md:max-w-none">
              <div className="relative w-full h-[300px] md:h-[400px] rounded-md overflow-hidden shadow-xl">
                <Image
                  src="/retro.gif"
                  alt="Game Controller"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl flex flex-col md:flex-row items-center gap-8 bg-gray-200">
        <div className="flex-1 w-full max-w-md md:max-w-none py-6">
          <div className="relative w-full h-[250px] md:h-[250px] overflow-hidden">
            <Image
              src="/retrobg.png"
              alt="Game Exchange"
              fill
              style={{ objectFit: "cover" }}
              priority
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left px-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Game Exchange</h3>
          <p className="text-sm text-gray-500">
            Trade your games with other gamers easily.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-xl md:text-2xl text-[#E66B1A] font-press-start mb-6">Featured Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>

  );
}
