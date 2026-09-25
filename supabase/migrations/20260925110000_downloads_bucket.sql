-- Feature 011, stage D: files parents can download, such as the admission form.
--
-- Plain English (approved with the 011 plan on 2026-09-25): a new public file
-- store called "downloads". Anyone with a file's link can download it — that
-- is the point, parents get the admission form. Only signed-in staff can add,
-- replace or remove files. PDFs only, up to 4 MB. Nothing existing changes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('downloads', 'downloads', true, 4194304, array['application/pdf'])
on conflict (id) do nothing;

create policy downloads_staff_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'downloads');

create policy downloads_staff_update on storage.objects
  for update to authenticated using (bucket_id = 'downloads') with check (bucket_id = 'downloads');

create policy downloads_staff_delete on storage.objects
  for delete to authenticated using (bucket_id = 'downloads');
