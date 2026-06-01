import { useState, useMemo, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://sthgrllaqplnzbhyaeym.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aGdybGxhcXBsbnpiaHlhZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Mjc5NjQsImV4cCI6MjA4OTIwMzk2NH0.ihquZkmQFUOjTpdmW5UY57Mks4xKPgOVWkRvJLc_BM4";
const HEADERS = {"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`};

async function sbFetch(path){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{headers:HEADERS});
  if(!res.ok)throw new Error(await res.text());
  return res.json();
}

const OBJETIVOS=["Ampliar o alcance da marca e posicionamento do mercado","Aperfeiçoar o modelo de gestão orçamentária","Cultura San Paolo ATIVA","Estruturar controladoria do CMV","Implantar padronização do modelo operacional","Implantação Plano de Manutenção","Lideranças táticas com comportamento consistente de gestão de pessoas","Melhorar as causas do turnover","Melhorar faturamento dentro das Mesmas Lojas","Melhorar fidelidade e relacionamento com cliente","Revisão PCP"];
const SETORES=["Auditoria","Diretoria","Financeiro","Gerencia de Operações","Gerência das Regionais","Manutenção","Marketing","RH","Supervisão","Supply","TI"];
const RESPONSAVEIS=["Alexia","Analu","Arthur","Clara","David","Diretoria","Fabiano","Fábio","Gabriel","Gerência Regional","Ian","Ivna","João","Lanna","Limaverde","Lorrane","Meneses","Rafael","Rebeca","Renan","Renata","Rosiane","Stephane","Supervisor","Tarcila","Tifany","Valquíria","Vitória"];
const STATUS_OPTIONS=["A iniciar","Em andamento","Concluída","Atrasada","Cancelada"];

const OBJETIVO_COR={"Ampliar o alcance da marca e posicionamento do mercado":"#ec4899","Aperfeiçoar o modelo de gestão orçamentária":"#10b981","Cultura San Paolo ATIVA":"#f59e0b","Estruturar controladoria do CMV":"#ef4444","Implantar padronização do modelo operacional":"#3b82f6","Implantação Plano de Manutenção":"#8b5cf6","Lideranças táticas com comportamento consistente de gestão de pessoas":"#06b6d4","Melhorar as causas do turnover":"#f97316","Melhorar faturamento dentro das Mesmas Lojas":"#84cc16","Melhorar fidelidade e relacionamento com cliente":"#a855f7","Revisão PCP":"#14b8a6"};
const STATUS_META={"A iniciar":{bg:"#1e293b",text:"#94a3b8",dot:"#475569"},"Em andamento":{bg:"#1e3a5f",text:"#60a5fa",dot:"#3b82f6"},"Concluída":{bg:"#064e3b",text:"#34d399",dot:"#10b981"},"Atrasada":{bg:"#450a0a",text:"#f87171",dot:"#ef4444"},"Cancelada":{bg:"#1c1c1e",text:"#6b7280",dot:"#374151"}};

function fmtData(d){if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m}/${y}`;}
function diasRestantes(prazo){if(!prazo)return 999;return Math.ceil((new Date(prazo)-new Date())/86400000);}

const inpSt={width:"100%",background:"#0a0f1e",border:"1px solid #1e293b",borderRadius:8,color:"#f1f5f9",padding:"8px 11px",fontSize:13,outline:"none",boxSizing:"border-box"};
const btnSt={border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"};

function ProgressBar({value,cor}){
  return <div style={{background:"#1e293b",borderRadius:99,height:5,width:"100%",overflow:"hidden"}}>
    <div style={{width:`${value||0}%`,height:"100%",borderRadius:99,background:value===100?"#10b981":(cor||"#3b82f6"),transition:"width 0.4s"}}/>
  </div>;
}
function Badge({label,cor,bg,small}){
  return <span style={{background:bg,color:cor,border:`1px solid ${cor}30`,borderRadius:4,padding:small?"2px 7px":"3px 10px",fontSize:small?10:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
}
function StatCard({label,value,sub,cor}){
  return <div style={{background:"#0f172a",border:`1px solid ${cor}33`,borderRadius:12,padding:"16px 20px",flex:1,minWidth:120}}>
    <div style={{color:"#64748b",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
    <div style={{color:cor,fontSize:26,fontWeight:800,lineHeight:1}}>{value}</div>
    {sub&&<div style={{color:"#475569",fontSize:11,marginTop:4}}>{sub}</div>}
  </div>;
}
function Spinner(){
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:16}}>
    <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid #1e293b",borderTop:"3px solid #3b82f6",animation:"spin 0.8s linear infinite"}}/>
    <div style={{color:"#475569",fontSize:13}}>Carregando dados...</div>
    <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
  </div>;
}

// ─── MODAL DE DETALHE (somente leitura) ──────────────────────────────────────
function ModalDetalhe({acao,onClose,cor}){
  const st=STATUS_META[acao.status]||STATUS_META["A iniciar"];
  const dias=diasRestantes(acao.prazo);
  const atrasada=dias<0&&acao.status!=="Concluída"&&acao.status!=="Cancelada";
  return <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:"#0f172a",border:`1px solid ${cor}33`,borderRadius:16,padding:28,width:"min(600px,95vw)",maxHeight:"88vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:cor,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{acao.objetivo}</div>
          <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9",lineHeight:1.4}}>{acao.tarefa}</div>
        </div>
        <button onClick={onClose} style={{...btnSt,background:"#1e293b",color:"#94a3b8",padding:"5px 10px",flexShrink:0}}>✕</button>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        <Badge label={acao.status} cor={st.text} bg={st.bg}/>
        {acao.iniciativa&&<span style={{fontSize:12,color:"#64748b",padding:"3px 10px",background:"#1e293b",borderRadius:4}}>{acao.iniciativa}</span>}
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,color:"#475569",fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Progresso</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ProgressBar value={acao.progresso||0} cor={cor}/>
          <span style={{fontSize:16,fontWeight:800,color:acao.progresso===100?"#10b981":cor,minWidth:40,fontFamily:"DM Mono"}}>{acao.progresso||0}%</span>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[
          ["👤 Responsável",acao.responsavel],
          ["🏢 Setor",acao.setor],
          ["📅 Prazo",fmtData(acao.prazo)+(acao.prazo!==acao.prazo_original&&acao.prazo_original?" (orig: "+fmtData(acao.prazo_original)+")":"")],
          ["⏱ Situação",acao.status==="Concluída"?"Concluída":acao.status==="Cancelada"?"Cancelada":atrasada?`${Math.abs(dias)}d em atraso`:dias===0?"Vence hoje":`${dias}d restantes`],
        ].map(([lbl,val])=>(
          <div key={lbl} style={{background:"#0a0f1e",borderRadius:8,padding:"10px 14px",border:"1px solid #1e293b"}}>
            <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:3}}>{lbl}</div>
            <div style={{fontSize:13,color:"#e2e8f0",fontWeight:600}}>{val||"—"}</div>
          </div>
        ))}
      </div>

      {acao.obs&&<div style={{background:"#0a0f1e",borderRadius:8,padding:"12px 14px",border:"1px solid #1e293b"}}>
        <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>💬 Observações</div>
        <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{acao.obs}</div>
      </div>}

      <div style={{marginTop:16,padding:"10px 14px",background:"#0a0f1e",borderRadius:8,border:"1px solid #1e293b",display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,color:"#475569"}}>🔒</span>
        <span style={{fontSize:11,color:"#475569",fontStyle:"italic"}}>Visualização somente leitura · Alterações apenas pelo gestor do plano</span>
      </div>
    </div>
  </div>;
}

// ─── VIEWER PRINCIPAL ─────────────────────────────────────────────────────────
export default function Viewer(){
  const[acoes,setAcoes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[erro,setErro]=useState(false);
  const[filtro,setFiltro]=useState({objetivo:"todos",setor:"todos",status:"todos",responsavel:"todos",busca:""});
  const[view,setView]=useState("lista");
  const[detalhe,setDetalhe]=useState(null);
  const[pag,setPag]=useState(1);
  const PER_PAGE=30;

  useEffect(()=>{
    sbFetch("acoes?select=*&order=id.asc")
      .then(d=>{setAcoes(d||[]);setLoading(false);})
      .catch(()=>{setErro(true);setLoading(false);});
  },[]);

  const stats=useMemo(()=>{
    const total=acoes.length;
    if(!total)return{total:0,concluidas:0,emAnd:0,aIniciar:0,atrasadas:0,progMedio:0};
    return{total,concluidas:acoes.filter(a=>a.status==="Concluída").length,emAnd:acoes.filter(a=>a.status==="Em andamento").length,aIniciar:acoes.filter(a=>a.status==="A iniciar").length,atrasadas:acoes.filter(a=>a.status!=="Concluída"&&a.status!=="Cancelada"&&diasRestantes(a.prazo)<0).length,progMedio:Math.round(acoes.reduce((s,a)=>s+(a.progresso||0),0)/total)};
  },[acoes]);

  const filtradas=useMemo(()=>acoes.filter(a=>{
    if(filtro.objetivo!=="todos"&&(a.objetivo||"").trim()!==filtro.objetivo)return false;
    if(filtro.setor!=="todos"&&a.setor!==filtro.setor)return false;
    if(filtro.status!=="todos"&&a.status!==filtro.status)return false;
    if(filtro.responsavel!=="todos"&&a.responsavel!==filtro.responsavel)return false;
    const q=filtro.busca.toLowerCase();
    if(q&&!(a.tarefa||"").toLowerCase().includes(q)&&!(a.iniciativa||"").toLowerCase().includes(q)&&!(a.responsavel||"").toLowerCase().includes(q)&&!(a.objetivo||"").toLowerCase().includes(q))return false;
    return true;
  }),[acoes,filtro]);

  const paginas=Math.ceil(filtradas.length/PER_PAGE);
  const paginadas=filtradas.slice((pag-1)*PER_PAGE,pag*PER_PAGE);
  function setFiltroKey(k,v){setFiltro(f=>({...f,[k]:v}));setPag(1);}
  const sel=(v,curr)=>({...btnSt,padding:"6px 13px",fontSize:11,background:v===curr?"#1e3a5f":"transparent",color:v===curr?"#60a5fa":"#64748b",border:`1px solid ${v===curr?"#3b82f633":"transparent"}`});

  return(
    <div style={{minHeight:"100vh",background:"#020817",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#f1f5f9"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{background:"#0a0f1e",borderBottom:"1px solid #1e293b",padding:"0 28px"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#ec4899,#f59e0b)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🍦</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.02em"}}>San Paolo · Plano de Ação</div>
              <div style={{fontSize:10,color:"#475569",fontWeight:500}}>Planejamento Estratégico · PWR Gestão</div>
            </div>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {["lista","objetivos","setores"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={sel(v,view)}>
                {v==="lista"?"☰ Lista":v==="objetivos"?"◈ Por Objetivo":"⊞ Por Setor"}
              </button>
            ))}
            <div style={{marginLeft:8,padding:"4px 10px",background:"#1e293b",borderRadius:6,display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:10}}>🔒</span>
              <span style={{fontSize:10,color:"#475569",fontWeight:600}}>Somente leitura</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 28px"}}>
        {/* STATS */}
        <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
          <StatCard label="Total" value={stats.total} sub="tarefas ativas" cor="#3b82f6"/>
          <StatCard label="Concluídas" value={stats.concluidas} sub={`${stats.total?Math.round(stats.concluidas/stats.total*100):0}% do total`} cor="#10b981"/>
          <StatCard label="Em Andamento" value={stats.emAnd} sub="em execução" cor="#f59e0b"/>
          <StatCard label="A Iniciar" value={stats.aIniciar} sub="não iniciadas" cor="#94a3b8"/>
          <StatCard label="Atrasadas" value={stats.atrasadas} sub="prazo vencido" cor="#ef4444"/>
          <StatCard label="Progresso Médio" value={`${stats.progMedio}%`} sub="consolidado" cor="#a855f7"/>
        </div>

        {/* FILTROS */}
        <div style={{background:"#0a0f1e",border:"1px solid #1e293b",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <input placeholder="Buscar tarefa, iniciativa, responsável..." value={filtro.busca} onChange={e=>setFiltroKey("busca",e.target.value)} style={{...inpSt,width:280,flex:"0 0 auto"}}/>
            <select value={filtro.objetivo} onChange={e=>setFiltroKey("objetivo",e.target.value)} style={{...inpSt,maxWidth:260}}>
              <option value="todos">Todos os objetivos</option>
              {OBJETIVOS.map(o=><option key={o}>{o}</option>)}
            </select>
            <select value={filtro.setor} onChange={e=>setFiltroKey("setor",e.target.value)} style={{...inpSt,width:170}}>
              <option value="todos">Todos os setores</option>
              {SETORES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select value={filtro.responsavel} onChange={e=>setFiltroKey("responsavel",e.target.value)} style={{...inpSt,width:150}}>
              <option value="todos">Todos</option>
              {RESPONSAVEIS.map(r=><option key={r}>{r}</option>)}
            </select>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {["todos",...STATUS_OPTIONS].map(s=>{
                const st=STATUS_META[s]||{};
                return <button key={s} onClick={()=>setFiltroKey("status",s)} style={{...btnSt,padding:"5px 11px",fontSize:10,background:filtro.status===s?(st.bg||"#1e3a5f"):"transparent",color:filtro.status===s?(st.text||"#60a5fa"):"#64748b",border:`1px solid ${filtro.status===s?(st.dot||"#3b82f6")+"55":"#1e293b"}`}}>{s==="todos"?"Todos":s}</button>;
              })}
            </div>
          </div>
          <div style={{marginTop:10,fontSize:11,color:"#475569"}}>{filtradas.length} tarefa{filtradas.length!==1?"s":""} encontrada{filtradas.length!==1?"s":""}</div>
        </div>

        {loading&&<Spinner/>}
        {erro&&<div style={{textAlign:"center",color:"#ef4444",padding:"60px 0",fontSize:14}}>Erro ao carregar dados. Tente recarregar a página.</div>}

        {/* VIEW LISTA */}
        {!loading&&!erro&&view==="lista"&&(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {paginadas.map(a=>{
                const cor=OBJETIVO_COR[(a.objetivo||"").trim()]||"#64748b";
                const st=STATUS_META[a.status]||STATUS_META["A iniciar"];
                const dias=diasRestantes(a.prazo);
                const atrasada=dias<0&&a.status!=="Concluída"&&a.status!=="Cancelada";
                const prazoAlterado=a.prazo!==a.prazo_original&&a.prazo_original;
                return(
                  <div key={a.id} onClick={()=>setDetalhe(a)} style={{background:"#0f172a",borderRadius:10,border:`1px solid ${atrasada?"#ef444430":"#1e293b"}`,borderLeft:`3px solid ${cor}`,padding:"14px 18px",cursor:"pointer",transition:"border-color 0.15s"}}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
                          <span style={{fontSize:12,color:cor,fontWeight:700}}>{a.objetivo}</span>
                          <Badge label={a.status} cor={st.text} bg={st.bg} small/>
                        </div>
                        <div style={{fontSize:11,color:"#64748b",marginBottom:6}}><span style={{color:"#94a3b8",fontWeight:600}}>{a.iniciativa}</span></div>
                        <div style={{fontSize:13,color:"#e2e8f0",fontWeight:500,lineHeight:1.4,marginBottom:8}}>{a.tarefa}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <ProgressBar value={a.progresso||0} cor={cor}/>
                          <span style={{fontSize:11,fontWeight:800,color:a.progresso===100?"#10b981":cor,minWidth:32,fontFamily:"DM Mono"}}>{a.progresso||0}%</span>
                        </div>
                        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,color:"#64748b"}}>👤 <strong style={{color:"#94a3b8"}}>{a.responsavel}</strong> · {a.setor}</span>
                          <span style={{fontSize:11,color:atrasada?"#ef4444":"#64748b"}}>
                            📅 {fmtData(a.prazo)}
                            {prazoAlterado&&<span style={{color:"#f59e0b",marginLeft:5}}>⚠ orig: {fmtData(a.prazo_original)}</span>}
                            {a.status!=="Concluída"&&a.status!=="Cancelada"&&(
                              <span style={{marginLeft:5,fontWeight:700,color:atrasada?"#ef4444":dias<=7?"#f59e0b":"#475569"}}>
                                {atrasada?`${Math.abs(dias)}d atrasado`:`${dias}d restantes`}
                              </span>
                            )}
                          </span>
                        </div>
                        {a.obs&&<div style={{marginTop:6,fontSize:11,color:"#475569",fontStyle:"italic"}}>💬 {a.obs}</div>}
                      </div>
                      <span style={{color:"#334155",fontSize:16,flexShrink:0,marginTop:2}}>›</span>
                    </div>
                  </div>
                );
              })}
              {filtradas.length===0&&<div style={{textAlign:"center",color:"#475569",padding:"60px 0"}}>Nenhuma tarefa encontrada.</div>}
            </div>
            {paginas>1&&(
              <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20,flexWrap:"wrap"}}>
                <button onClick={()=>setPag(p=>Math.max(1,p-1))} disabled={pag===1} style={{...btnSt,background:"#1e293b",color:"#94a3b8",opacity:pag===1?0.4:1}}>← Anterior</button>
                {Array.from({length:Math.min(paginas,8)},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>setPag(p)} style={{...btnSt,padding:"7px 12px",background:p===pag?"#3b82f6":"#1e293b",color:p===pag?"#fff":"#94a3b8"}}>{p}</button>
                ))}
                <button onClick={()=>setPag(p=>Math.min(paginas,p+1))} disabled={pag===paginas} style={{...btnSt,background:"#1e293b",color:"#94a3b8",opacity:pag===paginas?0.4:1}}>Próxima →</button>
              </div>
            )}
          </>
        )}

        {/* VIEW OBJETIVOS */}
        {!loading&&!erro&&view==="objetivos"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
            {OBJETIVOS.map(obj=>{
              const oAcoes=filtradas.filter(a=>(a.objetivo||"").trim()===obj);
              if(!oAcoes.length)return null;
              const cor=OBJETIVO_COR[obj]||"#64748b";
              const progMedio=Math.round(oAcoes.reduce((s,a)=>s+(a.progresso||0),0)/oAcoes.length);
              const conc=oAcoes.filter(a=>a.status==="Concluída").length;
              const atr=oAcoes.filter(a=>a.status!=="Concluída"&&a.status!=="Cancelada"&&diasRestantes(a.prazo)<0).length;
              return(
                <div key={obj} style={{background:"#0f172a",border:`1px solid ${cor}22`,borderRadius:14,overflow:"hidden"}}>
                  <div style={{background:cor+"12",borderBottom:`1px solid ${cor}22`,padding:"14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:800,color:cor,lineHeight:1.3,marginBottom:6}}>{obj}</div>
                    <div style={{display:"flex",gap:10,fontSize:11,color:"#64748b"}}>
                      <span>{oAcoes.length} tarefas</span>
                      <span style={{color:"#10b981"}}>{conc} concluídas</span>
                      {atr>0&&<span style={{color:"#ef4444"}}>⚠ {atr} atrasadas</span>}
                    </div>
                    <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8}}>
                      <ProgressBar value={progMedio} cor={cor}/>
                      <span style={{fontSize:13,fontWeight:800,color:cor,minWidth:36,fontFamily:"DM Mono"}}>{progMedio}%</span>
                    </div>
                  </div>
                  <div style={{padding:"10px 12px",maxHeight:320,overflowY:"auto"}}>
                    {oAcoes.slice(0,10).map(a=>{
                      const st=STATUS_META[a.status]||STATUS_META["A iniciar"];
                      return(
                        <div key={a.id} onClick={()=>setDetalhe(a)} style={{borderBottom:"1px solid #1e293b",padding:"8px 4px",cursor:"pointer"}}>
                          <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
                            <span style={{fontSize:11,color:"#e2e8f0",lineHeight:1.3,flex:1}}>{a.tarefa}</span>
                            <Badge label={a.status} cor={st.text} bg={st.bg} small/>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <ProgressBar value={a.progresso||0} cor={cor}/>
                            <span style={{fontSize:10,fontWeight:800,color:cor,minWidth:28,fontFamily:"DM Mono"}}>{a.progresso||0}%</span>
                          </div>
                          <div style={{fontSize:10,color:"#475569",marginTop:3}}>👤 {a.responsavel} · 📅 {fmtData(a.prazo)}</div>
                        </div>
                      );
                    })}
                    {oAcoes.length>10&&<div style={{fontSize:11,color:"#475569",textAlign:"center",padding:"8px 0"}}>+{oAcoes.length-10} tarefas — use os filtros</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW SETORES */}
        {!loading&&!erro&&view==="setores"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {SETORES.map(setor=>{
              const sAcoes=filtradas.filter(a=>a.setor===setor);
              if(!sAcoes.length)return null;
              const progMedio=Math.round(sAcoes.reduce((s,a)=>s+(a.progresso||0),0)/sAcoes.length);
              const conc=sAcoes.filter(a=>a.status==="Concluída").length;
              const atr=sAcoes.filter(a=>a.status!=="Concluída"&&a.status!=="Cancelada"&&diasRestantes(a.prazo)<0).length;
              return(
                <div key={setor} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"16px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:800,color:"#f1f5f9"}}>{setor}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{sAcoes.length} tarefas · <span style={{color:"#10b981"}}>{conc} concluídas</span>{atr>0&&<span style={{color:"#ef4444"}}> · ⚠ {atr} atrasadas</span>}</div>
                    </div>
                    <div style={{fontSize:24,fontWeight:800,color:progMedio>50?"#10b981":progMedio>20?"#f59e0b":"#ef4444",fontFamily:"DM Mono"}}>{progMedio}%</div>
                  </div>
                  <ProgressBar value={progMedio} cor={progMedio>50?"#10b981":progMedio>20?"#f59e0b":"#ef4444"}/>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                    {[...new Set(sAcoes.map(a=>a.responsavel))].map(r=>(
                      <button key={r} onClick={()=>{setFiltroKey("responsavel",r);setFiltroKey("setor",setor);setView("lista");}} style={{...btnSt,padding:"3px 10px",background:"#0a0f1e",color:"#94a3b8",fontSize:11,border:"1px solid #1e293b"}}>
                        {r} ({sAcoes.filter(a=>a.responsavel===r).length})
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detalhe&&<ModalDetalhe acao={detalhe} onClose={()=>setDetalhe(null)} cor={OBJETIVO_COR[(detalhe.objetivo||"").trim()]||"#64748b"}/>}
      <style>{`select option{background:#0a0f1e;color:#f1f5f9;}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#0f172a;}::-webkit-scrollbar-thumb{background:#334155;border-radius:99px;}`}</style>
    </div>
  );
}
