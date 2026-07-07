"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CORES_PLANTAO } from "@/lib/escalas"
import type { MEMBROS_PLANTAO, GrupoFaxina, GrupoPlantao } from "@/lib/escalas"

const MESES = ["","Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
// Escala de serviço unificada (aba Plantão): funções, na ordem de exibição
// AuxiliarOD/AdjuntoOD = nomenclatura da 1ª CIA a partir de jul/2026; Adjunto1/Adjunto2 = legado (jun/2026)
const FUNCOES_SERVICO = ["AuxiliarOD","AdjuntoOD","Adjunto1","Adjunto2","Mestre","Leitor","Discurso","Comandante"] as const
const LABEL_FUNCAO: Record<string,string> = {
  AuxiliarOD:"Auxiliar do Oficial de Dia", AdjuntoOD:"Adjunto ao Aux. do Oficial de Dia",
  Adjunto1:"Adjunto da 1ª CIA", Adjunto2:"Adjunto da 2ª CIA",
  Mestre:"Mestre de Cerimônia", Leitor:"Leitor de BI",
  Discurso:"Discurso ao CFO", Comandante:"Comandante da 2ª CIA",
}
const GRUPOS_FAXINA = ["G1","G2","G3","G4","G5","G6","G7","G8"] as const

type ServicoSemana = {
  semana: number; isOverride?: boolean
  p1: {mat:number;nome:string}|null
  p3: {mat:number;nome:string}|null
  p4: {mat:number;nome:string}|null
}
type DiaCal     = { data:string; diaSemana:string; tipo:"util"|"fds"; grupoFaxina:GrupoFaxina|null; grupoPlantao:GrupoPlantao }
type PlantaoDia = { id:string; data:string; grupoPlantao:string; adjuntoMat:number|null }
type FuncaoDia  = { id:string; data:string; funcao:string; matricula:number }
type FaxinaMembro = { id?:string; mat:number; nome:string }
type ComposicaoFaxina = Record<string, FaxinaMembro[]>

const CORES_GRUPO: Record<string,string> = {
  G1:"#1D4ED8",G2:"#7C3AED",G3:"#B45309",G4:"#15803D",
  G5:"#B91C1C",G6:"#0369A1",G7:"#7E22CE",G8:"#92400E",
}
function TagGrupo({grupo,small}:{grupo:string;small?:boolean}) {
  const cor = CORES_GRUPO[grupo]||"#475569"
  return <span style={{background:cor+"18",color:cor,border:`1px solid ${cor}40`,borderRadius:6,padding:small?"1px 7px":"2px 10px",fontSize:small?11:12,fontWeight:600}}>{grupo}</span>
}

function TagPlantao({grupo,small}:{grupo:string;small?:boolean}) {
  const cor = CORES_PLANTAO[grupo]||"#475569"
  return <span style={{background:cor+"18",color:cor,border:`1px solid ${cor}40`,borderRadius:6,padding:small?"1px 6px":"2px 9px",fontSize:small?10:11,fontWeight:700,letterSpacing:"0.02em"}}>{grupo}</span>
}

function CardServico({label,pessoa,destaque}:{label:string;pessoa:{mat:number;nome:string}|null;destaque?:boolean}) {
  return (
    <div style={{background:destaque?"var(--azul-profundo)":"#fff",border:`1.5px solid ${destaque?"var(--azul-profundo)":"var(--cinza-borda)"}`,borderRadius:12,padding:"16px",textAlign:"center",boxShadow:"var(--shadow-sm)"}}>
      <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:destaque?"rgba(255,255,255,0.7)":"var(--cinza-texto)",marginBottom:6}}>{label}</p>
      {pessoa?(<><p style={{fontWeight:700,fontSize:15,color:destaque?"#fff":"var(--azul-profundo)",fontFamily:"var(--serif)"}}>{pessoa.nome}</p><p style={{fontSize:12,color:destaque?"rgba(255,255,255,0.6)":"var(--cinza-texto)",marginTop:2}}>Mat. {pessoa.mat}</p></>):<p style={{color:"var(--cinza-texto)",fontSize:13}}>—</p>}
    </div>
  )
}

function NavBtn({onClick,children,disabled}:{onClick:()=>void;children:React.ReactNode;disabled?:boolean}) {
  return <button onClick={onClick} disabled={disabled} style={{background:disabled?"#f0f4ff":"var(--azul-profundo)",color:disabled?"#c5cde0":"#fff",border:"none",borderRadius:8,padding:"6px 14px",fontSize:14,fontWeight:700,cursor:disabled?"default":"pointer"}}>{children}</button>
}

