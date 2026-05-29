"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  calcularMGCSimples, calcularComponentes,
  calcularPosicaoHistorica, calcularPercentil, calcularProjecaoConsolidada,
  BASE_T1, BASE_T2,
} from "@/lib/ranking"

// ── tipos ───────────────────────────────────────────────────────────────────────
type Disciplina  = { id:string; sigla:string; nome:string; modulo:string; cargaTotal:number; cargaMinistrada:number; status:string }
type NotaItem    = { id:string; disciplina:string; avaliacao:string; nota:number; peso:number; ehAF:boolean; apto:boolean; data:string; observacao:string|null }
type AlunoRank   = { id:string; matricula:number; nomeGuerra:string; canga:string|null; mgc:number|null; nfdc:number }
type MinhaEntrada = AlunoRank & { posicao:number }
type Componentes  = { mfic:number|null; nfdc:number; tcc:number|null; mgc:number|null }

interface Props {
  ranking:        AlunoRank[]
  minhaEntrada:   MinhaEntrada|null
  meusComponentes:Componentes
  minhaNFDC:      number
  isAdmin:        boolean
  userId:         string
  disciplinas:    Disciplina[]
  minhasNotas:    NotaItem[]
  totalAlunos:    number
}

const AZ  = "var(--azul-profundo)"
const AM  = "var(--azul-medio)"
const DOU = "var(--dourado)"

function medalha(i:number) { return i===0?"🥇":i===1?"🥈":i===2?"🥉":null }
function corNota(n:number|null,apto:boolean) {
  if (apto) return "#15803d"
  if (n===null) return "#9aa3b8"
  return n>=7?"#15803d":n>=4?"#b45309":"#b91c1c"
}
function fmtNum(n:number|null,dec=3) { return n!==null?n.toFixed(dec):"—" }

function calcMD(notas:NotaItem[]):number|null {
  const provas=notas.filter(n=>!n.ehAF&&!n.apto)
  if (!provas.length) return null
  return provas.reduce((s,n)=>s+n.nota,0)/provas.length
}

// ── SEÇÃO ESTATÍSTICA (projeção histórica) ───────────────────────────────────────
function SecaoEstatistica({ mgc, ranking, posicaoAtual, totalAlunos }: {
  mgc: number
  ranking: AlunoRank[]
  posicaoAtual: number
  totalAlunos: number
}) {
  const stats = useMemo(() => {
    const t3ComDados = ranking.filter(a => a.mgc !== null).length
    const posT1 = calcularPosicaoHistorica(mgc, BASE_T1)
    const posT2 = calcularPosicaoHistorica(mgc, BASE_T2)
    return {
      posT1: Math.max(1, Math.round(posT1)),
      posT2: Math.max(1, Math.round(posT2)),
      percT1: calcularPercentil(mgc, BASE_T1),
      percT2: calcularPercentil(mgc, BASE_T2),
      proj: calcularProjecaoConsolidada(mgc, posicaoAtual - 1, totalAlunos, t3ComDados),
    }
  }, [mgc, ranking, posicaoAtual, totalAlunos])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 0" }}>
        Projeção Histórica
      </p>

      {/* Estimativas T1 e T2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {([
          { label: "Estimativa T1", pos: stats.posT1, total: 148, perc: stats.percT1 },
          { label: "Estimativa T2", pos: stats.posT2, total: 171, perc: stats.percT2 },
        ] as const).map(item => (
          <div key={item.label} style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{item.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--serif)", color: AZ, margin: 0 }}>
              {item.pos}º <span style={{ fontSize: 12, fontWeight: 500, color: "#9aa3b8" }}>de {item.total}</span>
            </p>
            <div style={{ marginTop: 8, background: "#f0f4ff", borderRadius: 6, padding: "4px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#6b7a99" }}>Percentil</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: AM }}>{item.perc}%</span>
            </div>
            <p style={{ fontSize: 10, color: "#9aa3b8", marginTop: 6, margin: "6px 0 0" }}>
              Superior a {item.perc}% da {item.label.split(" ")[1]}
            </p>
          </div>
        ))}
      </div>

      {/* Projeção Consolidada */}
      <div style={{ background: "#fff", border: "1px solid #dde3ee", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #edf0f7" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9aa3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Projeção Consolidada — T3
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { label: "Melhor cenário", val: `${stats.proj.melhor}º`, cor: "#15803d" },
            { label: "Mais provável",  val: `${stats.proj.provavel}º`,  cor: AZ },
            { label: "Conservador",    val: `${stats.proj.conservador}º`, cor: "#b45309" },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: "16px 10px", textAlign: "center", borderRight: i < 2 ? "1px solid #edf0f7" : undefined }}>
              <p style={{ fontSize: 10, color: "#9aa3b8", marginBottom: 4, margin: "0 0 4px" }}>{item.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--serif)", color: item.cor, margin: 0 }}>{item.val}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 16px", background: "#f8faff", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#6b7a99", margin: 0 }}>
            Faixa provável: entre <strong>{stats.proj.melhor}º</strong> e <strong>{stats.proj.conservador}º</strong> de {totalAlunos} cadetes
          </p>
        </div>
      </div>
    </div>
  )
}

