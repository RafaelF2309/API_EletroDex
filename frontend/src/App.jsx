import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Package, Plus, Search, Settings2, ShieldCheck, Truck, Users, X, DollarSign } from 'lucide-react'
import { isAuthenticated, logout, saveSession, getUsuario } from './auth'
import api from './api'

const menu = [
  ['/', 'Dashboard', LayoutDashboard], ['produtos', 'Produtos', Package], ['estoque', 'Estoque', Boxes],
  ['entradas', 'Entradas', ArrowDownToLine], ['saidas', 'Saídas', ArrowUpFromLine], ['fornecedores', 'Fornecedores', Truck],
  ['lotes', 'Lotes', ClipboardList], ['usuarios', 'Usuários', Users], ['cargos', 'Cargos', ShieldCheck], ['ajustes', 'Ajustes', Settings2]
]

const labels = {
  produtos: ['Produtos', 'CATÁLOGO', '/produtos'],
  entradas: ['Entradas', 'MOVIMENTAÇÕES', '/entrada'],
  saidas: ['Saídas', 'MOVIMENTAÇÕES', '/saida'],
  fornecedores: ['Fornecedores', 'CADASTRO', '/fornecedores'],
  lotes: ['Lotes', 'ESTOQUE', '/lotes'],
  usuarios: ['Usuários', 'ADMINISTRAÇÃO', '/usuarios'],
  cargos: ['Cargos', 'ADMINISTRAÇÃO', '/cargos'],
  ajustes: ['Ajustes de estoque', 'AUDITORIA', '/ajustes']
}

