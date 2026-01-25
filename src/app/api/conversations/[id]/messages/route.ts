import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
	const userId = session.user.id
    const resolvedParams = await params

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: resolvedParams.id,
        participants: {
          some: {
            id: userId
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: resolvedParams.id
      },
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
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: resolvedParams.id,
        receiverId: userId,
        read: false
      },
      data: {
        read: true
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
	const userId = session.user.id
	
    const resolvedParams = await params
    const { content } = await req.json()

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }
    
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: resolvedParams.id,
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    const receiverId = conversation.participants.find(
      (p) => p.id !== userId
    )?.id

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        conversationId: resolvedParams.id
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

    await prisma.conversation.update({
      where: { id: resolvedParams.id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}