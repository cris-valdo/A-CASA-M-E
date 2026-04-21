-- Atelier Command Center: Database Schema Migration (Supabase)
-- Target: High-performance relational data structure for hospitality management

-- 1. Profiles (User Identity Extension)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  photo_url text,
  role text check (role in ('admin', 'staff')) default 'staff',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Guests
create table if not exists guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  nif text,
  email text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Room Inventory
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  room_number text unique not null,
  type text check (type in ('single', 'double', 'suite')) not null,
  price_per_night decimal(12, 2) not null,
  status text check (status in ('available', 'occupied', 'maintenance')) default 'available',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Invoices (The Ledger)
create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  guest_id uuid references guests(id),
  guest_name text,
  room_name text,
  room_number text,
  room_price decimal(12, 2),
  hosting_type text default 'Daily',
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  total_amount decimal(12, 2) not null,
  status text check (status in ('paid', 'pending', 'cancelled')) default 'pending',
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Mural Posts (Social Feed)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  author_id uuid references auth.users(id),
  author_name text,
  author_photo text,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Command Notifications
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  message text not null,
  type text check (type in ('report', 'guest', 'system', 'payout')) default 'system',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table guests enable row level security;
alter table rooms enable row level security;
alter table invoices enable row level security;
alter table posts enable row level security;
alter table notifications enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

create policy "Admins can manage all guests." on guests for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Staff can view guests." on guests for select using (auth.role() = 'authenticated');

create policy "Inventory is viewable by all authenticated." on rooms for select using (auth.role() = 'authenticated');
create policy "Admins can update rooms." on rooms for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Ledger is viewable by all authenticated." on invoices for select using (auth.role() = 'authenticated');
create policy "Mural is viewable by all authenticated." on posts for select using (auth.role() = 'authenticated');
create policy "Own notifications." on notifications for select using (auth.uid() = user_id);