function App() {
  const [logged, setLogged] = useState(isAuthenticated())
  const [user, setUser] = useState(getUsuario())
  if (!logged) return <Login onLogin={data => { saveSession(data); setUser(data.usuario); setLogged(true) }} />
  return <Routes><Route element={<Layout user={user} onLogout={() => { logout(); setLogged(false) }} />}>
    <Route index element={<Dashboard />} />
    <Route path="produtos" element={<CrudPage type="produtos" />} />
    <Route path="estoque" element={<Stock />} />
    <Route path="entradas" element={<CrudPage type="entradas" />} />
    <Route path="saidas" element={<CrudPage type="saidas" />} />
    <Route path="fornecedores" element={<CrudPage type="fornecedores" />} />
    <Route path="lotes" element={<CrudPage type="lotes" />} />
    <Route path="usuarios" element={<CrudPage type="usuarios" />} />
    <Route path="cargos" element={<CrudPage type="cargos" />} />
    <Route path="ajustes" element={<CrudPage type="ajustes" />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>
}

function Layout({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const current = menu.find(item => (item[0] === '/' ? location.pathname === '/' : location.pathname.startsWith('/' + item[0]))) || menu[0]
  return <div className="app-shell">
    <aside className={'sidebar ' + (open ? 'open' : '')}>
      <div className="brand"><img src="/logo-eletrodex.png" alt="EletroDex" /><span>GESTÃO DE ESTOQUE</span></div>
      <nav>{menu.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className="nav-item"><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="side-user"><div className="avatar">{(user?.nome || 'U')[0].toUpperCase()}</div><div className="user-info"><b>{user?.nome || 'Usuário'}</b><small>{user?.nome_cargo || 'Usuário'}</small></div><button title="Sair" onClick={onLogout}><LogOut size={17} /></button></div>
    </aside>
    {open && <button className="backdrop" onClick={() => setOpen(false)} />}
    <main className="main"><header className="topbar"><button className="mobile-menu" onClick={() => setOpen(true)}><Menu /></button><div><small>ELETRODEX / PAINEL</small><h1>{current[1]}</h1></div><div className="top-user"><div className="avatar">{(user?.nome || 'U')[0].toUpperCase()}</div><div><b>{user?.nome || 'Usuário'}</b><small>Nível {user?.nivel_acesso || 1}</small></div></div></header><div className="page"><Outlet /></div></main>
  </div>
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const response = await api.post('/auth/login', { email, senha })
      onLogin(response.data)
    } catch (error) {
      setErr(error.response?.data?.mensagem || 'Não foi possível realizar o login.')
    } finally {
      setLoading(false)
    }
  }
  return <div className="login"><div className="login-art"><div className="circle c1" /><div className="circle c2" /><div className="login-copy"><img src="/logo-eletrodex.png" alt="EletroDex" /><p>Controle inteligente para uma operação mais organizada.</p></div></div><div className="login-box"><div className="mobile-logo"><img src="/logo-eletrodex.png" alt="EletroDex" /></div><small className="kicker">ACESSO AO SISTEMA</small><h1>Bem-vindo de volta</h1><p className="muted">Entre com suas credenciais para acessar o painel.</p>{err && <div className="error">{err}</div>}<form onSubmit={submit}><label>E-mail<input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="seu@email.com" required /></label><label>Senha<input value={senha} onChange={event => setSenha(event.target.value)} type="password" placeholder="••••••••" required /></label><button className="btn primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar no sistema'}</button></form><small className="login-foot">EletroDex · Gestão de estoque</small></div></div>
}

function useApiCollection(endpoints) {
  const [state, setState] = useState({ items: {}, loading: true, error: '' })
  const requestKey = endpoints.join('|')
  useEffect(() => {
    let active = true
    setState({ items: {}, loading: true, error: '' })
    Promise.all(endpoints.map(endpoint => api.get(endpoint)))
      .then(responses => {
        if (!active) return
        const items = {}
        responses.forEach((response, index) => {
          const records = response.data?.dados
          if (!Array.isArray(records)) throw new Error(`Resposta inválida da rota ${endpoints[index]}`)
          items[endpoints[index]] = records
        })
        setState({ items, loading: false, error: '' })
      })
      .catch(error => {
        if (!active) return
        setState({ items: {}, loading: false, error: error.response?.data?.mensagem || error.message || 'Não foi possível carregar os dados.' })
      })
    return () => { active = false }
  }, [requestKey])
  return state
}

function Dashboard() {
  const { items, loading, error } = useApiCollection(['/produtos', '/saida', '/fornecedores'])
  const products = items['/produtos'] || []
  const sales = items['/saida'] || []
  const suppliers = items['/fornecedores'] || []
  const productPrices = new Map(products.map(product => [Number(product.id_produto), Number(product.preco) || 0]))
  const lowStock = products.filter(product => Number(product.qtd_atual) <= Number(product.estoque_minimo))
  const stockCount = products.reduce((total, product) => total + Number(product.qtd_atual || 0), 0)
  const revenue = sales.reduce((total, sale) => total + Number(sale.quantidade || 0) * (productPrices.get(Number(sale.id_produto)) || 0), 0)
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  return <>
    <div className="hero"><div><small className="kicker">VISÃO GERAL</small><h2>Seu estoque, sob controle.</h2><p>Acompanhe produtos, movimentações e alertas em um único painel.</p></div><div className="hero-icon"><Boxes size={48} /></div></div>
    <div className="stats">
      <Stat icon={Package} title="Produtos cadastrados" value={products.length} />
      <Stat icon={Boxes} title="Itens em estoque" value={stockCount} />
      <Stat icon={AlertTriangle} title="Abaixo do mínimo" value={lowStock.length} danger />
      <Stat icon={Truck} title="Fornecedores" value={suppliers.length} />
      <Stat icon={DollarSign} title="Faturamento das saídas" value={formatCurrency(revenue)} />
    </div>
    <div className="grid-2"><Panel title="Atenção no estoque" kicker="ALERTAS">{lowStock.length ? <div className="list">{lowStock.map(product => <div className="list-row" key={product.id_produto}><div className="icon-box"><Package size={17} /></div><div className="grow"><b>{product.nome}</b><small>{product.qtd_atual} unidades · mínimo {product.estoque_minimo}</small></div><Badge danger>Baixo</Badge></div>)}</div> : <Empty text="Nenhum produto abaixo do mínimo." />}</Panel><Panel title="Acesso rápido" kicker="OPERAÇÕES"><div className="quick-grid"><Quick to="produtos" icon={Package} text="Produtos" /><Quick to="estoque" icon={Boxes} text="Estoque" /><Quick to="entradas" icon={ArrowDownToLine} text="Nova entrada" /><Quick to="saidas" icon={ArrowUpFromLine} text="Nova saída" /></div><p className="muted revenue-note">Calculado pela quantidade de cada saída multiplicada pelo preço atual cadastrado do produto.</p></Panel></div>
  </>
}

function Stat({ icon: Icon, title, value, danger }) {
  return <div className="stat"><div className={'icon-box ' + (danger ? 'danger' : '')}><Icon size={20} /></div><div><small>{title}</small><strong>{value}</strong></div></div>
}

function Panel({ title, kicker, children, action }) {
  return <section className="panel"><div className="panel-head"><div><small className="kicker">{kicker}</small><h2>{title}</h2></div>{action}</div>{children}</section>
}

function Quick({ to, icon: Icon, text }) {
  return <NavLink to={'/' + to} className="quick"><Icon size={19} /><span>{text}</span></NavLink>
}

function Badge({ children, danger }) {
  return <span className={'badge ' + (danger ? 'danger' : 'success')}>{children}</span>
}

function Empty({ text }) {
  return <div className="empty"><Boxes size={28} /><p>{text}</p></div>
}

function Loading() {
  return <div className="panel"><p className="muted">Carregando dados...</p></div>
}

function ErrorMessage({ message }) {
  return <div className="error" role="alert">{message}</div>
}

function Stock() {
  const { items, loading, error } = useApiCollection(['/produtos'])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const products = items['/produtos'] || []
  const filtered = sortRecords(products.filter(product => JSON.stringify(product).toLowerCase().includes(search.toLowerCase())), sort)
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  return <Panel title="Posição atual do estoque" kicker="INVENTÁRIO"><FilterToolbar search={search} setSearch={setSearch} sort={sort} setSort={setSort} label="produtos" /><Table headers={['Produto', 'Código', 'Preço', 'Quantidade', 'Mínimo', 'Situação']} rows={filtered.map(product => [<div className="cell-main"><b>{product.nome}</b></div>, product.cod_barras, formatCurrency(product.preco), product.qtd_atual, product.estoque_minimo, Number(product.qtd_atual) <= Number(product.estoque_minimo) ? <Badge danger>Repor</Badge> : <Badge>Normal</Badge>])} /></Panel>
}

function CrudPage({ type }) {
  const [, kicker, endpoint] = labels[type]
  const endpoints = type === 'entradas' || type === 'saidas' ? [endpoint, '/produtos'] : [endpoint]
  const { items, loading, error } = useApiCollection(endpoints)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [show, setShow] = useState(false)
  const [title] = labels[type]
  const products = items['/produtos'] || []
  const priceByProduct = new Map(products.map(product => [Number(product.id_produto), Number(product.preco) || 0]))
  const records = items[endpoint] || []
  const prepared = records.map(record => {
    if (type === 'entradas' || type === 'saidas') {
      const unitPrice = priceByProduct.get(Number(record.id_produto)) || 0
      return { ...record, preco_unitario: unitPrice, preco_total: unitPrice * Number(record.quantidade || 0) }
    }
    return record
  })
  const filtered = sortRecords(prepared.filter(record => JSON.stringify(record).toLowerCase().includes(search.toLowerCase())), sort)
  const configs = {
    produtos: { headers: ['Produto', 'Código', 'Preço', 'Estoque', 'Mínimo', 'Status'], rows: filtered.map(item => [<div className="cell-main"><b>{item.nome}</b></div>, item.cod_barras, formatCurrency(item.preco), item.qtd_atual, item.estoque_minimo, Number(item.qtd_atual) <= Number(item.estoque_minimo) ? <Badge danger>Baixo</Badge> : <Badge>Normal</Badge>]) },
    entradas: { headers: ['Data', 'Produto', 'Quantidade', 'Preço unitário', 'Valor total', 'Fornecedor', 'Usuário'], rows: filtered.map(item => [formatDate(item.data), item.nome_produto, item.quantidade, formatCurrency(item.preco_unitario), formatCurrency(item.preco_total), item.nome_fornecedor, item.nome_usuario]) },
    saidas: { headers: ['Data', 'Produto', 'Quantidade', 'Preço unitário', 'Valor total', 'Motivo', 'Usuário'], rows: filtered.map(item => [formatDate(item.data), item.nome_produto, item.quantidade, formatCurrency(item.preco_unitario), formatCurrency(item.preco_total), item.motivo || '—', item.nome_usuario]) },
    fornecedores: { headers: ['Fornecedor', 'CNPJ', 'Telefone', 'E-mail'], rows: filtered.map(item => [<div className="cell-main"><b>{item.nome_fornecedor}</b></div>, item.cnpj, item.telefone, item.email]) },
    lotes: { headers: ['Lote', 'Produto', 'Quantidade inicial', 'Validade', 'Fornecedor'], rows: filtered.map(item => [item.numero_lote, item.nome_produto, item.quantidade_inicial, formatDate(item.dt_validade), item.nome_fornecedor]) },
    usuarios: { headers: ['Usuário', 'E-mail', 'Cargo', 'Nível', 'Cadastro'], rows: filtered.map(item => [<div className="cell-main"><b>{item.nome}</b></div>, item.email, item.nome_cargo, <Badge>Nível {item.nivel_acesso}</Badge>, formatDate(item.dt_cadastro)]) },
    cargos: { headers: ['Cargo', 'Nível', 'Descrição'], rows: filtered.map(item => [item.nome_cargo, <Badge>Nível {item.nivel_acesso}</Badge>, item.descricao || '—']) },
    ajustes: { headers: ['Data', 'Produto', 'Anterior', 'Nova', 'Diferença', 'Usuário', 'Motivo'], rows: filtered.map(item => [formatDate(item.ajuste_em), item.nome_produto, item.qtd_anterior, item.qtd_nova, <span className={Number(item.diferenca) < 0 ? 'negative' : 'positive'}>{Number(item.diferenca) > 0 ? '+' : ''}{item.diferenca}</span>, item.nome_usuario, item.motivo]) }
  }
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  const config = configs[type]
  return <Panel kicker={kicker} title={title} action={<button className="btn primary" onClick={() => setShow(true)}><Plus size={16} /> Novo</button>}><FilterToolbar search={search} setSearch={setSearch} sort={sort} setSort={setSort} label={title.toLowerCase()} /><Table headers={config.headers} rows={config.rows} />{show && <Modal title={'Novo ' + title.slice(0, -1)} onClose={() => setShow(false)} />}</Panel>
}

function FilterToolbar({ search, setSearch, sort, setSort, label }) {
  const [showFilters, setShowFilters] = useState(false)
  return <div className="toolbar"><div className="search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={'Buscar em ' + label + '...'} /></div><button type="button" className="btn secondary" aria-expanded={showFilters} onClick={() => setShowFilters(visible => !visible)}><Settings2 size={15} /> Filtros</button>{showFilters && <div className="filter-options"><label htmlFor="record-sort">Ordenar por</label><select id="record-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="">Padrão</option><option value="price_desc">Mais caro</option><option value="price_asc">Mais barato</option><option value="date_asc">Mais antigo</option><option value="date_desc">Mais novo</option></select><button type="button" className="btn secondary" onClick={() => setSort('')}>Limpar</button></div>}</div>
}

