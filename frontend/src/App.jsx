import { useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, Building2, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings2, ShieldCheck, Truck, UserRound, Users, X } from 'lucide-react'
import { isAuthenticated, logout, saveSession, getUsuario } from './auth'
import api from './api'

const menu = [
  ['/', 'Dashboard', LayoutDashboard], ['produtos', 'Produtos', Package], ['estoque', 'Estoque', Boxes],
  ['entradas', 'Entradas', ArrowDownToLine], ['saidas', 'Saídas', ArrowUpFromLine], ['fornecedores', 'Fornecedores', Truck],
  ['lotes', 'Lotes', ClipboardList], ['usuarios', 'Usuários', Users], ['cargos', 'Cargos', ShieldCheck], ['ajustes', 'Ajustes', Settings2]
]

const seed = {
  produtos: [
    {id:1,nome:'Cabo USB-C 2m',categoria:'Cabos',codigo:'CAB-001',estoque:18,minimo:10,status:'Normal'},
    {id:2,nome:'Fonte 12V 5A',categoria:'Fontes',codigo:'FON-002',estoque:6,minimo:12,status:'Baixo'},
    {id:3,nome:'Mouse sem fio',categoria:'Periféricos',codigo:'MOU-003',estoque:32,minimo:15,status:'Normal'},
    {id:4,nome:'Teclado mecânico',categoria:'Periféricos',codigo:'TEC-004',estoque:9,minimo:8,status:'Normal'},
    {id:5,nome:'Hub USB 4 portas',categoria:'Acessórios',codigo:'HUB-005',estoque:4,minimo:10,status:'Baixo'},
  ],
  fornecedores:[{id:1,nome:'TechSupply Brasil',cnpj:'12.345.678/0001-90',telefone:'(11) 3333-2222',email:'contato@techsupply.com'},{id:2,nome:'Eletron Parts',cnpj:'98.765.432/0001-10',telefone:'(11) 4444-1111',email:'vendas@eletron.com'}],
  usuarios:[{id:1,nome:'Administrador',email:'admin@eletrodex.com',nivel:3,cargo:'Gerente'},{id:2,nome:'João Silva',email:'joao@eletrodex.com',nivel:2,cargo:'Estoquista'},{id:3,nome:'Ana Souza',email:'ana@eletrodex.com',nivel:1,cargo:'Visualizador'}],
  lotes:[{id:101,codigo:'LOT-2026-001',produto:'Cabo USB-C 2m',quantidade:18,validade:'2027-05-20',fornecedor:'TechSupply Brasil'},{id:102,codigo:'LOT-2026-002',produto:'Fonte 12V 5A',quantidade:6,validade:'2026-12-10',fornecedor:'Eletron Parts'}],
  entradas:[{id:1,data:'19/10/2026',produto:'Cabo USB-C 2m',quantidade:10,fornecedor:'TechSupply Brasil',usuario:'Administrador'},{id:2,data:'18/10/2026',produto:'Mouse sem fio',quantidade:20,fornecedor:'Eletron Parts',usuario:'João Silva'}],
  saidas:[{id:1,data:'19/10/2026',produto:'Fonte 12V 5A',quantidade:3,destino:'Manutenção',usuario:'João Silva'},{id:2,data:'18/10/2026',produto:'Mouse sem fio',quantidade:5,destino:'Vendas',usuario:'Administrador'}],
  ajustes:[{id:1,data:'19/10/2026',produto:'Teclado mecânico',anterior:8,nova:9,diferenca:1,usuario:'Administrador'},{id:2,data:'17/10/2026',produto:'Fonte 12V 5A',anterior:8,nova:6,diferenca:-2,usuario:'Administrador'}],
  cargos:[{id:1,nome:'Gerente',nivel:3,descricao:'Acesso total ao sistema'},{id:2,nome:'Estoquista',nivel:2,descricao:'Operações de estoque'},{id:3,nome:'Visualizador',nivel:1,descricao:'Somente consulta'}]
}

function App(){
 const [logged,setLogged]=useState(isAuthenticated()); const [user,setUser]=useState(getUsuario())
 if(!logged) return <Login onLogin={d=>{saveSession(d);setUser(d.usuario);setLogged(true)}}/>
 return <Routes><Route element={<Layout user={user} onLogout={()=>{logout();setLogged(false)}}/>}>
   <Route index element={<Dashboard/>}/><Route path="produtos" element={<CrudPage type="produtos"/>}/><Route path="estoque" element={<Stock/>}/>
   <Route path="entradas" element={<CrudPage type="entradas"/>}/><Route path="saidas" element={<CrudPage type="saidas"/>}/><Route path="fornecedores" element={<CrudPage type="fornecedores"/>}/>
   <Route path="lotes" element={<CrudPage type="lotes"/>}/><Route path="usuarios" element={<CrudPage type="usuarios"/>}/><Route path="cargos" element={<CrudPage type="cargos"/>}/><Route path="ajustes" element={<CrudPage type="ajustes"/>}/>
   <Route path="*" element={<Navigate to="/" replace/>}/>
 </Route></Routes>
}

