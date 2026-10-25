
export async function GET(req){
  const {searchParams}=new URL(req.url)
  const date=searchParams.get('date')||new Date().toISOString().split('T')[0].replace(/-/g,'')
  try{
    const d=date.replace(/-/g,'')
    const res=await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=${d}`,{cache:'no-store'})
    const json=await res.json()
    const matches=(json.events||[]).map((e,i)=>({
      id:e.id||i, sport:'football', time:new Date(e.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
      status:e.status?.type?.state==='in'?'LIVE':e.status?.type?.state==='post'?'Terminé':'À venir',
      teamA:e.competitions?.[0]?.competitors?.[1]?.team?.displayName||'Team A',
      teamB:e.competitions?.[0]?.competitors?.[0]?.team?.displayName||'Team B',
      scoreA:e.competitions?.[0]?.competitors?.[1]?.score!=null?parseInt(e.competitions?.[0]?.competitors?.[1]?.score):null,
      scoreB:e.competitions?.[0]?.competitors?.[0]?.score!=null?parseInt(e.competitions?.[0]?.competitors?.[0]?.score):null,
      odds:{'1':2.45,'N':3.10,'2':2.85}
    }))
    if(matches.length===0) throw new Error('empty')
    return Response.json({matches})
  }catch{
    const MOCK=[
      {id:1,sport:'football',time:'18:00',status:'LIVE',teamA:'Crystal Palace',teamB:'Newcastle',scoreA:1,scoreB:0,odds:{'1':2.45,'N':3.10,'2':2.85}},
      {id:2,sport:'football',time:'19:30',status:'À venir',teamA:'Everton',teamB:'Sunderland',scoreA:null,scoreB:null,odds:{'1':1.95,'N':3.40,'2':3.80}},
      {id:3,sport:'football',time:'20:45',status:'À venir',teamA:'Arsenal',teamB:'Brighton',scoreA:null,scoreB:null,odds:{'1':1.65,'N':3.80,'2':4.50}},
    ]
    return Response.json({matches:MOCK})
  }
}
