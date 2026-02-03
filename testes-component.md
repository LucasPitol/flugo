### 2️⃣ Testes de **widget** (component tests / integration)

Foco em:

* Fluxos do usuário
* Renderização + interação
* Estados vazios, loading, erro
* Regras de UI que garantem integridade

📍 Onde:

* `src/pages/**`
* componentes de formulário
* tabelas com interação

---

# 🧩 TESTES DE WIDGET — Tarefas orientadas a commit

---

### Commit 6 — Página de colaboradores (renderização)

**`test: render colaboradores list and empty state`**

**Alvo**

* `ColaboradoresPage`
* `ColaboradoresTable`

**Casos**

* Lista vazia → EmptyState
* Lista com dados → tabela renderizada
* StatusChip correto

📌 Garante estados básicos de UX

---

### Commit 7 — Filtros híbridos

**`test: apply name, email and department filters in colaboradores page`**

**Casos**

* Nome/email filtram localmente
* Departamento dispara refetch (mock)
* Limpar filtros restaura lista

📌 Mostra entendimento do trade-off documentado

---

### Commit 8 — Exclusão em massa

**`test: bulk delete colaboradores flow`**

**Casos**

* Selecionar múltiplos
* Botão “Excluir selecionados” aparece
* Confirmação
* Service chamado corretamente

📌 Fluxo crítico pedido explicitamente no desafio

---

### Commit 9 — Novo colaborador (regra de departamento)

**`test: prevent colaborador creation without departamento`**

**Casos**

* Nenhum departamento → Select desabilitado
* CTA “Criar departamento” visível
* Submit bloqueado
* Com departamento → fluxo normal

📌 Endereça exatamente o bug que você identificou

---

### Commit 10 — Regra do gestor responsável

**`test: gestor responsible field behavior by hierarchy level`**

**Casos**

* Nível = gestor → campo desabilitado
* Nível ≠ gestor → obrigatório
* Não pode selecionar a si mesmo

📌 Avaliador vai reconhecer isso na hora

---

### Commit 11 — Departamentos (fluxo principal)

**`test: departamentos CRUD and collaborator transfer flow`**

**Casos**

* Criar departamento sem gestor
* Editar departamento
* Adicionar/remover colaboradores
* Bloquear exclusão com colaboradores

📌 Fecha o último grande requisito

---

## 🧠 Observação estratégica (importante)

Você **não precisa cobrir 100% da UI**.

O que você está mostrando com esse plano:

* Entende **onde testar**
* Entende **o que vale a pena testar**
* Prioriza **regras de negócio e fluxos críticos**

Isso é exatamente o que um avaliador quer ver.

---

Um último commit:

Explicando:

* Unit vs Widget
* O que foi priorizado
* Por quê

