-- Integration test: real PostgreSQL/RLS, no emails or durable test accounts.
begin;
insert into auth.users(id,email,email_confirmed_at) values
 ('a2200000-0000-4000-8000-000000000001','nuvem-owner@example.invalid',now()),
 ('a2200000-0000-4000-8000-000000000002','nuvem-editor@example.invalid',now()),
 ('a2200000-0000-4000-8000-000000000003','nuvem-reader@example.invalid',now()),
 ('a2200000-0000-4000-8000-000000000004','nuvem-stranger@example.invalid',now());
insert into public.nuvem_boards(id,owner_id,title) values ('b2200000-0000-4000-8000-000000000001','a2200000-0000-4000-8000-000000000001','Transactional fixture');
insert into public.nuvem_access(board_id,owner_id,email,role) values
 ('b2200000-0000-4000-8000-000000000001','a2200000-0000-4000-8000-000000000001','nuvem-editor@example.invalid','editor'),
 ('b2200000-0000-4000-8000-000000000001','a2200000-0000-4000-8000-000000000001','nuvem-reader@example.invalid','reader');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2200000-0000-4000-8000-000000000001","email":"nuvem-owner@example.invalid","role":"authenticated"}',true);
select public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[{"data":{"id":"c2200000-0000-4000-8000-000000000001","kind":"nota","texto":"Original","cor":"sky","x":16,"y":16},"expected_updated_at":null}]');
do $$ begin
 begin
  perform public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[{"data":{"id":"c2200000-0000-4000-8000-000000000002","kind":"nota","texto":"Must roll back","cor":"sky","x":16,"y":16},"expected_updated_at":null},{"data":{"id":"c2200000-0000-4000-8000-000000000001","kind":"nota","texto":"Stale","cor":"sky","x":16,"y":16},"expected_updated_at":"2000-01-01T00:00:00Z"}]');
  raise exception 'Expected a stale-write error';
 exception when serialization_failure then null;
 end;
 if exists(select 1 from public.nuvem_items where id='c2200000-0000-4000-8000-000000000002') then raise exception 'Partial insert escaped rollback'; end if;
 if (select data->>'texto' from public.nuvem_items where id='c2200000-0000-4000-8000-000000000001')<>'Original' then raise exception 'Original was changed'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"a2200000-0000-4000-8000-000000000002","email":"nuvem-editor@example.invalid","role":"authenticated"}',true);
select public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[{"data":{"id":"c2200000-0000-4000-8000-000000000003","kind":"nota","texto":"Editor can save","cor":"sky","x":16,"y":16},"expected_updated_at":null}]');
select set_config('request.jwt.claims','{"sub":"a2200000-0000-4000-8000-000000000003","email":"nuvem-reader@example.invalid","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.nuvem_items where board_id='b2200000-0000-4000-8000-000000000001')<>2 then raise exception 'Reader cannot read'; end if;
 begin
  perform public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[]');
  raise exception 'Reader RPC allowed';
 exception when insufficient_privilege then null;
 end;
 update public.nuvem_items set data='{}' where board_id='b2200000-0000-4000-8000-000000000001';
 if found then raise exception 'Reader direct update allowed'; end if;
 delete from public.nuvem_items where board_id='b2200000-0000-4000-8000-000000000001';
 if found then raise exception 'Reader direct delete allowed'; end if;
 begin
  insert into public.nuvem_items(id,board_id,data) values('c2200000-0000-4000-8000-000000000004','b2200000-0000-4000-8000-000000000001','{}');
  raise exception 'Reader direct insert allowed';
 exception when insufficient_privilege then null;
 end;
 update public.nuvem_access set role='editor' where board_id='b2200000-0000-4000-8000-000000000001';
 if found then raise exception 'Reader elevated own permission'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"a2200000-0000-4000-8000-000000000004","email":"nuvem-stranger@example.invalid","role":"authenticated"}',true);
do $$ begin
 if exists(select 1 from public.nuvem_boards where id='b2200000-0000-4000-8000-000000000001') or exists(select 1 from public.nuvem_items where board_id='b2200000-0000-4000-8000-000000000001') then raise exception 'Stranger can read'; end if;
 begin
  perform public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[]');
  raise exception 'Stranger RPC allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
delete from public.nuvem_access where email='nuvem-editor@example.invalid' and board_id='b2200000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a2200000-0000-4000-8000-000000000002","email":"nuvem-editor@example.invalid","role":"authenticated"}',true);
do $$ begin
 if exists(select 1 from public.nuvem_items where board_id='b2200000-0000-4000-8000-000000000001') then raise exception 'Revoked editor still reads'; end if;
 begin
  perform public.nuven_apply_board_changes('b2200000-0000-4000-8000-000000000001','[]');
  raise exception 'Revoked editor still writes';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
rollback;
select 'PASS: owner, editor, reader, stranger, revocation and atomic conflict rollback; all fixtures removed' as result;