export function EscalasClient({
  semana,ano,mes,isAdmin,minhaMatricula,
  servicoAtual,todasSemanas,mesesCalendario,
  composicaoFaxina,membrosPlantao,
  plantaoDias,funcoesDias,nomesPorMat,alunos,
}:{
  semana:number;ano:number;mes:number;isAdmin:boolean;minhaMatricula:number
  servicoAtual:ServicoSemana;todasSemanas:ServicoSemana[]
  mesesCalendario:{ano:number;mes:number;dias:DiaCal[]}[]
  composicaoFaxina:ComposicaoFaxina
  membrosPlantao:typeof MEMBROS_PLANTAO
  plantaoDias:PlantaoDia[];funcoesDias:FuncaoDia[]
  nomesPorMat:Record<number,string>
  alunos:{matricula:number;nomeGuerra:string}[]
}) {
  const router = useRouter()
  const [aba,setAba] = useState<"servico"|"faxina"|"plantao">("servico")
  const [saving,setSaving] = useState(false)
  const [mesFaxinaIdx,setMesFaxinaIdx] = useState(0)
  const [mesPlantaoIdx,setMesPlantaoIdx] = useState(0)
  const [semanaServicoIdx,setSemanaServicoIdx] = useState(0)

  // Serviço overrides
  const [editandoSemana,setEditandoSemana] = useState<number|null>(null)
  const [editP1,setEditP1] = useState("");const [editP3,setEditP3] = useState("");const [editP4,setEditP4] = useState("")
  const [semanas,setSemanas] = useState(todasSemanas)

  // Faxina grupos admin
  const [composicao,setComposicao] = useState<ComposicaoFaxina>(composicaoFaxina)
  const [addGrupo,setAddGrupo] = useState("")
  const [addMat,setAddMat] = useState("")
  const [showAdminFaxina,setShowAdminFaxina] = useState(false)

  // Escala de serviço unificada (aba Plantão)
  const [showServicoForm,setShowServicoForm] = useState(false)
  const [servicoEntradas,setServicoEntradas] = useState<{data:string;funcao:string;matricula:string}[]>([{data:"",funcao:"AuxiliarOD",matricula:""}])

  // ── Faxina grupo admin ────────────────────────────────────────
  async function adicionarMembro() {
    if (!addGrupo||!addMat) return
    const aluno = alunos.find(a=>a.matricula===Number(addMat))
    if (!aluno) return
    setSaving(true)
    const res = await fetch("/api/faxina-grupos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({grupo:addGrupo,mat:Number(addMat),nome:aluno.nomeGuerra})})
    const novo = await res.json()
    setSaving(false)
    setAddMat("")
    setComposicao(prev=>{
      const grupo = prev[addGrupo]||[]
      return {...prev,[addGrupo]:[...grupo.filter(m=>m.mat!==novo.mat),{id:novo.id,mat:novo.mat,nome:novo.nome}]}
    })
  }

  async function removerMembro(id:string,grupo:string,mat:number) {
    if (!confirm("Remover este membro do grupo?")) return
    await fetch("/api/faxina-grupos",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})})
    setComposicao(prev=>({...prev,[grupo]:(prev[grupo]||[]).filter(m=>m.mat!==mat)}))
  }

  async function moverMembro(id:string,grupoAtual:string,mat:number,grupoNovo:string) {
    if (grupoNovo===grupoAtual) return
    setSaving(true)
    await fetch("/api/faxina-grupos",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,grupo:grupoNovo})})
    setSaving(false)
    const membro = composicao[grupoAtual]?.find(m=>m.mat===mat)
    if (!membro) return
    setComposicao(prev=>({
      ...prev,
      [grupoAtual]:(prev[grupoAtual]||[]).filter(m=>m.mat!==mat),
      [grupoNovo]:[...(prev[grupoNovo]||[]),{...membro,id}],
    }))
  }

  // ── Serviço ───────────────────────────────────────────────────
  async function salvarOverride(s:number) {
    setSaving(true)
    await fetch("/api/escalas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tipo:"servico",semana:s,p1:editP1?Number(editP1):null,p3:editP3?Number(editP3):null,p4:editP4?Number(editP4):null})})
    setSaving(false);setEditandoSemana(null);router.refresh()
  }
  async function removerOverride(s:number) {
    if (!confirm(`Restaurar cálculo automático da semana ${s}?`)) return
    await fetch("/api/escalas",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({tipo:"servico",semana:s})})
    router.refresh()
  }

  // ── Funções ───────────────────────────────────────────────────
  async function deletarFuncao(id:string) {
    await fetch("/api/funcoes-destaque",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})})
    router.refresh()
  }
  async function salvarServico() {
    setSaving(true)
    const funcoes=servicoEntradas.filter(e=>e.data&&e.matricula).map(e=>({data:e.data+"T12:00:00",funcao:e.funcao,matricula:Number(e.matricula)}))
    await fetch("/api/funcoes-destaque",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({funcoes})})
    setSaving(false);setShowServicoForm(false);router.refresh()
  }


  const isMinhaFaxina=(g:GrupoFaxina|null)=>g?(composicao[g]||[]).some(p=>p.mat===minhaMatricula):false
  const meuGrupoPlantao=(["GOLF","HOTEL","INDIA","JULIETT","KILO","LIMA","MIKE","NOVEMBER"] as GrupoPlantao[]).find(g=>(membrosPlantao[g]||[]).some(m=>m.mat===minhaMatricula))??null

  // Escala de serviço unificada: 6 funções por data (funcoesDias + adjuntos legados de plantaoDias)
  type ServicoItem={funcao:string;matricula:number;id?:string}
  const servicoPorData=new Map<string,ServicoItem[]>()
  for (const f of funcoesDias){const k=f.data.slice(0,10);if(!servicoPorData.has(k))servicoPorData.set(k,[]);servicoPorData.get(k)!.push({funcao:f.funcao,matricula:f.matricula,id:f.id})}
  // Preserva adjuntos da 2ª CIA cadastrados antigamente em PlantaoDia
  for (const p of plantaoDias){
    if(!p.adjuntoMat) continue
    const k=p.data.slice(0,10)
    const arr=servicoPorData.get(k)??[]
    if(!arr.some(x=>x.funcao==="Adjunto2")){arr.push({funcao:"Adjunto2",matricula:p.adjuntoMat});servicoPorData.set(k,arr)}
  }
  const ordemFuncao=(f:string)=>{const i=(FUNCOES_SERVICO as readonly string[]).indexOf(f);return i<0?99:i}
  const datasServico=Array.from(servicoPorData.keys()).sort()
  // Agrupa por função (uma tabela por função, datas em ordem)
  const servicoPorFuncao=new Map<string,{dataKey:string;matricula:number;id?:string}[]>()
  for (const dataKey of datasServico){
    for (const it of servicoPorData.get(dataKey)??[]){
      if(!servicoPorFuncao.has(it.funcao))servicoPorFuncao.set(it.funcao,[])
      servicoPorFuncao.get(it.funcao)!.push({dataKey,matricula:it.matricula,id:it.id})
    }
  }
  for (const arr of servicoPorFuncao.values()) arr.sort((a,b)=>a.dataKey.localeCompare(b.dataKey))
  const fmtData=(k:string)=>{const d=new Date(k+"T12:00:00");const s=d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"2-digit"});return s.charAt(0).toUpperCase()+s.slice(1)}
  const semanaVis=semanas[semanaServicoIdx]??servicoAtual
  const euSouP1=servicoAtual.p1?.mat===minhaMatricula
  const euSouP3=servicoAtual.p3?.mat===minhaMatricula
  const euSouP4=servicoAtual.p4?.mat===minhaMatricula

  const tabs=[{id:"servico",label:"Serviço P1/P3/P4"},{id:"faxina",label:"Faxina"},{id:"plantao",label:"Plantão"}] as const

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 16px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"var(--serif)",fontWeight:600,fontSize:24,color:"var(--azul-profundo)"}}>Escalas</h1>
          <p style={{color:"var(--cinza-texto)",fontSize:13,marginTop:4}}>Semana {semana}/52 · {MESES[mes]} {ano}</p>
        </div>
        <Link href="/escalas/imprimir" target="_blank" style={{background:"var(--dourado)",color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
          🖨️ Imprimir Escala
        </Link>
      </div>

      {/* Abas */}
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"2px solid var(--azul-claro)"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setAba(t.id)} style={{padding:"8px 16px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,borderRadius:"8px 8px 0 0",background:aba===t.id?"var(--azul-profundo)":"transparent",color:aba===t.id?"#fff":"var(--cinza-texto)",borderBottom:aba===t.id?"2px solid var(--azul-profundo)":"none",marginBottom:-2}}>{t.label}</button>
        ))}
      </div>

      {/* ── SERVIÇO ── */}
      {aba==="servico"&&(
        <div>
          {(euSouP1||euSouP3||euSouP4)&&<div style={{background:"var(--dourado)",borderRadius:10,padding:"10px 16px",marginBottom:20,color:"#fff",fontSize:13,fontWeight:600}}>⭐ Você está de {euSouP1?"P1 — Pessoal":euSouP3?"P3 — Operações":"P4 — Logística"} nessa semana</div>}
          <h2 style={{fontSize:14,fontWeight:700,color:"var(--azul-profundo)",marginBottom:12,letterSpacing:"0.06em",textTransform:"uppercase"}}>Semana {semana} — Atual</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:32}}>
            <CardServico label="P1 — Pessoal"   pessoa={servicoAtual.p1} destaque={euSouP1}/>
            <CardServico label="P3 — Operações" pessoa={servicoAtual.p3} destaque={euSouP3}/>
            <CardServico label="P4 — Logística" pessoa={servicoAtual.p4} destaque={euSouP4}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"var(--azul-profundo)",letterSpacing:"0.06em",textTransform:"uppercase"}}>
              Semana {semanaVis.semana}/52
              {semanaVis.isOverride&&<span style={{fontSize:10,background:"var(--dourado)",color:"#fff",borderRadius:20,padding:"2px 8px",marginLeft:8,fontWeight:700}}>editada</span>}
            </h2>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <NavBtn onClick={()=>setSemanaServicoIdx(i=>Math.max(0,i-1))} disabled={semanaServicoIdx===0}>‹</NavBtn>
              <span style={{fontSize:12,color:"var(--cinza-texto)",minWidth:80,textAlign:"center"}}>{semanaServicoIdx+1}/{semanas.length}</span>
              <NavBtn onClick={()=>setSemanaServicoIdx(i=>Math.min(semanas.length-1,i+1))} disabled={semanaServicoIdx===semanas.length-1}>›</NavBtn>
            </div>
          </div>

          {editandoSemana===semanaVis.semana?(
            <div style={{background:"#f8faff",border:"1.5px solid var(--azul-medio)",borderRadius:12,padding:16,marginBottom:16}}>
              <p style={{fontSize:13,fontWeight:700,color:"var(--azul-profundo)",marginBottom:12}}>Editar semana {semanaVis.semana}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
                {([{label:"P1 — Pessoal",val:editP1,set:setEditP1},{label:"P3 — Operações",val:editP3,set:setEditP3},{label:"P4 — Logística",val:editP4,set:setEditP4}]).map(({label,val,set})=>(
                  <div key={label}>
                    <label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:3}}>{label}</label>
                    <select value={val} onChange={e=>set(e.target.value)} style={{border:"1px solid #dde3ee",borderRadius:7,padding:"7px 10px",fontSize:13,width:"100%"}}>
                      <option value="">— automático —</option>
                      {alunos.map(a=><option key={a.matricula} value={a.matricula}>{a.matricula} {a.nomeGuerra}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>salvarOverride(semanaVis.semana)} disabled={saving} style={{background:"var(--azul-profundo)",color:"#fff",border:"none",borderRadius:7,padding:"7px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{saving?"Salvando...":"Salvar"}</button>
                {semanaVis.isOverride&&<button onClick={()=>removerOverride(semanaVis.semana)} style={{background:"#fee2e2",color:"#b91c1c",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>Restaurar automático</button>}
                <button onClick={()=>setEditandoSemana(null)} style={{background:"none",border:"none",fontSize:12,color:"var(--cinza-texto)",cursor:"pointer"}}>Cancelar</button>
              </div>
            </div>
          ):(
            <div style={{background:"#fff",border:"1.5px solid var(--cinza-borda)",borderRadius:12,overflow:"hidden",marginBottom:16}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{background:"var(--azul-claro)"}}>{["P1 — Pessoal","P3 — Operações","P4 — Logística"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontWeight:700,color:"var(--azul-profundo)",fontSize:12}}>{h}</th>)}{isAdmin&&<th style={{width:80}}/>}</tr></thead>
                <tbody><tr style={{borderTop:"1px solid var(--cinza-borda)",background:"var(--creme)"}}>
                  {[semanaVis.p1,semanaVis.p3,semanaVis.p4].map((p,i)=><td key={i} style={{padding:"12px 14px",fontWeight:p?.mat===minhaMatricula?700:400}}>{p?.nome??"—"}{p?.mat===minhaMatricula&&<span style={{fontSize:11,color:"var(--azul-medio)",marginLeft:6}}>← você</span>}</td>)}
                  {isAdmin&&<td style={{padding:"12px 14px"}}><button onClick={()=>{setEditandoSemana(semanaVis.semana);setEditP1(semanaVis.p1?String(semanaVis.p1.mat):"");setEditP3(semanaVis.p3?String(semanaVis.p3.mat):"");setEditP4(semanaVis.p4?String(semanaVis.p4.mat):"")}} style={{fontSize:11,color:"var(--azul-medio)",background:"#f0f4ff",border:"none",borderRadius:5,padding:"3px 10px",cursor:"pointer"}}>Editar</button></td>}
                </tr></tbody>
              </table>
            </div>
          )}

          <details style={{marginTop:8}}>
            <summary style={{fontSize:12,color:"var(--cinza-texto)",cursor:"pointer",userSelect:"none",marginBottom:8}}>Ver todas as semanas ({semanas.length})</summary>
            <div style={{background:"#fff",border:"1.5px solid var(--cinza-borda)",borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"var(--azul-profundo)",color:"#fff"}}><th style={{padding:"8px 12px",textAlign:"left",fontSize:11}}>Semana</th><th style={{padding:"8px 12px",textAlign:"left",fontSize:11}}>P1</th><th style={{padding:"8px 12px",textAlign:"left",fontSize:11}}>P3</th><th style={{padding:"8px 12px",textAlign:"left",fontSize:11}}>P4</th>{isAdmin&&<th style={{width:60}}/>}</tr></thead>
                <tbody>{semanas.map((s,i)=>{
                  const eu=s.p1?.mat===minhaMatricula||s.p3?.mat===minhaMatricula||s.p4?.mat===minhaMatricula
                  const atual=s.semana===semana
                  return <tr key={s.semana} style={{borderTop:"1px solid var(--cinza-borda)",background:atual?"var(--azul-claro)":eu?"#fffbf0":"#fff",fontWeight:atual||eu?600:400}}>
                    <td style={{padding:"8px 12px",color:"var(--azul-profundo)"}}>{s.semana}{atual?" ✦":""}{s.isOverride&&<span style={{fontSize:9,background:"var(--dourado)",color:"#fff",borderRadius:3,padding:"1px 4px",marginLeft:4}}>ed</span>}</td>
                    <td style={{padding:"8px 12px"}}>{s.p1?.nome??"—"}</td>
                    <td style={{padding:"8px 12px"}}>{s.p3?.nome??"—"}</td>
                    <td style={{padding:"8px 12px"}}>{s.p4?.nome??"—"}</td>
                    {isAdmin&&<td style={{padding:"8px 12px"}}><button onClick={()=>{setSemanaServicoIdx(i);setEditandoSemana(s.semana);setEditP1(s.p1?String(s.p1.mat):"");setEditP3(s.p3?String(s.p3.mat):"");setEditP4(s.p4?String(s.p4.mat):"")}} style={{fontSize:10,color:"var(--azul-medio)",background:"#f0f4ff",border:"none",borderRadius:4,padding:"2px 7px",cursor:"pointer"}}>Editar</button></td>}
                  </tr>
                })}</tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* ── FAXINA ── */}
      {aba==="faxina"&&(
        <div>
          {/* Grupos */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:28}}>
            {GRUPOS_FAXINA.map(g=>{
              const membros=composicao[g]||[]
              const euSou=membros.some(p=>p.mat===minhaMatricula)
              return (
                <div key={g} style={{background:euSou?"var(--azul-claro)":"#fff",border:`1.5px solid ${euSou?"var(--azul-medio)":"var(--cinza-borda)"}`,borderRadius:12,padding:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <TagGrupo grupo={g}/>
                    {euSou&&<span style={{fontSize:11,color:"var(--azul-medio)",fontWeight:600}}>← você</span>}
                  </div>
                  <ul style={{listStyle:"none",padding:0,margin:0,fontSize:12,color:"var(--grafite)"}}>
                    {membros.map(p=>(
                      <li key={p.mat} style={{padding:"2px 0",fontWeight:p.mat===minhaMatricula?700:400,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span>{p.mat} {p.nome}</span>
                        {isAdmin&&p.id&&(
                          <div style={{display:"flex",gap:4}}>
                            <select onChange={e=>e.target.value&&moverMembro(p.id!,g,p.mat,e.target.value)} defaultValue="" style={{fontSize:10,border:"1px solid #dde3ee",borderRadius:4,padding:"1px 4px",maxWidth:40,cursor:"pointer"}} title="Mover para grupo">
                              <option value="">→</option>
                              {GRUPOS_FAXINA.filter(x=>x!==g).map(x=><option key={x} value={x}>{x}</option>)}
                            </select>
                            <button onClick={()=>removerMembro(p.id!,g,p.mat)} style={{background:"none",border:"none",color:"#e53e3e",cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}>×</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Admin: adicionar membro */}
          {isAdmin&&(
            <div style={{marginBottom:24}}>
              <button onClick={()=>setShowAdminFaxina(!showAdminFaxina)} style={{background:"var(--azul-profundo)",color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:12}}>
                {showAdminFaxina?"Cancelar":"+ Adicionar / Mover Membro"}
              </button>
              {showAdminFaxina&&(
                <div style={{background:"#f8faff",border:"1px solid #dde3ee",borderRadius:12,padding:16,display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
                  <div>
                    <label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:3}}>GRUPO</label>
                    <select value={addGrupo} onChange={e=>setAddGrupo(e.target.value)} style={{border:"1px solid #dde3ee",borderRadius:7,padding:"7px 10px",fontSize:13}}>
                      <option value="">Selecionar...</option>
                      {GRUPOS_FAXINA.map(g=><option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:3}}>ALUNO</label>
                    <select value={addMat} onChange={e=>setAddMat(e.target.value)} style={{border:"1px solid #dde3ee",borderRadius:7,padding:"7px 10px",fontSize:13}}>
                      <option value="">Selecionar...</option>
                      {alunos.map(a=><option key={a.matricula} value={a.matricula}>{a.matricula} {a.nomeGuerra}</option>)}
                    </select>
                  </div>
                  <button onClick={adicionarMembro} disabled={saving||!addGrupo||!addMat} style={{background:"var(--dourado)",color:"#fff",border:"none",borderRadius:7,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer",opacity:!addGrupo||!addMat?0.5:1}}>
                    {saving?"...":"Adicionar"}
                  </button>
                  <p style={{fontSize:11,color:"#9aa3b8",width:"100%",margin:0}}>Para mover entre grupos, use a seta (→) ao lado do nome do membro.</p>
                </div>
              )}
            </div>
          )}

          {/* Calendário navegável */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"var(--azul-profundo)",letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:10}}>
              {MESES[mesesCalendario[mesFaxinaIdx].mes]} {mesesCalendario[mesFaxinaIdx].ano}
              {mesFaxinaIdx===0&&<span style={{fontSize:11,background:"var(--dourado)",color:"#fff",borderRadius:20,padding:"2px 10px",fontWeight:700}}>Mês atual</span>}
            </h2>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <NavBtn onClick={()=>setMesFaxinaIdx(i=>Math.max(0,i-1))} disabled={mesFaxinaIdx===0}>‹</NavBtn>
              <span style={{fontSize:12,color:"var(--cinza-texto)",minWidth:60,textAlign:"center"}}>{mesFaxinaIdx+1}/{mesesCalendario.length}</span>
              <NavBtn onClick={()=>setMesFaxinaIdx(i=>Math.min(mesesCalendario.length-1,i+1))} disabled={mesFaxinaIdx===mesesCalendario.length-1}>›</NavBtn>
            </div>
          </div>

          {(()=>{
            const {ano:a,mes:m,dias}=mesesCalendario[mesFaxinaIdx]
            const hoje=new Date()
            const hojeStr=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`
            const primeiroDia=new Date(a,m-1,1).getDay()
            const cells:(DiaCal|null)[]=[...Array(primeiroDia).fill(null),...(dias as DiaCal[])]
            while(cells.length%7!==0) cells.push(null)
            const esteHoje=dias.find(d=>d.data.slice(0,10)===hojeStr)
            return (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,fontSize:11,marginBottom:6}}>
                  {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d} style={{textAlign:"center",fontWeight:700,color:"var(--cinza-texto)",padding:4}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
                  {cells.map((dia,i)=>{
                    if(!dia) return <div key={i}/>
                    const numDia=Number(dia.data.slice(8,10)) // dia a partir da string (tz-estável)
                    const meuGrupo=isMinhaFaxina(dia.grupoFaxina)
                    const isHoje=dia.data.slice(0,10)===hojeStr
                    return (
                      <div key={i} style={{background:isHoje?"var(--azul-profundo)":meuGrupo?"var(--azul-claro)":dia.tipo==="fds"?"#F8FAFC":"#fff",border:isHoje?"2px solid var(--dourado)":`1.5px solid ${meuGrupo?"var(--azul-medio)":"var(--cinza-borda)"}`,borderRadius:8,padding:"6px 4px",textAlign:"center",minHeight:56,boxShadow:isHoje?"0 2px 8px rgba(11,45,94,0.22)":undefined}}>
                        <p style={{fontWeight:700,fontSize:13,marginBottom:3,color:isHoje?"#fff":dia.tipo==="fds"?"var(--cinza-texto)":"var(--grafite)"}}>
                          {numDia}
                          {isHoje&&<span style={{fontSize:8,display:"block",color:"rgba(255,200,80,0.9)",letterSpacing:"0.04em"}}>HOJE</span>}
                        </p>
                        {dia.tipo==="util"&&dia.grupoFaxina&&<TagGrupo grupo={dia.grupoFaxina} small/>}
                        {dia.tipo==="fds"&&<span style={{fontSize:9,color:isHoje?"rgba(255,255,255,0.65)":"var(--cinza-texto)"}}>FDS<br/>{dia.grupoPlantao}</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Card de hoje: plantão + faxina */}
                {esteHoje&&mesFaxinaIdx===0&&(
                  <div style={{background:"var(--azul-profundo)",borderRadius:12,padding:"16px 18px"}}>
                    {/* Plantão */}
                    <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                      Plantão de Hoje — {esteHoje.grupoPlantao}
                    </p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:esteHoje.tipo==="util"&&esteHoje.grupoFaxina?14:0}}>
                      {(membrosPlantao[esteHoje.grupoPlantao]||[]).map(m2=>{
                        const euSou=m2.mat===minhaMatricula
                        return <span key={m2.mat} style={{background:euSou?"var(--dourado)":"rgba(255,255,255,0.12)",color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:euSou?700:400}}>{m2.mat} {m2.nome}{euSou?" ←":""}</span>
                      })}
                    </div>
                    {/* Faxina do dia */}
                    {esteHoje.tipo==="util"&&esteHoje.grupoFaxina&&(
                      <>
                        <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",marginBottom:10}}/>
                        <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                          Faxina de Hoje — {esteHoje.grupoFaxina}
                        </p>
                        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                          {(composicao[esteHoje.grupoFaxina]||[]).map(m2=>{
                            const euSou=m2.mat===minhaMatricula
                            return <span key={m2.mat} style={{background:euSou?"var(--dourado)":"rgba(255,255,255,0.10)",color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:euSou?700:400}}>{m2.mat} {m2.nome}{euSou?" ←":""}</span>
                          })}
                        </div>
                      </>
                    )}
                    {/* Funções de destaque do dia */}
                    {(()=>{
                      const itensHoje=[...(servicoPorData.get(esteHoje.data.slice(0,10))??[])].sort((a,b)=>ordemFuncao(a.funcao)-ordemFuncao(b.funcao))
                      if(itensHoje.length===0) return null
                      return (
                        <>
                          <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",margin:"14px 0 10px"}}/>
                          <p style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                            Funções de Hoje
                          </p>
                          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                            {itensHoje.map(it=>{
                              const euSou=it.matricula===minhaMatricula
                              return <span key={it.funcao} style={{background:euSou?"var(--dourado)":"rgba(255,255,255,0.10)",color:"#fff",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:euSou?700:400}}><b style={{fontWeight:700}}>{LABEL_FUNCAO[it.funcao]??it.funcao}:</b> {nomesPorMat[it.matricula]??`Mat.${it.matricula}`}{euSou?" ←":""}</span>
                            })}
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      {/* ── PLANTÃO ── */}
      {aba==="plantao"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:28}}>
            {(["GOLF","HOTEL","INDIA","JULIETT","KILO","LIMA","MIKE","NOVEMBER"] as GrupoPlantao[]).map(g=>{
              const membros=membrosPlantao[g]||[]
              const temEu=membros.some(m=>m.mat===minhaMatricula)
              return (
                <div key={g} style={{background:temEu?"var(--azul-claro)":"#fff",border:`1.5px solid ${temEu?"var(--azul-medio)":"var(--cinza-borda)"}`,borderRadius:12,padding:14}}>
                  <p style={{fontWeight:700,fontSize:13,color:"var(--azul-profundo)",marginBottom:8}}>{g} {temEu&&<span style={{fontSize:11,color:"var(--azul-medio)"}}>← você</span>}</p>
                  <ul style={{listStyle:"none",padding:0,margin:0,fontSize:12}}>
                    {membros.map(m=><li key={m.mat} style={{padding:"1px 0",fontWeight:m.mat===minhaMatricula?700:400}}>{m.mat} {m.nome}</li>)}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Calendário de plantão (ciclo diário dos 8 grupos) */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h2 style={{fontSize:14,fontWeight:700,color:"var(--azul-profundo)",letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:10}}>
              Plantão · {MESES[mesesCalendario[mesPlantaoIdx].mes]} {mesesCalendario[mesPlantaoIdx].ano}
              {mesPlantaoIdx===0&&<span style={{fontSize:11,background:"var(--dourado)",color:"#fff",borderRadius:20,padding:"2px 10px",fontWeight:700}}>Mês atual</span>}
            </h2>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <NavBtn onClick={()=>setMesPlantaoIdx(i=>Math.max(0,i-1))} disabled={mesPlantaoIdx===0}>‹</NavBtn>
              <span style={{fontSize:12,color:"var(--cinza-texto)",minWidth:60,textAlign:"center"}}>{mesPlantaoIdx+1}/{mesesCalendario.length}</span>
              <NavBtn onClick={()=>setMesPlantaoIdx(i=>Math.min(mesesCalendario.length-1,i+1))} disabled={mesPlantaoIdx===mesesCalendario.length-1}>›</NavBtn>
            </div>
          </div>
          {meuGrupoPlantao&&<p style={{fontSize:12,color:"var(--cinza-texto)",marginBottom:10}}>Seu grupo: <TagPlantao grupo={meuGrupoPlantao}/> — os dias destacados são os seus.</p>}
          {(()=>{
            const {ano:a,mes:m,dias}=mesesCalendario[mesPlantaoIdx]
            const hoje=new Date()
            const hojeStr=`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`
            const primeiroDia=new Date(a,m-1,1).getDay()
            const cells:(DiaCal|null)[]=[...Array(primeiroDia).fill(null),...(dias as DiaCal[])]
            while(cells.length%7!==0) cells.push(null)
            return (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,fontSize:11,marginBottom:6}}>
                  {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(dd=><div key={dd} style={{textAlign:"center",fontWeight:700,color:"var(--cinza-texto)",padding:4}}>{dd}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:24}}>
                  {cells.map((dia,i)=>{
                    if(!dia) return <div key={i}/>
                    const numDia=Number(dia.data.slice(8,10))
                    const meuDia=meuGrupoPlantao!==null&&dia.grupoPlantao===meuGrupoPlantao
                    const isHoje=dia.data.slice(0,10)===hojeStr
                    return (
                      <div key={i} style={{background:isHoje?"var(--azul-profundo)":meuDia?"var(--azul-claro)":"#fff",border:isHoje?"2px solid var(--dourado)":`1.5px solid ${meuDia?"var(--azul-medio)":"var(--cinza-borda)"}`,borderRadius:8,padding:"6px 4px",textAlign:"center",minHeight:56,boxShadow:isHoje?"0 2px 8px rgba(11,45,94,0.22)":undefined}}>
                        <p style={{fontWeight:700,fontSize:13,marginBottom:4,color:isHoje?"#fff":"var(--grafite)"}}>
                          {numDia}
                          {isHoje&&<span style={{fontSize:8,display:"block",color:"rgba(255,200,80,0.9)",letterSpacing:"0.04em"}}>HOJE</span>}
                        </p>
                        <TagPlantao grupo={dia.grupoPlantao} small/>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}

          <h2 style={{fontSize:14,fontWeight:700,color:"var(--azul-profundo)",marginBottom:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Escala de Serviço</h2>
          <p style={{fontSize:12,color:"var(--cinza-texto)",marginBottom:16}}>Uma tabela por função — Turma 13. A linha em destaque é a sua.</p>
          {datasServico.length===0&&<p style={{color:"var(--cinza-texto)",fontSize:13,marginBottom:16}}>Nenhum dado inserido ainda.</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16,marginBottom:24}}>
            {FUNCOES_SERVICO.filter(f=>servicoPorFuncao.has(f)).map(funcao=>{
              const linhas=servicoPorFuncao.get(funcao)!
              const euAqui=linhas.some(l=>l.matricula===minhaMatricula)
              return (
                <div key={funcao} style={{background:"#fff",border:`1.5px solid ${euAqui?"var(--azul-medio)":"var(--cinza-borda)"}`,borderRadius:12,overflow:"hidden",boxShadow:"var(--shadow-sm)"}}>
                  <div style={{background:"var(--azul-profundo)",color:"#fff",padding:"10px 14px",fontSize:13,fontWeight:700}}>{LABEL_FUNCAO[funcao]??funcao}</div>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <tbody>
                      {linhas.map((l,idx)=>{
                        const eu=l.matricula===minhaMatricula
                        return (
                          <tr key={l.dataKey+l.id} style={{borderTop:idx===0?"none":"1px solid var(--cinza-borda)",background:eu?"var(--azul-claro)":"#fff"}}>
                            <td style={{padding:"8px 14px",whiteSpace:"nowrap",color:"var(--cinza-texto)",fontWeight:600,width:1}}>{fmtData(l.dataKey)}</td>
                            <td style={{padding:"8px 14px",fontWeight:eu?700:400,color:eu?"var(--azul-profundo)":"var(--grafite)"}}>
                              {nomesPorMat[l.matricula]??`Mat.${l.matricula}`}
                              {eu&&<span style={{marginLeft:6,fontSize:10,color:"var(--azul-medio)",fontWeight:700}}>← você</span>}
                            </td>
                            {isAdmin&&l.id&&<td style={{padding:"8px 10px",textAlign:"right",width:1}}><button onClick={()=>deletarFuncao(l.id!)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--cinza-texto)",fontSize:14,padding:0,lineHeight:1}}>×</button></td>}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
          {isAdmin&&(
            <div>
              <button onClick={()=>setShowServicoForm(!showServicoForm)} style={{background:"var(--azul-profundo)",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{showServicoForm?"Cancelar":"Inserir escala de serviço"}</button>
              {showServicoForm&&(
                <div style={{marginTop:16,background:"var(--azul-claro)",borderRadius:12,padding:20}}>
                  <p style={{fontSize:12,color:"var(--cinza-texto)",marginBottom:12}}>Informe a data, a função e o aluno da Turma 13 escalado.</p>
                  {servicoEntradas.map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                      <input type="date" value={e.data} onChange={ev=>{const n=[...servicoEntradas];n[i]={...n[i],data:ev.target.value};setServicoEntradas(n)}} style={{border:"1px solid var(--cinza-borda)",borderRadius:6,padding:"6px 10px",fontSize:13}}/>
                      <select value={e.funcao} onChange={ev=>{const n=[...servicoEntradas];n[i]={...n[i],funcao:ev.target.value};setServicoEntradas(n)}} style={{border:"1px solid var(--cinza-borda)",borderRadius:6,padding:"6px 10px",fontSize:13}}>{FUNCOES_SERVICO.map(f=><option key={f} value={f}>{LABEL_FUNCAO[f]}</option>)}</select>
                      <select value={e.matricula} onChange={ev=>{const n=[...servicoEntradas];n[i]={...n[i],matricula:ev.target.value};setServicoEntradas(n)}} style={{border:"1px solid var(--cinza-borda)",borderRadius:6,padding:"6px 10px",fontSize:13}}><option value="">— Aluno —</option>{alunos.map(a=><option key={a.matricula} value={a.matricula}>{a.matricula} {a.nomeGuerra}</option>)}</select>
                      {servicoEntradas.length>1&&<button onClick={()=>setServicoEntradas(servicoEntradas.filter((_,j)=>j!==i))} style={{background:"#fee2e2",color:"#b91c1c",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>✕</button>}
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={()=>setServicoEntradas([...servicoEntradas,{data:"",funcao:"AuxiliarOD",matricula:""}])} style={{background:"#e0e7ff",color:"var(--azul-profundo)",border:"none",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>+ Linha</button>
                    <button onClick={salvarServico} disabled={saving} style={{background:"var(--dourado)",color:"#fff",border:"none",borderRadius:8,padding:"7px 18px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{saving?"Salvando…":"Salvar"}</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
