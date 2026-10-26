import { supabase } from '../../../lib/supabase'

const MOCK = [
  { id: 1, sport: 'football', time: '18:00', status: 'LIVE', teamA: 'Crystal Palace', teamB: 'Newcastle', scoreA: 1, scoreB: 0, odds: { '1': 2.45, N: 3.1, '2': 2.85 } },
  { id: 2, sport: 'football', time: '19:30', status: 'À venir', teamA: 'Everton', teamB: 'Sunderland', scoreA: null, scoreB: null, odds: { '1': 1.95, N: 3.4, '2': 3.8 } },
  { id: 3, sport: 'football', time: '20:45', status: 'À venir', teamA: 'Arsenal', teamB: 'Brighton', scoreA: null, scoreB: null, odds: { '1': 1.65, N: 3.8, '2': 4.5 } },
]

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  try {
    if (!supabase) {
      throw new Error('Supabase not configured')
    }

    let query = supabase.from('matches').select('*')

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query.order('date', { ascending: true })

    if (error) {
      throw error
    }

    const matches = (data || []).map((match) => ({
      id: match.id,
      sport: match.sport || 'football',
      time: match.time || '18:00',
      status: match.status || 'À venir',
      teamA: match.team_a || 'Team A',
      teamB: match.team_b || 'Team B',
      scoreA: match.score_a ?? null,
      scoreB: match.score_b ?? null,
      odds: {
        '1': match.odds_1 ?? 2.45,
        N: match.odds_n ?? 3.1,
        '2': match.odds_2 ?? 2.85,
      },
    }))

    if (!matches.length) {
      throw new Error('empty')
    }

    return Response.json({ matches })
  } catch {
    return Response.json({ matches: MOCK })
  }
}
