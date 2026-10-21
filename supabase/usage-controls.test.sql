-- Executar somente em transação: todos os dados de teste são desfeitos.
begin;
insert into auth.users(id,email,email_confirmed_at) values ('00000000-0000-4000-8000-000000000001','qa-owner@example.invalid',now()),('00000000-0000-4000-8000-000000000002','qa-other@example.invalid',now());
insert into public.nuvem_boards(id,owner_id,title) values('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','QA rollback');
insert into nuven_private.account_limits(owner_id,storage_bytes,idea_limit,requests_per_minute) values('00000000-0000-4000-8000-000000000001',300,1,5);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","email":"qa-other@example.invalid","role":"authenticated"}',true);
do $$ begin
 if exists(select 1 from public.nuvem_boards where id='00000000-0000-4000-8000-000000000011') then raise exception 'FAIL: cross-account read'; end if;
 begin
 insert into public.nuvem_items(id,board_id,data) values(gen_random_uuid(),'00000000-0000-4000-8000-000000000011','{}');
 raise exception 'FAIL: cross-account write';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.nuvem_access(board_id,owner_id,email) values('00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000001','qa-other@example.invalid');
set local role authenticated;
do $$ begin
 if not exists(select 1 from public.nuvem_boards where id='00000000-0000-4000-8000-000000000011') then raise exception 'FAIL: invited account cannot read'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","email":"qa-owner@example.invalid","role":"authenticated"}',true);
select public.nuven_reserve_operation('idea');
do $$ begin
 begin perform public.nuven_reserve_operation('idea'); raise exception 'FAIL: quota bypass'; exception when sqlstate 'P0001' then if sqlerrm like 'FAIL:%' then raise; end if; end;
 insert into public.nuvem_items(id,board_id,data) values(gen_random_uuid(),'00000000-0000-4000-8000-000000000011','{"kind":"nota","texto":"QA"}');
 begin
 insert into public.nuvem_items(id,board_id,data) values(gen_random_uuid(),'00000000-0000-4000-8000-000000000011',jsonb_build_object('texto',repeat('x',400)));
 raise exception 'FAIL: storage bypass';
 exception when sqlstate 'P0001' then if sqlerrm like 'FAIL:%' then raise; end if; end;
end $$;
reset role;
select 'PASS: isolation, sharing, AI quota, storage quota; all test data rolled back' as result;

rollback;
