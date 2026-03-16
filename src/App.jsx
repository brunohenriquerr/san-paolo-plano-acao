import { useState, useMemo, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://sthgrllaqplnzbhyaeym.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0aGdybGxhcXBsbnpiaHlhZXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Mjc5NjQsImV4cCI6MjA4OTIwMzk2NH0.ihquZkmQFUOjTpdmW5UY57Mks4xKPgOVWkRvJLc_BM4";
const HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: HEADERS, ...options });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const OBJETIVOS_INICIAL = [
  "Ampliar o alcance da marca e posicionamento do mercado",
  "Aperfeiçoar o modelo de gestão orçamentária",
  "Cultura San Paolo ATIVA",
  "Estruturar controladoria do CMV",
  "Implantar padronização do modelo operacional",
  "Implantação Plano de Manutenção",
  "Lideranças táticas com comportamento consistente de gestão de pessoas",
  "Melhorar as causas do turnover",
  "Melhorar faturamento dentro das Mesmas Lojas",
  "Melhorar fidelidade e relacionamento com cliente",
  "Revisão PCP"
];

const SETORES = ["Auditoria","Diretoria","Financeiro","Gerencia de Operações","Gerência das Regionais","Manutenção","Marketing","RH","Supervisão","Supply","TI"];
const RESPONSAVEIS = ["Alexia","Analu","Arthur","Clara","David","Diretoria","Fabiano","Fábio","Gabriel","Gerência Regional","Ian","Ivna","João","Lanna","Limaverde","Lorrane","Meneses","Rafael","Rebeca","Renan","Renata","Rosiane","Stephane","Supervisor","Tarcila","Tifany","Valquíria","Vitória"];
const STATUS_OPTIONS = ["A iniciar","Em andamento","Concluída","Atrasada","Cancelada"];
const CORES = ["#ec4899","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#06b6d4","#f97316","#84cc16","#a855f7","#14b8a6","#e11d48","#0ea5e9","#d97706","#7c3aed","#059669","#dc2626","#2563eb"];

const OBJETIVO_COR_INICIAL = {
  "Ampliar o alcance da marca e posicionamento do mercado":"#ec4899",
  "Aperfeiçoar o modelo de gestão orçamentária":"#10b981",
  "Cultura San Paolo ATIVA":"#f59e0b",
  "Estruturar controladoria do CMV":"#ef4444",
  "Implantar padronização do modelo operacional":"#3b82f6",
  "Implantação Plano de Manutenção":"#8b5cf6",
  "Lideranças táticas com comportamento consistente de gestão de pessoas":"#06b6d4",
  "Melhorar as causas do turnover":"#f97316",
  "Melhorar faturamento dentro das Mesmas Lojas":"#84cc16",
  "Melhorar fidelidade e relacionamento com cliente":"#a855f7",
  "Revisão PCP":"#14b8a6"
};

const STATUS_META = {
  "A iniciar":    {bg:"#1e293b",text:"#94a3b8",dot:"#475569"},
  "Em andamento": {bg:"#1e3a5f",text:"#60a5fa",dot:"#3b82f6"},
  "Concluída":    {bg:"#064e3b",text:"#34d399",dot:"#10b981"},
  "Atrasada":     {bg:"#450a0a",text:"#f87171",dot:"#ef4444"},
  "Cancelada":    {bg:"#1c1c1e",text:"#6b7280",dot:"#374151"},
};

function fmtData(d){if(!d)return"—";const[y,m,dia]=d.split("-");return`${dia}/${m}/${y}`;}
function diasRestantes(prazo){if(!prazo)return 999;return Math.ceil((new Date(prazo)-new Date())/86400000);}

function ProgressBar({value,cor}){
  return <div style={{background:"#1e293b",borderRadius:99,height:5,width:"100%",overflow:"hidden"}}>
    <div style={{width:`${value||0}%`,height:"100%",borderRadius:99,background:value===100?"#10b981":(cor||"#3b82f6"),transition:"width 0.4s"}}/>
  </div>;
}

