-- Additive controls: preserve all existing projects, users and operations.
create table if not exists nuven_private.account_limits (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 idea_limit integer not null default 2 check(idea_limit>=0),
 document_limit integer not null default 1 check(document_limit>=0),
 storage_bytes bigint not null default 10485760 check(storage_bytes>=0),
 requests_per_minute integer not null default 5 check(requests_per_minute between 1 and 100),
 board_limit integer not null default 20 check(board_limit>=0)
);
alter table nuven_private.account_limits enable row level security;
revoke all on nuven_private.account_limits from public,anon,authenticated;
grant all on nuven_private.account_limits to service_role;

create or replace function nuven_private.reserve_operation(p_kind text) returns uuid
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); used integer; lim integer; rate integer; operation_id uuid;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and email_confirmed_at is not null) then raise exception 'Confirme seu e-mail.' using errcode='42501'; end if;
 if p_kind is null or p_kind not in ('idea','document') then raise exception 'Tipo inválido.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select case when p_kind='idea' then idea_limit else document_limit end,requests_per_minute into lim,rate from nuven_private.account_limits where owner_id=uid;
 lim:=coalesce(lim,case when p_kind='idea' then 2 else 1 end); rate:=coalesce(rate,5);
 if (select count(*) from nuven_private.operations where owner_id=uid and created_at>now()-interval '1 minute')>=rate then raise exception 'Aguarde um minuto antes de tentar novamente.' using errcode='P0001'; end if;
 update nuven_private.operations set state='failed' where owner_id=uid and state='reserved' and created_at<now()-interval '5 minutes';
 select count(*) into used from nuven_private.operations where owner_id=uid and kind=p_kind and state in ('reserved','completed');
 if used>=lim then raise exception 'Cota de IA atingida.' using errcode='P0001'; end if;
 insert into nuven_private.operations(owner_id,kind) values(uid,p_kind) returning id into operation_id;
 return operation_id;
end; $$;
revoke all on function nuven_private.reserve_operation(text) from public,anon;
grant execute on function nuven_private.reserve_operation(text) to authenticated;

create or replace function nuven_private.remaining_uses() returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); ideas integer; docs integer; lim_ideas integer; lim_docs integer; max_bytes bigint; used_bytes bigint;
begin
 if uid is null then raise exception 'Entre na conta.' using errcode='42501'; end if;
 select idea_limit,document_limit,storage_bytes into lim_ideas,lim_docs,max_bytes from nuven_private.account_limits where owner_id=uid;
 lim_ideas:=coalesce(lim_ideas,2);lim_docs:=coalesce(lim_docs,1);max_bytes:=coalesce(max_bytes,10485760);
 select count(*) filter(where kind='idea'),count(*) filter(where kind='document') into ideas,docs from nuven_private.operations where owner_id=uid and (state='completed' or(state='reserved' and created_at>=now()-interval '5 minutes'));
 select coalesce(sum(octet_length(i.data::text)),0) into used_bytes from public.nuvem_items i join public.nuvem_boards b on b.id=i.board_id where b.owner_id=uid;
 return jsonb_build_object('ideas',greatest(0,lim_ideas-ideas),'documents',greatest(0,lim_docs-docs),'idea_limit',lim_ideas,'document_limit',lim_docs,'storage_bytes',used_bytes,'storage_limit_bytes',max_bytes,'document_pages',3,'document_characters',6000);
end; $$;
revoke all on function nuven_private.remaining_uses() from public,anon;
grant execute on function nuven_private.remaining_uses() to authenticated;

create or replace function nuven_private.enforce_storage() returns trigger
language plpgsql security definer set search_path='' as $$
declare owner uuid; bytes_used bigint; max_bytes bigint; count_used integer; old_size integer:=0;
begin
 if TG_OP='UPDATE' and (new.board_id<>old.board_id or new.id<>old.id) then raise exception 'Não é permitido mover identificadores entre projetos.'; end if;
 select owner_id into owner from public.nuvem_boards where id=new.board_id;
 if owner is null then raise exception 'Projeto não encontrado.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text,1));
 select storage_bytes into max_bytes from nuven_private.account_limits where owner_id=owner;
 max_bytes:=coalesce(max_bytes,10485760);
 select coalesce(sum(octet_length(i.data::text)),0) into bytes_used from public.nuvem_items i join public.nuvem_boards b on b.id=i.board_id where b.owner_id=owner;
 if TG_OP='UPDATE' then old_size:=octet_length(old.data::text); end if;
 if bytes_used-old_size+octet_length(new.data::text)>max_bytes then raise exception 'Cota de armazenamento atingida.'; end if;
 select count(*) into count_used from public.nuvem_items where board_id=new.board_id;
 if TG_OP='INSERT' and count_used>=2000 then raise exception 'Limite de elementos do projeto atingido.'; end if;
 return new;
end; $$;
revoke all on function nuven_private.enforce_storage() from public,anon,authenticated;
create trigger nuven_storage_guard before insert or update on public.nuvem_items for each row execute function nuven_private.enforce_storage();
