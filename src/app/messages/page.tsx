import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface Conversation {
  id: string
  unreadCount: number
  participants: {
    id: string
    name: string
    avatar: string | null
  }[]
  messages: {
    id: string
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
      avatar: string | null
    }
  }[]
  updatedAt: string
}

async function getConversations(userId: string): Promise<Conversation[]> {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          id: userId
        }
      }
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          avatar: true
        }
      },
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Get unread count for each conversation
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          receiverId: userId,
          read: false
        }
      })
      return {
        ...conv,
        unreadCount,
        updatedAt: conv.updatedAt.toISOString(),
        messages: conv.messages.map(msg => ({
          ...msg,
          createdAt: msg.createdAt.toISOString()
        }))
      }
    })
  )

  return conversationsWithUnread
}

export default async function MessagesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const conversations = await getConversations(session.user.id)

  const conversationsWithOtherParticipant = conversations.map(conv => ({
    ...conv,
    participants: conv.participants.filter(p => p.id !== session.user?.id)
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold font-press-start text-[#E66B1A]">Messages</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {conversationsWithOtherParticipant.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-lg shadow-md divide-y">
            {conversationsWithOtherParticipant.map((conversation) => {
              // Get the other participant (not the current user)
              const otherParticipant = conversation.participants[0]
              const lastMessage = conversation.messages[0]

              if (!otherParticipant) return null

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="block hover:bg-gray-50 transition p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherParticipant.avatar ? (
                        <Image
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#E66B1A] flex items-center justify-center text-white font-semibold text-lg">
                          {otherParticipant.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {otherParticipant.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage.sender.id === session.user?.id ? 'You: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[#E66B1A] rounded-full">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <div className="text-6xl mb-4">💬</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
      <p className="text-gray-600 mb-6">
        Start trading games to connect with other gamers!
      </p>
      <Link
        href="/games"
        className="inline-block bg-[#E66B1A] text-white px-6 py-3 rounded-lg hover:bg-[#D55A1A] transition"
      >
        Browse Games
      </Link>
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}