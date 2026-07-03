# ia-prop — Motor de Scoring Crediticio

Aplicación de scoring crediticio (Banco Continental, ficticio) que evalúa solicitudes
de crédito con un modelo de **Regresión Logística** entrenado sobre el dataset
[German Credit Data](https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data)
(1.000 solicitudes históricas), usando el método **PDO** (Points to Double the Odds)
para convertir la probabilidad en un score de 300 a 700 puntos.

## Funcionalidad

- **Evaluación individual**: formulario con las 20 variables del solicitante, score
  en vivo, decisión sugerida (aprobar / revisar / rechazar) y desglose de los
  factores que más pesaron en el resultado.
- **Modo cartera (lote)**: corre el modelo sobre 20 solicitudes reales del set de
  test y compara la decisión sugerida contra el resultado histórico real.
- **Otorgar crédito**: persiste una evaluación puntual (inputs, score, decisión,
  versión del modelo usada) para hacerle seguimiento.
- **Seguimiento**: marcá el resultado real de cada crédito otorgado (pagó / default)
  a medida que se conoce. Con eso se calculan en vivo la tasa de acierto y el AUC
  del modelo en producción.
- **Modelo**: reentrena el modelo de forma **offline y manual** (botón "Recalcular
  modelo") combinando el dataset base con los créditos otorgados que ya tienen
  resultado real, y muestra el historial de versiones con su AUC.

### Por qué offline y no en vivo

El resultado real de un crédito (pagó o entró en default) tarda meses en conocerse
— no hay forma de reajustar el modelo en tiempo real porque el *label* todavía no
existe cuando se otorga el crédito. Por eso la recalibración es un paso manual y
auditable: cada corrida crea una **versión nueva** del modelo (con su propio AUC y
metadata), se activa, y las versiones anteriores quedan en el historial — el mismo
patrón de *champion/challenger* que usan las áreas de riesgo crediticio reales.

## Arquitectura

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript. Todo el motor de
  scoring vive en [`lib/credit-scoring/`](lib/credit-scoring) y
  [`components/credit-scoring/`](components/credit-scoring).
- **Backend**: Route Handlers de Next.js (`app/api/**`) que hablan con Supabase
  (Postgres) usando la `service_role` key — nunca expuesta al cliente.
- **Entrenamiento**: [`lib/credit-scoring/train.ts`](lib/credit-scoring/train.ts)
  implementa la regresión logística (descenso de gradiente, estandarización,
  one-hot, AUC) **en TypeScript puro**, sin backend de Python — el botón
  "Recalcular modelo" corre en el mismo runtime de Next.js.

### Base de datos (Supabase)

Tres tablas (ver [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)):

| Tabla                 | Contenido                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| `model_versions`       | Historial de modelos: coeficientes (JSON), AUC, notas, cuál está activo |
| `loan_applications`     | Créditos otorgados: inputs, score, decisión, y el `outcome` real        |
| `seed_training_data`    | Dataset base (1.000 filas de German Credit) para entrenar/reentrenar   |

### Setup local

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan gratuito alcanza).
2. Copiá `.env.local.example` a `.env.local` y completá `NEXT_PUBLIC_SUPABASE_URL` y
   `SUPABASE_SECRET_KEY` (Project Settings → API → `service_role` secret key).
3. Corré la migración: pegá el contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) en el
   SQL Editor del dashboard de Supabase y ejecutalo (crea las tablas y siembra el
   modelo base). La `service_role` key no tiene permiso para correr DDL, por eso
   este paso es manual.
4. Cargá el dataset base:
   ```bash
   pip install -r scripts/requirements.txt
   python scripts/prepare_seed.py > _seed_output.json
   node --env-file=.env.local scripts/load_seed.mjs _seed_output.json
   ```
5. `pnpm install && pnpm dev`

Sin Supabase configurado, la evaluación individual y el modo cartera igual
funcionan (con los coeficientes hardcodeados en `data.ts`); las pestañas
Seguimiento y Modelo muestran un aviso pidiendo la configuración.

### Verificar que el pipeline de entrenamiento reproduce el modelo base

```bash
npx tsx scripts/check_training_parity.mjs
```

Reentrena solo con el dataset base y compara el AUC resultante contra 0.771 (el del
modelo desplegado). Los coeficientes individuales pueden diferir (split train/test
distinto + regularización), pero el AUC y el signo de las variables más importantes
deberían coincidir.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_IW3fLS4jAncauAIDmH8pR2I8HMgF)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
