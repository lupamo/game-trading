import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ConversationView } from '@/components/ConversationView'

interface Message {
  id: string
  content: string
  createdAt: string
  read: boolean
  sender: {
    id: string
    name: string
    avatar: string | null
  }
}

async function getMessages(conversationId: string, userId: string): Promise<Message[]> {
  // Verify user is part of the conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: {
        some: {
          id: userId
        }
      }
    }
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId
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
      conversationId,
      receiverId: userId,
      read: false
    },
    data: {
      read: true
    }
  })

  return messages.map(msg => ({
    ...msg,
    createdAt: msg.createdAt.toISOString()
  }))
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await params
  const messages = await getMessages(resolvedParams.id, session.user.id)

  // Get the other participant from messages
  const currentUserId = session!.user!.id

  const otherParticipant = messages[0]?.sender.id !== currentUserId
    ? messages[0]?.sender
    : messages.find(m => m.sender.id !== currentUserId)?.sender

  return (
    <ConversationView
      conversationId={resolvedParams.id}
      initialMessages={messages}
      currentUserId={currentUserId}
      otherParticipant={otherParticipant}
    />
  )
}