function Badge({label,cor,bg,small}){
  return <span style={{background:bg,color:cor,border:`1px solid ${cor}30`,borderRadius:4,
    padding:small?"2px 7px":"3px 10px",fontSize:small?10:11,fontWeight:700,
    letterSpacing:"0.04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;
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

const inpSt={width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:8,color:"#f1f5f9",padding:"8px 11px",fontSize:13,outline:"none",boxSizing:"border-box"};
const btnSt={border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"};
const lblSt={display:"block",color:"#94a3b8",fontSize:10,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4};

function ModalObjetivo({onSave,onClose}){
  const[nome,setNome]=useState("");
  const[cor,setCor]=useState(CORES[0]);
  return <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:28,width:"min(460px,95vw)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{color:"#f1f5f9",fontSize:16,fontWeight:800,margin:0}}>Novo Objetivo Estratégico</h2>
        <button onClick={onClose} style={btnSt}>✕</button>
      </div>
      <div style={{marginBottom:16}}>
        <label style={lblSt}>Nome do Objetivo</label>
        <input autoFocus value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Expandir presença nacional" style={inpSt}/>
      </div>
      <div style={{marginBottom:22}}>
        <label style={lblSt}>Cor de Identificação</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
          {CORES.map(c=><button key={c} onClick={()=>setCor(c)} style={{width:30,height:30,borderRadius:8,background:c,border:"none",cursor:"pointer",outline:cor===c?"3px solid #fff":"3px solid transparent",outlineOffset:2}}/>)}
        </div>
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:20,height:20,borderRadius:5,background:cor}}/>
          <span style={{fontSize:12,fontWeight:700,color:cor}}>{nome||"Preview do objetivo"}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onClose} style={{...btnSt,background:"#1e293b",color:"#94a3b8"}}>Cancelar</button>
        <button onClick={()=>nome.trim()&&onSave(nome.trim(),cor)} style={{...btnSt,background:nome.trim()?cor:"#1e293b",color:"#fff",opacity:nome.trim()?1:0.5}}>Criar Objetivo</button>
      </div>
    </div>
  </div>;
}

function Modal({acao,onSave,onClose,objetivos,saving}){
  const lista=objetivos||OBJETIVOS_INICIAL;
  const[form,setForm]=useState(acao||{objetivo:lista[0],iniciativa:"",tarefa:"",responsavel:RESPONSAVEIS[0],setor:SETORES[0],prazo_original:"",prazo:"",progresso:0,status:"A iniciar",obs:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const inp=(label,key,type="text",opts=null)=>(
    <div style={{marginBottom:12}}>
      <label style={lblSt}>{label}</label>
      {opts?<select value={form[key]} onChange={e=>set(key,e.target.value)} style={inpSt}>{opts.map(o=><option key={o}>{o}</option>)}</select>
      :type==="textarea"?<textarea value={form[key]} onChange={e=>set(key,e.target.value)} rows={2} style={{...inpSt,resize:"vertical"}}/>
      :<input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} style={inpSt}/>}
    </div>
  );

  return <div style={{position:"fixed",inset:0,background:"#000000bb",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:28,width:"min(640px,95vw)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{color:"#f1f5f9",fontSize:16,fontWeight:800,margin:0}}>{acao?"Editar Tarefa":"Nova Tarefa"}</h2>
        <button onClick={onClose} style={btnSt}>✕</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <div style={{gridColumn:"1/-1"}}>{inp("Objetivo Estratégico","objetivo","text",lista)}</div>
        {inp("Iniciativa","iniciativa")}
        {inp("Responsável","responsavel","text",RESPONSAVEIS)}
        <div style={{gridColumn:"1/-1"}}>{inp("Tarefa","tarefa","textarea")}</div>
        {inp("Setor","setor","text",SETORES)}
        {inp("Status","status","text",STATUS_OPTIONS)}
        {inp("Prazo Original","prazo_original","date")}
        {inp("Prazo Atual","prazo","date")}
        <div style={{gridColumn:"1/-1"}}>
          <label style={lblSt}>Progresso: {form.progresso}%</label>
          <input type="range" min={0} max={100} value={form.progresso} onChange={e=>set("progresso",+e.target.value)} style={{width:"100%",accentColor:"#3b82f6"}}/>
        </div>
        <div style={{gridColumn:"1/-1"}}>{inp("Observações","obs","textarea")}</div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
        <button onClick={onClose} style={{...btnSt,background:"#1e293b",color:"#94a3b8"}}>Cancelar</button>
        <button onClick={()=>onSave(form)} disabled={saving} style={{...btnSt,background:"#3b82f6",color:"#fff",opacity:saving?0.6:1}}>{saving?"Salvando...":acao?"Salvar":"Criar"}</button>
      </div>
    </div>
  </div>;
}

export default function SanPaoloBSC(){
  const[acoes,setAcoes]=useState([]);
  const[loading,setLoading]=useState(true);
  const[saving,setSaving]=useState(false);
  const[toast,setToast]=useState(null);
  const[objetivos,setObjetivos]=useState(OBJETIVOS_INICIAL);
  const[objetivoCor,setObjetivoCor]=useState(OBJETIVO_COR_INICIAL);
  const[filtro,setFiltro]=useState({objetivo:"todos",setor:"todos",status:"todos",responsavel:"todos",busca:""});
  const[view,setView]=useState("lista");
  const[modal,setModal]=useState(null);
  const[modalObjetivo,setModalObjetivo]=useState(false);
  const[confirmarDelete,setConfirmarDelete]=useState(null);
  const[pag,setPag]=useState(1);
  const PER_PAGE=30;

  // ── Seleção em lote ──
  const[modoLote,setModoLote]=useState(false);
  const[selecionados,setSelecionados]=useState([]);
  const[statusLote,setStatusLote]=useState("Em andamento");
  const[salvandoLote,setSalvandoLote]=useState(false);

  const carregarAcoes=useCallback(async()=>{
    setLoading(true);
    try{const data=await sbFetch("acoes?select=*&order=id.asc");setAcoes(data||[]);}
    catch(e){showToast("Erro ao carregar dados","error");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{carregarAcoes();},[carregarAcoes]);

  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),3000);}

  async function salvar(form){
    setSaving(true);
    try{
      if(form.id){
        const{id,created_at,...data}=form;
        await sbFetch(`acoes?id=eq.${id}`,{method:"PATCH",body:JSON.stringify(data)});
        setAcoes(prev=>prev.map(a=>a.id===id?{...a,...data}:a));
        showToast("Tarefa atualizada!");
      }else{
        const{id,...data}=form;
        const result=await sbFetch("acoes",{method:"POST",body:JSON.stringify(data)});
        setAcoes(prev=>[...prev,result[0]]);
        showToast("Tarefa criada!");
      }
      setModal(null);
    }catch(e){showToast("Erro ao salvar","error");}
    finally{setSaving(false);}
  }

  async function remover(id){
    setSaving(true);
    try{
      await sbFetch(`acoes?id=eq.${id}`,{method:"DELETE"});
      setAcoes(prev=>prev.filter(a=>a.id!==id));
      setConfirmarDelete(null);
      showToast("Tarefa removida.");
    }catch(e){showToast("Erro ao remover","error");}
    finally{setSaving(false);}
  }

  function criarObjetivo(nome,cor){
    setObjetivos(prev=>[...prev,nome]);
    setObjetivoCor(prev=>({...prev,[nome]:cor}));
    setModalObjetivo(false);
    showToast(`Objetivo "${nome}" criado!`);
  }

  function toggleSelecao(id){
    setSelecionados(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  }
  function toggleTodos(){
    const idsPagina=paginadas.map(a=>a.id);
    const todosSelecionados=idsPagina.every(id=>selecionados.includes(id));
    if(todosSelecionados)setSelecionados(prev=>prev.filter(id=>!idsPagina.includes(id)));
    else setSelecionados(prev=>[...new Set([...prev,...idsPagina])]);
  }
  function cancelarLote(){setModoLote(false);setSelecionados([]);}

  async function aplicarLote(){
    if(!selecionados.length)return;
    setSalvandoLote(true);
    try{
      const progresso=statusLote==="Concluída"?100:statusLote==="A iniciar"?0:undefined;
      const patch=progresso!==undefined?{status:statusLote,progresso}:{status:statusLote};
      const ids=selecionados.join(",");
      await sbFetch(`acoes?id=in.(${ids})`,{method:"PATCH",body:JSON.stringify(patch)});
      setAcoes(prev=>prev.map(a=>selecionados.includes(a.id)?{...a,...patch}:a));
      showToast(`${selecionados.length} tarefa${selecionados.length>1?"s":""} atualizada${selecionados.length>1?"s":""}!`);
      cancelarLote();
    }catch(e){showToast("Erro ao atualizar em lote","error");}
    finally{setSalvandoLote(false);}
  }

  const stats=useMemo(()=>{
    const total=acoes.length;
    if(!total)return{total:0,concluidas:0,emAnd:0,aIniciar:0,atrasadas:0,progMedio:0};
    return{
      total,
      concluidas:acoes.filter(a=>a.status==="Concluída").length,
      emAnd:acoes.filter(a=>a.status==="Em andamento").length,
      aIniciar:acoes.filter(a=>a.status==="A iniciar").length,
      atrasadas:acoes.filter(a=>a.status!=="Concluída"&&a.status!=="Cancelada"&&diasRestantes(a.prazo)<0).length,
      progMedio:Math.round(acoes.reduce((s,a)=>s+(a.progresso||0),0)/total)
    };
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

      {toast&&<div style={{position:"fixed",top:20,right:24,zIndex:2000,background:toast.type==="error"?"#450a0a":"#064e3b",border:`1px solid ${toast.type==="error"?"#ef4444":"#10b981"}44`,color:toast.type==="error"?"#f87171":"#34d399",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px #00000066",animation:"fadeIn 0.2s ease"}}>
        {toast.type==="error"?"⚠ ":"✓ "}{toast.msg}
      </div>}

      <div style={{background:"#0a0f1e",borderBottom:"1px solid #1e293b",padding:"0 28px"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#ec4899,#f59e0b)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🍦</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.02em"}}>San Paolo · Plano de Ação</div>
              <div style={{fontSize:10,color:"#475569",fontWeight:500}}>Planejamento Estratégico · PWR Gestão</div>
            </div>
          </div>
          <div style={{display:"flex",gap:5}}>
            {["lista","objetivos","setores"].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={sel(v,view)}>
                {v==="lista"?"☰ Lista":v==="objetivos"?"◈ Por Objetivo":"⊞ Por Setor"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"24px 28px"}}>
        <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
          <StatCard label="Total" value={stats.total} sub="tarefas ativas" cor="#3b82f6"/>
          <StatCard label="Concluídas" value={stats.concluidas} sub={`${stats.total?Math.round(stats.concluidas/stats.total*100):0}% do total`} cor="#10b981"/>
          <StatCard label="Em Andamento" value={stats.emAnd} sub="em execução" cor="#f59e0b"/>
          <StatCard label="A Iniciar" value={stats.aIniciar} sub="não iniciadas" cor="#94a3b8"/>
          <StatCard label="Atrasadas" value={stats.atrasadas} sub="prazo vencido" cor="#ef4444"/>
          <StatCard label="Progresso Médio" value={`${stats.progMedio}%`} sub="consolidado" cor="#a855f7"/>
        </div>

        <div style={{background:"#0a0f1e",border:"1px solid #1e293b",borderRadius:12,padding:"16px 18px",marginBottom:20}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <input placeholder="Buscar tarefa, iniciativa, responsável..." value={filtro.busca} onChange={e=>setFiltroKey("busca",e.target.value)} style={{...inpSt,width:280,flex:"0 0 auto"}}/>
            <select value={filtro.objetivo} onChange={e=>setFiltroKey("objetivo",e.target.value)} style={{...inpSt,maxWidth:260}}>
              <option value="todos">Todos os objetivos</option>
              {objetivos.map(o=><option key={o}>{o}</option>)}
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
            <div style={{display:"flex",gap:8,marginLeft:"auto"}}>
              <button onClick={()=>setModalObjetivo(true)} style={{...btnSt,background:"#1e293b",color:"#94a3b8",border:"1px solid #334155"}}>+ Objetivo</button>
              <button onClick={()=>{setModoLote(v=>!v);setSelecionados([]);}} style={{...btnSt,background:modoLote?"#1e3a5f":"#1e293b",color:modoLote?"#60a5fa":"#94a3b8",border:`1px solid ${modoLote?"#3b82f644":"#334155"}`}}>☑ Editar em Lote</button>
              <button onClick={()=>setModal("new")} style={{...btnSt,background:"linear-gradient(135deg,#ec4899,#f59e0b)",color:"#fff"}}>+ Nova Tarefa</button>
            </div>
          </div>
          <div style={{marginTop:10,fontSize:11,color:"#475569"}}>
            {filtradas.length} tarefa{filtradas.length!==1?"s":""} encontrada{filtradas.length!==1?"s":""}
            {loading&&<span style={{marginLeft:8,color:"#3b82f6"}}>· sincronizando...</span>}
          </div>
        </div>

        {loading&&<Spinner/>}

        {!loading&&view==="lista"&&(
          <>
            {/* BARRA DE LOTE */}
            {modoLote&&(
              <div style={{background:"#0d1f3c",border:"1px solid #3b82f644",borderRadius:12,padding:"12px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <button onClick={toggleTodos} style={{...btnSt,padding:"5px 12px",background:"#1e293b",color:"#94a3b8",fontSize:12,border:"1px solid #334155"}}>
                  {paginadas.every(a=>selecionados.includes(a.id))?"☑ Desmarcar página":"☐ Selecionar página"}
                </button>
                <span style={{fontSize:12,color:"#60a5fa",fontWeight:700}}>
                  {selecionados.length} tarefa{selecionados.length!==1?"s":""} selecionada{selecionados.length!==1?"s":""}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto",flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:"#94a3b8"}}>Alterar status para:</span>
                  <select value={statusLote} onChange={e=>setStatusLote(e.target.value)} style={{...inpSt,width:160,padding:"6px 10px"}}>
                    {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <button onClick={aplicarLote} disabled={!selecionados.length||salvandoLote}
                    style={{...btnSt,background:selecionados.length?"#3b82f6":"#1e293b",color:"#fff",opacity:selecionados.length?1:0.4,padding:"7px 18px"}}>
                    {salvandoLote?"Salvando...":"Aplicar"}
                  </button>
                  <button onClick={cancelarLote} style={{...btnSt,background:"transparent",color:"#64748b",fontSize:12}}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {paginadas.map(a=>{
                const cor=objetivoCor[(a.objetivo||"").trim()]||"#64748b";
                const st=STATUS_META[a.status]||STATUS_META["A iniciar"];
                const dias=diasRestantes(a.prazo);
                const atrasada=dias<0&&a.status!=="Concluída"&&a.status!=="Cancelada";
                const prazoAlterado=a.prazo!==a.prazo_original&&a.prazo_original;
                const selecionado=selecionados.includes(a.id);
                return(
                  <div key={a.id} style={{background:selecionado?"#0d1f3c":"#0f172a",borderRadius:10,border:`1px solid ${selecionado?"#3b82f655":atrasada?"#ef444430":"#1e293b"}`,borderLeft:`3px solid ${selecionado?"#3b82f6":cor}`,padding:"14px 18px",transition:"background 0.15s"}}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      {modoLote&&(
                        <div onClick={()=>toggleSelecao(a.id)} style={{flexShrink:0,marginTop:2,cursor:"pointer"}}>
                          <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${selecionado?"#3b82f6":"#334155"}`,background:selecionado?"#3b82f6":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",transition:"all 0.15s"}}>
                            {selecionado?"✓":""}
                          </div>
                        </div>
                      )}
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
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        {!modoLote&&<>
                          <button onClick={()=>setModal(a)} style={{...btnSt,padding:"5px 10px",background:"#1e293b",color:"#94a3b8",fontSize:12}} title="Editar">✎</button>
                          <button onClick={()=>setConfirmarDelete(a)} style={{...btnSt,padding:"5px 10px",background:"#1a0a0a",color:"#ef444488",fontSize:12,border:"1px solid #ef444422"}} title="Excluir">🗑</button>
                        </>}
                        {modoLote&&<button onClick={()=>toggleSelecao(a.id)} style={{...btnSt,padding:"5px 14px",background:selecionado?"#3b82f6":"#1e293b",color:selecionado?"#fff":"#64748b",fontSize:12,border:`1px solid ${selecionado?"#3b82f6":"#334155"}`}}>{selecionado?"✓ Selecionado":"Selecionar"}</button>}
                      </div>
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
                {paginas>8&&<span style={{color:"#475569",padding:"7px 4px"}}>...</span>}
                <button onClick={()=>setPag(p=>Math.min(paginas,p+1))} disabled={pag===paginas} style={{...btnSt,background:"#1e293b",color:"#94a3b8",opacity:pag===paginas?0.4:1}}>Próxima →</button>
              </div>
            )}
          </>
        )}

        {!loading&&view==="objetivos"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:18}}>
            {objetivos.map(obj=>{
              const oAcoes=filtradas.filter(a=>(a.objetivo||"").trim()===obj);
              if(!oAcoes.length)return null;
              const cor=objetivoCor[obj]||"#64748b";
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
                        <div key={a.id} onClick={()=>setModal(a)} style={{borderBottom:"1px solid #1e293b",padding:"8px 4px",cursor:"pointer"}}>
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

        {!loading&&view==="setores"&&(
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
                      <button key={r} onClick={()=>{setFiltroKey("responsavel",r);setFiltroKey("setor",setor);setView("lista");}} style={{...btnSt,padding:"3px 10px",background:"#1e293b",color:"#94a3b8",fontSize:11,border:"1px solid #334155"}}>
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

      {modal&&<Modal acao={modal==="new"?null:modal} onSave={salvar} onClose={()=>setModal(null)} objetivos={objetivos} saving={saving}/>}
      {modalObjetivo&&<ModalObjetivo onSave={criarObjetivo} onClose={()=>setModalObjetivo(false)}/>}

      {confirmarDelete&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setConfirmarDelete(null)}>
          <div style={{background:"#0f172a",border:"1px solid #450a0a",borderRadius:16,padding:28,width:"min(420px,95vw)"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:32,marginBottom:12}}>🗑️</div>
              <div style={{fontSize:16,fontWeight:800,color:"#f1f5f9",marginBottom:8}}>Excluir tarefa?</div>
              <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.5}}>"<strong style={{color:"#e2e8f0"}}>{confirmarDelete.tarefa?.slice(0,80)}{confirmarDelete.tarefa?.length>80?"...":""}</strong>"</div>
              <div style={{fontSize:11,color:"#475569",marginTop:8}}>Esta ação não pode ser desfeita.</div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>setConfirmarDelete(null)} style={{...btnSt,background:"#1e293b",color:"#94a3b8",padding:"9px 24px"}}>Cancelar</button>
              <button onClick={()=>remover(confirmarDelete.id)} disabled={saving} style={{...btnSt,background:"#dc2626",color:"#fff",padding:"9px 24px",opacity:saving?0.6:1}}>{saving?"Removendo...":"Sim, excluir"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}select option{background:#1e293b;color:#f1f5f9;}::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#0f172a;}::-webkit-scrollbar-thumb{background:#334155;border-radius:99px;}`}</style>
    </div>
  );
}
