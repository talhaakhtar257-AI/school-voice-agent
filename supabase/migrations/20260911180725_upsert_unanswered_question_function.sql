-- Feature 006: atomic increment-or-insert for unanswered questions.
--
-- PostgREST's upsert (what supabase-js .upsert() sends) can only overwrite a
-- conflicting row's columns with the values in the request -- it cannot
-- express "set times_asked to its current value plus one" the way a normal
-- INSERT ... ON CONFLICT DO UPDATE SET can from SQL. Wrapping that exact SQL
-- in a SECURITY DEFINER function (same pattern as reserve_voice_call, 005
-- migration) lets the app call it as one atomic statement instead of a
-- read-then-write from application code.
--
-- Only the service-role client (POST /api/unanswered, after the shared-secret
-- check) may call this -- EXECUTE revoked from public/anon/authenticated,
-- same as reserve_voice_call.

create or replace function upsert_unanswered_question(
  p_question_text text,
  p_language text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into unanswered_questions (question_text, language)
  values (p_question_text, p_language)
  on conflict (normalized_text)
  do update set
    times_asked = unanswered_questions.times_asked + 1,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function upsert_unanswered_question(text, text) from public;
revoke execute on function upsert_unanswered_question(text, text) from anon;
revoke execute on function upsert_unanswered_question(text, text) from authenticated;
