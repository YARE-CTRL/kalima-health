/**
 * 🏥 BOT MÉDICO SIMPLE
 * 
 * ¿Qué hace esto?
 * - Lee los síntomas que escribe el usuario
 * - Decide si es urgente, necesita cita, o puede cuidarse solo
 * - Da consejos médicos básicos
 * - Se comunica con otros "robots" del sistema
 */

import { AgentService } from './agentServiceHybrid'

// 📝 TIPOS SIMPLES
export interface AnalisisTriage {
  nivel: 'autocuidado' | 'cita' | 'urgente'  // Qué tan grave es
  confianza: number                           // Qué tan seguro está (0-100%)
  explicacion: string                         // Por qué decidió eso
  consejos: string[]                          // Qué debe hacer el usuario
}

// 🤖 CLASE PRINCIPAL (muy simplificada)
export class HealthBot {
  
  // 🚨 PALABRAS QUE INDICAN EMERGENCIA
  private static palabrasUrgentes = [
    // Dolor de pecho - todas las variaciones
    'dolor pecho', 'duele pecho', 'duele el pecho', 'dolor de pecho', 'pecho duele',
    'dolor pecho fuerte', 'opresión pecho', 'dolor en el pecho', 'me duele el pecho',
    'dolor en el pecho', 'opresión en el pecho', 'dolor fuerte pecho',
    
    // Problemas respiratorios
    'no puedo respirar', 'dificultad respirar', 'falta de aire', 'no respiro bien',
    'dificultad para respirar', 'respiración dificultosa', 'ahogo', 'sofoco',
    
    // Sangrado
    'sangra mucho', 'hemorragia', 'sangrado abundante', 'sangra', 'sangrado',
    'sangre', 'hemorragia', 'sangrado profuso',
    
    // Emergencias neurológicas
    'desmayo', 'pérdida conciencia', 'convulsión', 'convulsiones', 'desmayé',
    'perdí el conocimiento', 'me desmayé',
    
    // Accidentes y heridas
    'accidente', 'herida grave', 'herida profunda', 'corte profundo',
    'golpe fuerte', 'traumatismo', 'accidente grave',
    
    // Otros síntomas urgentes
    'dolor abdominal intenso', 'dolor estómago fuerte', 'dolor muy fuerte',
    'dolor insoportable', 'dolor extremo', 'dolor agudo'
  ]

  // 🏥 PALABRAS QUE INDICAN NECESITA CITA
  private static palabrasCita = [
    // Fiebre
    'fiebre alta', 'fiebre', 'tengo fiebre', 'fiebre alta', 'temperatura alta',
    'calentura', 'tengo calentura',
    
    // Dolor de cabeza
    'dolor cabeza', 'duele cabeza', 'duele la cabeza', 'me duele la cabeza',
    'dolor de cabeza', 'cabeza duele', 'migraña', 'jaqueca',
    
    // Problemas digestivos
    'vómito', 'vomito', 'vomité', 'nausea', 'náusea', 'nauseas',
    'dolor estómago', 'dolor de estómago', 'estómago duele',
    'dolor abdominal', 'dolor barriga', 'barriga duele',
    'diarrea', 'diarrea fuerte', 'diarrea persistente',
    
    // Otros síntomas que requieren cita
    'mareo', 'mareos', 'me mareo', 'fatiga', 'cansancio extremo',
    'tos', 'tos persistente', 'tos fuerte', 'tos seca',
    'dolor fuerte', 'dolor moderado', 'dolor constante'
  ]

  /**
   * 🧠 ANALIZAR SÍNTOMAS (función principal)
   * Lee lo que escribió el usuario y decide qué tan grave es
   */
  static analizarSintomas(sintomas: string): AnalisisTriage {
    const sintomasMinusculas = sintomas.toLowerCase()
    
    console.log('🔍 Analizando síntomas:', sintomasMinusculas)
    
    // 1. ¿Es urgente? (buscar palabras de emergencia) - PRIORIDAD MÁXIMA
    for (const palabra of this.palabrasUrgentes) {
      if (sintomasMinusculas.includes(palabra)) {
        console.log('🚨 SÍNTOMA URGENTE DETECTADO:', palabra)
        return {
          nivel: 'urgente',
          confianza: 0.95,
          explicacion: `Detecté síntomas de emergencia: "${palabra}". Necesitas atención inmediata.`,
          consejos: [
            'Llama al 123 (emergencias)',
            'Ve al hospital más cercano',
            'No esperes, es urgente'
          ]
        }
      }
    }

    // 2. ¿Necesita cita médica? (buscar palabras de cita)
    for (const palabra of this.palabrasCita) {
      if (sintomasMinusculas.includes(palabra)) {
        console.log('🏥 SÍNTOMA QUE REQUIERE CITA DETECTADO:', palabra)
        return {
          nivel: 'cita',
          confianza: 0.85,
          explicacion: `Detecté síntomas que requieren evaluación médica: "${palabra}".`,
          consejos: [
            'Programa una cita médica',
            'Toma medicamentos básicos si los tienes',
            'Llama a tu médico si empeora'
          ]
        }
      }
    }

    // 3. Si no es nada grave, autocuidado
    console.log('🏠 Clasificado como autocuidado')
    return {
      nivel: 'autocuidado',
      confianza: 0.7,
      explicacion: 'Los síntomas parecen leves. Puedes cuidarte en casa.',
      consejos: [
        'Toma mucha agua',
        'Descansa bien',
        'Monitorea tu temperatura',
        'Llama al médico si empeora'
      ]
    }
  }

