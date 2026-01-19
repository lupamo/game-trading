import Image from "next/image";
import Link from "next/link";
import { RetroColor } from "@/components/RetroColor";
import { GameCard } from "../components/GameCard";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
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

async function getGames(limit: number = 4): Promise<GamesResponse> {
  try {
    const [games, total] = await Promise.all([
      prisma.game.findMany({
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
        take: limit,
      }),
      prisma.game.count()
    ])

    // Convert Date objects to strings for client components
    return {
      games: games.map(game => ({
        ...game,
        createdAt: game.createdAt.toISOString(),
      })),
      pagination: {
        total,
        page: 1,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching games from home page:', error)
    return {
      games: [],
      pagination: {
        total: 0,
        page: 1,
        limit,
        totalPages: 0
      }
    }
  }
}

export default async function Home() {
  const data = await getGames(4)

  return (    
    <div className="font-sans min-h-screen pb-20 bg-[#f4f6fa]">
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
              <div className="relative w-full h-[300px] md:h-[400px] rounded-md overflow-hidden shadow-xl py-8">
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
      <div className="max-w-7xl grid justify-items-center grid-cols-1 md:grid-cols-1 gap-1">
        <div className="flex-1 text-center mt-8 md:text-left px-4">
          <RetroColor text="Level Up your Inventory" />
          <p className="text-[10px] font-press-start text-gray-500">
            Swap games you own for ones you want. Discover new titles and expand your collection without spending a dime.
          </p>
        </div>
        <div className="flex-1 w-full max-w-md md:max-w-none py-1">
          <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden">
            <Image
              src="/retrobg.png"
              alt="Game Exchange"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-xl md:text-2xl text-[#E66B1A] font-press-start mb-6">Featured Games</h2>
        {data.games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 font-press-start text-sm mb-4">
              No games available yet. Be the first to add one!
            </p>
            <Link
              href="/games/add"
              className="inline-block bg-[#E66B1A] text-white px-6 py-3 rounded-lg hover:bg-[#D55A1A] transition font-press-start text-xs"
            >
              Add Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}