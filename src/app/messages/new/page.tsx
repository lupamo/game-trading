import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ recipientId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const recipientId = resolvedParams.recipientId

  if (!recipientId) {
    redirect('/messages')
  }

  const userId = session.user.id

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              id: userId
            }
          }
        },
        {
          participants: {
            some: {
              id: recipientId
            }
          }
        }
      ]
    }
  })

  if (existingConversation) {
    redirect(`/messages/${existingConversation.id}`)
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        connect: [{ id: userId }, { id: recipientId }]
      }
    }
  })

  // Redirect to the new conversation
  redirect(`/messages/${conversation.id}`)
}