function Layout({user,onLogout}){ const [open,setOpen]=useState(false); const loc=useLocation(); const current=menu.find(x=>(x[0]==='/'?loc.pathname==='/':loc.pathname.startsWith('/'+x[0])))||menu[0]; return <div className="app-shell">
 <aside className={'sidebar '+(open?'open':'')}><div className="brand"><img src="/logo-eletrodex.png"/><span>GESTÃO DE ESTOQUE</span></div><nav>{menu.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'} onClick={()=>setOpen(false)} className="nav-item"><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="side-user"><div className="avatar">{(user?.nome||'U')[0].toUpperCase()}</div><div className="user-info"><b>{user?.nome||'Usuário'}</b><small>{user?.nome_cargo||'Gerente'}</small></div><button title="Sair" onClick={onLogout}><LogOut size={17}/></button></div></aside>
 {open&&<button className="backdrop" onClick={()=>setOpen(false)}/>}<main className="main"><header className="topbar"><button className="mobile-menu" onClick={()=>setOpen(true)}><Menu/></button><div><small>ELETRODEX / PAINEL</small><h1>{current[1]}</h1></div><div className="top-user"><div className="avatar">{(user?.nome||'U')[0].toUpperCase()}</div><div><b>{user?.nome||'Usuário'}</b><small>Nível {user?.nivel_acesso||3}</small></div></div></header><div className="page"><Outlet/></div></main></div> }

function Login({onLogin}){ const [email,setEmail]=useState('');const [senha,setSenha]=useState('');const [err,setErr]=useState('');const [loading,setLoading]=useState(false);async function submit(e){e.preventDefault();setLoading(true);setErr('');try{const r=await api.post('/auth/login',{email,senha});onLogin(r.data)}catch(error){setErr(error.response?.data?.mensagem || 'Não foi possível realizar o login.')}finally{setLoading(false)}} return <div className="login"><div className="login-art"><div className="circle c1"/><div className="circle c2"/><div className="login-copy"><img src="/logo-eletrodex.png"/><p>Controle inteligente para uma operação mais organizada.</p></div></div><div className="login-box"><div className="mobile-logo"><img src="/logo-eletrodex.png"/></div><small className="kicker">ACESSO AO SISTEMA</small><h1>Bem-vindo de volta</h1><p className="muted">Entre com suas credenciais para acessar o painel.</p>{err&&<div className="error">{err}</div>}<form onSubmit={submit}><label>E-mail<input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com" required/></label><label>Senha<input value={senha} onChange={e=>setSenha(e.target.value)} type="password" placeholder="••••••••" required/></label><button className="btn primary" disabled={loading}>{loading?'Entrando...':'Entrar no sistema'}</button></form><small className="login-foot">EletroDex · Gestão de estoque</small></div></div> }

function Dashboard(){const p=seed.produtos;const baixo=p.filter(x=>x.estoque<x.minimo);return <><div className="hero"><div><small className="kicker">VISÃO GERAL</small><h2>Seu estoque, sob controle.</h2><p>Acompanhe produtos, movimentações e alertas em um único painel.</p></div><div className="hero-icon"><Boxes size={48}/></div></div><div className="stats"><Stat icon={Package} title="Produtos cadastrados" value={p.length}/><Stat icon={Boxes} title="Itens em estoque" value={p.reduce((a,b)=>a+b.estoque,0)}/><Stat icon={AlertTriangle} title="Abaixo do mínimo" value={baixo.length} danger/><Stat icon={Truck} title="Fornecedores" value={seed.fornecedores.length}/></div><div className="grid-2"><Panel title="Atenção no estoque" kicker="ALERTAS">{baixo.length?<div className="list">{baixo.map(x=><div className="list-row" key={x.id}><div className="icon-box"><Package size={17}/></div><div className="grow"><b>{x.nome}</b><small>{x.estoque} unidades · mínimo {x.minimo}</small></div><Badge danger>Baixo</Badge></div>)}</div>:<Empty text="Nenhum produto abaixo do mínimo."/>}</Panel><Panel title="Acesso rápido" kicker="OPERAÇÕES"><div className="quick-grid"><Quick to="produtos" icon={Package} text="Produtos"/><Quick to="estoque" icon={Boxes} text="Estoque"/><Quick to="entradas" icon={ArrowDownToLine} text="Nova entrada"/><Quick to="saidas" icon={ArrowUpFromLine} text="Nova saída"/></div></Panel></div></>}
function Stat({icon:Icon,title,value,danger}){return <div className="stat"><div className={'icon-box '+(danger?'danger':'')}><Icon size={20}/></div><div><small>{title}</small><strong>{value}</strong></div></div>}
function Panel({title,kicker,children,action}){return <section className="panel"><div className="panel-head"><div><small className="kicker">{kicker}</small><h2>{title}</h2></div>{action}</div>{children}</section>}
function Quick({to,icon:Icon,text}){return <NavLink to={'/'+to} className="quick"><Icon size={19}/><span>{text}</span></NavLink>}
function Badge({children,danger}){return <span className={'badge '+(danger?'danger':'success')}>{children}</span>}
function Empty({text}){return <div className="empty"><Boxes size={28}/><p>{text}</p></div>}

function Stock(){return <Panel title="Posição atual do estoque" kicker="INVENTÁRIO"><div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Buscar produto..."/></div><button className="btn primary"><Plus size={16}/> Ajustar estoque</button></div><Table headers={['Produto','Código','Quantidade','Mínimo','Situação']} rows={seed.produtos.map(x=>[<div className="cell-main"><b>{x.nome}</b><small>{x.categoria}</small></div>,x.codigo,x.estoque,x.minimo,x.estoque<x.minimo?<Badge danger>Repor</Badge>:<Badge>Normal</Badge>])}/></Panel>}

const labels={produtos:['Produtos','CATÁLOGO'],entradas:['Entradas','MOVIMENTAÇÕES'],saidas:['Saídas','MOVIMENTAÇÕES'],fornecedores:['Fornecedores','CADASTRO'],lotes:['Lotes','ESTOQUE'],usuarios:['Usuários','ADMINISTRAÇÃO'],cargos:['Cargos','ADMINISTRAÇÃO'],ajustes:['Ajustes de estoque','AUDITORIA']}
function CrudPage({type}){const [search,setSearch]=useState('');const [show,setShow]=useState(false);const [items]=useState(seed[type]||[]);const [title,kicker]=labels[type];const filtered=items.filter(x=>JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));const configs={
 produtos:{headers:['Produto','Código','Estoque','Mínimo','Status'],rows:filtered.map(x=>[<div className="cell-main"><b>{x.nome}</b><small>{x.categoria}</small></div>,x.codigo,x.estoque,x.minimo,x.status==='Baixo'?<Badge danger>Baixo</Badge>:<Badge>Normal</Badge>])},
 entradas:{headers:['Data','Produto','Quantidade','Fornecedor','Usuário'],rows:filtered.map(x=>[x.data,x.produto,x.quantidade,x.fornecedor,x.usuario])},
 saidas:{headers:['Data','Produto','Quantidade','Destino','Usuário'],rows:filtered.map(x=>[x.data,x.produto,x.quantidade,x.destino,x.usuario])},
 fornecedores:{headers:['Fornecedor','CNPJ','Telefone','E-mail'],rows:filtered.map(x=>[<div className="cell-main"><b>{x.nome}</b></div>,x.cnpj,x.telefone,x.email])},
 lotes:{headers:['Lote','Produto','Quantidade','Validade','Fornecedor'],rows:filtered.map(x=>[x.codigo,x.produto,x.quantidade,x.validade,x.fornecedor])},
 usuarios:{headers:['Usuário','E-mail','Cargo','Nível'],rows:filtered.map(x=>[<div className="cell-main"><b>{x.nome}</b></div>,x.email,x.cargo,<Badge>{x.nivel}</Badge>])},
 cargos:{headers:['Cargo','Nível','Descrição'],rows:filtered.map(x=>[x.nome,<Badge>Nível {x.nivel}</Badge>,x.descricao])},
 ajustes:{headers:['Data','Produto','Anterior','Nova','Diferença','Usuário'],rows:filtered.map(x=>[x.data,x.produto,x.anterior,x.nova,<span className={x.diferenca<0?'negative':'positive'}>{x.diferenca>0?'+':''}{x.diferenca}</span>,x.usuario])}
};const cfg=configs[type];return <Panel kicker={kicker} title={title} action={<button className="btn primary" onClick={()=>setShow(true)}><Plus size={16}/> Novo</button>}><div className="toolbar"><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={'Buscar em '+title.toLowerCase()+'...'}/></div><button className="btn secondary">Filtros</button></div><Table headers={cfg.headers} rows={cfg.rows}/>{show&&<Modal title={'Novo '+title.slice(0,-1)} onClose={()=>setShow(false)}/>}</Panel>}
function Table({headers,rows}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>):<tr><td colSpan={headers.length}><Empty text="Nenhum registro encontrado."/></td></tr>}</tbody></table></div>}
function Modal({title,onClose}){return <div className="modal-layer"><div className="modal"><div className="modal-head"><div><small className="kicker">CADASTRO</small><h2>{title}</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div><div className="modal-form"><label>Nome / descrição<input placeholder="Digite aqui..."/></label><label>Código<input placeholder="Ex.: EDX-001"/></label><div className="form-row"><label>Quantidade<input type="number" placeholder="0"/></label><label>Categoria<select><option>Selecione</option><option>Cabos</option><option>Fontes</option><option>Periféricos</option></select></label></div></div><div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={onClose}>Salvar cadastro</button></div></div></div>}

export default App
