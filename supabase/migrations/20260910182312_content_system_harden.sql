-- Harden feature 003 functions, following the Supabase security advisor.
--
-- 0011 function_search_path_mutable: set_updated_at had no fixed search_path.
-- 0028/0029 security-definer function executable by anon / authenticated:
--   publish_content must be reachable only from a server action using the
--   service-role client (which passes the verified staff id and email). It is
--   never called directly by the browser, by anon, or by a signed-in user.

alter function set_updated_at() set search_path = '';

revoke execute on function publish_content(uuid, text, jsonb) from public;
revoke execute on function publish_content(uuid, text, jsonb) from anon;
revoke execute on function publish_content(uuid, text, jsonb) from authenticated;
