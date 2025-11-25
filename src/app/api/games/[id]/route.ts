import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { error } from 'console'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const game = await prisma.game.findUnique({
      where: {
        id: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            location: true
          }
        }
      }
    })

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try  {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized, please log in' },
        { status: 401 }
      )
    }
    const resolvedParams = await params
    const game = await prisma.game.findUnique({
      where: { id: resolvedParams.id }
    })
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    if (game.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this game' },
        { status: 403 }
      )
    }
    await prisma.game.delete({
      where: { id: resolvedParams.id }
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