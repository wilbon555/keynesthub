-- Enums
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.property_category as enum ('residential','commercial','land','industrial','other');
create type public.listing_status as enum ('draft','published','archived');
create type public.size_unit as enum ('sqft','sqm','acre','hectare');
create type public.message_type as enum ('text','image','file');

-- Utility function to auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Roles helper
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- User roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category public.property_category not null default 'other',
  price numeric,
  price_currency text default 'USD',
  price_is_contact boolean default false,
  size numeric,
  size_unit public.size_unit,
  bedrooms int,
  bathrooms int,
  amenities text[],
  address text,
  city text,
  state text,
  country text,
  latitude double precision,
  longitude double precision,
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_created_at on public.listings(created_at desc);
create index if not exists idx_listings_user_id on public.listings(user_id);

alter table public.listings enable row level security;

create policy "Published listings are viewable by everyone"
  on public.listings for select using (status = 'published' or auth.uid() = user_id);

create policy "Users can create their own listings"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = user_id);

create trigger update_listings_updated_at
before update on public.listings
for each row execute function public.update_updated_at_column();

-- Listing images
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  url text,
  position int default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_listing_images_listing_id on public.listing_images(listing_id);

alter table public.listing_images enable row level security;

create policy "Images visible if listing published or owner"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
      and (l.status = 'published' or l.user_id = auth.uid())
    )
  );

create policy "Only owner can modify listing images"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- Chats
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id)
);

alter table public.chats enable row level security;

create policy "Only participants can view chats"
  on public.chats for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Only participants can create chats"
  on public.chats for insert with check (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  type public.message_type not null default 'text',
  attachment_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_messages_chat_id_created_at on public.messages(chat_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    ) and sender_id = auth.uid()
  );

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatars"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for listing images
create policy "Listing images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Users can upload their own listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own listing images"
  on storage.objects for update using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );