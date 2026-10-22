-- Additive upgrade: preserve boards, notes and existing editor invitations.
begin;
alter table public.nuvem_access add column if not exists role text not null default 'editor' check (role in ('reader','editor'));
grant update(role) on public.nuvem_access to authenticated;
drop policy if exists access_update on public.nuvem_access;
create policy access_update on public.nuvem_access for update to authenticated
using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));

-- Restrict existing write policies; readers retain the existing SELECT access.
drop policy if exists items_create on public.nuvem_items;
drop policy if exists items_update on public.nuvem_items;
drop policy if exists items_delete on public.nuvem_items;
create policy items_create on public.nuvem_items for insert to authenticated with check (
 exists(select 1 from public.nuvem_boards b where b.id=board_id and (b.owner_id=(select auth.uid()) or exists(
 select 1 from public.nuvem_access a where a.board_id=b.id and a.email=lower((select auth.jwt()->>'email')) and a.role='editor'))));
create policy items_update on public.nuvem_items for update to authenticated using (
 exists(select 1 from public.nuvem_boards b where b.id=board_id and (b.owner_id=(select auth.uid()) or exists(
 select 1 from public.nuvem_access a where a.board_id=b.id and a.email=lower((select auth.jwt()->>'email')) and a.role='editor'))))
with check (
 exists(select 1 from public.nuvem_boards b where b.id=board_id and (b.owner_id=(select auth.uid()) or exists(
 select 1 from public.nuvem_access a where a.board_id=b.id and a.email=lower((select auth.jwt()->>'email')) and a.role='editor'))));
create policy items_delete on public.nuvem_items for delete to authenticated using (
 exists(select 1 from public.nuvem_boards b where b.id=board_id and (b.owner_id=(select auth.uid()) or exists(
 select 1 from public.nuvem_access a where a.board_id=b.id and a.email=lower((select auth.jwt()->>'email')) and a.role='editor'))));

-- One command = one transaction. A stale update rolls back new inserts too.
create or replace function public.nuven_apply_board_changes(p_board_id uuid,p_changes jsonb)
returns integer language plpgsql security invoker set search_path='' as $$
declare change jsonb; item jsonb; expected timestamptz; changed integer:=0;
begin
 if auth.uid() is null then raise exception 'Entre na sua conta.' using errcode='42501'; end if;
 if jsonb_typeof(p_changes) is distinct from 'array' or jsonb_array_length(p_changes)>2000 then
   raise exception 'Comando excede o limite de elementos.';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_board_id::text,31));
 if not exists(select 1 from public.nuvem_boards b where b.id=p_board_id and (b.owner_id=auth.uid() or exists(
   select 1 from public.nuvem_access a where a.board_id=b.id and a.email=lower(auth.jwt()->>'email') and a.role='editor'))) then
   raise exception 'Sem permissão para editar este projeto.' using errcode='42501';
 end if;
 for change in select value from jsonb_array_elements(p_changes) loop
   item:=change->'data'; expected:=(change->>'expected_updated_at')::timestamptz;
   if jsonb_typeof(item) is distinct from 'object' or item->>'kind' not in ('nota','caixa','seta') or item->>'kind' is null then
     raise exception 'Elemento inválido.';
   end if;
   if expected is null then
     insert into public.nuvem_items(id,board_id,data) values((item->>'id')::uuid,p_board_id,item);
   else
     update public.nuvem_items set data=item,updated_at=clock_timestamp()
       where id=(item->>'id')::uuid and board_id=p_board_id and updated_at=expected;
     if not found then raise exception 'O projeto mudou em outra sessão. Atualize e envie novamente.' using errcode='40001'; end if;
   end if;
   changed:=changed+1;
 end loop;
 if (select count(*) from public.nuvem_items where board_id=p_board_id)>2000 then raise exception 'Projeto excede o limite de elementos.'; end if;
 return changed;
end; $$;
revoke all on function public.nuven_apply_board_changes(uuid,jsonb) from public,anon;
grant execute on function public.nuven_apply_board_changes(uuid,jsonb) to authenticated;
commit;
