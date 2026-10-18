-- Pixie Seller — ajustes no banco existente
-- Rodar uma vez no Supabase: Dashboard > SQL Editor > New query > colar > Run.
-- Script idempotente: pode ser executado de novo sem duplicar nada.
-- Não apaga tabelas nem dados.

-- 1) Colunas que o painel do vendedor precisa e que ainda não existem em "produtos"
alter table public.produtos add column if not exists marca text;
alter table public.produtos add column if not exists quantidade integer not null default 1;

-- 2) O painel web não tem login, então o produto é salvo sem vendedor.
--    (Se a coluna já aceitar nulo, este comando não muda nada.)
alter table public.produtos alter column vendedor_id drop not null;

-- 3) Regras de negócio básicas garantidas pelo próprio banco
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'produtos_preco_nao_negativo') then
    alter table public.produtos add constraint produtos_preco_nao_negativo check (preco >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'produtos_quantidade_nao_negativa') then
    alter table public.produtos add constraint produtos_quantidade_nao_negativa check (quantidade >= 0);
  end if;
end $$;

-- 4) Permissões (RLS). Sem login, a chave pública (anon) precisa poder ler e gravar.
--    ATENÇÃO: isso deixa a tabela aberta para quem tiver a URL e a chave pública.
--    Aceitável para o projeto acadêmico; em produção trocar por políticas com auth.uid().
alter table public.produtos enable row level security;
alter table public.categorias enable row level security;

drop policy if exists "pixie_seller_ler_produtos" on public.produtos;
drop policy if exists "pixie_seller_inserir_produtos" on public.produtos;
drop policy if exists "pixie_seller_atualizar_produtos" on public.produtos;
drop policy if exists "pixie_seller_excluir_produtos" on public.produtos;
drop policy if exists "pixie_seller_ler_categorias" on public.categorias;

create policy "pixie_seller_ler_produtos" on public.produtos for select to anon, authenticated using (true);
create policy "pixie_seller_inserir_produtos" on public.produtos for insert to anon, authenticated with check (true);
create policy "pixie_seller_atualizar_produtos" on public.produtos for update to anon, authenticated using (true) with check (true);
create policy "pixie_seller_excluir_produtos" on public.produtos for delete to anon, authenticated using (true);
create policy "pixie_seller_ler_categorias" on public.categorias for select to anon, authenticated using (true);

-- 5) Categorias novas, além das que o app mobile já cadastrou.
--    Compara sem diferenciar maiúsculas/minúsculas para não duplicar.
insert into public.categorias (nome)
select nome from (values
  ('Miniaturas e carrinhos'),
  ('Videogames e consoles')
) as novas(nome)
where not exists (select 1 from public.categorias c where lower(c.nome) = lower(novas.nome));

-- 6) Conferência: deve listar as colunas de produtos, incluindo marca e quantidade
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'produtos'
order by ordinal_position;
