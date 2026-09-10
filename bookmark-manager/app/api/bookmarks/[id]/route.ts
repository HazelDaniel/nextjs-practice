// Route Handler on a dynamic segment [id] — concepts covered in
// app/api/bookmarks/route.ts and app/bookmarks/[id]/page.tsx (params await).
// Below: one more await-params-in-handler touchpoint, plus PATCH/DELETE.
import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/data'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  const { id } = await params
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: user.id },
    include: { tags: true, collection: true },
  })
  if (!bookmark) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json(bookmark)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  const { id } = await params
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  const body = await request.json()
  const bookmark = await prisma.bookmark.findFirst({ where: { id, userId: user.id } })
  if (!bookmark) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.bookmark.update({
    where: { id },
    data: {
      ...(typeof body.title === 'string' ? { title: body.title } : {}),
      ...(typeof body.url === 'string' ? { url: body.url } : {}),
      ...(typeof body.description === 'string' ? { description: body.description } : {}),
      ...(typeof body.collectionId === 'string' || body.collectionId === null
        ? { collectionId: body.collectionId }
        : {}),
      ...(typeof body.status === 'string' ? { status: body.status } : {}),
    },
    include: { tags: true, collection: true },
  })

  revalidatePath('/')

  return Response.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  const { id } = await params
  if (!user) {
    return Response.json({ error: 'Not authorized' }, { status: 401 })
  }

  const deleted = await prisma.bookmark.deleteMany({ where: { id, userId: user.id } })
  if (deleted.count === 0) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  revalidatePath('/')

  return new Response(null, { status: 204 })
}