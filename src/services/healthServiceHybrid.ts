/**
 * 🎛️ SERVICIO HÍBRIDO - REAL/MOCK
 * Usa automáticamente servicios mock si no hay configuración de Supabase
 */

import { supabase } from './supabase'
import type { User, Conversation, Message, TriageResult } from './supabase'

// Importar servicios mock y real
import { MockHealthService, MockUtils } from './mockServices'
import { HealthService as RealHealthService } from './healthService'
import type { MockUser, MockConversation, MockMessage, MockTriageResult } from './mockData'

// 🔍 DETECTAR MODO DE FUNCIONAMIENTO
const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return !!(url && key && 
    url !== 'mock-mode' && 
    url !== 'your_supabase_url' &&
    key !== 'mock-mode' &&
    key !== 'your_supabase_anon_key' &&
    import.meta.env.VITE_USE_MOCK !== 'true')
}

// 🎭 ADAPTADORES DE TIPOS
const adaptMockUserToUser = (mockUser: MockUser): User => ({
  id: mockUser.id,
  phone: mockUser.phone,
  name: mockUser.name || '',
  role: 'paciente' as const,
  region: mockUser.region,
  created_at: mockUser.created_at
})

const adaptMockConversationToConversation = (mockConv: MockConversation): Conversation => ({
  id: mockConv.id,
  user_id: mockConv.user_id,
  title: mockConv.title,
  created_at: mockConv.created_at
})

const adaptMockMessageToMessage = (mockMsg: MockMessage): Message => ({
  id: mockMsg.id,
  conversation_id: mockMsg.conversation_id,
  content: mockMsg.content,
  role: mockMsg.role,
  created_at: mockMsg.created_at
})

const adaptMockTriageToTriage = (mockTriage: MockTriageResult): TriageResult => ({
  id: mockTriage.id,
  conversation_id: mockTriage.conversation_id,
  nivel: mockTriage.nivel,
  confianza: mockTriage.confianza,
  explicacion: mockTriage.explicacion,
  consejos: mockTriage.consejos,
  created_at: mockTriage.created_at
})

/**
 * 🏥 SERVICIO DE SALUD HÍBRIDO
 */
export class HealthService {
  
