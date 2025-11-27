import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const userId = session.user.id
		
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
		//GEt unred count for each conversation
		const conversationsWithUnread = await Promise.all(
			conversations.map(async (conv: any) => {
				const unreadCount = await prisma.message.count({
					where: {
						conversationId: conv.id,
						receiverId: userId,
						read: false
					}
				})
				return {
					...conv,
					unreadCount
				}
			})
		)
		return NextResponse.json(conversationsWithUnread)
	} catch (error) {
		console.error("Error fetching conversations:", error);
		return NextResponse.json(
			{ error: 'Failed to fetch conversations' },
			{ status: 500 }
		)
	}
}

//create a new conversation
export async function POST(req: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		const userId = session.user.id;
		const { recepientId } = await req.json()

		if (!recepientId) {
			return NextResponse.json(
				{ error: "Recepient ID is required" },
				{ status: 400 }
			)
		}

		//check if conversation already exists
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
								id: recepientId
							}
						}
					}
				]
			},
			include: {
				participants: {
					select: {
						id: true,
						name: true,
						avatar: true
					}
				}
			}
		})
		if (existingConversation) {
			return NextResponse.json(existingConversation)
		}

		const conversation = await prisma.conversation.create({
			data: {
				participants: {
					connect: [{ id: session.user.id }, { id: recepientId }]
				}
			},
			include: {
				participants: {
					select: {
						id: true,
						name: true,
						avatar: true
					}
				}
			}
		})
		return NextResponse.json(conversation, { status: 201 })
	} catch (error) {
		console.error("Error creating conversation:", error);
		return NextResponse.json(
			{ error: 'Failed to create conversation' },
			{ status: 500 }
		)
	}
}