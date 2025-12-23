// Edge Function: llm-chat
// Proxy para OpenAI que evita problemas de CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers para desarrollo
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener la API key de OpenAI desde los secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parsear el body de la request
    const { prompt, context, model = 'gpt-3.5-turbo', maxTokens = 200, temperature = 0.7 } = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Llamar a OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Eres un asistente médico para zonas rurales. Tu trabajo es:

1. EVALUAR síntomas y clasificar en:
   - URGENTE: Requiere atención inmediata (dolor pecho, dificultad respirar, sangrado abundante)
   - CITA: Necesita evaluación médica (fiebre alta, dolor intenso persistente)
   - AUTOCUIDADO: Se puede manejar en casa (síntomas leves)

2. DAR recomendaciones claras y específicas
3. SER empático y usar lenguaje simple
4. INCLUIR cuándo buscar ayuda inmediata

Contexto: ${context || 'Consulta médica general'}

Responde de forma concisa y práctica. Máximo ${maxTokens} palabras.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}))
      throw new Error(`OpenAI API Error: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const openaiData = await openaiResponse.json()
    
    if (!openaiData.choices || !openaiData.choices[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    // Devolver respuesta
    return new Response(
      JSON.stringify({
        content: openaiData.choices[0].message.content,
        model: openaiData.model,
        usage: openaiData.usage,
        metadata: {
          timestamp: new Date().toISOString(),
          context: context || 'general'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in llm-chat function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error processing request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
