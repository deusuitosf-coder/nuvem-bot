-- Additive, fail-closed guard. Existing account quotas remain in force.
begin;
create table if not exists nuven_private.service_limits (
 singleton boolean primary key default true check(singleton),
 max_monthly_attempts integer not null default 1000 check(max_monthly_attempts>=0),
 max_minute_attempts integer not null default 20 check(max_minute_attempts>=0)
);
alter table nuven_private.service_limits enable row level security;
revoke all on nuven_private.service_limits from public,anon,authenticated;
grant select,update on nuven_private.service_limits to service_role;
insert into nuven_private.service_limits(singleton) values(true) on conflict do nothing;
create index if not exists nuven_operations_created_at on nuven_private.operations(created_at);
create or replace function nuven_private.guard_global_ai_attempts() returns trigger
language plpgsql security invoker set search_path='' as $$
declare monthly integer; per_minute integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(762300221);
 select max_monthly_attempts,max_minute_attempts into monthly,per_minute
 from nuven_private.service_limits where singleton=true;
 if not found then raise exception 'A IA está temporariamente indisponível.' using errcode='P0001'; end if;
 if (select count(*) from nuven_private.operations where created_at>=date_trunc('month',now() at time zone 'UTC') at time zone 'UTC')>=monthly then
  raise exception 'O limite mensal do serviço foi atingido.' using errcode='P0001';
 end if;
 if (select count(*) from nuven_private.operations where created_at>now()-interval '1 minute')>=per_minute then
  raise exception 'Aguarde um minuto antes de tentar novamente.' using errcode='P0001';
 end if;
 return new;
end; $$;
revoke all on function nuven_private.guard_global_ai_attempts() from public,anon,authenticated;
drop trigger if exists nuven_global_ai_guard on nuven_private.operations;
create trigger nuven_global_ai_guard before insert on nuven_private.operations
for each row execute function nuven_private.guard_global_ai_attempts();
commit;
