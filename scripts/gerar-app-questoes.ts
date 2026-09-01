/**
 * Gera o app de estudo em HTML (autocontido, offline) de uma disciplina, a
 * partir das questões do portal.
 *
 *   npx tsx scripts/gerar-app-questoes.ts TCEM [saida.html]
 *
 * Três abas, montadas conforme os módulos existentes no banco:
 *   1 · Banco por tema  — módulos de conteúdo, um seletor por tema
 *   2 · Atividades      — módulo "APOSTILA" (exercícios do próprio material)
 *   3 · Simulado        — módulo "SIM"/"SIM-*", com cronômetro e nota
 *
 * Aba que não tiver módulo correspondente simplesmente não aparece.
 */
import "dotenv/config"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import { writeFileSync } from "fs"
import { TITULOS_MODULO } from "../lib/modulos-titulos"
neonConfig.webSocketConstructor = ws
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }) })

const SIGLA = (process.argv[2] || "TCEM").toUpperCase()
const SAIDA = process.argv[3] || `QUESTOES_${SIGLA}.html`

/** Minutos do simulado. Sem fonte no banco, é a convenção do CFO: 100 min. */
const MIN_SIMULADO = 100
/** Nota cheia do simulado. */
const NOTA_CHEIA = 10

type Alt = { id: string; texto: string }
type Modelo = { estrutura?: string; criterios?: string[]; resposta?: string }
type QOut = {
  tipo: "certo_errado" | "multipla" | "dissertativa"
  enunciado: string
  contexto: string | null
  alternativas: Alt[]
  gabarito: string
  explicacao: string | null
  modelo: Modelo | null
  fonte: string | null
}

async function main() {
  const disc = await prisma.disciplina.findUnique({ where: { sigla: SIGLA } })
  const brutas = await prisma.questao.findMany({
    where: { materia: SIGLA },
    orderBy: [{ modulo: "asc" }, { createdAt: "asc" }],
  })
  if (brutas.length === 0) {
    console.error(`Nenhuma questão para ${SIGLA}.`)
    process.exit(1)
  }

  const conv = (q: (typeof brutas)[number]): QOut => ({
    tipo: q.tipo as QOut["tipo"],
    enunciado: q.enunciado,
    contexto: q.contexto,
    alternativas: (q.alternativas as unknown as Alt[]) || [],
    gabarito: q.gabarito,
    explicacao: q.explicacao,
    modelo: (q.modelo as Modelo | null) || null,
    fonte: q.fonte,
  })

  const modulos = [...new Set(brutas.map(q => q.modulo))]
  const modSim = modulos.filter(m => /^SIM/i.test(m))
  const modAtiv = modulos.filter(m => /^APOSTILA$/i.test(m))
  const modTema = modulos
    .filter(m => !modSim.includes(m) && !modAtiv.includes(m))
    .sort((a, b) => {
      const na = Number(a), nb = Number(b)
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb
      return a.localeCompare(b, "pt-BR")
    })

  const titulos = TITULOS_MODULO[SIGLA] || {}
  const temas = modTema.map(m => ({
    id: m,
    titulo: titulos[m] || `Módulo ${m}`,
    fonte: [...new Set(brutas.filter(q => q.modulo === m).map(q => q.fonte).filter(Boolean))].join(" · "),
    qs: brutas.filter(q => q.modulo === m).map(conv),
  }))
  const ativs = modAtiv.flatMap(m => brutas.filter(q => q.modulo === m).map(conv))
  const simQs = modSim.flatMap(m => brutas.filter(q => q.modulo === m).map(conv))
  const simFonte = [...new Set(brutas.filter(q => modSim.includes(q.modulo)).map(q => q.fonte).filter(Boolean))].join(" · ")

  // Pesos do simulado: a nota cheia é dividida em partes IGUAIS entre os
  // grupos existentes (certo/errado, múltipla escolha, discursivas) e, dentro
  // de cada grupo, igualmente entre as questões. O banco não guarda valor por
  // questão, então isto é convenção do gerador — dita como tal na tela.
  const nCE = simQs.filter(q => q.tipo === "certo_errado").length
  const nMC = simQs.filter(q => q.tipo === "multipla").length
  const nDS = simQs.filter(q => q.tipo === "dissertativa").length
  const grupos = [nCE > 0, nMC > 0, nDS > 0].filter(Boolean).length
  const fatia = NOTA_CHEIA / (grupos || 1)
  const pesos = {
    ce: nCE ? fatia / nCE : 0,
    mc: nMC ? fatia / nMC : 0,
    ds: nDS ? fatia / nDS : 0,
    totCe: nCE ? fatia : 0,
    totMc: nMC ? fatia : 0,
    totDs: nDS ? fatia : 0,
  }

  const dados = {
    sigla: SIGLA,
    nome: disc?.nome || SIGLA,
    carga: disc ? `${disc.cargaMinistrada}/${disc.cargaTotal}h · ${disc.status}` : "",
    temas,
    ativs,
    ativFontes: [...new Set(ativs.map(a => a.fonte).filter(Boolean))],
    sim: { qs: simQs, fonte: simFonte, minutos: MIN_SIMULADO, pesos },
    total: brutas.length,
    gerado: new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
  }

  writeFileSync(SAIDA, pagina(dados), "utf8")

  console.log(`✓ ${SAIDA}`)
  console.log(`  ${SIGLA} — ${dados.nome}`)
  console.log(`  ${temas.length} temas (${temas.reduce((s, t) => s + t.qs.length, 0)} questões) · ${ativs.length} atividades · simulado com ${simQs.length}`)
  console.log(`  total ${brutas.length} questões`)
  if (simQs.length) console.log(`  pesos do simulado: C/E ${pesos.ce.toFixed(3)} × ${nCE} · MC ${pesos.mc.toFixed(3)} × ${nMC} · DIS ${pesos.ds.toFixed(3)} × ${nDS}`)
}

