import { supabase } from './supabase'

export const MOCK_MATCHES = [
  { id: 1, sport: 'football', time: '18:00', status: 'LIVE', teamA: 'Crystal Palace', teamB: 'Newcastle', scoreA: 1, scoreB: 0, odds: { '1': 2.45, N: 3.1, '2': 2.85 } },
  { id: 2, sport: 'football', time: '19:30', status: 'À venir', teamA: 'Everton', teamB: 'Sunderland', scoreA: null, scoreB: null, odds: { '1': 1.95, N: 3.4, '2': 3.8 } },
  { id: 3, sport: 'football', time: '20:45', status: 'À venir', teamA: 'Arsenal', teamB: 'Brighton', scoreA: null, scoreB: null, odds: { '1': 1.65, N: 3.8, '2': 4.5 } },
]

const toDateOnly = (isoDate) => {
  if (!isoDate) return new Date().toISOString().split('T')[0]
  return new Date(isoDate).toISOString().split('T')[0]
}

const normalizeMatchFromDB = (rows = []) =>
  (rows || []).map((match) => ({
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

const normalizeEspnMatch = (event, index) => {
  const competitors = event.competitions?.[0]?.competitors || []
  const teamA = competitors[1]?.team?.displayName || 'Team A'
  const teamB = competitors[0]?.team?.displayName || 'Team B'
  const scoreA = competitors[1]?.score != null ? Number(competitors[1].score) : null
  const scoreB = competitors[0]?.score != null ? Number(competitors[0].score) : null

  return {
    id: event.id || index,
    sport: 'football',
    date: toDateOnly(event.date),
    time: new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    status: event.status?.type?.state === 'in' ? 'LIVE' : event.status?.type?.state === 'post' ? 'Terminé' : 'À venir',
    team_a: teamA,
    team_b: teamB,
    score_a: scoreA,
    score_b: scoreB,
    odds_1: 2.45,
    odds_n: 3.1,
    odds_2: 2.85,
  }
}

async function fetchEspnMatches(dateString) {
  const date = dateString.replace(/-/g, '')
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${date}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Espn fetch failed')
  }

  const json = await res.json()
  return (json.events || []).map((event, index) => normalizeEspnMatch(event, index))
}

export async function syncMatchesForDate(dateString) {
  if (!supabase) {
    return MOCK_MATCHES
  }

  const normalizedDate = toDateOnly(dateString)

  const existing = await supabase
    .from('matches')
    .select('*')
    .eq('date', normalizedDate)
    .order('time', { ascending: true })

  if (!existing.error && existing.data?.length) {
    return normalizeMatchFromDB(existing.data)
  }

  const espnMatches = await fetchEspnMatches(normalizedDate)

  if (!espnMatches.length) {
    return MOCK_MATCHES
  }

  const { error: upsertError } = await supabase
    .from('matches')
    .upsert(espnMatches, { onConflict: 'id' })

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError)
    return normalizeMatchFromDB(espnMatches)
  }

  const refreshed = await supabase
    .from('matches')
    .select('*')
    .eq('date', normalizedDate)
    .order('time', { ascending: true })

  if (!refreshed.error && refreshed.data?.length) {
    return normalizeMatchFromDB(refreshed.data)
  }

  return normalizeMatchFromDB(espnMatches)
}
