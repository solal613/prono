'use client'
import { useState, useEffect, useRef } from 'react'

const LANGUES = [
  {code:'fr', drapeau:'🇫🇷', devise:'€', label:'Français'},
  {code:'en', drapeau:'🇬🇧', devise:'£', label:'English'},
  {code:'es', drapeau:'🇪🇸', devise:'€', label:'Español'},
  {code:'de', drapeau:'🇩🇪', devise:'€', label:'Deutsch'},
  {code:'it', drapeau:'🇮🇹', devise:'€', label:'Italiano'},
  {code:'us', drapeau:'🇺🇸', devise:'$', label:'US'},
]

export default function Page(){
  const [lang, setLang]=useState(LANGUES[0])
  const [pieces, setPieces]=useState(2510)
  const [correspondances, setCorrespondances]=useState([])
  const [realCount, setRealCount]=useState(0)
  const [sport, setSport]=useState('tous')
  const [dateSel, setDateSel]=useState('aujourd\'hui')
  const [loading, setLoading]=useState(true)
  const [inCall, setInCall]=useState(false)
  const [camOn, setCamOn]=useState(false)
  const [betMessage, setBetMessage]=useState('')
  const videoRef=useRef(null)

  useEffect(()=>{ loadMatches('aujourd\'hui') },[])

  function getDateStr(jour){
    const d=new Date()
    if(jour==='hier') d.setDate(d.getDate()-1)
    if(jour==='demain') d.setDate(d.getDate()+1)
    return d.toISOString().split('T')[0]
  }

  async function loadMatches(jour){
    setLoading(true)
    try{
      const res=await fetch(`/api/football?date=${getDateStr(jour)}`)
      const data=await res.json()
      setCorrespondances(data.matches || MOCK)
      setRealCount(data.matches?.length || 0)
    }catch{
      setCorrespondances(MOCK)
    }
    setLoading(false)
  }

  function handlePari(match, choix){
    if (pieces < 10) {
      setBetMessage(`Tu n'as pas assez de pièces pour placer un pari.`)
      return
    }

    setPieces(p => p - 10)
    setBetMessage(`Pari validé : ${choix} sur ${match.teamA} vs ${match.teamB} (-10${lang.devise})`)
  }

  const MOCK=[
    {id:1, sport:'football', time:'18:00', status:'LIVE', teamA:'Crystal Palace', teamB:'Newcastle', scoreA:1, scoreB:0, odds:{'1':2.45,'N':3.10,'2':2.85}},
    {id:2, sport:'football', time:'19:30', status:'À venir', teamA:'Everton', teamB:'Sunderland', scoreA:null, scoreB:null, odds:{'1':1.95,'N':3.40,'2':3.80}},
    {id:3, sport:'football', time:'20:45', status:'À venir', teamA:'Arsenal', teamB:'Brighton', scoreA:null, scoreB:null, odds:{'1':1.65,'N':3.80,'2':4.50}},
    {id:4, sport:'football', time:'20:45', status:'À venir', teamA:'Man City', teamB:'Bournemouth', scoreA:null, scoreB:null, odds:{'1':1.35,'N':5.00,'2':8.00}},
    {id:5, sport:'football', time:'15:00', status:'À venir', teamA:'Burnley', teamB:'Wolves', scoreA:null, scoreB:null, odds:{'1':2.80,'N':3.20,'2':2.60}},
    {id:6, sport:'football', time:'15:00', status:'À venir', teamA:'Fulham', teamB:'Brentford', scoreA:null, scoreB:null, odds:{'1':2.30,'N':3.30,'2':3.00}},
  ]

  const filtered=correspondances.filter(m=> sport==='tous' || m.sport===sport)

  return (
    <div style={{background:'#f8f7ff', minHeight:'100vh', fontFamily:'Inter, system-ui'}}>
      <header style={{background:'linear-gradient(135deg,#8b5cf6,#7c3aed)', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{background:'white', color:'#7c3aed', fontWeight:900, padding:'6px 12px', borderRadius:12, fontSize:20}}>PRONO</span>
          <span style={{color:'white', opacity:0.9, fontSize:14}}>• Entre potes</span>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          {LANGUES.map(l=>(
            <button key={l.code} onClick={()=>setLang(l)} style={{border: lang.code===l.code?'2px solid white':'none', background:'rgba(255,255,255,0.2)', borderRadius:20, padding:'4px 8px', color:'white', cursor:'pointer'}}>{l.drapeau}</button>
          ))}
          <span style={{background:'white', borderRadius:20, padding:'6px 14px', fontWeight:700}}>{pieces}{lang.devise}</span>
          <button style={{background:'white', borderRadius:20, padding:'6px 14px', fontWeight:700, border:'none', cursor:'pointer'}}>Boutique</button>
        </div>
      </header>

      <div style={{padding:'16px 24px', display:'flex', gap:8}}>
        {['hier','aujourd\'hui','demain'].map(d=>(
          <button key={d} onClick={()=>{setDateSel(d); loadMatches(d)}} style={{background: dateSel===d?'#8b5cf6':'white', color: dateSel===d?'white':'#6b7280', border:'none', borderRadius:20, padding:'8px 14px', fontWeight:700, cursor:'pointer'}}>{d}</button>
        ))}
      </div>

      <div style={{padding:'0 24px 16px', display:'flex', gap:8, flexWrap:'wrap'}}>
        {['tous','football','basket-ball','tennis','NFL'].map(s=>(
          <button key={s} onClick={()=>setSport(s)} style={{background: sport===s?'black':'white', color: sport===s?'white':'#6b7280', border:'none', borderRadius:20, padding:'8px 18px', fontWeight:700, cursor:'pointer'}}>{s}</button>
        ))}
      </div>

      <div style={{margin:'0 24px', background:'white', borderRadius:16, padding:'12px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <span style={{display:'flex', alignItems:'center', gap:8, fontWeight:600}}><span style={{width:8, height:8, background:'#22c55e', borderRadius:'50%', display:'inline-block'}}></span>{realCount} matchs</span>
        <button onClick={()=>loadMatches(dateSel)} style={{background:'#8b5cf6', color:'white', border:'none', borderRadius:20, padding:'6px 14px', fontWeight:600, cursor:'pointer'}}>Actualiser</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, padding:24}}>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {loading ? <div>Chargement...</div> : filtered.map(m=>(
            <div key={m.id} style={{background:'white', borderRadius:24, padding:18, boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <span style={{fontSize:11, color:'#9ca3af', textTransform:'uppercase', fontWeight:700}}>{m.sport} • {m.time}</span>
                <span style={{background: m.status==='LIVE'?'#dcfce7':'#f3f4f6', color: m.status==='LIVE'?'#16a34a':'#6b7280', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700}}>{m.status}</span>
              </div>
              <div style={{fontSize:18, fontWeight:800, marginBottom:12}}>{m.teamA} - {m.teamB} {m.scoreA!==null && <span style={{background:'black', color:'white', padding:'2px 8px', borderRadius:8}}>{m.scoreA}-{m.scoreB}</span>}</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {Object.entries(m.odds).map(([k,v])=>(
                  <button
                    key={k}
                    type='button'
                    disabled={pieces < 10}
                    onClick={()=>handlePari(m, k)}
                    style={{
                      flex:'1 1 110px',
                      background:'#f8f7ff',
                      border:'1px solid #e5e7eb',
                      borderRadius:12,
                      padding:'10px 12px',
                      fontWeight:700,
                      cursor: pieces < 10 ? 'not-allowed' : 'pointer',
                      opacity: pieces < 10 ? 0.55 : 1,
                      color:'#111827'
                    }}
                  >
                    {k} • {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div style={{background:'white', borderRadius:24, padding:18}}>
            <h3 style={{fontWeight:800, marginBottom:10}}>Ligues Amis</h3>
            <div style={{background:'#f8f7ff', borderRadius:12, padding:'8px 12px', fontWeight:700, color:'#7c3aed', marginBottom:8}}>PRONO-X7K9</div>
            <button style={{width:'100%', background:'black', color:'white', borderRadius:12, padding:'10px', fontWeight:700, border:'none', marginBottom:8, cursor:'pointer'}}>Rejoindre</button>
            <button style={{width:'100%', background:'#8b5cf6', color:'white', borderRadius:12, padding:'10px', fontWeight:700, border:'none', cursor:'pointer'}}>Créer ligue</button>
          </div>

          <div style={{background:'white', borderRadius:24, padding:18}}>
            <h3 style={{fontWeight:800, marginBottom:10}}>Top Pronoers</h3>
            <div>1. Solal - 1250 pts 🏆</div>
            <div>2. Alex - 980 pts</div>
            <div>3. Max - 870 pts</div>
          </div>

          {betMessage && (
            <div style={{background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#065f46', padding:'12px 14px', borderRadius:14, fontWeight:600}}>
              {betMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