function pagina(d: unknown): string {
  const json = JSON.stringify(d).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "")
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QUESTÕES — ${(d as { nome: string }).nome} · CFO PM 2026</title>
<style>
:root{--creme:#fbf9f3;--tinta:#2a2620;--borg:#7d1f2b;--azul:#1f4e79;--verde:#2e6b3e;--our:#9a7b16;--cinza:#4a4a4a;}
*{box-sizing:border-box}
body{margin:0;background:var(--creme);color:var(--tinta);font-family:-apple-system,"Segoe UI",Arial,sans-serif;font-size:15px;line-height:1.5}
.wrap{max-width:1000px;margin:0 auto;padding:16px 18px 60px}
header.doc{text-align:center;border-bottom:3px double var(--borg);padding-bottom:10px;margin-bottom:14px}
header.doc h1{font-size:21px;color:var(--borg);text-transform:uppercase;letter-spacing:.5px;margin:0}
header.doc .sub{font-size:12.5px;color:var(--cinza);margin-top:6px;line-height:1.4}
header.doc .tot{font-size:12.5px;margin-top:8px;background:#f2efe6;border:1px solid #d8d3c4;display:inline-block;padding:4px 12px}
nav.abas{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap}
nav.abas button{flex:1;min-width:150px;padding:10px 8px;border:1px solid var(--cinza);background:#eeece6;color:var(--tinta);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;cursor:pointer}
nav.abas button.on{background:var(--borg);color:var(--creme);border-color:var(--borg)}
.painel{display:none}.painel.on{display:block}
.barra{background:#f2efe6;border:1px solid #d8d3c4;padding:10px 12px;margin-bottom:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.barra label{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--cinza)}
select{padding:7px 8px;font-size:14px;border:1px solid var(--cinza);background:#fff;color:var(--tinta);max-width:100%}
.btn{padding:9px 16px;border:none;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;cursor:pointer;color:#fff;background:var(--borg)}
.btn.sec{background:var(--cinza)}.btn.our{background:var(--our)}
.btn:disabled{opacity:.45;cursor:not-allowed}
h2.sec{font-size:14px;text-transform:uppercase;letter-spacing:.6px;color:#fff;background:var(--cinza);padding:6px 10px;margin:20px 0 10px}
.fonte{font-style:italic;font-size:12.5px;color:var(--cinza);margin-bottom:12px}
.q{border:1px solid #d8d3c4;border-left:4px solid var(--cinza);background:#fff;padding:10px 12px;margin-bottom:9px}
.q .num{font-weight:700;color:var(--borg);font-size:12.5px;margin-right:6px}
.q .src{display:block;font-style:italic;font-size:12px;color:var(--cinza);margin-bottom:5px}
.q.ok{border-left-color:var(--verde);background:#eef6f0}
.q.bad{border-left-color:#a02020;background:#fbeeee}
.ctx{background:#f2efe6;border-left:3px solid var(--cinza);padding:8px 11px;margin-bottom:9px;font-size:14px}
.vfbtns{margin-top:8px;display:flex;gap:6px}
.vfbtns button{width:44px;padding:6px 0;border:1px solid var(--cinza);background:#eeece6;font-weight:700;font-size:14px;cursor:pointer;color:var(--tinta)}
.vfbtns button.sel{background:var(--azul);color:#fff;border-color:var(--azul)}
.ops{margin-top:8px;list-style:none;padding:0}
.ops li{margin-bottom:3px}
.ops label{display:block;padding:5px 8px;border:1px solid #ddd8c9;background:#faf9f4;cursor:pointer;font-size:14px}
.ops label.sel{background:#eaf1f8;border-color:var(--azul)}
.ops label.gab{background:#eef6f0;border-color:var(--verde)}
.ops input{margin-right:7px}
textarea{width:100%;min-height:110px;margin-top:8px;padding:8px;font-family:inherit;font-size:14px;border:1px solid #d8d3c4;background:#fffdf7;color:var(--tinta);resize:vertical}
.just{margin-top:8px;padding:7px 10px;font-size:13.5px;border-left:3px solid var(--our);background:#f8f2dd;display:none}
.just.show{display:block}.just b{color:var(--our)}
.esp{margin-top:8px;padding:8px 11px;font-size:13.5px;border:1px solid var(--borg);background:#faf3f4;display:none}
.esp.show{display:block}
.esp .lbl{font-weight:700;color:var(--borg);text-transform:uppercase;font-size:12px;letter-spacing:.5px;display:block;margin-bottom:3px}
.esp ol{margin:4px 0 6px;padding-left:20px}
.auto{margin-top:8px;font-size:13px;display:none}
.auto.show{display:block}
.auto span.t{font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:.4px;color:var(--cinza);margin-right:8px}
.auto label{margin-right:12px;cursor:pointer}
.placar{margin-top:14px;padding:11px 14px;border:2px solid var(--borg);background:#faf3f4;font-weight:700;font-size:15px;display:none}
.placar.show{display:block}
.crono{font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--borg);letter-spacing:1px}
.crono.fim{color:#a02020}
.alerta{display:none;margin-bottom:14px;padding:11px 14px;border:2px solid #a02020;background:#fbeeee;color:#a02020;font-weight:700}
.alerta.show{display:block}
.nota{margin-top:16px;padding:13px 16px;border:2px solid var(--verde);background:#eef6f0;display:none}
.nota.show{display:block}
.nota .big{font-size:24px;font-weight:700;color:var(--verde)}
.nota table{width:100%;border-collapse:collapse;margin-top:9px;font-size:13.5px}
.nota td{border:1px solid #c8c3b4;padding:4px 8px}
.nota td:last-child{text-align:right;font-variant-numeric:tabular-nums}
footer{margin-top:26px;padding-top:10px;border-top:1px solid #d8d3c4;font-size:12px;color:var(--cinza);text-align:center}
</style></head><body><div class="wrap">
<header class="doc">
  <h1 id="hTit"></h1>
  <div class="sub" id="hSub"></div>
  <div class="tot" id="hTot"></div>
</header>
<nav class="abas" id="abas"></nav>

<section id="p1" class="painel">
  <div class="barra">
    <label for="selTema">Tema</label><select id="selTema"></select>
    <button class="btn" id="btCorrigeTema">Verificar gabarito</button>
    <button class="btn sec" id="btLimpaTema">Limpar respostas</button>
  </div>
  <div id="bancoBox"></div><div id="placarBanco" class="placar"></div>
</section>

<section id="p2" class="painel">
  <div class="barra"><label>Atividades</label>
    <button class="btn" id="btCorrigeAtiv">Verificar gabarito</button>
    <button class="btn sec" id="btLimpaAtiv">Limpar respostas</button>
  </div>
  <div class="fonte" id="avisoAtiv"></div>
  <div id="ativBox"></div><div id="placarAtiv" class="placar"></div>
</section>

<section id="p3" class="painel">
  <div class="barra"><label>Tempo restante</label>
    <span id="crono" class="crono">--:--</span>
    <button class="btn our" id="btIniciar">Iniciar simulado</button>
    <button class="btn" id="btCorrigirSim" disabled>Corrigir e apurar nota</button>
    <button class="btn sec" id="btLimpaSim">Limpar respostas</button>
  </div>
  <div id="alertaSim" class="alerta">TEMPO ESGOTADO. O simulado foi encerrado — corrija para apurar a nota.</div>
  <div class="fonte" id="fonteSim"></div>
  <div id="simBox"></div><div id="notaSim" class="nota"></div>
</section>

<footer id="rodape"></footer>
</div>
<script id="dados" type="application/json">${json}</script>
<script>
${cliente()}
</script></body></html>`
}

/** Script do app. Fica em função só para manter o TS acima legível. */
function cliente(): string {
  return `
var D=JSON.parse(document.getElementById("dados").textContent);
var LET=["A","B","C","D","E","F"];
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function br(s){return esc(s).replace(/\\n+/g,"<br>");}
function fmt(x){return x.toFixed(2).replace(".",",");}
function gabTxt(q){var g=(q.gabarito||"").toLowerCase();return g==="certo"?"CERTO":g==="errado"?"ERRADO":(q.gabarito||"").toUpperCase();}
function ehCerto(q){return (q.gabarito||"").toLowerCase()==="certo";}

/* ---------- render de uma questão ---------- */
function renderQ(q,pref,i,n){
  var h='<div class="q" id="'+pref+i+'">';
  if(q.fonte) h+='<span class="src">Fonte: '+esc(q.fonte)+'</span>';
  if(q.contexto) h+='<div class="ctx">'+br(q.contexto)+'</div>';
  h+='<span class="num">'+n+'.</span>'+br(q.enunciado);
  if(q.tipo==="certo_errado"){
    h+='<div class="vfbtns"><button type="button" data-r="1" onclick="setVF(\\''+pref+'\\','+i+',1)">V</button>'+
       '<button type="button" data-r="0" onclick="setVF(\\''+pref+'\\','+i+',0)">F</button></div>'+
       '<div class="just" id="j'+pref+i+'"></div>';
  }else if(q.tipo==="multipla"){
    h+='<ul class="ops">';
    for(var j=0;j<q.alternativas.length;j++){
      h+='<li><label id="l'+pref+i+'_'+j+'"><input type="radio" name="'+pref+i+'" value="'+j+'" onclick="setME(\\''+pref+'\\','+i+','+j+')"> '+
         esc(q.alternativas[j].id)+') '+esc(q.alternativas[j].texto)+'</label></li>';
    }
    h+='</ul><div class="just" id="j'+pref+i+'"></div>';
  }else{
    h+='<textarea id="t'+pref+i+'" oninput="setDI(\\''+pref+'\\','+i+',this.value)"></textarea>';
    h+='<div class="esp" id="e'+pref+i+'"><span class="lbl">Espelho de resposta</span>';
    if(q.modelo&&q.modelo.estrutura) h+='<p><b>Estrutura:</b> '+br(q.modelo.estrutura)+'</p>';
    if(q.modelo&&q.modelo.criterios&&q.modelo.criterios.length){
      h+='<p><b>Critérios:</b></p><ol>';
      for(var c=0;c<q.modelo.criterios.length;c++) h+='<li>'+br(q.modelo.criterios[c])+'</li>';
      h+='</ol>';
    }
    if(q.modelo&&q.modelo.resposta) h+='<p>'+br(q.modelo.resposta)+'</p>';
    else if(q.explicacao) h+='<p>'+br(q.explicacao)+'</p>';
    h+='</div>';
  }
  return h+'</div>';
}
function indiceGab(q){
  for(var j=0;j<q.alternativas.length;j++){
    if(String(q.alternativas[j].id).toUpperCase()===String(q.gabarito).trim().toUpperCase()) return j;
  }
  return -1;
}
/* ---------- estado ---------- */
var EST={};
function chave(p,i){return p+i;}
function setVF(p,i,v){if(p==="s"&&!podeResponder())return;EST[chave(p,i)]=v;
  var bs=document.querySelectorAll("#"+p+i+" .vfbtns button");
  for(var k=0;k<bs.length;k++) bs[k].className=(parseInt(bs[k].getAttribute("data-r"),10)===v?"sel":"");}
function setME(p,i,j){if(p==="s"&&!podeResponder())return;EST[chave(p,i)]=j;
  var ls=document.querySelectorAll("#"+p+i+" .ops label");
  for(var k=0;k<ls.length;k++) ls[k].className=(k===j?"sel":"");}
function setDI(p,i,v){if(p==="s"&&!podeResponder()){document.getElementById("t"+p+i).value=EST[chave(p,i)]||"";return;}EST[chave(p,i)]=v;}
function limpaPref(p){for(var k in EST){if(k.indexOf(p)===0&&/^\\d+$/.test(k.slice(p.length))) delete EST[k];}}

/* ---------- correção genérica ---------- */
function corrige(qs,pref){
  var ac=0,tot=0;
  for(var i=0;i<qs.length;i++){
    var q=qs[i],box=document.getElementById(pref+i);
    if(q.tipo==="dissertativa"){document.getElementById("e"+pref+i).className="esp show";continue;}
    tot++;
    var j=document.getElementById("j"+pref+i),r=EST[chave(pref,i)],certo=false;
    if(q.tipo==="certo_errado"){certo=(r!==undefined&&r===(ehCerto(q)?1:0));}
    else{var g=indiceGab(q);certo=(r!==undefined&&r===g);
      var ls=document.querySelectorAll("#"+pref+i+" .ops label");
      for(var k=0;k<ls.length;k++) if(k===g) ls[k].className="gab";}
    if(certo)ac++;
    box.className="q "+(certo?"ok":"bad");
    j.className="just show";
    j.innerHTML="<b>Gabarito: "+gabTxt(q)+".</b> "+(q.explicacao?br(q.explicacao):"");
  }
  return {ac:ac,tot:tot};
}

/* ---------- aba 1 ---------- */
var temaIdx=0;
function renderTema(){
  var t=D.temas[temaIdx];
  var h='<div class="fonte">'+esc(t.titulo)+(t.fonte?" · "+esc(t.fonte):"")+"</div>";
  var ce=[],mc=[],ds=[];
  for(var i=0;i<t.qs.length;i++){var q=t.qs[i];(q.tipo==="certo_errado"?ce:q.tipo==="multipla"?mc:ds).push(i);}
  if(ce.length){h+='<h2 class="sec">Certo ou errado ('+ce.length+')</h2>';for(var a=0;a<ce.length;a++)h+=renderQ(t.qs[ce[a]],"b",ce[a],a+1);}
  if(mc.length){h+='<h2 class="sec">Múltipla escolha ('+mc.length+')</h2>';for(var b=0;b<mc.length;b++)h+=renderQ(t.qs[mc[b]],"b",mc[b],b+1);}
  if(ds.length){h+='<h2 class="sec">Discursivas ('+ds.length+')</h2>';for(var c=0;c<ds.length;c++)h+=renderQ(t.qs[ds[c]],"b",ds[c],c+1);}
  document.getElementById("bancoBox").innerHTML=h;
  document.getElementById("placarBanco").className="placar";
}
function trocaTema(){temaIdx=parseInt(document.getElementById("selTema").value,10);limpaPref("b");renderTema();}

/* ---------- aba 3: cronômetro ---------- */
var simT=D.sim.minutos*60,simH=null,simOn=false,simParc=null;
function podeResponder(){return simT>0;}
function pintaCrono(){var m=Math.floor(simT/60),s=simT%60;var el=document.getElementById("crono");
  el.textContent=(m<10?"0":"")+m+":"+(s<10?"0":"")+s;el.className="crono"+(simT<=0?" fim":"");}
function tickSim(){if(simT>0){simT--;pintaCrono();}if(simT<=0){pararSim();document.getElementById("alertaSim").className="alerta show";}}
function pararSim(){if(simH){clearInterval(simH);simH=null;}simOn=false;}
function renderSim(){
  var h="",qs=D.sim.qs,ce=[],mc=[],ds=[];
  for(var i=0;i<qs.length;i++){(qs[i].tipo==="certo_errado"?ce:qs[i].tipo==="multipla"?mc:ds).push(i);}
  var P=D.sim.pesos;
  if(ce.length){h+='<h2 class="sec">Certo ou errado — '+ce.length+' × '+fmt(P.ce)+'</h2>';for(var a=0;a<ce.length;a++)h+=renderQ(qs[ce[a]],"s",ce[a],a+1);}
  if(mc.length){h+='<h2 class="sec">Múltipla escolha — '+mc.length+' × '+fmt(P.mc)+'</h2>';for(var b=0;b<mc.length;b++)h+=renderQ(qs[mc[b]],"s",mc[b],b+1);}
  if(ds.length){h+='<h2 class="sec">Discursivas — '+ds.length+' × '+fmt(P.ds)+'</h2>';
    for(var c=0;c<ds.length;c++){h+=renderQ(qs[ds[c]],"s",ds[c],c+1);}}
  document.getElementById("simBox").innerHTML=h;
  for(var c2=0;c2<ds.length;c2++){
    var box=document.getElementById("s"+ds[c2]);
    var div=document.createElement("div");
    div.className="auto";div.id="a"+ds[c2];
    div.innerHTML='<span class="t">Autoavaliação</span>'+
      '<label><input type="radio" name="auto'+ds[c2]+'" onclick="setAuto('+ds[c2]+',0)"> Não atendeu (0,00)</label>'+
      '<label><input type="radio" name="auto'+ds[c2]+'" onclick="setAuto('+ds[c2]+',0.5)"> Parcialmente ('+fmt(P.ds/2)+')</label>'+
      '<label><input type="radio" name="auto'+ds[c2]+'" onclick="setAuto('+ds[c2]+',1)"> Integralmente ('+fmt(P.ds)+')</label>';
    box.appendChild(div);
  }
}
var AUTO={};
function setAuto(i,f){AUTO[i]=f;calcNota();}
function corrigirSim(){
  pararSim();
  var qs=D.sim.qs,P=D.sim.pesos,pce=0,pmc=0;
  for(var i=0;i<qs.length;i++){
    var q=qs[i],box=document.getElementById("s"+i);
    if(q.tipo==="dissertativa"){document.getElementById("es"+i).className="esp show";document.getElementById("a"+i).className="auto show";continue;}
    var j=document.getElementById("js"+i),r=EST[chave("s",i)],certo=false;
    if(q.tipo==="certo_errado"){certo=(r!==undefined&&r===(ehCerto(q)?1:0));if(certo)pce+=P.ce;}
    else{var g=indiceGab(q);certo=(r!==undefined&&r===g);if(certo)pmc+=P.mc;
      var ls=document.querySelectorAll("#s"+i+" .ops label");
      for(var k=0;k<ls.length;k++) if(k===g) ls[k].className="gab";}
    box.className="q "+(certo?"ok":"bad");
    j.className="just show";
    j.innerHTML="<b>Gabarito: "+gabTxt(q)+".</b> "+(q.explicacao?br(q.explicacao):"");
  }
  simParc={ce:pce,mc:pmc};calcNota();
}
function calcNota(){
  if(!simParc)return;
  var P=D.sim.pesos,qs=D.sim.qs,pds=0;
  for(var i=0;i<qs.length;i++) if(qs[i].tipo==="dissertativa") pds+=(AUTO[i]||0)*P.ds;
  var tot=simParc.ce+simParc.mc+pds;
  var box=document.getElementById("notaSim");
  box.className="nota show";
  var linhas="";
  if(P.totCe) linhas+="<tr><td>Certo e errado</td><td>"+fmt(simParc.ce)+" / "+fmt(P.totCe)+"</td></tr>";
  if(P.totMc) linhas+="<tr><td>Múltipla escolha</td><td>"+fmt(simParc.mc)+" / "+fmt(P.totMc)+"</td></tr>";
  if(P.totDs) linhas+="<tr><td>Discursivas (autoavaliação)</td><td>"+fmt(pds)+" / "+fmt(P.totDs)+"</td></tr>";
  box.innerHTML='<div class="big">Nota final: '+fmt(tot)+" / 10,00</div><table>"+linhas+
    "<tr><td><b>Total</b></td><td><b>"+fmt(tot)+" / 10,00</b></td></tr></table>";
}

/* ---------- abas ---------- */
var ABAS=[];
function aba(n){for(var i=0;i<ABAS.length;i++){
  document.getElementById("p"+ABAS[i]).className="painel"+(ABAS[i]===n?" on":"");
  document.getElementById("ab"+ABAS[i]).className=(ABAS[i]===n?"on":"");}}

/* ---------- init ---------- */
(function(){
  document.getElementById("hTit").textContent="Questões — "+D.nome+" ("+D.sigla+")";
  document.getElementById("hSub").innerHTML="Curso de Formação de Oficiais · PMPE · Turma 13 — 2026"+(D.carga?"<br>Carga: "+esc(D.carga):"");
  var nt=0;for(var i=0;i<D.temas.length;i++)nt+=D.temas[i].qs.length;
  document.getElementById("hTot").innerHTML=D.temas.length+" temas · <b>"+nt+"</b> questões no banco"+
    (D.ativs.length?" · "+D.ativs.length+" atividades":"")+(D.sim.qs.length?" · simulado com "+D.sim.qs.length+" itens":"")+
    " · <b>"+D.total+"</b> no total";

  var nav=document.getElementById("abas"),rot=[];
  if(D.temas.length){ABAS.push(1);rot.push([1,"1 · Banco por tema"]);}
  if(D.ativs.length){ABAS.push(2);rot.push([2,"2 · Atividades da apostila"]);}
  if(D.sim.qs.length){ABAS.push(3);rot.push([3,"3 · Simulado (10,0 · "+D.sim.minutos+" min)"]);}
  nav.innerHTML=rot.map(function(r){return '<button id="ab'+r[0]+'" onclick="aba('+r[0]+')">'+esc(r[1])+"</button>";}).join("");

  if(D.temas.length){
    document.getElementById("selTema").innerHTML=D.temas.map(function(t,i){
      return '<option value="'+i+'">'+esc(t.titulo)+"</option>";}).join("");
    document.getElementById("selTema").onchange=trocaTema;
    document.getElementById("btCorrigeTema").onclick=function(){
      var r=corrige(D.temas[temaIdx].qs,"b");
      var p=document.getElementById("placarBanco");p.className="placar show";
      p.innerHTML="Objetivas deste tema: <b>"+r.ac+"/"+r.tot+"</b>"+(r.tot?" ("+fmt(r.ac/r.tot*100)+"%)":"")+
        ". As discursivas devem ser conferidas pelo espelho.";};
    document.getElementById("btLimpaTema").onclick=function(){limpaPref("b");renderTema();};
    renderTema();
  }
  if(D.ativs.length){
    document.getElementById("avisoAtiv").innerHTML="Exercícios do próprio material"+
      (D.ativFontes.length?" — "+esc(D.ativFontes.join(" · ")):"")+".";
    var h="";for(var a=0;a<D.ativs.length;a++)h+=renderQ(D.ativs[a],"v",a,a+1);
    document.getElementById("ativBox").innerHTML=h;
    document.getElementById("btCorrigeAtiv").onclick=function(){
      var r=corrige(D.ativs,"v");
      var p=document.getElementById("placarAtiv");p.className="placar show";
      p.innerHTML="Objetivas: <b>"+r.ac+"/"+r.tot+"</b>. As discursivas devem ser conferidas pelo espelho.";};
    document.getElementById("btLimpaAtiv").onclick=function(){
      limpaPref("v");var h2="";for(var a2=0;a2<D.ativs.length;a2++)h2+=renderQ(D.ativs[a2],"v",a2,a2+1);
      document.getElementById("ativBox").innerHTML=h2;
      document.getElementById("placarAtiv").className="placar";};
  }
  if(D.sim.qs.length){
    document.getElementById("fonteSim").innerHTML=(D.sim.fonte?esc(D.sim.fonte)+" · ":"")+
      "<b>Atenção:</b> o valor por questão não consta do banco. Os 10,0 pontos foram divididos "+
      "em partes iguais entre os três grupos e, dentro de cada grupo, entre as questões — "+
      "convenção deste gerador, não a distribuição oficial da prova.";
    renderSim();pintaCrono();
    document.getElementById("btIniciar").onclick=function(){
      if(simOn)return;simOn=true;this.disabled=true;
      document.getElementById("btCorrigirSim").disabled=false;simH=setInterval(tickSim,1000);};
    document.getElementById("btCorrigirSim").onclick=corrigirSim;
    document.getElementById("btLimpaSim").onclick=function(){
      pararSim();simT=D.sim.minutos*60;pintaCrono();limpaPref("s");AUTO={};simParc=null;
      document.getElementById("btIniciar").disabled=false;
      document.getElementById("btCorrigirSim").disabled=true;
      document.getElementById("alertaSim").className="alerta";
      document.getElementById("notaSim").className="nota";renderSim();};
  }
  document.getElementById("rodape").textContent="Gerado do banco do Portal CFO 2026 (portalcfo2026.com.br) em "+D.gerado+" · "+D.total+" questões de "+D.sigla;
  aba(ABAS[0]);
})();
`
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
