-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- Function to auto-update updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Listings table
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2),
  address text,
  city text,
  state text,
  country text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  bedrooms integer,
  bathrooms integer,
  area integer,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger for updated_at
create trigger trg_listings_updated_at
before update on public.listings
for each row execute function public.update_updated_at_column();

-- Indexes
create index if not exists idx_listings_user_id on public.listings(user_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_city on public.listings(city);

-- Enable RLS
alter table public.listings enable row level security;

-- Policies (owner-only for now)
create policy if not exists "Users can view their own listings"
  on public.listings for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

-- Listing images table
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  path text not null, -- storage object path (e.g., {user_id}/listing_{id}/img_1.jpg)
  url text,          -- optional public URL cache
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_images_listing_id on public.listing_images(listing_id);

alter table public.listing_images enable row level security;

-- Images policies: only owners (via listing ownership)
create policy if not exists "Owners can view their listing images"
  on public.listing_images for select
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = auth.uid()
  ));

create policy if not exists "Owners can insert their listing images"
  on public.listing_images for insert
  with check (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = auth.uid()
  ));

create policy if not exists "Owners can update their listing images"
  on public.listing_images for update
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = auth.uid()
  ));

create policy if not exists "Owners can delete their listing images"
  on public.listing_images for delete
  using (exists (
    select 1 from public.listings l
    where l.id = listing_id and l.user_id = auth.uid()
  ));

-- Storage bucket for listing images (publicly readable), with owner-restricted writes
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Public can view images in this bucket
create policy if not exists "Public can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Users can upload to their own folder: {user_id}/...
create policy if not exists "Users can upload their listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own objects
create policy if not exists "Users can update their listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own objects
create policy if not exists "Users can delete their listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );