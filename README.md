# Pixie Seller

Painel web do vendedor da plataforma **Pixie**, um marketplace e comunidade de itens colecionáveis.
Projeto 1 da disciplina Desenvolvimento de Aplicações Web 3 (IFPB, Campus Esperança, 2026.2).

O Pixie tem duas aplicações:

- **Pixie Mobile**: app dos compradores, para explorar, favoritar e fazer propostas.
- **Pixie Seller** (este repositório): site em que o vendedor cadastra os itens da coleção e gerencia os anúncios.

## Funcionalidades

- **Painel**: totais por status do anúncio, valor anunciado, valor vendido, itens por categoria e últimos cadastros.
- **CRUD completo do Item de Coleção**: cadastrar, listar, ver detalhes, editar e excluir (com confirmação).
- **Listagem**: busca pelo nome, filtro por categoria e por status, e ordenação por data, nome ou preço.
- **Validação do formulário**: campos obrigatórios, tamanho dos textos, preço no formato brasileiro, quantidade inteira e URL da imagem.
- **Ciclo de vida do anúncio**: rascunho → publicado ⇄ pausado → vendido. Só aparecem as transições permitidas, e não é possível publicar um item sem preço ou sem estoque.
- **Feedback**: mensagens de sucesso e erro, indicadores de carregamento, telas de lista vazia e de erro com a opção "Tentar novamente".
- **Layout responsivo**: tabela no computador e cards no celular.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | React 19 + Next.js 16 (App Router), TypeScript |
| Estilo | Tailwind CSS 4 + componentes shadcn/ui (Base UI), ícones lucide-react |
| Persistência | Supabase (PostgreSQL na nuvem) via `@supabase/supabase-js` |

## Como executar

Pré-requisitos: Node.js 20 ou superior e acesso ao projeto Supabase.

```bash
git clone <url-do-repositorio>
cd pixie-dawIII
npm install
```

1. Crie o arquivo `.env.local` na raiz do projeto. Ele não vai para o Git. Os valores ficam no Supabase, em **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave publishable/anon>
   ```
   Use somente a chave **pública**. Nunca coloque a `service_role` neste arquivo.
2. No Supabase, abra **SQL Editor** e execute uma vez o script [`supabase/ajustes_pixie_seller.sql`](supabase/ajustes_pixie_seller.sql). Ele adiciona as colunas `marca` e `quantidade`, as políticas RLS e as categorias.
3. Inicie o servidor:
   ```bash
   npm run dev          # http://localhost:3000
   ```

### Executar no Android (RT05)

O computador e o celular precisam estar na mesma rede Wi-Fi.

```bash
npm run dev:rede     # ou: npm run build && npm run start:rede
```

- **Celular físico**: abra o Chrome em `http://<IP-do-computador>:3000`. O IP aparece no terminal, em "Network".
- **Emulador Android Studio**: abra o Chrome em `http://10.0.2.2:3000`.

## Estrutura

```
app/                      páginas (rotas do Next.js)
  page.tsx                painel inicial
  itens/page.tsx          listagem com busca, filtros e ordenação
  itens/novo/page.tsx     cadastro
  itens/[id]/page.tsx     detalhes, status e exclusão
  itens/[id]/editar/      edição
components/               componentes de interface (FormularioItem, ListaItens, ConfirmarExclusao...)
  ui/                     componentes base do shadcn/ui
hooks/useCarregarItem.ts  carrega um item pelo id, com estados de carregamento e erro
lib/
  supabase.ts             cliente do Supabase
  servicoItens.ts         camada de dados: única parte que acessa o banco
  validacao.ts            validação do formulário e regras de negócio do anúncio
  tipos.ts                tipos TypeScript (ItemColecao, StatusAnuncio...)
  formatacao.ts           formatação de moeda e data (pt-BR)
supabase/                 script SQL de ajuste do banco
docs/                     documentação do projeto
```

O fluxo é sempre o mesmo: **página → `servicoItens` → Supabase**. As páginas não montam consultas SQL, e as regras de negócio ficam em `lib/validacao.ts`.

## Capturas de tela

> Adicione os prints em `docs/prints/` e eles aparecem aqui.

| Painel | Listagem | Formulário | Detalhes |
|---|---|---|---|
| ![Painel](docs/prints/painel.png) | ![Listagem](docs/prints/listagem.png) | ![Formulário](docs/prints/formulario.png) | ![Detalhes](docs/prints/detalhes.png) |

## Documentação

Veja [`docs/DOCUMENTACAO.md`](docs/DOCUMENTACAO.md): tema, modelo de dados e justificativa do Supabase.
