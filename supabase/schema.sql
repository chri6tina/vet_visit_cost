-- VetVisitCost.com Initial Schema

-- Enable necessary Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- 1. Procedures Table
create table public.procedures (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    category text,
    species text[],
    description text,
    avg_cost_low int,
    avg_cost_high int,
    avg_cost_national int,
    notes text,
    related_procedures uuid[]
);

-- 2. State Procedure Costs
create table public.state_procedure_costs (
    id uuid primary key default uuid_generate_v4(),
    procedure_id uuid references public.procedures(id) on delete cascade,
    state_code text not null,
    avg_cost_low int,
    avg_cost_high int,
    avg_cost_avg int,
    source text,
    last_updated date default current_date
);

-- 3. Vets Table
create table public.vets (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    name text not null,
    slug text unique,
    address text,
    city text not null,
    state text not null,
    zip text,
    latitude float8,
    longitude float8,
    -- Add a PostGIS geography point for spatial queries (radius search)
    location geography(POINT, 4326), 
    phone text,
    website text,
    email text,
    hours jsonb,
    accepts_new_patients boolean default false,
    emergency_care boolean default false,
    low_cost boolean default false,
    nonprofit boolean default false,
    spay_neuter_clinic boolean default false,
    payment_options text[],
    species_seen text[],
    verified boolean default false,
    claimed boolean default false,
    owner_user_id uuid references auth.users(id),
    rating_avg float4,
    rating_count int default 0,
    description text,
    photo_urls text[]
);

-- Note: Trigger to automatically update the 'location' geography column when lat/lng are modified
create or replace function update_vet_location()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_update_vet_location
  before insert or update on public.vets
  for each row
  execute function update_vet_location();

-- 4. Vet Prices
create table public.vet_prices (
    id uuid primary key default uuid_generate_v4(),
    vet_id uuid references public.vets(id) on delete cascade,
    procedure_id uuid references public.procedures(id) on delete cascade,
    price_low int,
    price_high int,
    price_exact int,
    last_updated date default current_date,
    submitted_by uuid references auth.users(id),
    verified boolean default false
);

-- 5. Reviews
create table public.reviews (
    id uuid primary key default uuid_generate_v4(),
    vet_id uuid references public.vets(id) on delete cascade,
    user_id uuid references auth.users(id),
    rating int check (rating between 1 and 5),
    title text,
    body text,
    visit_type text,
    pet_type text,
    price_paid int,
    procedure text,
    created_at timestamptz default now(),
    helpful_count int default 0,
    verified_visit boolean default false
);

-- 6. Low Cost Programs
create table public.low_cost_programs (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    org_type text,
    city text,
    state text,
    zip text,
    latitude float8,
    longitude float8,
    location geography(POINT, 4326),
    phone text,
    website text,
    services text[],
    income_based boolean,
    appointment_required boolean,
    notes text,
    last_verified date
);

create trigger tr_update_low_cost_location
  before insert or update on public.low_cost_programs
  for each row
  execute function update_vet_location();

-- 7. Price Reports (Crowdsourced input)
create table public.price_reports (
    id uuid primary key default uuid_generate_v4(),
    procedure_id uuid references public.procedures(id) on delete cascade,
    vet_id uuid references public.vets(id) on delete set null,
    city text,
    state text,
    zip text,
    price_paid int,
    visit_date date,
    pet_type text,
    pet_weight_lbs int,
    notes text,
    submitted_by uuid references auth.users(id),
    approved boolean default false,
    created_at timestamptz default now()
);

-- Add basic Indexes for quick lookups and SEO pages
create index idx_procedures_slug on public.procedures(slug);
create index idx_vets_slug on public.vets(slug);
create index idx_vets_location on public.vets using gist(location);
create index idx_vets_city_state on public.vets(city, state);
create index idx_price_reports_proc on public.price_reports(procedure_id);
