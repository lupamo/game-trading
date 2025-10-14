import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { error } from "console";

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
		console.error('Error fetching games:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch games' },
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

//deleting a game
export async function DELETE(
	req: NextRequest,
	{ params } : { params: { id: string } }
) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Unauthorized, please log in' },
				{ status: 401 }
			)
		}
		const game = await prisma.game.findUnique({
			where: { id: params.id }
		})
		if (!game) {
			return NextResponse.json(
				{ error: 'Game not found' },
				{ status: 404 }
			)
		}
		if (game.userId !== session.user.id) {
			return NextResponse.json(
				{ error: 'You can only delete your own games' },
				{ status: 403 }
			)
		}
		await prisma.game.delete({
			where: { id: params.id }
		})
		return NextResponse.json(
			{ message: 'Game deleted successfully' },
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error deleting game:', error)
		return NextResponse.json(
			{ error: 'Failed to delete game' },
			{ status: 500 }
		)
	}
}