  /**
   * 👤 CREAR O BUSCAR USUARIO
   */
  static async encontrarOCrearUsuario(telefono: string, nombre?: string): Promise<User> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para usuario')
      const mockUser = await MockHealthService.encontrarOCrearUsuario(telefono, nombre)
      return adaptMockUserToUser(mockUser)
    }

    // Código original de Supabase
    if (!telefono || telefono.length < 8) {
      throw new Error('Número de teléfono inválido')
    }

    const { data: usuarioExistente } = await supabase
      .from('users')
      .select('*')
      .eq('phone', telefono)
      .single()

    if (usuarioExistente) {
      console.log(`✅ Usuario encontrado: ${usuarioExistente.name}`)
      return usuarioExistente
    }

    const { data: nuevoUsuario } = await supabase
      .from('users')
      .insert({
        phone: telefono,
        name: nombre || `Usuario ${telefono.slice(-4)}`,
        role: 'paciente'
      })
      .select()
      .single()

    if (!nuevoUsuario) {
      throw new Error('No se pudo crear el usuario')
    }

    console.log(`✅ Usuario creado: ${nuevoUsuario.name}`)
    return nuevoUsuario
  }

  /**
   * 💬 CREAR CONVERSACIÓN
   */
  static async crearConversacion(usuarioId: string, titulo: string = 'Nueva consulta médica'): Promise<Conversation> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para conversación')
      const mockConversation = await MockHealthService.crearConversacion(usuarioId, titulo)
      return adaptMockConversationToConversation(mockConversation)
    }

    // Código original de Supabase
    const { data: nuevaConversacion } = await supabase
      .from('conversations')
      .insert({
        user_id: usuarioId,
        title: titulo
      })
      .select()
      .single()

    if (!nuevaConversacion) {
      throw new Error('No se pudo crear la conversación')
    }

    console.log(`✅ Conversación creada: ${nuevaConversacion.title}`)
    return nuevaConversacion
  }

  /**
   * 📨 GUARDAR MENSAJE
   */
  static async guardarMensaje(conversacionId: string, contenido: string, rol: 'user' | 'assistant'): Promise<Message> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para mensaje')
      const mockMessage = await MockHealthService.guardarMensaje(conversacionId, contenido, rol)
      return adaptMockMessageToMessage(mockMessage)
    }

    // Código original de Supabase
    const { data: nuevoMensaje } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversacionId,
        content: contenido,
        role: rol
      })
      .select()
      .single()

    if (!nuevoMensaje) {
      throw new Error('No se pudo guardar el mensaje')
    }

    console.log(`✅ Mensaje guardado (${rol}): ${contenido.substring(0, 50)}...`)
    return nuevoMensaje
  }

  /**
   * 📋 OBTENER MENSAJES
   */
  static async obtenerMensajes(conversacionId: string): Promise<Message[]> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para obtener mensajes')
      const mockMessages = await MockHealthService.obtenerMensajes(conversacionId)
      return mockMessages.map(adaptMockMessageToMessage)
    }

    // Código original de Supabase
    const { data: mensajes } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversacionId)
      .order('created_at', { ascending: true })

    if (!mensajes) {
      throw new Error('No se pudieron obtener los mensajes')
    }

    console.log(`✅ Mensajes obtenidos: ${mensajes.length}`)
    return mensajes
  }

  /**
   * 🏥 GUARDAR RESULTADO DE TRIAGE
   */
  static async guardarResultadoTriage(conversacionId: string, nivel: 'autocuidado' | 'cita' | 'urgente', confianza: number, explicacion: string, consejos: string[]): Promise<TriageResult> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para triage')
      // Para mock, necesitamos simular los síntomas basados en los consejos
      const mockTriage = await MockHealthService.guardarResultadoTriage(conversacionId, explicacion)
      return adaptMockTriageToTriage(mockTriage)
    }

    // Código original de Supabase
    const { data: resultado } = await supabase
      .from('triage_results')
      .insert({
        conversation_id: conversacionId,
        nivel,
        confianza,
        explicacion,
        consejos
      })
      .select()
      .single()

    if (!resultado) {
      throw new Error('No se pudo guardar el resultado del triage')
    }

    console.log(`✅ Triage guardado: ${resultado.nivel} (${resultado.confianza}%)`)
    return resultado
  }

  /**
   * 🔔 ENVIAR NOTIFICACIÓN
   */
  static async enviarNotificacion(telefono: string, mensaje: string, tipoNotificacion: string = 'triage'): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para notificación')
      return await MockHealthService.enviarNotificacion(telefono, mensaje)
    }

    try {
      // Webhook de n8n para automatización
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (webhookUrl && webhookUrl !== 'mock-mode') {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: telefono,
            message: mensaje,
            type: tipoNotificacion,
            timestamp: new Date().toISOString()
          })
        })
      }

      console.log(`📱 Notificación enviada a ${telefono}`)
      return true
    } catch (error) {
      console.error('❌ Error enviando notificación:', error)
      return false
    }
  }

  /**
   * � INICIAR CONVERSACIÓN DE SALUD
   */
  static async iniciarConversacionSalud(telefono: string, nombre?: string): Promise<{ user: User, conversation: Conversation }> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para iniciar conversación')
      const mockResult = await MockHealthService.iniciarConversacionSalud(telefono, nombre)
      return {
        user: adaptMockUserToUser(mockResult.user),
        conversation: adaptMockConversationToConversation(mockResult.conversation)
      }
    }

    return await RealHealthService.iniciarConversacionSalud(telefono, nombre)
  }

  /**
   * 📊 OBTENER RESULTADOS DE TRIAGE
   */
  static async obtenerResultadosTriage(conversationId: string): Promise<TriageResult[]> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para obtener resultados de triage')
      const mockResults = await MockHealthService.obtenerResultadosTriage(conversationId)
      return mockResults.map(adaptMockTriageToTriage)
    }

    return await RealHealthService.obtenerResultadosTriage(conversationId)
  }

  /**
   * 💬 ENVIAR MENSAJE
   */
  static async enviarMensaje(conversationId: string, role: 'user' | 'bot', content: string): Promise<Message> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para enviar mensaje')
      const mockMessage = await MockHealthService.enviarMensaje(conversationId, role, content)
      return adaptMockMessageToMessage(mockMessage)
    }

    return await RealHealthService.enviarMensaje(conversationId, role, content)
  }

  /**
   * 💾 GUARDAR RESULTADO DE TRIAGE
   */
  static async guardarResultadoTriage(conversationId: string, messageId: string, analisis: any): Promise<TriageResult> {
    if (!isSupabaseConfigured()) {
      console.log('🎭 Usando servicio MOCK para guardar resultado de triage')
      const mockResult = await MockHealthService.guardarResultadoTriage(conversationId, messageId, analisis)
      return adaptMockTriageToTriage(mockResult)
    }

    return await RealHealthService.guardarResultadoTriage(conversationId, messageId, analisis)
  }

  /**
   * �🔍 VERIFICAR MODO ACTUAL
   */
  static getModeInfo(): { mode: 'real' | 'mock', configured: boolean } {
    const configured = isSupabaseConfigured()
    return {
      mode: configured ? 'real' : 'mock',
      configured
    }
  }
}

// 🚀 MOSTRAR MODO AL INICIALIZAR
const modeInfo = HealthService.getModeInfo()
if (modeInfo.mode === 'mock') {
  console.log('🎭 KALIMA HEALTH - MODO DESARROLLO CON DATOS MOCK')
  console.log('✨ Todas las funcionalidades están siendo simuladas')
  console.log('🔧 Para usar servicios reales, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
} else {
  console.log('🌐 KALIMA HEALTH - MODO PRODUCCIÓN CON SUPABASE')
}