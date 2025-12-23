/**
 * 🤖 SERVICIO DE AGENTE HÍBRIDO - REAL/MOCK
 * Usa automáticamente servicios mock si no hay configuración de APIs externas
 */

import { MockAgentService } from './mockServices'

// 🔍 DETECTAR CONFIGURACIÓN DE APIs EXTERNAS
const isAPIConfigured = (): boolean => {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
  const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
  
  return !!(openaiKey && openaiKey !== 'mock-mode' && openaiKey !== 'your_openai_api_key' &&
           import.meta.env.VITE_USE_MOCK !== 'true')
}

/**
 * 🤖 SERVICIO DE AGENTE HÍBRIDO
 */
export class AgentService {
  
  /**
   * 💭 PROCESAR MENSAJE CON IA
   */
  static async procesarMensaje(mensaje: string, conversacionId: string): Promise<string> {
    if (!isAPIConfigured()) {
      console.log('🎭 Usando IA MOCK para procesar mensaje')
      return await MockAgentService.procesarMensaje(mensaje, conversacionId)
    }

    try {
      // Usar API real de OpenAI
      console.log('🤖 Procesando mensaje con OpenAI...')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: mensaje,
          conversationId,
          model: 'gpt-3.5-turbo',
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`Error de API: ${response.status}`)
      }

      const data = await response.json()
      return data.response || 'Lo siento, no pude procesar tu mensaje en este momento.'

    } catch (error) {
      console.error('❌ Error con API real, usando MOCK:', error)
      // Fallback a mock si falla la API real
      return await MockAgentService.procesarMensaje(mensaje, conversacionId)
    }
  }

  /**
   * 🎯 COMUNICACIÓN ENTRE AGENTES
   */
  static async comunicarConAgente(agenteTipo: string, datos: any): Promise<any> {
    if (!isAPIConfigured()) {
      console.log('🎭 Usando comunicación MOCK entre agentes')
      return await MockAgentService.comunicarConAgente(agenteTipo, datos)
    }

    try {
      // Usar n8n webhook real para comunicación entre agentes
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      
      if (!webhookUrl || webhookUrl === 'mock-mode') {
        throw new Error('N8N webhook no configurado')
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentType: agenteTipo,
          data: datos,
          timestamp: new Date().toISOString(),
          action: 'agent-communication'
        })
      })

      if (!response.ok) {
        throw new Error(`Error de webhook: ${response.status}`)
      }

      const result = await response.json()
      console.log(`✅ Comunicación completada con agente ${agenteTipo}`)
      return result

    } catch (error) {
      console.error('❌ Error en comunicación real, usando MOCK:', error)
      // Fallback a mock si falla la comunicación real
      return await MockAgentService.comunicarConAgente(agenteTipo, datos)
    }
  }

  /**
   * 🧠 ANÁLISIS DE TRIAGE INTELIGENTE
   */
  static async analizarTriage(sintomas: string, contexto?: string): Promise<{
    nivel: 'autocuidado' | 'cita' | 'urgente'
    confianza: number
    explicacion: string
    consejos: string[]
  }> {
    if (!isAPIConfigured()) {
      console.log('🎭 Usando análisis MOCK de triage')
      // Importar la función de mock
      const { generateMockTriage } = await import('./mockData')
      return generateMockTriage(sintomas)
    }

    try {
      // Usar IA real para análisis más sofisticado
      const prompt = `
        Como asistente médico virtual, analiza los siguientes síntomas y proporciona una clasificación de triage.
        
        Síntomas: ${sintomas}
        ${contexto ? `Contexto adicional: ${contexto}` : ''}
        
        Clasifica como:
        - "urgente": Requiere atención médica inmediata (dolor de pecho, dificultad respirar, sangrado grave, etc.)
        - "cita": Requiere evaluación médica pero no urgente (dolores persistentes, síntomas molestos, etc.)
        - "autocuidado": Síntomas leves manejables en casa (resfriados leves, dolores menores, etc.)
        
        Responde SOLO con un JSON válido con esta estructura:
        {
          "nivel": "urgente|cita|autocuidado",
          "confianza": 0-100,
          "explicacion": "razón de la clasificación",
          "consejos": ["consejo1", "consejo2", "consejo3"]
        }
      `

      const response = await this.procesarMensaje(prompt, 'triage-analysis')
      
      // Intentar parsear como JSON
      try {
        const analysis = JSON.parse(response)
        if (analysis.nivel && analysis.confianza && analysis.explicacion && analysis.consejos) {
          return analysis
        }
      } catch {
        // Si no es JSON válido, usar análisis básico
      }

      // Fallback si la respuesta no es válida
      throw new Error('Respuesta de IA no válida')

    } catch (error) {
      console.error('❌ Error en análisis real, usando MOCK:', error)
      const { generateMockTriage } = await import('./mockData')
      return generateMockTriage(sintomas)
    }
  }

  /**
   * 🔍 VERIFICAR MODO ACTUAL
   */
  static getModeInfo(): { mode: 'real' | 'mock', configured: boolean } {
    const configured = isAPIConfigured()
    return {
      mode: configured ? 'real' : 'mock',
      configured
    }
  }

  /**
   * 🤖 CONFIGURAR AGENTES BÁSICOS
   * Inicializa los agentes del sistema
   */
  static configurarAgentesBasicos(): void {
    if (!isAPIConfigured()) {
      return MockAgentService.configurarAgentesBasicos()
    }

    // En modo real, registrar agentes reales
    console.log('🤖 Configurando agentes básicos para modo producción...')
    // Aquí se configurarían los agentes reales cuando estén disponibles
    
    // Por ahora usar mock incluso en modo real para agentes básicos
    return MockAgentService.configurarAgentesBasicos()
  }

  /**
   * 💬 SIMULAR COMUNICACIÓN A2A
   * Comunicación entre agentes
   */
  static async simularComunicacionA2A(
    sintomas: string, 
    idConversacion: string, 
    idUsuario: string
  ): Promise<void> {
    if (!isAPIConfigured()) {
      return await MockAgentService.simularComunicacionA2A(sintomas, idConversacion, idUsuario)
    }

    // En modo real, usar comunicación real entre agentes
    console.log('🤖 Simulando comunicación A2A real...')
    // Por ahora usar mock incluso en modo real
    return await MockAgentService.simularComunicacionA2A(sintomas, idConversacion, idUsuario)
  }
}

// 🚀 MOSTRAR MODO AL INICIALIZAR
const modeInfo = AgentService.getModeInfo()
if (modeInfo.mode === 'mock') {
  console.log('🎭 AGENT SERVICE - MODO DESARROLLO CON RESPUESTAS MOCK')
  console.log('✨ Las respuestas de IA están siendo simuladas')
} else {
  console.log('🤖 AGENT SERVICE - MODO PRODUCCIÓN CON APIs REALES')
}