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
    <div className="font-sans min-h-screen pb-20 bg-[#1E1E1E]">
      <div className="relative w-full h-[400px] sm:h-[350px] md:h-[500px] lg:h-[600px] max-w-7xl mx-auto px-0 overflow-hidden">
        <Image
          src="/cyberpunk.webp"
          alt="Game Controller"
          fill
          style={{ objectFit: "cover" }}
          priority
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
      
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center pt-2 pb-8 px-4 z-20">
            <h1 className="text-[#E66B1A] text-5xl font-bold drop-shadow-lg">
              Welcome to GameTrade
            </h1>
            <p className="text-base md:text-lg mt-2 text-white drop-shadow-md">
              Trade your games with other gamers easily.
            </p>
          </div> 
      </div>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl text-[#E66B1A] mt-3">Featured Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {data.games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
}
