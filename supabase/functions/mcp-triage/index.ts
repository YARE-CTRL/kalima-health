// Edge Function: mcp-triage
// MCP-like endpoint que combina triage local + LLM

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Palabras clave para detección de emergencias (copiado del frontend)
const EMERGENCY_KEYWORDS = [
  'dolor pecho', 'dolor de pecho', 'dolor en el pecho', 'opresión en el pecho',
  'dificultad respirar', 'no puedo respirar', 'falta de aire', 'ahogo',
  'sangrado abundante', 'sangra mucho', 'hemorragia', 'sangrado profuso',
  'pérdida de conciencia', 'desmayo', 'desvanecimiento', 'pérdida del conocimiento',
  'dolor abdominal intenso', 'dolor de estómago fuerte', 'dolor abdominal severo',
  'trauma', 'golpe fuerte', 'accidente', 'caída grave',
  'convulsión', 'convulsiones', 'ataque', 'epilepsia',
  'parálisis', 'no puedo mover', 'pérdida de sensibilidad',
  'dolor de cabeza muy fuerte', 'dolor de cabeza insoportable',
  'vómitos con sangre', 'sangre en las heces', 'heces negras'
]

const APPOINTMENT_KEYWORDS = [
  'fiebre alta', 'fiebre muy alta', 'temperatura alta', 'fiebre persistente',
  'dolor intenso', 'dolor fuerte', 'dolor persistente', 'dolor que no mejora',
  'mareos', 'mareos frecuentes', 'vértigo',
  'náuseas', 'vómitos', 'vómitos frecuentes',
  'dolor de cabeza fuerte', 'migraña', 'dolor de cabeza persistente',
  'dolor de espalda', 'dolor lumbar', 'dolor de espalda intenso',
  'problemas digestivos', 'dolor estómago', 'dolor abdominal',
  'fatiga extrema', 'cansancio extremo', 'debilidad',
  'pérdida de peso', 'pérdida de apetito', 'pérdida de peso rápida',
  'problemas de visión', 'visión borrosa', 'dificultad para ver',
  'problemas de audición', 'zumbido en los oídos', 'pérdida de audición'
]

// Función de análisis local (copiada del frontend)
function analyzeTriageLevel(userMessage: string) {
  const message = userMessage.toLowerCase()
  
  const emergencyMatches = EMERGENCY_KEYWORDS.filter(keyword => 
    message.includes(keyword.toLowerCase())
  )
  
  const appointmentMatches = APPOINTMENT_KEYWORDS.filter(keyword => 
    message.includes(keyword.toLowerCase())
  )

  const intensityWords = ['muy', 'mucho', 'intenso', 'severo', 'grave', 'insoportable', 'extremo']
  const hasIntensity = intensityWords.some(word => message.includes(word))

  let level: 'autocuidado' | 'cita' | 'urgente'
  let confidence: number
  let reasoning: string
  let recommendations: string[]

  if (emergencyMatches.length > 0) {
    level = 'urgente'
    confidence = Math.min(0.95, 0.7 + (emergencyMatches.length * 0.05) + (hasIntensity ? 0.1 : 0))
    reasoning = `🚨 EMERGENCIA DETECTADA: ${emergencyMatches.slice(0, 3).join(', ')}${emergencyMatches.length > 3 ? ' y más síntomas' : ''}`
    recommendations = [
      '🚨 BUSCA ATENCIÓN MÉDICA INMEDIATA',
      'Llama al 123 o ve al hospital más cercano AHORA',
      'No conduzcas, pide ayuda para llegar al hospital',
      'Si es posible, que alguien te acompañe'
    ]
  } else if (appointmentMatches.length > 0 || hasIntensity) {
    level = 'cita'
    confidence = Math.min(0.85, 0.6 + (appointmentMatches.length * 0.05) + (hasIntensity ? 0.15 : 0))
    reasoning = `📅 Consulta médica recomendada: ${appointmentMatches.slice(0, 2).join(', ')}${appointmentMatches.length > 2 ? ' y otros síntomas' : ''}${hasIntensity ? ' (síntomas intensos)' : ''}`
    recommendations = [
      '📅 Programa una cita médica en las próximas 24-48 horas',
      'Ve al centro de salud o consulta con un médico',
      'Mientras tanto, descansa y mantente hidratado',
      'Si empeora, busca atención inmediata'
    ]
  } else {
    level = 'autocuidado'
    confidence = 0.75
    reasoning = 'Síntomas leves que pueden manejarse con autocuidado'
    recommendations = [
      '🏠 Puedes manejar esto en casa',
      'Descansa, mantente hidratado y come bien',
      'Monitorea tus síntomas',
      'Si empeoran o persisten más de 3 días, consulta a un médico'
    ]
  }

  return {
    level,
    confidence,
    reasoning,
    recommendations,
    emergency_indicators: emergencyMatches
  }
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parsear el body
    const { symptoms, conversationId, userId, context } = await req.json()

    if (!symptoms) {
      return new Response(
        JSON.stringify({ error: 'Symptoms are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Análisis local primero
    const localTriage = analyzeTriageLevel(symptoms)
    
    // 2. Si es urgente, devolver inmediatamente
    if (localTriage.level === 'urgente') {
      return new Response(
        JSON.stringify({
          triageLevel: localTriage.level,
          confidence: localTriage.confidence,
          reasoning: localTriage.reasoning,
          recommendations: localTriage.recommendations,
          emergency_indicators: localTriage.emergency_indicators,
          source: 'local-analysis',
          metadata: {
            timestamp: new Date().toISOString(),
            conversationId,
            userId
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Para otros casos, intentar enriquecer con LLM
    try {
      const llmResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/llm-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Analiza estos síntomas y proporciona orientación médica: ${symptoms}`,
          context: `triage-${localTriage.level}`,
          maxTokens: 150
        })
      })

      if (llmResponse.ok) {
        const llmData = await llmResponse.json()
        
        // Combinar análisis local con respuesta de LLM
        return new Response(
          JSON.stringify({
            triageLevel: localTriage.level,
            confidence: localTriage.confidence,
            reasoning: localTriage.reasoning,
            recommendations: localTriage.recommendations,
            llmResponse: llmData.content,
            source: 'local-analysis + llm-enrichment',
            metadata: {
              timestamp: new Date().toISOString(),
              conversationId,
              userId,
              llmModel: llmData.model
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (llmError) {
      console.log('LLM enrichment failed, using local analysis only:', llmError.message)
    }

    // 4. Fallback: solo análisis local
    return new Response(
      JSON.stringify({
        triageLevel: localTriage.level,
        confidence: localTriage.confidence,
        reasoning: localTriage.reasoning,
        recommendations: localTriage.recommendations,
        source: 'local-analysis-only',
        metadata: {
          timestamp: new Date().toISOString(),
          conversationId,
          userId
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in mcp-triage function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Error processing triage request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
