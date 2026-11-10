-- Supabase exposes only each signed-in customer's own delivery addresses.

revoke all on public.customer_addresses from public, anon, authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;

create policy "Customers read own delivery addresses"
  on public.customer_addresses for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Customers add own delivery addresses"
  on public.customer_addresses for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Customers update own delivery addresses"
  on public.customer_addresses for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Customers delete own delivery addresses"
  on public.customer_addresses for delete to authenticated
  using (user_id = (select auth.uid()));