  /**
   * 💬 PROCESAR MENSAJE DEL USUARIO
   * Función principal que se llama desde el chat
   */
  static async procesarMensaje(
    mensajeUsuario: string, 
    _historial: string[] = [],
    idConversacion?: string,
    idUsuario?: string
  ): Promise<{ respuesta: string, triage: AnalisisTriage }> {
    
    // 1. Analizar síntomas
    const analisis = this.analizarSintomas(mensajeUsuario)
    
    // 2. Crear respuesta para el usuario
    let respuesta = ''
    
    if (analisis.nivel === 'urgente') {
      respuesta = `ATENCIÓN URGENTE\n\n${analisis.explicacion}\n\n${analisis.consejos.join('\n')}\n\nSi tienes una emergencia médica, llama inmediatamente al 123 o ve al hospital más cercano.`
    } else if (analisis.nivel === 'cita') {
      respuesta = `Necesitas atención médica\n\n${analisis.explicacion}\n\n${analisis.consejos.join('\n')}\n\nTe recomiendo programar una cita médica pronto.`
    } else {
      respuesta = `Puedes cuidarte en casa\n\n${analisis.explicacion}\n\n${analisis.consejos.join('\n')}\n\nSi los síntomas empeoran, consulta a un médico.`
    }

    // 3. Comunicar con otros agentes (A2A)
    if (idConversacion && idUsuario) {
      try {
        await AgentService.simularComunicacionA2A(mensajeUsuario, idConversacion, idUsuario)
      } catch (error) {
        console.log('Los agentes no pudieron comunicarse, pero el análisis funcionó')
      }
    }

    // 4. Intentar usar IA avanzada (opcional)
    try {
      const respuestaIA = await this.llamarIA(mensajeUsuario, idConversacion, idUsuario)
      if (respuestaIA) {
        // Combinar respuesta local con IA
        respuesta = `${respuesta}\n\nAnálisis adicional con IA:\n${respuestaIA}`
      }
    } catch (error) {
      console.log('IA no disponible, usando análisis local')
    }

    return { respuesta, triage: analisis }
  }

  /**
   * 🤖 LLAMAR A LA IA (función opcional)
   * Intenta usar OpenAI para análisis más avanzado
   */
  private static async llamarIA(
    sintomas: string, 
    idConversacion?: string, 
    idUsuario?: string
  ): Promise<string | null> {
    try {
      // URL de la Edge Function de Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuración de Supabase no encontrada')
      }

      // Llamar a la Edge Function
      const respuesta = await fetch(`${supabaseUrl}/functions/v1/mcp-triage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: sintomas,
          conversationId: idConversacion,
          userId: idUsuario,
          context: 'análisis_simple'
        }),
      })

      if (!respuesta.ok) {
        throw new Error('Error llamando a la IA')
      }

      const datos = await respuesta.json()
      return datos.llmResponse || null

    } catch (error) {
      console.log('Error llamando a la IA:', error)
      return null
    }
  }

  /**
   * 💡 DAR CONSEJOS ADICIONALES
   * Consejos específicos según los síntomas
   */
  static darConsejosAdicionales(sintomas: string): string[] {
    const sintomasMinusculas = sintomas.toLowerCase()
    const consejos: string[] = []

    if (sintomasMinusculas.includes('fiebre')) {
      consejos.push('Toma la temperatura cada 2 horas')
      consejos.push('Puedes tomar paracetamol si la fiebre es alta')
    }

    if (sintomasMinusculas.includes('dolor')) {
      consejos.push('Considera tomar analgésicos básicos')
      consejos.push('Descansa en una posición cómoda')
    }

    if (sintomasMinusculas.includes('tos')) {
      consejos.push('Toma miel con limón')
      consejos.push('Mantente hidratado')
    }

    if (sintomasMinusculas.includes('nausea') || sintomasMinusculas.includes('vómito')) {
      consejos.push('Come alimentos suaves como pan o galletas')
      consejos.push('Toma pequeños sorbos de agua')
    }

    return consejos
  }
}