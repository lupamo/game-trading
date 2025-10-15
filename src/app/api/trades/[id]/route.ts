import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET single trade
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trade = await prisma.trade.findUnique({
      where: { id: params.id },
      include: {
        offerer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            location: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            location: true
          }
        },
        OfferedGame: {
          include: {
            user: true
          }
        },
        requestedGame: {
          include: {
            user: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Check if user is part of this trade
    if (trade.offererId !== session.user.id && trade.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have access to this trade' },
        { status: 403 }
      )
    }

    return NextResponse.json(trade, { status: 200 })

  } catch (error) {
    console.error('Error fetching trade:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    )
  }
}

// PATCH - Update trade status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { status } = body

    // Valid statuses
    const validStatuses = ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get trade
    const trade = await prisma.trade.findUnique({
      where: { id: params.id }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Check permissions
    if (status === 'ACCEPTED' || status === 'DECLINED') {
      // Only receiver can accept/decline
      if (trade.receiverId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the receiver can accept or decline' },
          { status: 403 }
        )
      }
    } else if (status === 'CANCELLED') {
      // Only offerer can cancel
      if (trade.offererId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the offerer can cancel' },
          { status: 403 }
        )
      }
    } else if (status === 'COMPLETED') {
      // Both parties must be involved
      if (trade.offererId !== session.user.id && trade.receiverId !== session.user.id) {
        return NextResponse.json(
          { error: 'Only trade participants can mark as completed' },
          { status: 403 }
        )
      }
    }

    // Update trade
    const updatedTrade = await prisma.trade.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
      },
      include: {
        offerer: true,
        receiver: true,
        OfferedGame: true,
        requestedGame: true
      }
    })

    return NextResponse.json(updatedTrade, { status: 200 })

  } catch (error) {
    console.error('Error updating trade:', error)
    return NextResponse.json(
      { error: 'Failed to update trade' },
      { status: 500 }
    )
  }
}

// DELETE trade
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trade = await prisma.trade.findUnique({
      where: { id: params.id }
    })

    if (!trade) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      )
    }

    // Only offerer can delete (cancel) their own trade requests
    if (trade.offererId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the offerer can delete this trade' },
        { status: 403 }
      )
    }

    await prisma.trade.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Trade deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json(
      { error: 'Failed to delete trade' },
      { status: 500 }
    )
  }
}
