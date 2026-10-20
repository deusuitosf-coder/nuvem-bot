-- Additive Nuven-only objects. Existing boards and other projects are preserved.
create schema if not exists nuven_private;
revoke all on schema nuven_private from public, anon;
grant usage on schema nuven_private to authenticated, service_role;

create table nuven_private.operations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  kind text not null check (kind in ('idea','document')),
  state text not null default 'reserved' check (state in ('reserved','completed','failed')),
  created_at timestamptz not null default now()
);
create index nuven_operations_owner_kind on nuven_private.operations(owner_id,kind,state);
alter table nuven_private.operations enable row level security;
revoke all on nuven_private.operations from public, anon, authenticated;

create function nuven_private.reserve_operation(p_kind text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); used int; operation_id uuid;
begin
  if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then
    raise exception 'Confirme seu e-mail antes de usar a IA.' using errcode='42501';
  end if;
  if p_kind not in ('idea','document') or p_kind is null then raise exception 'Tipo inválido.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  -- Abandoned reservations expire without charging the user.
  update nuven_private.operations set state='failed' where owner_id=uid and state='reserved' and created_at < now()-interval '5 minutes';
  select count(*) into used from nuven_private.operations where owner_id=uid and kind=p_kind and state in ('reserved','completed');
  if used >= (case when p_kind='document' then 1 else 2 end) then
    raise exception 'Os testes gratuitos desta categoria terminaram. Solicite um orçamento.';
  end if;
  insert into nuven_private.operations(owner_id,kind) values(uid,p_kind) returning id into operation_id;
  return operation_id;
end; $$;
revoke all on function nuven_private.reserve_operation(text) from public, anon;
grant execute on function nuven_private.reserve_operation(text) to authenticated;
create function public.nuven_reserve_operation(p_kind text) returns uuid language sql security invoker set search_path = '' as $$
  select nuven_private.reserve_operation(p_kind);
$$;
revoke all on function public.nuven_reserve_operation(text) from public, anon;
grant execute on function public.nuven_reserve_operation(text) to authenticated;

create function nuven_private.finish_operation(p_id uuid,p_success boolean) returns void
language sql security definer set search_path = '' as $$
  update nuven_private.operations set state=case when p_success then 'completed' else 'failed' end where id=p_id and state='reserved';
$$;
revoke all on function nuven_private.finish_operation(uuid,boolean) from public,anon,authenticated;
grant execute on function nuven_private.finish_operation(uuid,boolean) to service_role;
create function public.nuven_finish_operation(p_id uuid,p_success boolean) returns void language sql security invoker set search_path = '' as $$
  select nuven_private.finish_operation(p_id,p_success);
$$;
revoke all on function public.nuven_finish_operation(uuid,boolean) from public,anon,authenticated;
grant execute on function public.nuven_finish_operation(uuid,boolean) to service_role;

create function nuven_private.remaining_uses() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); ideas int; documents int;
begin
  if uid is null then raise exception 'Entre na conta.' using errcode='42501'; end if;
  select count(*) filter(where kind='idea'),count(*) filter(where kind='document') into ideas,documents
  from nuven_private.operations where owner_id=uid and (state='completed' or (state='reserved' and created_at >= now()-interval '5 minutes'));
  return jsonb_build_object('ideas',greatest(0,2-ideas),'documents',greatest(0,1-documents),'document_pages',3,'document_characters',6000);
end; $$;
revoke all on function nuven_private.remaining_uses() from public,anon;
grant execute on function nuven_private.remaining_uses() to authenticated;
create function public.nuven_remaining_uses() returns jsonb language sql security invoker set search_path = '' as $$
  select nuven_private.remaining_uses();
$$;
revoke all on function public.nuven_remaining_uses() from public,anon;
grant execute on function public.nuven_remaining_uses() to authenticated;

create table public.nuven_quote_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  scope text not null check (char_length(scope) between 1 and 1500),
  company text not null default '' check(char_length(company)<=120),
  service text not null check(service in ('simples','documentos','empresa')),
  units int not null check(units between 1 and 100),
  documents int not null default 0 check(documents between 0 and 100000),
  pages int not null default 0 check(pages between 0 and 100000),
  complexity text not null check(complexity in ('padrao','complexo')),
  state text not null default 'received' check(state in ('received','reviewing','approved','paid')),
  created_at timestamptz not null default now()
);
alter table public.nuven_quote_requests enable row level security;
revoke all on public.nuven_quote_requests from public,anon,authenticated;
grant select on public.nuven_quote_requests to authenticated;
grant insert(owner_id,scope,company,service,units,documents,pages,complexity) on public.nuven_quote_requests to authenticated;
create policy nuven_quote_owner_read on public.nuven_quote_requests for select to authenticated using ((select auth.uid())=owner_id);
create policy nuven_quote_owner_create on public.nuven_quote_requests for insert to authenticated with check ((select auth.uid())=owner_id and state='received');
create index nuven_quotes_owner on public.nuven_quote_requests(owner_id,created_at);

-- RLS does not protect TRUNCATE; browser roles must never have this privilege.
revoke truncate, references, trigger on public.nuvem_boards, public.nuvem_items, public.nuvem_access from anon, authenticated;
revoke all on public.nuvem_boards, public.nuvem_items, public.nuvem_access from anon;
create policy operations_direct_access_denied on nuven_private.operations for all to authenticated using (false) with check (false);
grant select,update on public.nuven_quote_requests to service_role;
