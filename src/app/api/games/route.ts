import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";


//getting all games
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url)

		const platform = searchParams.get('platform')
		const search = searchParams.get('search')
		const genre = searchParams.get('genre')
		const condition = searchParams.get('condition')
		const userId = searchParams.get('userId')
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '12')
		const skip = (page - 1) * limit

		const where: any = {}

		if (platform) {
			where.platform = platform
		}
		if (search) {
			where.title = {
				contains: search,
				mode: 'insensitive'
			}
		}

		if (genre) {
			where.genre = {
				has: genre
			}
		}
		if (condition) {
			where.condition = condition
		}
		if (userId) {
			where.userId = userId
		}

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
		console.log('Succesfully fetched games:', games.length)

		return NextResponse.json({
			games,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit)
			}
		}, { status: 200 })
	} catch (error) {
		
		return NextResponse.json(
			{ 
				error: 'Failed to fetch games',
				message: error instanceof Error ? error.message : 'Unknown error',
				type: error instanceof Error ? error.name : 'Unknown'
			},

			{ status: 500 }
		)
	}
}

//adding a new game
export async function POST(req: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Unauthorized, please log in' },
				{ status: 401 }
			)
		}

		const body = await req.json()
		const { title, platform, condition, description, images, genre } = body

		if (!title || !platform || !condition) {
			return NextResponse.json (
				{ error: 'Title, platform, and condition are required' },
				{ status: 400 }
			)
		}

		const game = await prisma.game.create({
			data: {
				title,
				platform,
				condition,
				description: description || '',
				images: images || [],
				genre: genre || [],
				userId: session.user.id
			},
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
			}
		})
		return NextResponse.json(game, { status: 201 })
	} catch (error) {
		console.error('Error creating game:', error)
		return NextResponse.json(
			{ error: 'Failed to create game' },
			{ status: 500 }
		)
	}
}
