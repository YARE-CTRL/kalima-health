import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos para las tablas
export interface User {
  id: string
  phone: string
  name?: string
  role: 'paciente' | 'promotor'
  region?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  status: 'abierta' | 'cerrada'
  assigned_to?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'user' | 'bot' | 'promotor'
  content: string
  created_at: string
}

export interface TriageResult {
  id: string
  conversation_id: string
  level: 'autocuidado' | 'cita' | 'urgente'
  notes?: string
  created_at: string
}
