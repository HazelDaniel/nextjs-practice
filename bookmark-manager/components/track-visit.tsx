'use client'

import { useEffect } from 'react'
import { incrementClicks } from '@/lib/actions'

// Higher-level concept: invoking a Server Action from a client lifecycle hook.
// Unlike <form action=...> (progressive enhancement), event handlers and
// useEffect call the action directly as an async function — here a page view
// increments 'clicks' when this detail route mounts.
export default function TrackVisit({ id }: { id: string }) {
  useEffect(() => {
    incrementClicks(id)
  }, [id])

  return null
}