function sortRecords(records, sort) {
  if (!sort) return records
  const direction = sort.endsWith('desc') ? -1 : 1
  if (sort.startsWith('price')) return [...records].sort((a, b) => direction * (recordPrice(a) - recordPrice(b)))
  return [...records].sort((a, b) => direction * (recordDate(a) - recordDate(b)))
}

function recordPrice(record) {
  return Number(record.preco ?? record.preco_unitario ?? record.preco_total ?? 0)
}

function recordDate(record) {
  const value = record.dt_cadastro || record.data || record.ajuste_em || record.dt_validade || record.dt_fabricacao
  const time = value ? new Date(value).getTime() : NaN
  return Number.isNaN(time) ? Number(record.id_usuario || record.id_cargo || record.id_produto || record.id_entrada || record.id_saida || record.id_lote || record.id_ajuste || record.id_fornecedor || 0) : time
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value) {
  if (!value) return '—'
  const datePart = typeof value === 'string' ? value.match(/^(\d{4})-(\d{2})-(\d{2})/) : null
  if (datePart) {
    return new Date(Number(datePart[1]), Number(datePart[2]) - 1, Number(datePart[3])).toLocaleDateString('pt-BR')
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
}

function Table({ headers, rows }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell ?? '—'}</td>)}</tr>) : <tr><td colSpan={headers.length}><Empty text="Nenhum registro encontrado." /></td></tr>}</tbody></table></div>
}

function Modal({ title, onClose }) {
  return <div className="modal-layer"><div className="modal"><div className="modal-head"><div><small className="kicker">CADASTRO</small><h2>{title}</h2></div><button className="icon-btn" onClick={onClose}><X /></button></div><div className="modal-form"><label>Nome / descrição<input placeholder="Digite aqui..." /></label><label>Código<input placeholder="Ex.: EDX-001" /></label><div className="form-row"><label>Quantidade<input type="number" placeholder="0" /></label><label>Categoria<select><option>Selecione</option><option>Cabos</option><option>Fontes</option><option>Periféricos</option></select></label></div></div><div className="modal-actions"><button className="btn secondary" onClick={onClose}>Cancelar</button><button className="btn primary" onClick={onClose}>Salvar cadastro</button></div></div></div>
}

export default App
