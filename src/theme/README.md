# Design system — guia de estilo centralizado

Tema e tokens em um único lugar para manter consistência visual e facilitar escala.

## Estrutura

- **`tokens.ts`** — Tokens de design: cores, tipografia, espaçamentos, breakpoints, sombras, estados (hover, disabled, error).
- **`theme.ts`** — Tema MUI que consome os tokens; componentes MUI herdam estilos daqui.
- **`index.ts`** — Exporta `theme` (para `ThemeProvider`) e tokens (para uso em `sx` ou styled).

## Uso

1. **Tema**: o `App` já usa `ThemeProvider` com `theme`; não é necessário importar em cada tela.
2. **Tokens em componentes**: quando precisar de valores (ex: cor em `sx`), importe de `../theme`:
   ```ts
   import { colors, typography, states } from '../theme';
   ```
3. **Componentes base**: use os componentes em `components/ui` (AppButton, AppCard, PageHeader, EmptyState, StatusChip, AppSnackbar) nas telas para evitar estilos locais e duplicação.

## Regras

- Não definir cores/estilos hardcoded nas telas; usar tokens ou tema.
- Novas telas devem usar os componentes base e o tema; mudanças de design devem ser feitas em `tokens.ts` ou `theme.ts` para impactar o mínimo de código.
