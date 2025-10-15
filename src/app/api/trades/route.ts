import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401}
			)
		}

		const { searchParams } = new URL(req.url)
		const type = searchParams.get('type')
		const status = searchParams.get('status')

		const where: any = {}

		if (type === 'sent') {
			where.offererId = session.user.id
		} else if (type === 'received') {
			where.receiverId = session.user.id
		} else {
			where.OR = [
				{ offererId: session.user.id },
				{ receiverId: session.user.id }
			]
		}

		if (status) {
			where.status = status
		}

		const trades = await prisma.trade.findMany({
			where,
			include: {
				offerer: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
						location: true,
					}
				},
				receiver: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true,
						location: true,
					}
				},
				OfferedGame: {
					include: {
						user: {
							select: {
								id: true,
								name: true
							}
						}
					}
				},
				messages: {
					orderBy: {
						createdAt: 'desc'
					},
					take: 1
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		return NextResponse.json(trades, { status: 200 })
	} catch (error) {
		console.error('Error fetching trades:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch trades' },
			{ status: 500 }
		)
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401}
			)
		}
		const body = await req.json()
		const { OfferedGameId, requestedGameId, message } = body

		if (!OfferedGameId || !requestedGameId) {
			return NextResponse.json(
				{ error: 'Both offeredGameId and requestedGameId are required' },
				{ status: 400 }
			)
		}
		const [offereGame, requestedGame] = await Promise.all([
			prisma.game.findUnique({ where: { id: OfferedGameId } }),
			prisma.game.findUnique({ where: { id: requestedGameId } })
		])
		if (!offereGame || !requestedGame) {
			return NextResponse.json(
				{ error: 'One or both of the specified games do not exist' },
				{ status: 404 }
			)
		}
		//cannot offer a game you do not own
		if (OfferedGameId.userId !== session.user.id) {
			return NextResponse.json(
				{ error: 'You can only offer your own games' },
				{ status: 403 }
			)
		}

		//cannot request trade for your own game
		if (requestedGame.userId === session.user.id) {
			return NextResponse.json(
				{ error: 'You cannot request a trade for your own game' },
				{ status: 400 }
			)
		}

		//create trade
		const trade = await prisma.trade.create({
			data: {
				offererId: session.user.id,
				receiverId: requestedGame.userId,
				OfferedGameId,
				requestedGameId,
				status: 'PENDING',
			},
			include: {
				offerer: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true
					}
				},
				receiver: {
					select: {
						id: true,
						name: true,
						email: true,
						avatar: true
					}
				},
				OfferedGame: true,
				requestedGame: true,
			}
		})

		if (message) {
			await prisma.message.create({
				data: {
					content: message,
					senderId: session.user.id,
					tradeId: trade.id
				}
			})
		}
		return NextResponse.json(trade, { status: 201 })
	} catch (error) {
		console.error('Error creating trade:', error)
		return NextResponse.json(
			{ error: 'Failed to create trade' },
			{ status: 500 }
		)
	}
}