// ── ABA MEU RANKING ─────────────────────────────────────────────────────────────
function AbaMeuRanking({ranking,minhaEntrada,meusComponentes,isAdmin,totalAlunos}:{
  ranking:AlunoRank[]; minhaEntrada:MinhaEntrada|null; meusComponentes:Componentes; isAdmin:boolean; totalAlunos:number
}) {
  if (!isAdmin) {
    return (
      <div style={{maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
        {/* Card de posição */}
        {minhaEntrada?(
          <div style={{background:`linear-gradient(135deg,${AZ},#1a3a6e)`,borderRadius:20,padding:"32px 28px",color:"#fff",textAlign:"center",boxShadow:"0 8px 32px rgba(11,45,94,0.28)"}}>
            <div style={{fontSize:48,marginBottom:4}}>{medalha(minhaEntrada.posicao-1)??"🎖️"}</div>
            <p style={{fontSize:13,opacity:0.7,marginBottom:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Sua posição</p>
            <p style={{fontSize:56,fontWeight:800,fontFamily:"var(--serif)",lineHeight:1}}>{minhaEntrada.posicao}º</p>
            <p style={{fontSize:13,opacity:0.6,marginTop:4}}>de {totalAlunos} cadetes</p>
            <div style={{borderTop:"1px solid rgba(255,255,255,0.15)",marginTop:24,paddingTop:20}}>
              <p style={{fontSize:12,opacity:0.65,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>MGC</p>
              <p style={{fontSize:40,fontWeight:800,fontFamily:"var(--serif)",color:"var(--dourado-claro,#f0d080)"}}>
                {fmtNum(minhaEntrada.mgc)}
              </p>
              <p style={{fontSize:11,opacity:0.5,marginTop:4}}>MFIC × 6,5 + NFDC × 2,5 + TCC × 1 / 10</p>
            </div>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <p style={{fontSize:32,marginBottom:12}}>📊</p>
            <p style={{fontSize:16,fontWeight:600,color:AZ}}>Nenhuma nota lançada ainda</p>
            <p style={{fontSize:13,color:"#9aa3b8",marginTop:6}}>Acesse <strong>Minhas Notas</strong> para começar.</p>
          </div>
        )}

        {/* Detalhamento dos componentes */}
        <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid #edf0f7"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em"}}>Componentes da MGC</p>
          </div>
          {[
            {label:"MFIC",desc:"Média Final Intelectual do Curso",val:meusComponentes.mfic,peso:"× 6,5",cor:"#1A52A8"},
            {label:"NFDC",desc:"Nota Final Disciplinar de Curso",val:meusComponentes.nfdc,peso:"× 2,5",cor:meusComponentes.nfdc<10?"#b45309":"#15803d"},
            {label:"TCC", desc:"Trabalho de Conclusão de Curso",val:meusComponentes.tcc,peso:"× 1,0",cor:"#7C3AED"},
          ].map(c=>(
            <div key={c.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid #f5f7fb"}}>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:AZ,margin:0}}>{c.label}</p>
                <p style={{fontSize:11,color:"#9aa3b8",margin:0}}>{c.desc}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontSize:20,fontWeight:800,color:c.cor,fontFamily:"var(--serif)",margin:0}}>
                  {c.val!==null?Number(c.val).toFixed(3):"—"}
                </p>
                <p style={{fontSize:11,color:"#9aa3b8",margin:0}}>{c.peso}</p>
              </div>
            </div>
          ))}
          <div style={{padding:"12px 16px",background:"#f8faff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:13,fontWeight:700,color:AZ,margin:0}}>MGC Final</p>
            <p style={{fontSize:22,fontWeight:800,color:AZ,fontFamily:"var(--serif)",margin:0}}>{fmtNum(meusComponentes.mgc)}</p>
          </div>
        </div>

        {minhaEntrada?.mgc !== null && minhaEntrada !== null && (
          <SecaoEstatistica
            mgc={minhaEntrada.mgc!}
            ranking={ranking}
            posicaoAtual={minhaEntrada.posicao}
            totalAlunos={totalAlunos}
          />
        )}

        <p style={{fontSize:12,color:"#9aa3b8",textAlign:"center"}}>Posições dos demais cadetes são privadas · Atualizado em tempo real</p>
      </div>
    )
  }

  // Admin: tabela completa
  return (
    <div>
      <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:AZ,color:"#fff"}}>
              {["Pos.","Nome de Guerra","Mat.","NFDC","MGC"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:h==="MGC"||h==="NFDC"?"right":"left",fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map((a,i)=>{
              const med=medalha(i)
              return (
                <tr key={a.matricula} style={{borderTop:"1px solid #edf0f7"}}>
                  <td style={{padding:"10px 14px",fontWeight:700,color:med?undefined:AM,fontSize:med?16:13}}>{med?`${med} ${i+1}º`:`${i+1}º`}</td>
                  <td style={{padding:"10px 14px",color:AZ,fontWeight:500}}>{a.nomeGuerra}</td>
                  <td style={{padding:"10px 14px",color:"#6b7a99"}}>{a.matricula}</td>
                  <td style={{padding:"10px 14px",textAlign:"right",fontWeight:600,color:a.nfdc<10?"#b45309":"#15803d"}}>{a.nfdc.toFixed(3)}</td>
                  <td style={{padding:"10px 14px",textAlign:"right",fontFamily:"monospace",fontWeight:700,color:a.mgc!==null?AZ:"#c5cde0"}}>{a.mgc!==null?a.mgc.toFixed(3):"—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:11,color:"#9aa3b8",textAlign:"center",marginTop:12}}>Decreto 57.694/2024 · MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10</p>
    </div>
  )
}

// ── ABA MINHAS NOTAS ─────────────────────────────────────────────────────────────
function AbaMinhasNotas({disciplinas,minhasNotas:inicial,minhaNFDC:nfdcInicial,userId}:{
  disciplinas:Disciplina[]; minhasNotas:NotaItem[]; minhaNFDC:number; userId:string
}) {
  const router = useRouter()
  const [notas,setNotas]     = useState(inicial)
  const [nfdc,setNfdc]       = useState(nfdcInicial)
  const [editNfdc,setEditNfdc] = useState(false)
  const [nfdcInput,setNfdcInput] = useState(String(nfdcInicial))
  const [aberta,setAberta]   = useState<string|null>(null)
  const [formSigla,setFormSigla] = useState<string|null>(null)
  const [form,setForm]       = useState({avaliacao:"",nota:"",ehAF:false})
  const [salvando,setSalvando] = useState(false)

  const notasPorDisc = useMemo(()=>{
    const m:Record<string,NotaItem[]>={}
    for (const n of notas){if(!m[n.disciplina])m[n.disciplina]=[];m[n.disciplina].push(n)}
    return m
  },[notas])

  const notaTCC = notas.find(n=>n.disciplina==="TCC"||n.avaliacao==="TCC")

  const {mfic,tcc,mgc} = useMemo(()=>calcularComponentes(notas,nfdc),[notas,nfdc])

  async function salvarNFDC() {
    setSalvando(true)
    const res = await fetch("/api/nfdc",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({nfdc:Number(nfdcInput)})})
    const data = await res.json()
    setSalvando(false)
    if (data.nfdc!==undefined){setNfdc(data.nfdc);setEditNfdc(false)}
  }

  const [msg, setMsg] = useState<{tipo:"ok"|"erro";texto:string}|null>(null)

  function flash(tipo:"ok"|"erro", texto:string) {
    setMsg({tipo,texto})
    setTimeout(()=>setMsg(null), 3000)
  }

  async function lancarTCC(nota:string) {
    if (!nota) return
    setSalvando(true)
    try {
      const res = await fetch("/api/notas",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({disciplina:"TCC",avaliacao:"TCC",nota:Number(nota),ehAF:false,apto:false,
          data:new Date().toISOString().slice(0,10),observacao:null})})
      if (!res.ok) { const e=await res.json(); flash("erro",e.error||"Erro ao salvar TCC"); return }
      flash("ok","TCC salvo!")
      router.refresh()
    } catch { flash("erro","Erro de conexão") } finally { setSalvando(false) }
  }

  async function deletarTCC() {
    if (!notaTCC||!confirm("Remover nota do TCC?")) return
    await fetch(`/api/notas/${notaTCC.id}`,{method:"DELETE"})
    router.refresh()
  }

  async function lancar(sigla:string) {
    if (!form.avaliacao) return
    const notaVal = Number(form.nota)
    if (isNaN(notaVal)||notaVal<0||notaVal>10) {
      flash("erro","Nota deve ser entre 0 e 10"); return
    }
    setSalvando(true)
    try {
      const res = await fetch("/api/notas",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({disciplina:sigla,avaliacao:form.avaliacao,nota:notaVal,
          ehAF:form.ehAF,apto:false,data:new Date().toISOString().slice(0,10),observacao:null})})
      if (!res.ok) { const e=await res.json(); flash("erro",e.error||"Erro ao salvar nota"); return }
      setFormSigla(null)
      setForm({avaliacao:"",nota:"",ehAF:false})
      flash("ok",`Nota de ${sigla} salva!`)
      router.refresh()
    } catch { flash("erro","Erro de conexão ao salvar") } finally { setSalvando(false) }
  }

  async function deletar(id:string) {
    if (!confirm("Excluir esta nota?")) return
    await fetch(`/api/notas/${id}`,{method:"DELETE"})
    router.refresh()
  }

  const discComNotas = disciplinas.filter(d=>(notasPorDisc[d.sigla]?.length??0)>0 && d.sigla!=="TCC")
  // Inclui TODAS as disciplinas sem nota (inclusive "Início") — aluno pode ter prova de qualquer módulo
  const discSemNotas = disciplinas.filter(d=>(notasPorDisc[d.sigla]?.length??0)===0 && d.sigla!=="TCC")

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      {/* Toast de feedback */}
      {msg && (
        <div style={{
          position:"fixed",top:20,right:20,zIndex:9999,
          background: msg.tipo==="ok"?"#15803d":"#b91c1c",
          color:"#fff",borderRadius:10,padding:"12px 20px",
          fontSize:13,fontWeight:600,boxShadow:"0 4px 16px rgba(0,0,0,0.18)",
          animation:"slideIn 0.2s ease",
        }}>
          {msg.tipo==="ok"?"✓":"✗"} {msg.texto}
        </div>
      )}

      {/* Painel de componentes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {label:"MFIC",val:fmtNum(mfic),sub:"disciplinas"},
          {label:"NFDC",val:fmtNum(nfdc),sub:"disciplinar"},
          {label:"TCC", val:fmtNum(tcc), sub:"conclusão"},
          {label:"MGC", val:fmtNum(mgc), sub:"geral final"},
        ].map(item=>(
          <div key={item.label} style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:12,padding:"12px 14px",textAlign:"center"}}>
            <p style={{fontSize:10,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{item.label}</p>
            <p style={{fontSize:20,fontWeight:800,fontFamily:"var(--serif)",color:AZ,margin:0}}>{item.val}</p>
            <p style={{fontSize:10,color:"#c5cde0",marginTop:2}}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* NFDC */}
      <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:editNfdc?12:0}}>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:AZ,margin:0}}>NFDC — Nota Disciplinar</p>
            <p style={{fontSize:11,color:"#9aa3b8",margin:"2px 0 0"}}>Inicia em 10,0 · pode ser alterada por transgressões</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <p style={{fontSize:24,fontWeight:800,fontFamily:"var(--serif)",color:nfdc<10?"#b45309":"#15803d",margin:0}}>{nfdc.toFixed(3)}</p>
            {!editNfdc&&<button onClick={()=>{setEditNfdc(true);setNfdcInput(String(nfdc))}} style={{fontSize:11,color:AM,background:"#f0f4ff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer"}}>Editar</button>}
          </div>
        </div>
        {editNfdc&&(
          <div style={{display:"flex",gap:10,alignItems:"center",paddingTop:4}}>
            <input type="number" min={0} max={10} step={0.001} value={nfdcInput} onChange={e=>setNfdcInput(e.target.value)}
              style={{border:"1px solid #dde3ee",borderRadius:7,padding:"7px 10px",fontSize:16,width:100,fontWeight:700,textAlign:"center"}} />
            <p style={{fontSize:11,color:"#9aa3b8",margin:0}}>de 10,0</p>
            <button onClick={salvarNFDC} disabled={salvando} style={{background:AZ,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{salvando?"...":"Salvar"}</button>
            <button onClick={()=>setEditNfdc(false)} style={{background:"none",border:"none",fontSize:12,color:"#9aa3b8",cursor:"pointer"}}>Cancelar</button>
          </div>
        )}
      </div>

      {/* TCC */}
      <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:notaTCC?0:12}}>
          <div>
            <p style={{fontSize:13,fontWeight:700,color:AZ,margin:0}}>TCC — Trabalho de Conclusão</p>
            <p style={{fontSize:11,color:"#9aa3b8",margin:"2px 0 0"}}>Lance quando receber a nota oficial da banca</p>
          </div>
          {notaTCC&&(
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <p style={{fontSize:24,fontWeight:800,fontFamily:"var(--serif)",color:"#7C3AED",margin:0}}>{notaTCC.nota.toFixed(1)}</p>
              <button onClick={deletarTCC} style={{fontSize:11,color:"#e53e3e",background:"none",border:"none",cursor:"pointer"}}>Remover</button>
            </div>
          )}
        </div>
        {!notaTCC&&(
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <input type="number" min={0} max={10} step={0.1} placeholder="0.0 – 10.0"
              id="tcc-input"
              style={{border:"1px solid #dde3ee",borderRadius:7,padding:"7px 10px",fontSize:16,width:110,fontWeight:700}} />
            <button onClick={()=>{const el=document.getElementById("tcc-input") as HTMLInputElement;lancarTCC(el?.value)}} disabled={salvando}
              style={{background:"#7C3AED",color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>{salvando?"...":"Lançar TCC"}</button>
          </div>
        )}
      </div>

      {/* Disciplinas com notas */}
      {discComNotas.length>0&&(
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Disciplinas com notas lançadas</p>
          <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
            {discComNotas.map((d,i)=>{
              const ns=notasPorDisc[d.sigla]||[]
              const md=calcMD(ns)
              const isAberta=aberta===d.sigla
              const podeP2=d.cargaTotal>=40
              return (
                <div key={d.sigla} style={{borderTop:i>0?"1px solid #edf0f7":undefined}}>
                  <button onClick={()=>setAberta(isAberta?null:d.sigla)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
                    <div style={{width:36,height:36,borderRadius:8,background:md!==null&&md>=7?"#dcfce7":md!==null&&md>=4?"#fef3c7":"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span style={{fontSize:12,fontWeight:800,color:corNota(md,ns.some(n=>n.apto))}}>{ns.some(n=>n.apto)?"✓":md!==null?md.toFixed(1):"?"}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:12,fontWeight:700,color:AM,margin:0}}>{d.sigla}</p>
                      <p style={{fontSize:13,color:AZ,margin:0}}>{d.nome}</p>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <p style={{fontSize:11,color:"#9aa3b8",margin:0}}>{podeP2?"P1+P2":"P1"}</p>
                      <p style={{fontSize:11,color:"#c5cde0",margin:0}}>{d.cargaTotal}h</p>
                    </div>
                    <span style={{fontSize:12,color:"#9aa3b8",transform:isAberta?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
                  </button>
                  {isAberta&&(
                    <div style={{background:"#f8faff",borderTop:"1px solid #edf0f7",padding:"12px 16px 14px"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                        {ns.map(n=>(
                          <div key={n.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,background:"#fff",borderRadius:6,padding:"6px 10px",border:"1px solid #edf0f7"}}>
                            <span style={{fontWeight:700,width:32,color:AM,flexShrink:0}}>{n.avaliacao}</span>
                            <span style={{fontWeight:700,color:corNota(n.nota,n.apto)}}>{n.apto?"APTO":n.nota.toFixed(1)}</span>
                            {n.ehAF&&<span style={{fontSize:10,background:"#fef3c7",color:"#92400e",borderRadius:4,padding:"1px 5px"}}>AF</span>}
                            {n.observacao&&<span style={{color:"#6b7a99",fontSize:11,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.observacao}</span>}
                            <span style={{color:"#9aa3b8",marginLeft:"auto",flexShrink:0}}>{n.data}</span>
                            <button onClick={()=>deletar(n.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#b91c1c",fontSize:16,padding:"0 2px",lineHeight:1}}>×</button>
                          </div>
                        ))}
                      </div>
                      {formSigla===d.sigla?(
                        <div style={{background:"#fff",borderRadius:8,padding:"12px",border:`1.5px solid ${AM}`,display:"flex",flexWrap:"wrap",gap:10,alignItems:"flex-end"}}>
                          <div><label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:2}}>Avaliação *</label>
                            <input value={form.avaliacao} onChange={e=>setForm(f=>({...f,avaliacao:e.target.value}))} placeholder={podeP2?"P1,P2,AF…":"P1,AF…"} style={{border:"1px solid #dde3ee",borderRadius:6,padding:"5px 8px",fontSize:13,width:70}} autoFocus/></div>
                          <div><label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:2}}>Nota (0–10)</label>
                            <input type="number" min={0} max={10} step={0.1} value={form.nota} onChange={e=>setForm(f=>({...f,nota:e.target.value}))} style={{border:"1px solid #dde3ee",borderRadius:6,padding:"5px 8px",fontSize:13,width:65}}/></div>
                          <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4,cursor:"pointer",paddingBottom:2}}>
                            <input type="checkbox" checked={form.ehAF} onChange={e=>setForm(f=>({...f,ehAF:e.target.checked}))}/> AF (2ª chamada)
                          </label>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>lancar(d.sigla)} disabled={salvando||!form.avaliacao||!form.nota} style={{background:AZ,color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",opacity:(!form.avaliacao||!form.nota)?0.5:1}}>{salvando?"...":"Salvar"}</button>
                            <button onClick={()=>setFormSigla(null)} style={{background:"none",border:"none",fontSize:12,color:"#9aa3b8",cursor:"pointer"}}>Cancelar</button>
                          </div>
                        </div>
                      ):(
                        <button onClick={()=>{setFormSigla(d.sigla);setForm({avaliacao:"",nota:"",ehAF:false})}} style={{fontSize:12,color:AM,background:"none",border:`1px solid ${AM}`,borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>+ Lançar nota</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Disciplinas sem notas — formulário inline ao clicar */}
      {discSemNotas.length>0&&(
        <div>
          <p style={{fontSize:11,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
            Sem nota lançada ({discSemNotas.length})
          </p>
          <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
            {discSemNotas.map((d,i)=>{
              const podeP2 = d.cargaTotal>=40
              const aberta = formSigla===d.sigla
              return (
                <div key={d.sigla} style={{borderTop:i>0?"1px solid #edf0f7":undefined}}>
                  {/* Linha da disciplina */}
                  <div style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <span style={{fontSize:11,fontWeight:700,color:AM}}>{d.sigla}</span>
                      <span style={{fontSize:13,color:AZ,marginLeft:8}}>{d.nome}</span>
                    </div>
                    <span style={{fontSize:10,color:"#c5cde0",flexShrink:0}}>{d.cargaTotal}h</span>
                    <button
                      onClick={()=>{
                        if(aberta){setFormSigla(null)}
                        else{setFormSigla(d.sigla);setForm({avaliacao:"",nota:"",ehAF:false})}
                      }}
                      style={{fontSize:11,color:aberta?"#b91c1c":AM,background:aberta?"#fee2e2":"#f0f4ff",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",flexShrink:0,fontWeight:600}}>
                      {aberta?"Cancelar":"+ Nota"}
                    </button>
                  </div>
                  {/* Formulário inline */}
                  {aberta&&(
                    <div style={{background:"#f8faff",borderTop:"1px solid #edf0f7",padding:"14px 16px"}}>
                      <div style={{background:"#fff",borderRadius:8,padding:"14px",border:`1.5px solid ${AM}`,display:"flex",flexWrap:"wrap",gap:10,alignItems:"flex-end"}}>
                        <div>
                          <label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:2}}>Avaliação *</label>
                          <input value={form.avaliacao} onChange={e=>setForm(f=>({...f,avaliacao:e.target.value}))}
                            placeholder={podeP2?"P1, P2, AF…":"P1, AF…"}
                            style={{border:"1px solid #dde3ee",borderRadius:6,padding:"7px 10px",fontSize:14,width:80}}
                            autoFocus />
                        </div>
                        <div>
                          <label style={{fontSize:11,color:"#6b7a99",display:"block",marginBottom:2}}>Nota (0–10)</label>
                          <input type="number" min={0} max={10} step={0.1} value={form.nota}
                            onChange={e=>setForm(f=>({...f,nota:e.target.value}))}
                            style={{border:"1px solid #dde3ee",borderRadius:6,padding:"7px 10px",fontSize:14,width:75}} />
                        </div>
                        <label style={{fontSize:12,display:"flex",alignItems:"center",gap:5,cursor:"pointer",paddingBottom:2}}>
                          <input type="checkbox" checked={form.ehAF} onChange={e=>setForm(f=>({...f,ehAF:e.target.checked}))}/> AF (2ª chamada)
                        </label>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>lancar(d.sigla)} disabled={salvando||!form.avaliacao||!form.nota} style={{
                            background:AZ,color:"#fff",border:"none",borderRadius:7,
                            padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer",
                            opacity:(!form.avaliacao||!form.nota)?0.5:1
                          }}>{salvando?"Salvando…":"Salvar nota"}</button>
                          <button onClick={()=>setFormSigla(null)} style={{background:"none",border:"none",fontSize:12,color:"#9aa3b8",cursor:"pointer"}}>Cancelar</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── ABA SIMULAR ──────────────────────────────────────────────────────────────────
function AbaSimular({disciplinas,minhasNotas,minhaNFDC,ranking,totalAlunos}:{disciplinas:Disciplina[];minhasNotas:NotaItem[];minhaNFDC:number;ranking:AlunoRank[];totalAlunos:number}) {
  const [sim,setSim] = useState<Record<string,Record<string,string>>>(()=>{
    const m:Record<string,Record<string,string>>={}
    for (const n of minhasNotas){
      if (n.disciplina==="TCC") continue
      if (!m[n.disciplina])m[n.disciplina]={}
      m[n.disciplina][n.avaliacao]=n.apto?"apto":String(n.nota)
    }
    return m
  })
  const notaTCC = minhasNotas.find(n=>n.disciplina==="TCC"||n.avaliacao==="TCC")
  const [simTCC,setSimTCC] = useState(notaTCC?String(notaTCC.nota):"")
  const [simNFDC,setSimNFDC] = useState(String(minhaNFDC))

  const {mfic,nfdc:nfdcSim,tcc,mgc} = useMemo<{mfic:number|null;nfdc:number;tcc:number|null;mgc:number|null}>(()=>{
    const notasSim:Parameters<typeof calcularComponentes>[0]=[]
    for (const [disc,avals] of Object.entries(sim)){
      for (const [aval,val] of Object.entries(avals)){
        if (!val) continue
        const apto=val==="apto"
        const nota=apto?10:Number(val)
        if (!apto&&isNaN(nota)) continue
        notasSim.push({disciplina:disc,avaliacao:aval,nota,ehAF:aval==="AF",apto,peso:1})
      }
    }
    if (simTCC){const tccVal=Number(simTCC);if(!isNaN(tccVal))notasSim.push({disciplina:"TCC",avaliacao:"TCC",nota:tccVal,ehAF:false,apto:false,peso:1})}
    const nf=Number(simNFDC);const nfdcVal=isNaN(nf)?minhaNFDC:nf
    return calcularComponentes(notasSim,nfdcVal)
  },[sim,simTCC,simNFDC,minhaNFDC])

  const statsSimulados = useMemo(()=>{
    if (mgc === null) return null
    const t3ComDados = ranking.filter(a => a.mgc !== null).length
    const t3Acima = ranking.filter(a => a.mgc !== null && a.mgc > mgc).length
    return {
      posT1: Math.max(1, Math.round(calcularPosicaoHistorica(mgc, BASE_T1))),
      posT2: Math.max(1, Math.round(calcularPosicaoHistorica(mgc, BASE_T2))),
      percT1: calcularPercentil(mgc, BASE_T1),
      percT2: calcularPercentil(mgc, BASE_T2),
      proj: calcularProjecaoConsolidada(mgc, t3Acima, totalAlunos, t3ComDados),
    }
  },[mgc,ranking,totalAlunos])

  function setNota(disc:string,aval:string,val:string){setSim(prev=>({...prev,[disc]:{...prev[disc],[aval]:val}}))}

  const discAtivas=disciplinas.filter(d=>d.status!=="Início"&&d.sigla!=="TCC")

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* MGC simulada */}
      <div style={{background:`linear-gradient(135deg,${AZ},#1a3a6e)`,borderRadius:16,padding:"24px",color:"#fff"}}>
        <p style={{fontSize:12,opacity:0.65,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,textAlign:"center"}}>MGC Simulada</p>
        <p style={{fontSize:48,fontWeight:800,fontFamily:"var(--serif)",color:"var(--dourado-claro,#f0d080)",margin:0,textAlign:"center"}}>{fmtNum(mgc)}</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:20,textAlign:"center"}}>
          {[{l:"MFIC",v:fmtNum(mfic)},{l:"NFDC",v:fmtNum(Number(simNFDC),3)},{l:"TCC",v:simTCC||"—"}].map(x=>(
            <div key={x.l} style={{background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"8px"}}>
              <p style={{fontSize:10,opacity:0.65,margin:0}}>{x.l}</p>
              <p style={{fontSize:16,fontWeight:700,margin:0}}>{x.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NFDC e TCC simulados */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontSize:12,fontWeight:700,color:AZ,margin:"0 0 8px"}}>NFDC simulada</p>
          <input type="number" min={0} max={10} step={0.001} value={simNFDC} onChange={e=>setSimNFDC(e.target.value)}
            style={{border:"1px solid #dde3ee",borderRadius:7,padding:"8px 12px",fontSize:18,width:"100%",fontWeight:700,textAlign:"center"}}/>
        </div>
        <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontSize:12,fontWeight:700,color:AZ,margin:"0 0 8px"}}>TCC simulado</p>
          <input type="number" min={0} max={10} step={0.1} value={simTCC} onChange={e=>setSimTCC(e.target.value)} placeholder="0.0 – 10.0"
            style={{border:"1px solid #dde3ee",borderRadius:7,padding:"8px 12px",fontSize:18,width:"100%",fontWeight:700,textAlign:"center"}}/>
        </div>
      </div>

      {/* Projeção simulada */}
      {statsSimulados && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <p style={{fontSize:11,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:0}}>Projeção Simulada</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {([
              {label:"Estimativa T1",pos:statsSimulados.posT1,total:148,perc:statsSimulados.percT1},
              {label:"Estimativa T2",pos:statsSimulados.posT2,total:171,perc:statsSimulados.percT2},
            ] as const).map(item=>(
              <div key={item.label} style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:12,padding:"12px 14px"}}>
                <p style={{fontSize:10,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{item.label}</p>
                <p style={{fontSize:20,fontWeight:800,fontFamily:"var(--serif)",color:AZ,margin:0}}>{item.pos}º <span style={{fontSize:11,fontWeight:500,color:"#9aa3b8"}}>de {item.total}</span></p>
                <div style={{marginTop:6,background:"#f0f4ff",borderRadius:5,padding:"3px 8px",display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:"#6b7a99"}}>Percentil</span>
                  <span style={{fontSize:12,fontWeight:700,color:AM}}>{item.perc}%</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #edf0f7"}}>
              <p style={{fontSize:10,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase",letterSpacing:"0.06em",margin:0}}>Projeção Consolidada — T3</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
              {[
                {label:"Melhor",val:`${statsSimulados.proj.melhor}º`,cor:"#15803d"},
                {label:"Provável",val:`${statsSimulados.proj.provavel}º`,cor:AZ},
                {label:"Conservador",val:`${statsSimulados.proj.conservador}º`,cor:"#b45309"},
              ].map((item,i)=>(
                <div key={item.label} style={{padding:"12px 8px",textAlign:"center",borderRight:i<2?"1px solid #edf0f7":undefined}}>
                  <p style={{fontSize:10,color:"#9aa3b8",margin:"0 0 3px"}}>{item.label}</p>
                  <p style={{fontSize:24,fontWeight:800,fontFamily:"var(--serif)",color:item.cor,margin:0}}>{item.val}</p>
                </div>
              ))}
            </div>
            <div style={{padding:"8px 14px",background:"#f8faff",textAlign:"center"}}>
              <p style={{fontSize:11,color:"#6b7a99",margin:0}}>
                Faixa: <strong>{statsSimulados.proj.melhor}º</strong> a <strong>{statsSimulados.proj.conservador}º</strong> de {totalAlunos} cadetes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de notas por disciplina */}
      <div style={{background:"#fff",border:"1px solid #dde3ee",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"10px 16px",borderBottom:"1px solid #edf0f7",display:"grid",gridTemplateColumns:"1fr 70px 70px 70px",gap:8,fontSize:11,fontWeight:700,color:"#9aa3b8",textTransform:"uppercase"}}>
          <span>Disciplina</span><span style={{textAlign:"center"}}>P1</span><span style={{textAlign:"center"}}>P2</span><span style={{textAlign:"center"}}>AF</span>
        </div>
        {discAtivas.map((d,i)=>{
          const podeP2=d.cargaTotal>=40
          return (
            <div key={d.sigla} style={{borderTop:i>0?"1px solid #edf0f7":undefined,padding:"8px 16px",display:"grid",gridTemplateColumns:"1fr 70px 70px 70px",gap:8,alignItems:"center"}}>
              <div><span style={{fontSize:11,fontWeight:700,color:AM}}>{d.sigla}</span><span style={{fontSize:12,color:"#6b7a99",marginLeft:6}}>{d.nome.slice(0,28)}{d.nome.length>28?"…":""}</span></div>
              {(["P1","P2","AF"] as const).map(aval=>(
                <input key={aval} disabled={aval==="P2"&&!podeP2} type="number" min={0} max={10} step={0.1}
                  value={sim[d.sigla]?.[aval]??""} onChange={e=>setNota(d.sigla,aval,e.target.value)}
                  placeholder={aval==="P2"&&!podeP2?"—":""}
                  style={{border:"1px solid #dde3ee",borderRadius:6,padding:"4px 6px",fontSize:13,textAlign:"center",width:"100%",opacity:aval==="P2"&&!podeP2?0.3:1,background:aval==="P2"&&!podeP2?"#f8faff":"#fff"}}/>
              ))}
            </div>
          )
        })}
      </div>
      <p style={{fontSize:12,color:"#9aa3b8",textAlign:"center"}}>Simulação não salva dados. Acesse <strong>Minhas Notas</strong> para lançamento oficial.</p>
    </div>
  )
}

// ── PRINCIPAL ────────────────────────────────────────────────────────────────────
export function RankingClient({ranking,minhaEntrada,meusComponentes,minhaNFDC,isAdmin,userId,disciplinas,minhasNotas,totalAlunos}:Props) {
  const [aba,setAba] = useState<"ranking"|"notas"|"simular">("ranking")

  const ABAS=[
    {id:"ranking" as const,label:isAdmin?"Ranking Completo":"Meu Ranking"},
    {id:"notas"   as const,label:"Minhas Notas"},
    {id:"simular" as const,label:"Simular"},
  ]

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 16px"}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:700,color:AZ,fontFamily:"var(--serif)",margin:0}}>Ranking</h1>
        <p style={{fontSize:12,color:"#9aa3b8",marginTop:4}}>MGC = (MFIC × 6,5 + NFDC × 2,5 + TCC × 1) / 10 · Decreto 57.694/2024</p>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:"2px solid #edf0f7"}}>
        {ABAS.map(a=>(
          <button key={a.id} onClick={()=>setAba(a.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"8px 18px",fontSize:14,fontWeight:aba===a.id?700:400,color:aba===a.id?AZ:"#9aa3b8",borderBottom:aba===a.id?`2px solid ${DOU}`:"2px solid transparent",marginBottom:-2,transition:"all 0.15s"}}>{a.label}</button>
        ))}
      </div>
      {aba==="ranking" && <AbaMeuRanking ranking={ranking} minhaEntrada={minhaEntrada} meusComponentes={meusComponentes} isAdmin={isAdmin} totalAlunos={totalAlunos}/>}
      {aba==="notas"   && <AbaMinhasNotas disciplinas={disciplinas} minhasNotas={minhasNotas} minhaNFDC={minhaNFDC} userId={userId}/>}
      {aba==="simular" && <AbaSimular disciplinas={disciplinas} minhasNotas={minhasNotas} minhaNFDC={minhaNFDC} ranking={ranking} totalAlunos={totalAlunos}/>}
    </div>
  )
}
