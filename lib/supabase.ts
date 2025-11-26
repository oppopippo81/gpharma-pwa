import { createClient } from '@supabase/supabase-js'

// Carica le chiavi dal file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Crea e porta fuori la connessione per usarla nel resto dell'app
export const supabase = createClient(supabaseUrl, supabaseKey)