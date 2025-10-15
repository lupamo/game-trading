import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { tradeId, content } = body

    if (!tradeId || !content) {
      return NextResponse.json(
        { error: 'Trade ID and content are required' },
        { status: 400 }
      )
    }

    // Verify user is part of the trade
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    if (trade.offererId !== session.user.id && trade.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not part of this trade' },
        { status: 403 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        tradeId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(message, { status: 201 })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}