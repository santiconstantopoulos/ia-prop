import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cliente Supabase server-side. Usa la SECRET key (service-role): tiene permisos
// completos y NUNCA debe exponerse al cliente. Por eso este módulo solo se importa
// desde Route Handlers (app/api/**), nunca desde componentes con "use client".

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY

/** True si las variables de entorno de Supabase están configuradas. */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && secretKey)
}

let cached: SupabaseClient | null = null

/**
 * Devuelve el cliente Supabase (server-side), o null si no está configurado.
 * Los Route Handlers deben chequear null y degradar con gracia (fallback a DATA).
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!cached) {
    cached = createClient(url!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return cached
}
