-- Prepara el Postgres de usar y tirar donde se RESTAURA el respaldo para
-- comprobar que sirve. Recrea lo que un proyecto Supabase nuevo ya trae,
-- para que la restauración de prueba se parezca a la real.

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists citext      with schema extensions;
create extension if not exists pgcrypto    with schema extensions;

-- auth.users lo administra Supabase. Aquí solo creamos el esquema; la tabla
-- se construye en el workflow a partir de las columnas que traiga el propio
-- respaldo. Escribirla a mano no sirve: Supabase le agrega columnas cuando
-- quiere y el COPY falla con "column ... does not exist".
create schema if not exists auth;
create or replace function auth.uid() returns uuid
  language sql stable as $fn$ select null::uuid $fn$;

do $$ begin create role anon nologin;          exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin;  exception when duplicate_object then null; end $$;

-- El dump trae su propio CREATE SCHEMA public; si ya existe, pg_restore
-- reporta un error que no es un error. Mejor dejarle el terreno limpio.
drop schema if exists public cascade;
