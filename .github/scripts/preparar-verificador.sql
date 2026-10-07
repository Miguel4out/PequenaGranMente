-- Prepara el Postgres de usar y tirar donde se RESTAURA el respaldo para
-- comprobar que sirve. Recrea lo que un proyecto Supabase nuevo ya trae,
-- para que la restauración de prueba se parezca a la real.

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists citext      with schema extensions;
create extension if not exists pgcrypto    with schema extensions;

-- auth.users lo administra Supabase. Aquí solo necesitamos la forma, para
-- que la llave foránea de `profiles` tenga a dónde apuntar.
create schema if not exists auth;
create table if not exists auth.users (
  id                 uuid primary key,
  email              varchar(255) unique,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at         timestamptz default now()
);
create or replace function auth.uid() returns uuid
  language sql stable as $fn$ select null::uuid $fn$;

do $$ begin create role anon nologin;          exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin;  exception when duplicate_object then null; end $$;

-- El dump trae su propio CREATE SCHEMA public; si ya existe, pg_restore
-- reporta un error que no es un error. Mejor dejarle el terreno limpio.
drop schema if exists public cascade;
