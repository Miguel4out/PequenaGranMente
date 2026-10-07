# Pequeña Gran Mente · app del consultorio

Agenda de citas y perfiles de clientes para el consultorio. Primera entrega: **agenda + clientes**.
Diseño "bloques en rosa" aprobado el 5 de octubre de 2026 (ver maquetado en Claude).

## Stack

- Next.js 16 (App Router, TypeScript) + Tailwind CSS 4
- Supabase: Postgres, Auth (enlace mágico por correo) y RLS
- date-fns

## Primera vez

1. Instala **Node.js LTS** (22 o superior) y **Git**.
2. Crea un proyecto gratuito en [supabase.com](https://supabase.com) (región más cercana: East US).
3. En Supabase → **SQL Editor**, pega y ejecuta `supabase/migrations/0001_esquema.sql`.
4. En Supabase → **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: agrega `http://localhost:3000/auth/callback`
5. Copia `.env.example` como `.env.local` y llena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Supabase → Project Settings → API). **Nunca** pongas la llave `service_role` en el proyecto.
6. En esta carpeta:

   ```bash
   npm install
   npm run dev
   ```

7. Abre http://localhost:3000, escribe tu correo y entra con el enlace que te llega.
   Al entrar por primera vez se crea tu fila en `usuarios` y `psicologos` automáticamente.
8. (Opcional) Para tener datos de ejemplo: abre `supabase/seed.sql`, cambia `TU-CORREO@ejemplo.com`
   por el correo con el que entraste y ejecútalo en el SQL Editor. Los nombres son inventados.

## Estructura

```
src/app/login            Inicio de sesión (enlace mágico)
src/app/auth/callback    Recibe el enlace y abre la sesión
src/app/(app)/agenda     Agenda semana/día, nueva cita, cambiar día u hora
src/app/(app)/clientes   Lista, perfil y alta de clientes
src/components/ui        Ladrillo (botón/enlace/caja), Marca, Volver
src/components/agenda    Vistas de calendario, detalle y formularios de cita
src/components/clientes  Formularios de cliente y notas
src/lib/datos.ts         Lecturas a Supabase (servidor)
src/lib/acciones.ts      Server Actions: crear/reprogramar/cambiar estado, notas, clientes
src/lib/fechas.ts        Fechas en la zona America/Mexico_City
src/proxy.ts             Protege las rutas: sin sesión → /login
supabase/migrations      Esquema, RLS, función huecos_libres, candado anti-traslape
supabase/seed.sql        Datos de ejemplo
public/marca             Logo (trazo original con el cerebro en rosa)
```

## Reglas del diseño

- Paleta en `src/app/globals.css`: crema de fondo, derivados del rosa del cerebro, tinta para texto.
- Todo botón/enlace importante es un `.ladrillo` con color `l-crema | l-nube | l-pastel | l-rosa | l-chicle | l-frambuesa | l-tinta`
  y opcionalmente `con-botones` (los botones superiores de la pieza).
- Cada tipo de cita tiene un tono de la gama rosa (`servicios.color`), y siempre lleva su nombre escrito.
- Mínimo 16 px de letra (17 en celular) y 44 px de alto en todo lo que se toca.
- Responsivo: menú lateral en escritorio (≥1024 px), barra inferior en tablet y móvil; la semana se muestra
  solo en escritorio y en pantallas chicas se usa la vista de día.

## Qué NO guarda esta app

Notas clínicas ni expediente. `notas_admin` es solo para avisos de organización. Esa decisión viene del plan
de arquitectura (NOM-004 y LFPDPPP) y no se cambia sin un plan dedicado.

## Pendientes de la primera entrega

- Pantalla **Horarios** (editar `disponibilidad` y `bloqueos`); hoy se cargan por SQL.
- Editar datos de un cliente existente y agregar más tutores desde la app.
- Recordatorios por correo (Resend) y pagos (Mercado Pago): fase siguiente.
- Respaldo: el plan gratuito de Supabase no incluye respaldos; antes de datos reales, activar Pro o un `pg_dump` programado.
