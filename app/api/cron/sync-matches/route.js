import { NextResponse } from 'next/server'
import { syncMatchesForDate } from '../../../../lib/matches-sync'

export async function GET(req) {
  const authHeader = req.headers.get('authorization') || ''
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const matches = await syncMatchesForDate(today)

  return NextResponse.json({
    ok: true,
    date: today,
    updated: matches.length,
  })
}
