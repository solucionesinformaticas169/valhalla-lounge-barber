# Valhalla Lounge Barber

Landing page premium para una barberia con estilo vikingo, construida con Next.js App Router, Tailwind CSS, PostgreSQL y Prisma, lista para desplegar en Vercel y crecer a una solucion SaaS.

## Stack

- Next.js 15 con App Router
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Estructura preparada para Vercel

## Correr localmente

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
copy .env.example .env
```

3. Configura `DATABASE_URL` en `.env`.

4. Genera Prisma Client:

```bash
npm run prisma:generate
```

5. Si ya tienes PostgreSQL listo, crea la tabla:

```bash
npm run prisma:migrate -- --name init
```

6. Inicia el proyecto:

```bash
npm run dev
```

## Despliegue recomendado

Arquitectura sugerida:

- `Vercel`: frontend + API de Next.js
- `Railway`: PostgreSQL
- `Meta WhatsApp Cloud API`: notificaciones de WhatsApp
- Servicio SMTP actual: mantener el endpoint configurado en `EMAIL_SERVICE_URL` o migrarlo despues a Next.js

### 1. Subir el proyecto a GitHub

Este proyecto todavia no esta inicializado como repositorio git. Para prepararlo:

```bash
git init
git add .
git commit -m "Initial production-ready commit"
```

Luego crea el repositorio en GitHub y conecta el remoto:

```bash
git remote add origin <TU_REPO_GITHUB>
git branch -M main
git push -u origin main
```

### 2. Conectar GitHub con Vercel

- Importa el repositorio en Vercel
- Framework preset: `Next.js`
- Root directory: la raiz del proyecto
- Build command: dejar la de Vercel por defecto

### 3. Configurar variables de entorno en Vercel

Variables minimas:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Variables si usas correo:

- `EMAIL_SERVICE_URL`
- `SMTP_EMAIL`
- `SMTP_APP_PASSWORD`

Variables si usas WhatsApp:

- `WHATSAPP_ENABLED`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_MESSAGE_MODE`
- `WHATSAPP_DEFAULT_COUNTRY_CODE`
- `WHATSAPP_OWNER_PHONE`
- `WHATSAPP_TEMPLATE_LANGUAGE`
- `WHATSAPP_TEMPLATE_BOOKED`
- `WHATSAPP_TEMPLATE_CANCELLED`
- `WHATSAPP_TEMPLATE_RESCHEDULED`
- `WHATSAPP_TEMPLATE_OWNER_BOOKED`

### 4. Apuntar Prisma a Railway

En Railway copia la cadena de conexion PostgreSQL y usala como `DATABASE_URL`.

Antes del primer uso en produccion, aplica las migraciones:

```bash
npm run prisma:migrate:deploy
```

Tambien puedes generar el cliente si hace falta:

```bash
npm run prisma:generate
```

### 5. Nota importante sobre Prisma

La migracion inicial ya fue alineada con el `schema.prisma` actual para que `prisma migrate deploy` cree en Railway la estructura correcta de `appointments`.

### 6. Verificaciones despues del deploy

- Crear una cita desde `/servicios`
- Consultar, reagendar y cancelar desde `/reservas`
- Verificar acceso al admin
- Confirmar conexion a Railway
- Confirmar notificaciones de WhatsApp y correo

## Estructura

- `app/`: rutas, layout global y endpoint de citas
- `components/`: bloques reutilizables del home
- `lib/`: configuracion, validaciones y cliente Prisma
- `prisma/`: schema inicial para citas
- `public/images/`: recursos visuales

## Escalabilidad

- El formulario ya consume una API interna con validacion
- Prisma queda listo para extender estados, usuarios, sucursales y recordatorios
- La UI esta separada en secciones reutilizables para evolucionar a panel administrativo o multi negocio

## Base lista para WhatsApp

- La API de citas ya dispara eventos de notificacion para `CREATED`, `CANCELLED` y `RESCHEDULED`
- `lib/appointment-notifications.ts` centraliza los canales para no duplicar logica por ruta
- WhatsApp puede trabajar directo con Meta WhatsApp Cloud API usando `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_API_TOKEN`
- Si prefieres un microservicio o middleware propio, todavia puedes usar `WHATSAPP_SERVICE_URL`
- `WHATSAPP_MESSAGE_MODE="text"` sirve para pruebas iniciales; `template` queda reservado para cuando ya tengas plantillas aprobadas
- Cada evento tiene su propia plantilla:
  - `WHATSAPP_TEMPLATE_BOOKED`
  - `WHATSAPP_TEMPLATE_CANCELLED`
  - `WHATSAPP_TEMPLATE_RESCHEDULED`
  - `WHATSAPP_TEMPLATE_OWNER_BOOKED`
- `WHATSAPP_OWNER_PHONE` permite avisar automaticamente al numero del negocio cuando entra una nueva cita
- Los telefonos se normalizan con `WHATSAPP_DEFAULT_COUNTRY_CODE`, pensado por defecto para Ecuador (`593`)

## Siguiente paso sugerido

1. Confirmar que el numero del negocio ya esta registrado y habilitado dentro de Meta WhatsApp Cloud API
2. Probar un envio real creando, cancelando o reagendando una cita desde la app
3. Cuando ya tengas plantillas aprobadas, cambiar `WHATSAPP_MESSAGE_MODE` a `template` y usar los nombres ya cargados en las variables correspondientes
