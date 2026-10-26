import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'

import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  X,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react'

import {
  isAuthenticated,
  logout,
  saveSession,
  getUsuario,
} from './auth'

import api from './api'

const menu = [
  ['/', 'Dashboard', LayoutDashboard],
  ['produtos', 'Produtos', Package],
  ['estoque', 'Estoque', Boxes],
  ['entradas', 'Entradas', ArrowDownToLine],
  ['saidas', 'Saídas', ArrowUpFromLine],
  ['fornecedores', 'Fornecedores', Truck],
  ['lotes', 'Lotes', ClipboardList],
  ['usuarios', 'Usuários', Users],
  ['cargos', 'Cargos', ShieldCheck],
  ['ajustes', 'Ajustes', Settings2],
]

const TableSortContext = createContext('')

function App() {
  const [logged, setLogged] = useState(isAuthenticated())
  const [user, setUser] = useState(getUsuario())

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null)
      setLogged(false)
    }

    window.addEventListener(
      'eletrodex:unauthorized',
      handleUnauthorized
    )

    return () =>
      window.removeEventListener(
        'eletrodex:unauthorized',
        handleUnauthorized
      )
  }, [])

  if (!logged) {
    return (
      <Login
        onLogin={(data) => {
          saveSession(data)
          setUser(data.usuario)
          setLogged(true)
        }}
      />
    )
  }

  return (
    <Routes>
      <Route
        element={
          <Layout
            user={user}
            onLogout={() => {
              logout()
              setLogged(false)
            }}
          />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="entradas" element={<Entradas />} />
        <Route path="saidas" element={<Saidas />} />
        <Route path="fornecedores" element={<Fornecedores />} />
        <Route path="lotes" element={<Lotes />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="cargos" element={<Cargos />} />
        <Route path="ajustes" element={<Ajustes />} />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Route>
    </Routes>
  )
}

/* =========================
   LAYOUT
========================= */

function Layout({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()

  const current =
    menu.find((item) =>
      item[0] === '/'
        ? loc.pathname === '/'
        : loc.pathname.startsWith('/' + item[0])
    ) || menu[0]

  return (
    <div className="app-shell">
      <aside
        className={
          'sidebar ' + (open ? 'open' : '')
        }
      >
        <div className="brand">
          <img src="/logo-eletrodex.png" />
          <span>GESTÃO DE ESTOQUE</span>
        </div>

        <nav>
          {menu.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className="nav-item"
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-user">
          <div className="avatar">
            {(user?.nome || 'U')[0].toUpperCase()}
          </div>

          <div className="user-info">
            <b>{user?.nome || 'Usuário'}</b>
            <small>
              {user?.nome_cargo || 'Usuário'}
            </small>
          </div>

          <button
            title="Sair"
            onClick={onLogout}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {open && (
        <button
          className="backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <small>ELETRODEX / PAINEL</small>
            <h1>{current[1]}</h1>
          </div>

          <div className="top-user">
            <div className="avatar">
              {(user?.nome || 'U')[0].toUpperCase()}
            </div>

            <div>
              <b>{user?.nome || 'Usuário'}</b>
              <small>
                Nível {user?.nivel_acesso || 1}
              </small>
            </div>
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

/* =========================
   LOGIN
========================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()

    setLoading(true)
    setErr('')

    try {
      const response = await api.post(
        '/auth/login',
        {
          email,
          senha,
        }
      )

      onLogin(response.data)
    } catch (error) {
      setErr(
        error.response?.data?.mensagem ||
          'Não foi possível realizar o login.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-art">
        <div className="circle c1" />
        <div className="circle c2" />

        <div className="login-copy">
          <img src="/logo-eletrodex.png" />

          <p>
            Controle inteligente para uma operação
            mais organizada.
          </p>
        </div>
      </div>

      <div className="login-box">
        <div className="mobile-logo">
          <img src="/logo-eletrodex.png" />
        </div>

        <small className="kicker">
          ACESSO AO SISTEMA
        </small>

        <h1>Bem-vindo de volta</h1>

        <p className="muted">
          Entre com suas credenciais para acessar
          o painel.
        </p>

        {err && (
          <div className="error">
            {err}
          </div>
        )}

        <form onSubmit={submit}>
          <label>
            E-mail

            <input
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              type="email"
              placeholder="seu@email.com"
              required
            />
          </label>

          <label>
            Senha

            <input
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              type="password"
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="btn primary"
            disabled={loading}
          >
            {loading
              ? 'Entrando...'
              : 'Entrar no sistema'}
          </button>
        </form>

        <small className="login-foot">
          EletroDex · Gestão de estoque
        </small>
      </div>
    </div>
  )
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {
  const [produtos, setProdutos] = useState([])
  const [estoques, setEstoques] = useState([])
  const [fornecedores, setFornecedores] =
    useState([])
  const [entradas, setEntradas] = useState([])
  const [saidas, setSaidas] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  async function carregar() {
    setLoadError('')
    setLoading(true)

    try {
      const [
        produtosRes,
        estoqueRes,
        fornecedoresRes,
        entradasRes,
        saidasRes,
      ] = await Promise.all([
        api.get('/produtos'),
        api.get('/estoque'),
        api.get('/fornecedores'),
        api.get('/entrada'),
        api.get('/saida'),
      ])

      setProdutos(produtosRes.data.dados || [])
      setEstoques(estoqueRes.data.dados || [])
      setFornecedores(
        fornecedoresRes.data.dados || []
      )
      setEntradas(
        entradasRes.data.dados || []
      )
      setSaidas(
        saidasRes.data.dados || []
      )
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar os dados do dashboard.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const totalEstoque = estoques.reduce(
    (total, item) =>
      total + Number(item.qtd_atual || 0),
    0
  )

  const produtosBaixos = produtos.filter(
    (produto) =>
      Number(produto.qtd_atual || 0) <=
      Number(produto.estoque_minimo || 0)
  )
  const faturamento = saidas.reduce(
    (total, item) =>
      total +
      Number(item.preco_produto || 0) *
        Number(item.quantidade || 0),
    0
  )

  if (loading) {
    return <Loading />
  }

  if (loadError) {
    return <div className="error" role="alert">{loadError}</div>
  }

  return (
    <>
      <div className="hero">
        <div>
          <small className="kicker">
            VISÃO GERAL
          </small>

          <h2>
            Seu estoque, sob controle.
          </h2>

          <p>
            Dados reais do Backend e MySQL.
          </p>
        </div>

        <div className="hero-icon">
          <Boxes size={48} />
        </div>
      </div>

      <div className="stats">
        <Stat
          icon={Package}
          title="Produtos cadastrados"
          value={produtos.length}
        />

        <Stat
          icon={Boxes}
          title="Itens em estoque"
          value={totalEstoque}
        />

        <Stat
          icon={AlertTriangle}
          title="Abaixo do mínimo"
          value={produtosBaixos.length}
          danger
        />

        <Stat
          icon={Truck}
          title="Fornecedores"
          value={fornecedores.length}
        />

        <Stat
          icon={ArrowUpFromLine}
          title="Faturamento"
          value={formatCurrency(faturamento)}
        />
      </div>

      <div className="grid-2">
        <Panel
          title="Atenção no estoque"
          kicker="ALERTAS"
        >
          {produtosBaixos.length ? (
            <div className="list">
              {produtosBaixos.map(
                (produto) => (
                  <div
                    className="list-row"
                    key={produto.id_produto}
                  >
                    <div className="icon-box">
                      <Package size={17} />
                    </div>

                    <div className="grow">
                      <b>
                        {produto.nome}
                      </b>

                      <small>
                        {produto.qtd_atual}
                        {' '}unidades · mínimo{' '}
                        {produto.estoque_minimo}
                      </small>
                    </div>

                    <Badge danger>
                      Baixo
                    </Badge>
                  </div>
                )
              )}
            </div>
          ) : (
            <Empty text="Nenhum produto abaixo do mínimo." />
          )}
        </Panel>

        <Panel
          title="Acesso rápido"
          kicker="OPERAÇÕES"
        >
          <div className="quick-grid">
            <Quick
              to="produtos"
              icon={Package}
              text="Produtos"
            />

            <Quick
              to="estoque"
              icon={Boxes}
              text="Estoque"
            />

            <Quick
              to="entradas"
              icon={ArrowDownToLine}
              text="Nova entrada"
            />

            <Quick
              to="saidas"
              icon={ArrowUpFromLine}
              text="Nova saída"
            />
          </div>
        </Panel>
      </div>

      <div
        className="grid-2"
        style={{ marginTop: 17 }}
      >
        <Panel
          title="Últimas entradas"
          kicker="MOVIMENTAÇÕES"
        >
          <SimpleList
            items={entradas.slice(0, 5)}
            render={(item) => (
              <>
                <b>
                  {item.nome_produto}
                </b>
                <small>
                  +{item.quantidade} unidades ·{' '}
                  {item.nome_fornecedor}
                </small>
              </>
            )}
          />
        </Panel>

        <Panel
          title="Últimas saídas"
          kicker="MOVIMENTAÇÕES"
        >
          <SimpleList
            items={saidas.slice(0, 5)}
            render={(item) => (
              <>
                <b>
                  {item.nome_produto}
                </b>
                <small>
                  -{item.quantidade} unidades ·{' '}
                  {item.motivo || 'Sem motivo'}
                </small>
              </>
            )}
          />
        </Panel>
      </div>
    </>
  )
}

/* =========================
   PRODUTOS
========================= */

function Produtos() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()
  const podeEditar =
    Number(user?.nivel_acesso) >= 2
  const podeExcluir =
    Number(user?.nivel_acesso) >= 3

  async function carregar() {
    setLoadError('')

    try {
      const response = await api.get('/produtos')
      setItems(response.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar os produtos.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        JSON.stringify(item)
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [items, search]
  )

  async function excluir(id) {
    if (!confirm('Excluir este produto?')) {
      return
    }

    try {
      await api.delete(
        `/produtos/${id}`
      )

      await carregar()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Não foi possível excluir.'
      )
    }
  }

  return (
    <CrudPanel
      title="Produtos"
      kicker="CATÁLOGO"
      search={search}
      setSearch={setSearch}
      onNew={() => {
        setEdit(null)
        setShow(true)
      }}
      canNew={podeEditar}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Produto',
          'Código',
          'Preço',
          'Estoque',
          'Mínimo',
          'Status',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          <div className="cell-main">
            <b>{item.nome}</b>
            <small>
              {item.descricao || 'Sem descrição'}
            </small>
          </div>,

          item.cod_barras,

          `R$ ${Number(
            item.preco
          ).toFixed(2)}`,

          item.qtd_atual,

          item.estoque_minimo,

          item.abaixo_do_minimo ? (
            <Badge danger>Baixo</Badge>
          ) : (
            <Badge>Normal</Badge>
          ),

          <Actions
            canEdit={podeEditar}
            canDelete={podeExcluir}
            onEdit={() => {
              setEdit(item)
              setShow(true)
            }}
            onDelete={() =>
              excluir(item.id_produto)
            }
          />,
        ])}
      />

      {show && (
        <ProdutoModal
          item={edit}
          onClose={() => {
            setShow(false)
            setEdit(null)
          }}
          onSaved={async () => {
            setShow(false)
            setEdit(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function ProdutoModal({
  item,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    nome: item?.nome || '',
    descricao: item?.descricao || '',
    estoque_minimo:
      item?.estoque_minimo ?? 0,
    cod_barras:
      item?.cod_barras || '',
    preco: item?.preco || '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (item) {
        await api.patch(
          `/produtos/${item.id_produto}`,
          {
            nome: form.nome,
            descricao: form.descricao,
            estoque_minimo:
              Number(form.estoque_minimo),
            cod_barras: form.cod_barras,
            preco: Number(form.preco),
          }
        )
      } else {
        await api.post(
          '/produtos',
          {
            ...form,
            estoque_minimo:
              Number(form.estoque_minimo),
            preco: Number(form.preco),
          }
        )
      }

      window.alert(
        item
          ? 'Produto atualizado com sucesso.'
          : 'Produto cadastrado com sucesso.'
      )
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao salvar produto.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        item
          ? 'Editar produto'
          : 'Novo produto'
      }
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Nome
          <input
            value={form.nome}
            onChange={(e) =>
              setForm({
                ...form,
                nome: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Descrição
          <input
            value={form.descricao}
            onChange={(e) =>
              setForm({
                ...form,
                descricao:
                  e.target.value,
              })
            }
          />
        </label>

        <label>
          Código de barras
          <input
            value={form.cod_barras}
            onChange={(e) =>
              setForm({
                ...form,
                cod_barras:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <div className="form-row">
          <label>
            Preço
            <input
              type="number"
              step="0.01"
              value={form.preco}
              onChange={(e) =>
                setForm({
                  ...form,
                  preco: e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Estoque mínimo
            <input
              type="number"
              value={
                form.estoque_minimo
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  estoque_minimo:
                    e.target.value,
                })
              }
            />
          </label>
        </div>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   FORNECEDORES
========================= */

function Fornecedores() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()
  const podeEditar =
    Number(user?.nivel_acesso) >= 2
  const podeExcluir =
    Number(user?.nivel_acesso) >= 3

  async function carregar() {
    setLoadError('')

    try {
      const response = await api.get('/fornecedores')
      setItems(response.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar os fornecedores.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  async function excluir(id) {
    if (!confirm('Excluir este fornecedor?')) {
      return
    }

    try {
      await api.delete(
        `/fornecedores/${id}`
      )
      carregar()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Não foi possível excluir.'
      )
    }
  }

  return (
    <CrudPanel
      title="Fornecedores"
      kicker="CADASTRO"
      search={search}
      setSearch={setSearch}
      canNew={podeEditar}
      onNew={() => {
        setEdit(null)
        setShow(true)
      }}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Fornecedor',
          'CNPJ',
          'Telefone',
          'E-mail',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          <div className="cell-main">
            <b>
              {item.nome_fornecedor}
            </b>
          </div>,
          item.cnpj,
          item.telefone,
          item.email,
          <Actions
            canEdit={podeEditar}
            canDelete={podeExcluir}
            onEdit={() => {
              setEdit(item)
              setShow(true)
            }}
            onDelete={() =>
              excluir(item.id_fornecedor)
            }
          />,
        ])}
      />

      {show && (
        <FornecedorModal
          item={edit}
          onClose={() => {
            setShow(false)
            setEdit(null)
          }}
          onSaved={async () => {
            setShow(false)
            setEdit(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function FornecedorModal({
  item,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    nome_fornecedor:
      item?.nome_fornecedor || '',
    cnpj: item?.cnpj || '',
    telefone:
      item?.telefone || '',
    email: item?.email || '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (item) {
        await api.patch(
          `/fornecedores/${item.id_fornecedor}`,
          form
        )
      } else {
        await api.post(
          '/fornecedores',
          form
        )
      }

      window.alert(
        item
          ? 'Fornecedor atualizado com sucesso.'
          : 'Fornecedor cadastrado com sucesso.'
      )
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao salvar fornecedor.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        item
          ? 'Editar fornecedor'
          : 'Novo fornecedor'
      }
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Nome
          <input
            value={
              form.nome_fornecedor
            }
            onChange={(e) =>
              setForm({
                ...form,
                nome_fornecedor:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          CNPJ
          <input
            value={form.cnpj}
            onChange={(e) =>
              setForm({
                ...form,
                cnpj: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Telefone
          <input
            value={form.telefone}
            onChange={(e) =>
              setForm({
                ...form,
                telefone:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
          />
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   LOTES
========================= */

function Lotes() {
  const [items, setItems] = useState([])
  const [produtos, setProdutos] = useState([])
  const [fornecedores, setFornecedores] =
    useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()
  const podeEditar =
    Number(user?.nivel_acesso) >= 2
  const podeExcluir =
    Number(user?.nivel_acesso) >= 3

  async function carregar() {
    setLoadError('')

    try {
      const [
        lotes,
        produtosRes,
        fornecedoresRes,
      ] = await Promise.all([
        api.get('/lotes'),
        api.get('/produtos'),
        api.get('/fornecedores'),
      ])

      setItems(lotes.data.dados || [])
      setProdutos(produtosRes.data.dados || [])
      setFornecedores(fornecedoresRes.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar lotes, produtos e fornecedores.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  async function excluir(id) {
    if (!confirm('Excluir este lote?')) {
      return
    }

    try {
      await api.delete(`/lotes/${id}`)
      carregar()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Não foi possível excluir.'
      )
    }
  }

  return (
    <CrudPanel
      title="Lotes"
      kicker="ESTOQUE"
      search={search}
      setSearch={setSearch}
      canNew={podeEditar}
      onNew={() => {
        setEdit(null)
        setShow(true)
      }}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Lote',
          'Produto',
          'Fabricação',
          'Validade',
          'Fornecedor',
          'Quantidade',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          item.numero_lote,
          item.nome_produto,
          formatDate(item.dt_fabricacao),
          formatDate(item.dt_validade),
          item.nome_fornecedor,
          item.quantidade_inicial,
          <Actions
            canEdit={podeEditar}
            canDelete={podeExcluir}
            onEdit={() => {
              setEdit(item)
              setShow(true)
            }}
            onDelete={() =>
              excluir(item.id_lote)
            }
          />,
        ])}
      />

      {show && (
        <LoteModal
          item={edit}
          produtos={produtos}
          fornecedores={fornecedores}
          onClose={() => {
            setShow(false)
            setEdit(null)
          }}
          onSaved={async () => {
            setShow(false)
            setEdit(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function LoteModal({
  item,
  produtos,
  fornecedores,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    id_produto:
      item?.id_produto || '',
    numero_lote:
      item?.numero_lote || '',
    dt_fabricacao:
      item?.dt_fabricacao
        ? String(
            item.dt_fabricacao
          ).slice(0, 10)
        : '',
    dt_validade:
      item?.dt_validade
        ? String(
            item.dt_validade
          ).slice(0, 10)
        : '',
    quantidade_inicial:
      item?.quantidade_inicial || '',
    id_fornecedor:
      item?.id_fornecedor || '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (item) {
        await api.patch(
          `/lotes/${item.id_lote}`,
          {
            numero_lote:
              form.numero_lote,
            dt_fabricacao:
              form.dt_fabricacao,
            dt_validade:
              form.dt_validade,
            id_fornecedor:
              Number(
                form.id_fornecedor
              ),
          }
        )
      } else {
        await api.post(
          '/lotes',
          {
            ...form,
            id_produto:
              Number(form.id_produto),
            quantidade_inicial:
              Number(
                form.quantidade_inicial
              ),
            id_fornecedor:
              Number(
                form.id_fornecedor
              ),
          }
        )
      }

      window.alert(
        item
          ? 'Lote atualizado com sucesso.'
          : 'Lote cadastrado com sucesso.'
      )
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao salvar lote.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        item
          ? 'Editar lote'
          : 'Novo lote'
      }
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        {!item && (
          <label>
            Produto
            <select
              value={form.id_produto}
              onChange={(e) =>
                setForm({
                  ...form,
                  id_produto:
                    e.target.value,
                })
              }
              required
            >
              <option value="">
                Selecione
              </option>

              {produtos.map(
                (produto) => (
                  <option
                    key={
                      produto.id_produto
                    }
                    value={
                      produto.id_produto
                    }
                  >
                    {produto.nome}
                  </option>
                )
              )}
            </select>
          </label>
        )}

        <label>
          Número do lote
          <input
            value={
              form.numero_lote
            }
            onChange={(e) =>
              setForm({
                ...form,
                numero_lote:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <div className="form-row">
          <label>
            Fabricação
            <input
              type="date"
              value={
                form.dt_fabricacao
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  dt_fabricacao:
                    e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Validade
            <input
              type="date"
              value={
                form.dt_validade
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  dt_validade:
                    e.target.value,
                })
              }
              required
            />
          </label>
        </div>

        {!item && (
          <label>
            Quantidade inicial
            <input
              type="number"
              min="1"
              value={
                form.quantidade_inicial
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  quantidade_inicial:
                    e.target.value,
                })
              }
              required
            />
          </label>
        )}

        <label>
          Fornecedor
          <select
            value={
              form.id_fornecedor
            }
            onChange={(e) =>
              setForm({
                ...form,
                id_fornecedor:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {fornecedores.map(
              (fornecedor) => (
                <option
                  key={
                    fornecedor.id_fornecedor
                  }
                  value={
                    fornecedor.id_fornecedor
                  }
                >
                  {
                    fornecedor.nome_fornecedor
                  }
                </option>
              )
            )}
          </select>
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   ESTOQUE
========================= */

function Estoque() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] =
    useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()
  const podeAjustar =
    Number(user?.nivel_acesso) >= 2

  async function carregar() {
    setLoadError('')

    try {
      const response = await api.get('/estoque')
      setItems(response.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar o estoque.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <CrudPanel
      title="Estoque"
      kicker="INVENTÁRIO"
      search={search}
      setSearch={setSearch}
      canNew={false}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Produto',
          'Lote',
          'Quantidade',
          'Mínimo',
          'Localização',
          'Situação',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          item.nome_produto,

          item.numero_lote,

          item.qtd_atual,

          item.estoque_minimo,

          `${item.localizacao_corredor || '-'} / ${
            item.localizacao_prateleira || '-'
          }`,

          Number(item.qtd_atual) <=
          Number(item.estoque_minimo) ? (
            <Badge danger>
              Repor
            </Badge>
          ) : (
            <Badge>
              Normal
            </Badge>
          ),

          podeAjustar ? (
            <button
              className="btn secondary"
              onClick={() =>
                setSelected(item)
              }
            >
              <RefreshCw size={14} />
              Ajustar
            </button>
          ) : (
            '-'
          ),
        ])}
      />

      {selected && (
        <AjusteModal
          item={selected}
          onClose={() =>
            setSelected(null)
          }
          onSaved={async () => {
            setSelected(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function AjusteModal({
  item,
  onClose,
  onSaved,
}) {
  const [diferenca, setDiferenca] =
    useState('')
  const [motivo, setMotivo] =
    useState('')
  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post(
        `/estoque/${item.id_estoque}/ajuste`,
        {
          diferenca: Number(diferenca),
          motivo,
        }
      )

      window.alert('Estoque ajustado com sucesso.')
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao ajustar estoque.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Ajustar estoque"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <div className="cell-main">
          <b>
            {item.nome_produto}
          </b>

          <small>
            Atual: {item.qtd_atual}
          </small>
        </div>

        <label>
          Diferença
          <input
            type="number"
            value={diferenca}
            onChange={(e) =>
              setDiferenca(
                e.target.value
              )
            }
            placeholder="Ex.: 5 ou -2"
            required
          />
        </label>

        <label>
          Motivo
          <input
            value={motivo}
            onChange={(e) =>
              setMotivo(
                e.target.value
              )
            }
            placeholder="Motivo do ajuste"
            maxLength="200"
            required
          />
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   ENTRADAS
========================= */

function Entradas() {
  const [items, setItems] = useState([])
  const [produtos, setProdutos] = useState([])
  const [lotes, setLotes] = useState([])
  const [fornecedores, setFornecedores] =
    useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()
  const podeCriar =
    Number(user?.nivel_acesso) >= 2

  async function carregar() {
    setLoadError('')

    try {
      const [
        entradas,
        produtosRes,
        lotesRes,
        fornecedoresRes,
      ] = await Promise.all([
        api.get('/entrada'),
        api.get('/produtos'),
        api.get('/lotes'),
        api.get('/fornecedores'),
      ])

      setItems(entradas.data.dados || [])
      setProdutos(produtosRes.data.dados || [])
      setLotes(lotesRes.data.dados || [])
      setFornecedores(fornecedoresRes.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar entradas e dados relacionados.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <CrudPanel
      title="Entradas"
      kicker="MOVIMENTAÇÕES"
      search={search}
      setSearch={setSearch}
      canNew={podeCriar}
      onNew={() => setShow(true)}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Data',
          'Produto',
          'Lote',
          'Quantidade',
          'Preço unitário',
          'Valor total',
          'Fornecedor',
          'Usuário',
        ]}
        rows={filtered.map((item) => [
          formatDateTime(item.data),
          item.nome_produto,
          item.numero_lote,
          item.quantidade,
          formatCurrency(item.preco_produto),
          formatCurrency(
            Number(item.preco_produto || 0) *
              Number(item.quantidade || 0)
          ),
          item.nome_fornecedor,
          item.nome_usuario,
        ])}
      />

      {show && (
        <EntradaModal
          produtos={produtos}
          lotes={lotes}
          fornecedores={fornecedores}
          onClose={() =>
            setShow(false)
          }
          onSaved={async () => {
            setShow(false)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function EntradaModal({
  produtos,
  lotes,
  fornecedores,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    id_produto: '',
    id_lote: '',
    id_fornecedor: '',
    data: '',
    quantidade: '',
    rastreamento: '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/entrada', {
        id_produto:
          Number(form.id_produto),
        id_lote:
          Number(form.id_lote),
        id_fornecedor:
          Number(form.id_fornecedor),
        data: form.data,
        quantidade:
          Number(form.quantidade),
        rastreamento:
          form.rastreamento || null,
      })

      window.alert('Entrada registrada com sucesso.')
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao cadastrar entrada.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Nova entrada"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Produto
          <select
            value={form.id_produto}
            onChange={(e) =>
              setForm({
                ...form,
                id_produto:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {produtos.map(
              (produto) => (
                <option
                  key={
                    produto.id_produto
                  }
                  value={
                    produto.id_produto
                  }
                >
                  {produto.nome}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Lote
          <select
            value={form.id_lote}
            onChange={(e) =>
              setForm({
                ...form,
                id_lote:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {lotes.map((lote) => (
              <option
                key={lote.id_lote}
                value={lote.id_lote}
              >
                {lote.numero_lote} -{' '}
                {lote.nome_produto}
              </option>
            ))}
          </select>
        </label>

        <label>
          Fornecedor
          <select
            value={
              form.id_fornecedor
            }
            onChange={(e) =>
              setForm({
                ...form,
                id_fornecedor:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {fornecedores.map(
              (fornecedor) => (
                <option
                  key={
                    fornecedor.id_fornecedor
                  }
                  value={
                    fornecedor.id_fornecedor
                  }
                >
                  {
                    fornecedor.nome_fornecedor
                  }
                </option>
              )
            )}
          </select>
        </label>

        <div className="form-row">
          <label>
            Data
            <input
              type="datetime-local"
              value={form.data}
              onChange={(e) =>
                setForm({
                  ...form,
                  data:
                    e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value={
                form.quantidade
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  quantidade:
                    e.target.value,
                })
              }
              required
            />
          </label>
        </div>

        <div className="price-summary">
          <span>Preço unitário</span>
          <strong>
            {formatCurrency(
              produtos.find(
                (produto) =>
                  Number(produto.id_produto) ===
                  Number(form.id_produto)
              )?.preco
            )}
          </strong>
          <span>Valor total</span>
          <strong>
            {formatCurrency(
              Number(
                produtos.find(
                  (produto) =>
                    Number(produto.id_produto) ===
                    Number(form.id_produto)
                )?.preco || 0
              ) * Number(form.quantidade || 0)
            )}
          </strong>
        </div>

        <label>
          Rastreamento
          <input
            value={
              form.rastreamento
            }
            onChange={(e) =>
              setForm({
                ...form,
                rastreamento:
                  e.target.value,
              })
            }
          />
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   SAÍDAS
========================= */

function Saidas() {
  const [items, setItems] = useState([])
  const [produtos, setProdutos] = useState([])
  const [lotes, setLotes] = useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()

  const podeCriar =
    Number(user?.nivel_acesso) >= 1

  async function carregar() {
    setLoadError('')

    try {
      const [
        saidas,
        produtosRes,
        lotesRes,
      ] = await Promise.all([
        api.get('/saida'),
        api.get('/produtos'),
        api.get('/lotes'),
      ])

      setItems(saidas.data.dados || [])
      setProdutos(produtosRes.data.dados || [])
      setLotes(lotesRes.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar saídas e dados relacionados.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <CrudPanel
      title="Saídas"
      kicker="MOVIMENTAÇÕES"
      search={search}
      setSearch={setSearch}
      canNew={podeCriar}
      onNew={() => setShow(true)}
    >
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Data',
          'Produto',
          'Lote',
          'Quantidade',
          'Preço unitário',
          'Valor total',
          'Motivo',
          'Usuário',
        ]}
        rows={filtered.map((item) => [
          formatDateTime(item.data),
          item.nome_produto,
          item.numero_lote,
          item.quantidade,
          formatCurrency(item.preco_produto),
          formatCurrency(
            Number(item.preco_produto || 0) *
              Number(item.quantidade || 0)
          ),
          item.motivo || '-',
          item.nome_usuario,
        ])}
      />

      {show && (
        <SaidaModal
          produtos={produtos}
          lotes={lotes}
          onClose={() =>
            setShow(false)
          }
          onSaved={async () => {
            setShow(false)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function SaidaModal({
  produtos,
  lotes,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    id_produto: '',
    id_lote: '',
    data: '',
    quantidade: '',
    motivo: '',
    rastreamento: '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/saida', {
        id_produto:
          Number(form.id_produto),
        id_lote:
          Number(form.id_lote),
        data: form.data,
        quantidade:
          Number(form.quantidade),
        motivo:
          form.motivo || null,
        rastreamento:
          form.rastreamento || null,
      })

      window.alert('Saída registrada com sucesso.')
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao cadastrar saída.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Nova saída"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Produto
          <select
            value={form.id_produto}
            onChange={(e) =>
              setForm({
                ...form,
                id_produto:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {produtos.map(
              (produto) => (
                <option
                  key={
                    produto.id_produto
                  }
                  value={
                    produto.id_produto
                  }
                >
                  {produto.nome}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Lote
          <select
            value={form.id_lote}
            onChange={(e) =>
              setForm({
                ...form,
                id_lote:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {lotes.map((lote) => (
              <option
                key={lote.id_lote}
                value={lote.id_lote}
              >
                {lote.numero_lote} -{' '}
                {lote.nome_produto}
              </option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <label>
            Data
            <input
              type="datetime-local"
              value={form.data}
              onChange={(e) =>
                setForm({
                  ...form,
                  data:
                    e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value={
                form.quantidade
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  quantidade:
                    e.target.value,
                })
              }
              required
            />
          </label>
        </div>

        <div className="price-summary">
          <span>Preço unitário</span>
          <strong>
            {formatCurrency(
              produtos.find(
                (produto) =>
                  Number(produto.id_produto) ===
                  Number(form.id_produto)
              )?.preco
            )}
          </strong>
          <span>Valor total</span>
          <strong>
            {formatCurrency(
              Number(
                produtos.find(
                  (produto) =>
                    Number(produto.id_produto) ===
                    Number(form.id_produto)
                )?.preco || 0
              ) * Number(form.quantidade || 0)
            )}
          </strong>
        </div>

        <label>
          Motivo
          <input
            value={form.motivo}
            onChange={(e) =>
              setForm({
                ...form,
                motivo:
                  e.target.value,
              })
            }
          />
        </label>

        <label>
          Rastreamento
          <input
            value={
              form.rastreamento
            }
            onChange={(e) =>
              setForm({
                ...form,
                rastreamento:
                  e.target.value,
              })
            }
          />
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   USUÁRIOS
========================= */

function Usuarios() {
  const [items, setItems] = useState([])
  const [cargos, setCargos] = useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()

  const podeListar =
    Number(user?.nivel_acesso) >= 2
  const podeGerenciar =
    Number(user?.nivel_acesso) >= 3

  async function carregar() {
    setLoadError('')

    try {
      const [usuarios, cargosRes] = await Promise.all([
        podeListar
          ? api.get('/usuarios')
          : api.get(`/usuarios/${user.id_usuario}`),
        api.get('/cargos'),
      ])

      setItems(
        podeListar
          ? usuarios.data.dados || []
          : usuarios.data.dados
            ? [usuarios.data.dados]
            : []
      )

      setCargos(
        cargosRes.data.dados || []
      )
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar os usuários e cargos.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [podeListar, user?.id_usuario])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  async function excluir(id) {
    if (!confirm('Excluir este usuário?')) {
      return
    }

    try {
      await api.delete(
        `/usuarios/${id}`
      )

      carregar()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Não foi possível excluir.'
      )
    }
  }

  return (
    <CrudPanel
      title="Usuários"
      kicker="ADMINISTRAÇÃO"
      search={search}
      setSearch={setSearch}
      canNew={podeGerenciar}
      onNew={() => setShow(true)}
    >
      {!podeListar && (
        <p className="muted">
          Seu nível de acesso permite consultar apenas seu próprio cadastro.
        </p>
      )}

      {loadError && (
        <p className="error">{loadError}</p>
      )}

      <Table
        headers={[
          'Nome',
          'E-mail',
          'Setor',
          'Cargo',
          'Nível',
          'Cadastro',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          item.nome,
          item.email,
          item.setor,
          item.nome_cargo,
          <Badge>
            Nível {item.nivel_acesso}
          </Badge>,
          formatDate(item.dt_cadastro),
          <Actions
            canEdit={
              podeGerenciar ||
              Number(item.id_usuario) ===
                Number(user?.id_usuario)
            }
            canDelete={podeGerenciar}
            onEdit={() => {
              setEdit(item)
              setShow(true)
            }}
            onDelete={() =>
              excluir(item.id_usuario)
            }
          />,
        ])}
      />

      {show && (
        <UsuarioModal
          item={edit}
          canManage={podeGerenciar}
          cargos={cargos}
          onClose={() => {
            setShow(false)
            setEdit(null)
          }}
          onSaved={async () => {
            setShow(false)
            setEdit(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function UsuarioModal({
  item,
  canManage,
  cargos,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    nome: item?.nome || '',
    email: item?.email || '',
    senha: '',
    senha_atual: '',
    setor: item?.setor || 'estoque',
    id_cargo: item?.id_cargo || '',
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      if (item) {
        const dados = {
          nome: form.nome,
        }

        if (canManage) {
          Object.assign(dados, {
            email: form.email,
            setor: form.setor,
            id_cargo: Number(form.id_cargo),
          })
        }

        if (form.senha) {
          dados.senha = form.senha
          if (!canManage) {
            dados.senha_atual = form.senha_atual
          }
        }

        await api.patch(
          `/usuarios/${item.id_usuario}`,
          dados
        )
      } else {
        await api.post('/usuarios', {
          ...form,
          id_cargo:
            Number(form.id_cargo),
        })
      }

      window.alert(
        item
          ? 'Usuário atualizado com sucesso.'
          : 'Usuário cadastrado com sucesso.'
      )
      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao cadastrar usuário.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={item ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Nome
          <input
            value={form.nome}
            onChange={(e) =>
              setForm({
                ...form,
                nome: e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            disabled={Boolean(item) && !canManage}
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
            required
          />
        </label>

        {(!item || canManage) && (
          <label>
            {item ? 'Nova senha (opcional)' : 'Senha'}
            <input
              type="password"
              value={form.senha}
              onChange={(e) =>
                setForm({
                  ...form,
                  senha: e.target.value,
                })
              }
              required={!item}
            />
          </label>
        )}

        {item && !canManage && (
          <label>
            Nova senha (opcional)
            <input
              type="password"
              value={form.senha}
              onChange={(e) =>
                setForm({
                  ...form,
                  senha: e.target.value,
                })
              }
            />
          </label>
        )}

        {item && !canManage && form.senha && (
          <label>
            Senha atual
            <input
              type="password"
              value={form.senha_atual}
              onChange={(e) =>
                setForm({
                  ...form,
                  senha_atual: e.target.value,
                })
              }
              required
            />
          </label>
        )}

        {(!item || canManage) && <label>
          Setor
          <select
            value={form.setor}
            onChange={(e) =>
              setForm({
                ...form,
                setor:
                  e.target.value,
              })
            }
          >
            <option value="gerencia">
              Gerência
            </option>

            <option value="estoque">
              Estoque
            </option>

            <option value="vendas">
              Vendas
            </option>
          </select>
        </label>}

        {(!item || canManage) && <label>
          Cargo
          <select
            value={form.id_cargo}
            onChange={(e) =>
              setForm({
                ...form,
                id_cargo:
                  e.target.value,
              })
            }
            required
          >
            <option value="">
              Selecione
            </option>

            {cargos.map((cargo) => (
              <option
                key={
                  cargo.id_cargo
                }
                value={
                  cargo.id_cargo
                }
              >
                {cargo.nome_cargo} -
                Nível{' '}
                {cargo.nivel_acesso}
              </option>
            ))}
          </select>
        </label>}

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   CARGOS
========================= */

function Cargos() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [edit, setEdit] = useState(null)
  const [loadError, setLoadError] = useState('')

  const user = getUsuario()

  const podeGerenciar =
    Number(user?.nivel_acesso) >= 3

  async function carregar() {
    setLoadError('')

    try {
      const response = await api.get('/cargos')
      setItems(response.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar os cargos.'
      )
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  async function excluir(id) {
    if (!confirm('Excluir este cargo?')) {
      return
    }

    try {
      await api.delete(
        `/cargos/${id}`
      )

      carregar()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Não foi possível excluir.'
      )
    }
  }

  return (
    <CrudPanel
      title="Cargos"
      kicker="ADMINISTRAÇÃO"
      search={search}
      setSearch={setSearch}
      canNew={podeGerenciar}
      onNew={() => {
        setEdit(null)
        setShow(true)
      }}
    >
      {loadError && (
        <p className="error">{loadError}</p>
      )}

      <Table
        headers={[
          'Cargo',
          'Nível',
          'Descrição',
          'Ações',
        ]}
        rows={filtered.map((item) => [
          item.nome_cargo,

          <Badge>
            Nível {item.nivel_acesso}
          </Badge>,

          item.descricao || '-',

          <Actions
            canEdit={
              podeGerenciar
            }
            canDelete={
              podeGerenciar
            }
            onEdit={() => {
              setEdit(item)
              setShow(true)
            }}
            onDelete={() =>
              excluir(
                item.id_cargo
              )
            }
          />,
        ])}
      />

      {show && (
        <CargoModal
          item={edit}
          onClose={() => {
            setShow(false)
            setEdit(null)
          }}
          onSaved={async () => {
            setShow(false)
            setEdit(null)
            await carregar()
          }}
        />
      )}
    </CrudPanel>
  )
}

function CargoModal({
  item,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    nome_cargo:
      item?.nome_cargo || '',
    descricao:
      item?.descricao || '',
    nivel_acesso:
      item?.nivel_acesso || 1,
  })

  const [loading, setLoading] =
    useState(false)

  async function salvar(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const body = {
        ...form,
        nivel_acesso:
          Number(
            form.nivel_acesso
          ),
      }

      if (item) {
        await api.patch(
          `/cargos/${item.id_cargo}`,
          body
        )
      } else {
        await api.post(
          '/cargos',
          body
        )
      }

      await onSaved()
    } catch (error) {
      alert(
        error.response?.data?.mensagem ||
          'Erro ao salvar cargo.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        item
          ? 'Editar cargo'
          : 'Novo cargo'
      }
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={salvar}
      >
        <label>
          Nome do cargo
          <input
            value={
              form.nome_cargo
            }
            onChange={(e) =>
              setForm({
                ...form,
                nome_cargo:
                  e.target.value,
              })
            }
            required
          />
        </label>

        <label>
          Descrição
          <input
            value={
              form.descricao
            }
            onChange={(e) =>
              setForm({
                ...form,
                descricao:
                  e.target.value,
              })
            }
          />
        </label>

        <label>
          Nível de acesso
          <select
            value={
              form.nivel_acesso
            }
            onChange={(e) =>
              setForm({
                ...form,
                nivel_acesso:
                  e.target.value,
              })
            }
          >
            <option value="1">
              1 - Vendedor
            </option>

            <option value="2">
              2 - Estoquista
            </option>

            <option value="3">
              3 - Gerente
            </option>
          </select>
        </label>

        <ModalActions
          onClose={onClose}
          loading={loading}
        />
      </form>
    </Modal>
  )
}

/* =========================
   AJUSTES
========================= */

function Ajustes() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loadError, setLoadError] = useState('')
  const podeConsultar = Number(getUsuario()?.nivel_acesso) >= 2

  async function carregar() {
    setLoadError('')

    try {
      const response = await api.get('/ajustes')
      setItems(response.data.dados || [])
    } catch (error) {
      setLoadError(
        error.response?.data?.mensagem ||
          'Não foi possível carregar o histórico de ajustes.'
      )
    }
  }

  useEffect(() => {
    if (podeConsultar) carregar()
  }, [podeConsultar])

  const filtered = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <CrudPanel
      title="Ajustes de estoque"
      kicker="AUDITORIA"
      search={search}
      setSearch={setSearch}
      canNew={false}
    >
      {!podeConsultar && (
        <p className="muted">
          Seu nível de acesso não permite consultar o histórico de ajustes.
        </p>
      )}
      {loadError && <p className="error" role="alert">{loadError}</p>}
      <Table
        headers={[
          'Data',
          'Produto',
          'Anterior',
          'Nova',
          'Diferença',
          'Motivo',
          'Usuário',
        ]}
        rows={filtered.map((item) => [
          formatDateTime(
            item.ajuste_em || item.data
          ),

          item.nome_produto ||
            item.produto ||
            '-',

          item.qtd_anterior ??
            item.anterior ??
            '-',

          item.qtd_nova ??
            item.nova ??
            '-',

          <span
            className={
              Number(
                item.diferenca
              ) < 0
                ? 'negative'
                : 'positive'
            }
          >
            {Number(
              item.diferenca
            ) > 0
              ? '+'
              : ''}
            {item.diferenca}
          </span>,

          item.motivo || '-',

          item.nome_usuario ||
            item.usuario ||
            '-',
        ])}
      />
    </CrudPanel>
  )
}

/* =========================
   COMPONENTES
========================= */

function CrudPanel({
  title,
  kicker,
  search,
  setSearch,
  onNew,
  canNew,
  children,
}) {
  const [sortDraft, setSortDraft] = useState('')
  const [appliedSort, setAppliedSort] = useState('')

  return (
    <Panel
      title={title}
      kicker={kicker}
      action={
        canNew ? (
          <button
            className="btn primary"
            onClick={onNew}
          >
            <Plus size={16} />
            Novo
          </button>
        ) : null
      }
    >
      <div className="toolbar">
        {setSearch && (
          <div className="search">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder={
                'Buscar em ' +
                title.toLowerCase() +
                '...'
              }
            />
          </div>
        )}

        <select
          className="filter-select"
          aria-label="Ordenar registros"
          value={sortDraft}
          onChange={(event) =>
            setSortDraft(event.target.value)
          }
        >
          <option value="">Sem ordenação</option>
          <option value="price-desc">Mais caro</option>
          <option value="price-asc">Mais barato</option>
          <option value="date-asc">Mais antigo</option>
          <option value="date-desc">Mais novo</option>
        </select>

        <button
          className="btn secondary"
          type="button"
          onClick={() => setAppliedSort(sortDraft)}
        >
          Aplicar filtro
        </button>
      </div>

      <TableSortContext.Provider value={appliedSort}>
        {children}
      </TableSortContext.Provider>
    </Panel>
  )
}

function Panel({
  title,
  kicker,
  children,
  action,
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <small className="kicker">
            {kicker}
          </small>

          <h2>{title}</h2>
        </div>

        {action}
      </div>

      {children}
    </section>
  )
}

function Table({
  headers,
  rows,
}) {
  const sortMode = useContext(TableSortContext)
  const priceSort = sortMode.startsWith('price-')
  const sortColumn = headers.findIndex((header) =>
    priceSort
      ? /preço|valor/i.test(header)
      : /data|cadastro|fabricação|validade|ajuste/i.test(header)
  )
  const sortedRows =
    sortColumn < 0
      ? rows
      : [...rows].sort((rowA, rowB) => {
          const valueA = getSortableValue(rowA[sortColumn], priceSort)
          const valueB = getSortableValue(rowB[sortColumn], priceSort)
          const result =
            typeof valueA === 'number' &&
            typeof valueB === 'number'
              ? valueA - valueB
              : String(valueA).localeCompare(String(valueB), 'pt-BR')

          return sortMode.endsWith('desc') ? -result : result
        })

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(
              (header) => (
                <th key={header}>
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {sortedRows.length ? (
            sortedRows.map(
              (row, index) => (
                <tr key={index}>
                  {row.map(
                    (cell, i) => (
                      <td key={i}>
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              )
            )
          ) : (
            <tr>
              <td
                colSpan={
                  headers.length
                }
              >
                <Empty text="Nenhum registro encontrado." />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function getSortableValue(value, isPrice) {
  const text =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : value?.props?.children

  if (isPrice) {
    const normalized = String(text || '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:,|$))/g, '')
      .replace(',', '.')

    return Number(normalized) || 0
  }

  const date = String(text || '').match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/
  )

  if (date) {
    return new Date(
      Number(date[3]),
      Number(date[2]) - 1,
      Number(date[1]),
      Number(date[4] || 0),
      Number(date[5] || 0)
    ).getTime()
  }

  const timestamp = Date.parse(String(text || ''))
  return Number.isNaN(timestamp) ? String(text || '') : timestamp
}

function Actions({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  if (!canEdit && !canDelete) {
    return '-'
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
      }}
    >
      {canEdit && (
        <button
          className="btn secondary"
          title="Editar"
          onClick={onEdit}
        >
          <Pencil size={14} />
        </button>
      )}

      {canDelete && (
        <button
          className="btn secondary"
          title="Excluir"
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="modal-layer">
      <div className="modal">
        <div className="modal-head">
          <div>
            <small className="kicker">
              CADASTRO
            </small>

            <h2>{title}</h2>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            type="button"
          >
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function ModalActions({
  onClose,
  loading,
}) {
  return (
    <div className="modal-actions">
      <button
        type="button"
        className="btn secondary"
        onClick={onClose}
      >
        Cancelar
      </button>

      <button
        type="submit"
        className="btn primary"
        disabled={loading}
      >
        {loading
          ? 'Salvando...'
          : 'Salvar cadastro'}
      </button>
    </div>
  )
}

function Stat({
  icon: Icon,
  title,
  value,
  danger,
}) {
  return (
    <div className="stat">
      <div
        className={
          'icon-box ' +
          (danger ? 'danger' : '')
        }
      >
        <Icon size={20} />
      </div>

      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function Quick({
  to,
  icon: Icon,
  text,
}) {
  return (
    <NavLink
      to={'/' + to}
      className="quick"
    >
      <Icon size={19} />
      <span>{text}</span>
    </NavLink>
  )
}

function Badge({
  children,
  danger,
}) {
  return (
    <span
      className={
        'badge ' +
        (danger
          ? 'danger'
          : 'success')
      }
    >
      {children}
    </span>
  )
}

function Empty({ text }) {
  return (
    <div className="empty">
      <Boxes size={28} />
      <p>{text}</p>
    </div>
  )
}

function SimpleList({
  items,
  render,
}) {
  if (!items.length) {
    return (
      <Empty text="Nenhuma movimentação encontrada." />
    )
  }

  return (
    <div className="list">
      {items.map(
        (item, index) => (
          <div
            className="list-row"
            key={index}
          >
            <div className="icon-box">
              <ClipboardList
                size={17}
              />
            </div>

            <div className="grow">
              {render(item)}
            </div>
          </div>
        )
      )}
    </div>
  )
}

function Loading() {
  return (
    <Panel
      title="Carregando"
      kicker="ELETRODEX"
    >
      <div className="empty">
        <p>
          Carregando dados do Backend...
        </p>
      </div>
    </Panel>
  )
}

/* =========================
   FORMATAÇÃO
========================= */

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(
    value
  ).toLocaleDateString(
    'pt-BR'
  )
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return new Date(
    value
  ).toLocaleString(
    'pt-BR'
  )
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default App