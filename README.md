# Flugo

App de gestão de colaboradores: listagem em tabela, cadastro em etapas, edição e exclusão individual, com **Firebase Auth** (login/cadastro) e persistência com **Firebase Firestore**.

Acesse [https://flugo-six.vercel.app](https://flugo-six.vercel.app).

## Stack

- **React 18** + **TypeScript** + **Vite**
- **MUI** (Material UI) + **React Router**
- **Firebase** (Auth + Firestore)

## Pré-requisitos

- Node.js 18+
- npm, yarn ou pnpm

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build e preview

```bash
npm run build
npm run preview
```

O build sai em `dist/`. O preview serve o build localmente.

## Funcionalidades

- **Login** (`/login`) e **Cadastro** (`/cadastro`): autenticação via Firebase Auth. Rotas privadas protegidas por `ProtectedRoute`.
- **Colaboradores** (`/colaboradores`): listagem em tabela com ordenação por nome, e-mail, departamento ou status; chips de status (Ativo/Inativo); **Filtros** (drawer com nome, e-mail, departamento; efetivados ao clicar em "Aplicar filtros" — departamento vai para query no Firestore, nome/e-mail filtrados localmente; "Limpar" zera e refaz fetch); botão “Novo colaborador”; quando há seleção, o header mostra “X selecionados” e “Excluir selecionados” (botão “Novo” e “Filtros” ficam ocultos). Botão “Editar” por linha abre **drawer de edição** (dados básicos + campos profissionais; Salvar / Excluir). Exclusão em massa via seleção e diálogo de confirmação.
- **Novo colaborador** (`/colaboradores/novo`): formulário em etapas (Infos Básicas → Infos Profissionais). Etapa 1: nome, e-mail, departamento, ativar ao criar. Etapa 2: cargo, data de admissão, nível hierárquico, gestor responsável (quando nível ≠ gestor), salário base (máscara BR); validação com Zod; persistência no Firestore.
- **Departamentos** (`/departamentos`): listagem em tabela (nome, gestor responsável opcional, nº de colaboradores); Novo departamento; Editar departamento (nome, gestor opcional, colaboradores vinculados; adicionar/remover com destino obrigatório para removidos). Transferência de colaboradores entre departamentos (pela edição do departamento ou pela edição do colaborador). Exclusão só permitida quando não há colaboradores vinculados.
- **404** (`/404`): página não encontrada.

## Arquitetura (front × back)

- **UI não conhece domínio:** páginas, hooks, contexts e components em `src/` **não** importam `back-end/domain`. Contratos da UI ficam em **services** (tipos, inputs, filtros).
- **Service é a fronteira:** apenas `src/services/*` pode importar `back-end/domain` e `back-end/interface`. O service mapeia DTOs do domínio para os tipos expostos à UI (e vice-versa).

**Regra do gestor responsável**

- Se **nível hierárquico = gestor:** o campo "Gestor responsável" é desabilitado e o `gestorId` é limpo (não persistido). Um gestor não tem gestor responsável.
- Se **nível ≠ gestor:** o campo "Gestor responsável" é obrigatório. O Select é populado com colaboradores cujo `nivelHierarquico === 'gestor'`. No modo edição, o próprio colaborador é excluído dessa lista (não pode ser gestor de si mesmo).
- Ao trocar o nível para "Gestor", o `gestorId` é limpo na UI e, no update, o campo é removido do documento no Firestore (`deleteField()`).

**Impacto no modelo e na persistência**

- **DTO / tipos UI:** `ColaboradorDTO`, `Colaborador` (UI), `CreateColaboradorInput` e `UpdateColaboradorInput` incluem esses campos como opcionais (exceto nas validações de formulário, onde são obrigatórios conforme as regras acima).
- **Firestore:** na escrita, `dataAdmissao` é normalizada para `Timestamp`; `salarioBase` para `number`; `cargo` e `gestorId` são gravados com `trim`. Na leitura, `Timestamp` é convertido para string ISO no DTO.
- **Validação:** schema Zod em `src/services/colaboradores/validation.ts` (cargo, dataAdmissao, nivelHierarquico obrigatórios; gestorId obrigatório apenas quando nível ≠ gestor; salarioBase obrigatório e > 0).

- O **gestor responsável** do departamento é **opcional**: quando informado, é um colaborador com `nivelHierarquico === 'gestor'`. O departamento não é obrigado a ter gestor.
- **Colaborador** possui campo `departamento` (string = nome do departamento). **Todo colaborador deve estar vinculado a um departamento** (não pode ficar sem). A consistência entre `colaborador.departamento` e `departamento.colaboradoresIds` é mantida em toda escrita (ver estratégia abaixo).

**Regras de integridade**

1. **Colaborador não pode existir sem departamento.** Todo colaborador deve ter `departamento` preenchido e pertencer a exatamente um departamento na lista `colaboradoresIds` desse departamento.
2. **Exclusão de departamento:** só é permitida quando `colaboradoresIds` está vazio. Caso contrário, a UI bloqueia (diálogo "Exclusão não permitida") e o usuário é orientado a transferir ou remover colaboradores antes.
3. **Remoção de colaborador de um departamento (na edição do departamento):** exige **seleção obrigatória do departamento de destino**. A UI não permite salvar com removidos e destino vazio; o service também valida e lança erro se destino estiver vazio.

**Estratégia de transferência (fluxos bidirecionais)**

Toda alteração que move um colaborador de um departamento a outro atualiza **os dois lados** para manter a consistência:

- **Ao adicionar colaborador a um departamento** (criar ou editar departamento):  
  O colaborador passa a ter `departamento` = nome do novo departamento; o **departamento anterior** tem o ID do colaborador removido de `colaboradoresIds`. Assim, nenhum departamento “antigo” fica com referência órfã.
- **Ao remover colaborador de um departamento** (editar departamento):  
  O usuário escolhe o **departamento de destino**; o colaborador tem `departamento` atualizado para o destino e o departamento destino ganha o ID em `colaboradoresIds`. Não há estado “colaborador sem departamento”.
- **Ao trocar departamento na edição do colaborador:**  
  O service de sincronização (`colaboradorDepartamentoSync`) atualiza o departamento antigo (remove o ID de `colaboradoresIds`), o novo departamento (adiciona o ID) e o colaborador (`departamento` = nome do novo). Uma única operação atômica na aplicação, com rollback em caso de falha.

A lógica de transferência e rollback está concentrada em:

- `departamentosService`: `criarDepartamentoEAtualizarColaboradores`, `updateDepartamentoEAtualizarColaboradores` (remover do antigo, atualizar colaborador, adicionar no novo; rollback em erro).
- `colaboradorDepartamentoSync`: `updateColaboradorESincronizarDepartamentos` (usado na edição do colaborador quando o departamento muda).

### Filtros híbridos (Colaboradores)

- **department → backend:** Firestore faz `where('departamento', '==', department)`. Igualdade é indexada e eficiente; refetch só quando o departamento aplicado muda.
- **name / email → local:** Aplicados no front sobre a lista já carregada (includes, case-insensitive). Firestore não oferece "contains" em texto de forma barata; filtrar localmente evita overfetch e mantém a UX responsiva para MVP. Se no futuro houver full-text search (ex.: Algolia/Elastic), name/email podem migrar para query remota.

## Estrutura do projeto

```
flugo/
├── public/
│   ├── images.jpeg
│   └── logo2.png
├── src/
│   ├── components/
│   │   ├── colaboradores/
│   │   │   └── ColaboradoresFilters.tsx   # Drawer de filtros (nome, email, departamento)
│   │   ├── Layout.tsx                     # Layout com sidebar e outlet
│   │   ├── ProtectedRoute.tsx             # Proteção de rotas privadas
│   │   └── ui/
│   │       ├── AppButton.tsx
│   │       ├── AppCard.tsx
│   │       ├── AppSnackbar.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── StatusChip.tsx
│   │       └── index.ts                   # Exporta componentes do design system
│   ├── contexts/
│   │   └── AuthContext.tsx                # Estado de autenticação (usa authService)
│   ├── pages/
│   │   ├── Cadastro.tsx
│   │   ├── Colaboradores/
│   │   │   ├── ColaboradoresPage.tsx      # Página: header, filtros, snackbars, diálogos
│   │   │   ├── ColaboradoresTable.tsx     # Tabela com ordenação e seleção
│   │   │   ├── ColaboradorEditDrawer.tsx  # Drawer de edição e exclusão única
│   │   │   ├── hooks/
│   │   │   │   └── useColaboradores.ts    # Listagem, filtros híbridos (remoto: dept; local: name, email), ordenação, edição
│   │   │   └── index.ts
│   │   ├── Departamentos/
│   │   │   ├── DepartamentosPage.tsx      # Página: header, snackbars, diálogo de exclusão
│   │   │   ├── DepartamentosTable.tsx     # Tabela (nome, gestor, nº colaboradores, ações)
│   │   │   ├── NovoDepartamento.tsx       # Formulário: nome, gestor, multi-select colaboradores
│   │   │   ├── EditarDepartamento.tsx     # Formulário: nome, gestor, colaboradores, destino para removidos
│   │   │   ├── hooks/
│   │   │   │   └── useDepartamentos.ts   # Listagem, exclusão, toasts (severity success/error)
│   │   │   └── index.ts
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   └── NovoColaborador.tsx
│   ├── services/
│   │   ├── auth/
│   │   │   ├── errors.ts                  # AuthServiceError (UI não conhece AuthError de back-end/data)
│   │   │   └── types.ts                   # Contrato UI: AuthUser
│   │   ├── authService.ts                 # login, register, logout, onAuthStateChanged (captura AuthError → AuthServiceError)
│   │   ├── colaboradores/
│   │   │   ├── types.ts                   # Contratos UI: Colaborador, CreateColaboradorInput, UpdateColaboradorInput, ColaboradoresFilter
│   │   │   └── validation.ts              # Schema Zod: campos profissionais, regra gestorId, getFieldErrors
│   │   ├── colaboradoresService.ts       # listar, criar, update, delete, bulkDelete (mapeia domain ↔ UI)
│   │   ├── colaboradorDepartamentoSync.ts # updateColaboradorESincronizarDepartamentos (transferência na edição do colaborador)
│   │   ├── departamentos/
│   │   │   └── types.ts                   # Contratos UI: Departamento, CreateDepartamentoInput, UpdateDepartamentoInput
│   │   └── departamentosService.ts       # listar, criar, update, delete; criarDepartamentoEAtualizarColaboradores, updateDepartamentoEAtualizarColaboradores
│   ├── utils/
│   │   └── formatBr.ts                    # formatBrCurrency, parseBrCurrency, maskBrCurrencyInput (padrão BR)
│   ├── theme/
│   │   ├── index.ts
│   │   ├── theme.ts
│   │   ├── tokens.ts
│   │   └── README.md
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── back-end/
│   ├── data/
│   │   ├── errors/
│   │   │   ├── AuthError.ts
│   │   │   └── RepositoryError.ts
│   │   ├── firebase/
│   │   │   ├── auth.ts
│   │   │   ├── colaborador.collection.ts
│   │   │   ├── departamento.collection.ts
│   │   │   └── config.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Colaborador.ts
│   │   │   └── Departamento.ts
│   │   ├── repositories/
│   │   │   ├── AuthRepository.ts
│   │   │   ├── ColaboradorRepository.ts
│   │   │   └── DepartamentoRepository.ts
│   │   └── types/
│   │       ├── AuthTypes.ts
│   │       ├── ColaboradorDTO.ts
│   │       ├── ColaboradoresFilter.ts
│   │       └── DepartamentoDTO.ts
│   └── interface/
│       ├── AuthGateway.ts
│       ├── ColaboradoresGateway.ts
│       └── DepartamentosGateway.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
└── .env
```

### Observação sobre arquitetura

- **`back-end/*`:** importado apenas por `src/services/*`. A UI (pages, hooks, contexts, components) não importa nada de `back-end/domain` nem de `back-end/data`. O authService captura `AuthError` da infraestrutura e lança `AuthServiceError` (camada de aplicação); Login e Cadastro usam apenas `AuthServiceError` de `src/services/auth/errors`. ✅

## Deploy (Vercel)

O `vercel.json` está configurado para build com Vite e output em `dist/`. Configure as variáveis de ambiente do projeto na Vercel (com o prefixo `VITE_`).
