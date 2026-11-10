-- Fresh-project schema for this demo: only customer-owned delivery addresses.
-- Supabase Auth separately manages login credentials in auth.users.

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  address_type text not null default 'shipping' check (address_type = 'shipping'),
  recipient_name text not null check (char_length(trim(recipient_name)) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 32),
  address_line_1 text not null check (char_length(trim(address_line_1)) between 1 and 200),
  address_line_2 text check (address_line_2 is null or char_length(address_line_2) <= 200),
  city text not null check (char_length(trim(city)) between 1 and 120),
  region text check (region is null or char_length(region) <= 120),
  postal_code text not null check (char_length(trim(postal_code)) between 1 and 24),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customer_addresses_one_default_per_user
  on public.customer_addresses (user_id)
  where is_default;
create index customer_addresses_user_id_idx
  on public.customer_addresses (user_id);

alter table public.customer_addresses enable row level security;
