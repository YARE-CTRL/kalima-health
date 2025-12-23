/**
 * 🏥 SERVICIO DE SALUD SIMPLE
 * 
 * ¿Qué hace esto?
 * - Guarda y busca usuarios en la base de datos
 * - Crea conversaciones de chat
 * - Guarda mensajes del chat
 * - Guarda resultados de triage
 * - Envía notificaciones automáticas
 */

import { supabase } from './supabase'
import type { User, Conversation, Message, TriageResult } from './supabase'

export class HealthService {
  
  /**
   * 👤 CREAR O BUSCAR USUARIO
   * Si el usuario ya existe, lo devuelve. Si no, lo crea.
   */
  static async encontrarOCrearUsuario(telefono: string, nombre?: string): Promise<User> {
    // Validar teléfono
    if (!telefono || telefono.length < 8) {
      throw new Error('Número de teléfono inválido')
    }

    // Buscar usuario existente
    const { data: usuarioExistente } = await supabase
      .from('users')
      .select('*')
      .eq('phone', telefono)
      .single()

    // Si ya existe, devolverlo
    if (usuarioExistente) {
      console.log(`✅ Usuario encontrado: ${usuarioExistente.name}`)
      return usuarioExistente
    }

    // Si no existe, crearlo
    const { data: nuevoUsuario } = await supabase
      .from('users')
      .insert({
        phone: telefono,
        name: nombre || `Usuario ${telefono.slice(-4)}`,
        role: 'paciente'
      })
      .select()
      .single()

    console.log(`✅ Usuario creado: ${nuevoUsuario.name}`)
    return nuevoUsuario!
  }

  /**
   * 💬 CREAR O ABRIR CONVERSACIÓN
   * Crea una nueva conversación o abre una existente
   */
  static async crearOAbrirConversacion(telefono: string, nombre?: string): Promise<{ user: User, conversation: Conversation }> {
    // Crear o encontrar usuario
    const usuario = await this.encontrarOCrearUsuario(telefono, nombre)
    
    // Buscar conversación abierta
    const { data: conversacionExistente } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', usuario.id)
      .eq('status', 'abierta')
      .single()

    // Si ya tiene conversación abierta, devolverla
    if (conversacionExistente) {
      console.log(`✅ Conversación abierta encontrada`)
      return { user: usuario, conversation: conversacionExistente }
    }

    // Si no tiene conversación abierta, crear una nueva
    const { data: nuevaConversacion } = await supabase
      .from('conversations')
      .insert({
        user_id: usuario.id,
        status: 'abierta'
      })
      .select()
      .single()

    console.log(`✅ Nueva conversación creada`)
    return { user: usuario, conversation: nuevaConversacion! }
  }

  /**
   * 📝 ENVIAR MENSAJE
   * Guarda un mensaje en la conversación
   */
  static async enviarMensaje(
    idConversacion: string, 
    remitente: 'user' | 'bot' | 'promotor', 
    contenido: string
  ): Promise<Message> {
    const { data: mensaje } = await supabase
      .from('messages')
      .insert({
        conversation_id: idConversacion,
        sender: remitente,
        content: contenido
      })
      .select()
      .single()

    console.log(`📝 Mensaje guardado: ${remitente}`)
    return mensaje!
  }

  /**
   * 📚 OBTENER MENSAJES
   * Obtiene todos los mensajes de una conversación
   */
  static async obtenerMensajes(idConversacion: string): Promise<Message[]> {
    const { data: mensajes } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', idConversacion)
      .order('created_at', { ascending: true })

    console.log(`📚 ${mensajes?.length || 0} mensajes obtenidos`)
    return mensajes || []
  }

  /**
   * 🏥 GUARDAR RESULTADO DE TRIAGE
   * Guarda el resultado del análisis médico
   */
  static async guardarResultadoTriage(
    idConversacion: string, 
    nivel: 'autocuidado' | 'cita' | 'urgente', 
    notas?: string,
    idUsuario?: string,
    ultimoMensaje?: string
  ): Promise<TriageResult> {
    // Guardar en base de datos
    const { data: resultado } = await supabase
      .from('triage_results')
      .insert({ 
        conversation_id: idConversacion, 
        level: nivel, 
        notes: notas 
      })
      .select()
      .single()

    console.log(`🏥 Triage guardado: ${nivel}`)

    // Enviar notificación automática (no bloquea la respuesta)
    this.enviarNotificacionAutomatica({
      nivelTriage: nivel,
      confianza: this.extraerConfianza(notas),
      idUsuario: idUsuario || 'desconocido',
      idConversacion,
      ultimoMensaje: ultimoMensaje || '',
      hora: new Date().toISOString()
    }).catch(error => {
      console.log('Notificación automática falló:', error.message)
    })

    return resultado!
  }

  /**
   * 📊 OBTENER RESULTADOS DE TRIAGE
   * Obtiene el historial de triage de una conversación
   */
  static async obtenerResultadosTriage(idConversacion: string): Promise<TriageResult[]> {
    const { data: resultados } = await supabase
      .from('triage_results')
      .select('*')
      .eq('conversation_id', idConversacion)
      .order('created_at', { ascending: false })

    console.log(`📊 ${resultados?.length || 0} resultados de triage obtenidos`)
    return resultados || []
  }

  /**
   * 🔒 CERRAR CONVERSACIÓN
   * Marca una conversación como cerrada
   */
  static async cerrarConversacion(idConversacion: string): Promise<void> {
    await supabase
      .from('conversations')
      .update({ status: 'cerrada' })
      .eq('id', idConversacion)

    console.log(`🔒 Conversación cerrada`)
  }

  /**
   * 🔍 OBTENER CONVERSACIÓN
   * Obtiene una conversación específica
   */
  static async obtenerConversacion(idConversacion: string): Promise<Conversation | null> {
    const { data: conversacion } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', idConversacion)
      .single()

    return conversacion
  }

  /**
   * 🚀 INICIAR CONVERSACIÓN DE SALUD
   * Función principal para empezar un chat médico
   */
  static async iniciarConversacionSalud(telefono: string, nombre?: string): Promise<{ user: User, conversation: Conversation }> {
    return await this.crearOAbrirConversacion(telefono, nombre)
  }

  /**
   * 📤 ENVIAR NOTIFICACIÓN AUTOMÁTICA
   * Envía webhook a n8n para automatizaciones
   */
  private static async enviarNotificacionAutomatica(payload: {
    nivelTriage: string
    confianza: number
    idUsuario: string
    idConversacion: string
    ultimoMensaje: string
    hora: string
  }): Promise<void> {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.log('URL de n8n no configurada, saltando automatización')
      return
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'kalima-health'
        },
        body: JSON.stringify(payload)
      })
      
      console.log('✅ Notificación automática enviada')
    } catch (error) {
      console.error('❌ Error enviando notificación automática:', error)
    }
  }

  /**
   * 🔢 EXTRAER CONFIANZA
   * Extrae el nivel de confianza de las notas
   */
  private static extraerConfianza(notas?: string): number {
    if (!notas) return 0.8
    
    const match = notas.match(/Confianza: (\d+)%/)
    if (match) {
      return parseInt(match[1]) / 100
    }
    
    return 0.8
  }
}