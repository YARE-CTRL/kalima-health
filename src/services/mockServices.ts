/**
 * 🎭 SERVICIOS MOCK PARA DESARROLLO RÁPIDO
 * Reemplaza las funciones de Supabase sin necesidad de configuración
 */

import { mockDatabase, generateMockTriage, getRandomResponse } from './mockData'
import type { MockUser, MockConversation, MockMessage, MockTriageResult } from './mockData'

export class MockHealthService {
  
  /**
   * 👤 ENCONTRAR O CREAR USUARIO MOCK
   */
  static async encontrarOCrearUsuario(telefono: string, nombre?: string): Promise<MockUser> {
    console.log('🎭 MOCK: Buscando usuario con teléfono:', telefono)
    
    // Buscar usuario existente
    let usuario = await mockDatabase.findUser(telefono)
    
    if (!usuario) {
      // Crear usuario nuevo
      console.log('🎭 MOCK: Creando nuevo usuario')
      usuario = await mockDatabase.createUser({
        phone: telefono,
        name: nombre || 'Usuario Mock',
        region: 'Región Mock'
      })
    }
    
    console.log('✅ MOCK: Usuario encontrado/creado:', usuario.name)
    return usuario
  }

  /**
   * 💬 CREAR CONVERSACIÓN MOCK
   */
  static async crearConversacion(usuarioId: string, titulo: string = 'Nueva consulta'): Promise<MockConversation> {
    console.log('🎭 MOCK: Creando conversación para usuario:', usuarioId)
    
    const conversacion = await mockDatabase.createConversation(usuarioId, titulo)
    
    // Agregar mensaje de bienvenida automáticamente
    await this.guardarMensaje(conversacion.id, 'Hola, soy tu asistente médico virtual de Kalima Health. ¿En qué puedo ayudarte hoy?', 'assistant')
    
    console.log('✅ MOCK: Conversación creada:', conversacion.title)
    return conversacion
  }

  /**
   * 📨 GUARDAR MENSAJE MOCK
   */
  static async guardarMensaje(conversacionId: string, contenido: string, rol: 'user' | 'assistant'): Promise<MockMessage> {
    console.log(`🎭 MOCK: Guardando mensaje ${rol}:`, contenido.substring(0, 50) + '...')
    
    const mensaje = await mockDatabase.createMessage({
      conversation_id: conversacionId,
      content: contenido,
      role: rol
    })
    
    console.log('✅ MOCK: Mensaje guardado')
    return mensaje
  }

  /**
   * 📋 OBTENER MENSAJES MOCK
   */
  static async obtenerMensajes(conversacionId: string): Promise<MockMessage[]> {
    console.log('🎭 MOCK: Obteniendo mensajes para conversación:', conversacionId)
    
    const mensajes = await mockDatabase.getMessages(conversacionId)
    
    console.log('✅ MOCK: Mensajes obtenidos:', mensajes.length)
    return mensajes
  }

  /**
   * 🏥 GUARDAR RESULTADO DE TRIAGE MOCK
   */
  static async guardarResultadoTriage(conversacionId: string, sintomas: string): Promise<MockTriageResult> {
    console.log('🎭 MOCK: Analizando síntomas para triage...')
    
    // Generar triage basado en síntomas
    const analisis = generateMockTriage(sintomas)
    
    const resultado = await mockDatabase.createTriageResult({
      conversation_id: conversacionId,
      ...analisis
    })
    
    console.log('✅ MOCK: Triage completado - Nivel:', resultado.nivel)
    return resultado
  }

  /**
   * 🔔 ENVIAR NOTIFICACIÓN MOCK (simulación)
   */
  static async enviarNotificacion(userId: string, mensaje: string): Promise<boolean> {
    console.log('🎭 MOCK: Enviando notificación a usuario:', userId)
    console.log('📢 MOCK: Notificación:', mensaje)
    
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ MOCK: Notificación enviada exitosamente')
    return true
  }

  /**
   * 📊 OBTENER ESTADÍSTICAS MOCK
   */
  static async obtenerEstadisticas(): Promise<any> {
    console.log('🎭 MOCK: Obteniendo estadísticas...')
    
    const data = mockDatabase.getAllData()
    
    return {
      usuarios_activos: data.users.length,
      conversaciones_hoy: data.conversations.length,
      triage_urgente: data.triageResults.filter(t => t.nivel === 'urgente').length,
      triage_cita: data.triageResults.filter(t => t.nivel === 'cita').length,
      triage_autocuidado: data.triageResults.filter(t => t.nivel === 'autocuidado').length
    }
  }

  /**
   * 🚀 INICIAR CONVERSACIÓN DE SALUD MOCK
   */
  static async iniciarConversacionSalud(telefono: string, nombre?: string): Promise<{ user: MockUser, conversation: MockConversation }> {
    console.log('🎭 MOCK: Iniciando conversación de salud...', { telefono, nombre })
    
    const user: MockUser = {
      id: `mock-user-${Date.now()}`,
      phone: telefono,
      name: nombre || `Usuario ${telefono.slice(-4)}`,
      role: 'paciente',
      region: 'Mock Region',
      created_at: new Date().toISOString()
    }
    
    const conversation: MockConversation = {
      id: `mock-conversation-${Date.now()}`,
      user_id: user.id,
      title: `Consulta ${new Date().toLocaleDateString()}`,
      created_at: new Date().toISOString()
    }
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ MOCK: Conversación iniciada', { user, conversation })
    return { user, conversation }
  }

  /**
   * 📊 OBTENER RESULTADOS DE TRIAGE MOCK
   */
  static async obtenerResultadosTriage(conversationId: string): Promise<MockTriageResult[]> {
    console.log('🎭 MOCK: Obteniendo resultados de triage...', conversationId)
    
    // Simular algunos resultados previos
    const mockResults: MockTriageResult[] = [
      {
        id: `mock-triage-${Date.now()}`,
        conversation_id: conversationId,
        nivel: 'autocuidado',
        confianza: 85,
        explicacion: 'Síntomas leves que pueden tratarse en casa',
        consejos: ['Descansar', 'Mantenerse hidratado', 'Tomar líquidos tibios'],
        created_at: new Date().toISOString()
      }
    ]
    
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('✅ MOCK: Resultados obtenidos', mockResults)
    return mockResults
  }

  /**
   * 💬 ENVIAR MENSAJE MOCK
   */
  static async enviarMensaje(conversationId: string, role: 'user' | 'bot', content: string): Promise<MockMessage> {
    console.log('🎭 MOCK: Enviando mensaje...', { conversationId, role, content })
    
    const message: MockMessage = {
      id: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversation_id: conversationId,
      content: content,
      role: role,
      created_at: new Date().toISOString()
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log('✅ MOCK: Mensaje enviado', message)
    return message
  }

  /**
   * 💾 GUARDAR RESULTADO DE TRIAGE MOCK (nueva implementación)
   */
  static async guardarResultadoTriage(conversationId: string, messageId: string, analisis: any): Promise<MockTriageResult> {
    console.log('🎭 MOCK: Guardando resultado de triage...', { conversationId, messageId, analisis })
    
    const triageResult: MockTriageResult = {
      id: `mock-triage-${Date.now()}`,
      conversation_id: conversationId,
      nivel: analisis.nivel || 'autocuidado',
      confianza: analisis.confianza || 80,
      explicacion: analisis.explicacion || 'Análisis simulado del sistema mock',
      consejos: analisis.consejos || ['Recomendación simulada 1', 'Recomendación simulada 2'],
      created_at: new Date().toISOString()
    }
    
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('✅ MOCK: Resultado guardado', triageResult)
    return triageResult
  }
}

/**
 * 🤖 SERVICIO DE CHAT MOCK
 */
export class MockAgentService {
  
  /**
   * 💭 PROCESAR MENSAJE CON IA MOCK
   */
  static async procesarMensaje(mensaje: string, conversacionId: string): Promise<string> {
    console.log('🎭 MOCK: Procesando mensaje con IA mock...')
    console.log('📝 MOCK: Mensaje recibido:', mensaje.substring(0, 100) + '...')
    
    // Simular tiempo de procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let respuesta = ''
    
    // Lógica simple para generar respuestas contextuales
    const mensajeMinuscula = mensaje.toLowerCase()
    
    if (mensajeMinuscula.includes('hola') || mensajeMinuscula.includes('buenos')) {
      respuesta = "¡Hola! Soy tu asistente médico virtual. Estoy aquí para ayudarte con cualquier consulta de salud. ¿Qué síntomas o molestias tienes?"
    }
    else if (mensajeMinuscula.includes('dolor')) {
      respuesta = "Entiendo que tienes dolor. Para ayudarte mejor, ¿puedes decirme:\n• ¿Dónde sientes el dolor exactamente?\n• ¿Cuándo comenzó?\n• ¿Cómo describirías el dolor? (punzante, sordo, pulsátil)\n• ¿Del 1 al 10, qué tan intenso es?"
    }
    else if (mensajeMinuscula.includes('fiebre')) {
      respuesta = "La fiebre puede ser síntoma de varias condiciones. ¿Has podido tomarte la temperatura? ¿Tienes otros síntomas como dolor de cabeza, dolor corporal, o escalofríos?"
    }
    else if (mensajeMinuscula.includes('cabeza')) {
      respuesta = "Los dolores de cabeza pueden tener diferentes causas. ¿Es un dolor que conoces o es diferente a lo usual? ¿Has estado estresado, has dormido mal, o has cambiado tu rutina recientemente?"
    }
    else if (mensajeMinuscula.includes('gracias')) {
      respuesta = "¡De nada! Estoy aquí para ayudarte. ¿Hay algo más sobre tu salud que te preocupe? Recuerda que siempre es importante escuchar a tu cuerpo."
    }
    else {
      // Respuesta genérica inteligente
      respuesta = `Gracias por contarme sobre "${mensaje}". Para poder darte la mejor recomendación, me gustaría conocer más detalles. ¿Puedes contarme cuándo comenzaron estos síntomas y si has notado algo que los mejore o empeore?`
    }
    
    console.log('✅ MOCK: Respuesta generada:', respuesta.substring(0, 50) + '...')
    
    // Después de algunas interacciones, sugerir triage
    const mensajes = await mockDatabase.getMessages(conversacionId)
    if (mensajes.length > 4) {
      respuesta += "\n\n🏥 Basándome en lo que me has contado, voy a hacer un análisis para determinar el siguiente paso más adecuado para tu situación."
    }
    
    return respuesta
  }

  /**
   * 🎯 COMUNICACIÓN ENTRE AGENTES MOCK
   */
  static async comunicarConAgente(agenteTipo: string, datos: any): Promise<any> {
    console.log(`🎭 MOCK: Comunicando con agente ${agenteTipo}`)
    console.log('📤 MOCK: Datos enviados:', datos)
    
    // Simular comunicación entre agentes
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const respuestaMock = {
      agente: agenteTipo,
      procesado: true,
      timestamp: new Date().toISOString(),
      respuesta: `Respuesta simulada del agente ${agenteTipo}`,
      datos_procesados: datos
    }
    
    console.log('✅ MOCK: Comunicación completada')
    return respuestaMock
  }

  /**
   * 🤖 CONFIGURAR AGENTES BÁSICOS MOCK
   */
  static configurarAgentesBasicos(): void {
    console.log('🎭 MOCK: Configurando agentes básicos...')
    console.log('✅ MOCK: Agentes básicos configurados (simulado)')
  }

  /**
   * 💬 SIMULAR COMUNICACIÓN A2A MOCK
   */
  static async simularComunicacionA2A(
    sintomas: string, 
    idConversacion: string, 
    idUsuario: string
  ): Promise<void> {
    console.log('🎭 MOCK: Simulando comunicación A2A...')
    console.log('📝 MOCK: Síntomas:', sintomas.substring(0, 50) + '...')
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ MOCK: Comunicación A2A completada')
  }
}

/**
 * 🎭 UTILIDADES MOCK
 */
export class MockUtils {
  
  /**
   * 🔍 VERIFICAR SI ESTAMOS EN MODO MOCK
   */
  static isMockMode(): boolean {
    return !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK === 'true'
  }

  /**
   * 📊 MOSTRAR ESTADO MOCK
   */
  static showMockStatus(): void {
    if (this.isMockMode()) {
      console.log('🎭 MODO MOCK ACTIVADO')
      console.log('✨ Todas las funcionalidades están siendo simuladas')
      console.log('🔧 Para usar servicios reales, configura las variables de entorno')
    }
  }

  /**
   * 🧹 LIMPIAR DATOS MOCK
   */
  static clearMockData(): void {
    mockDatabase.clearAll()
    console.log('🧹 MOCK: Datos eliminados')
  }

  /**
   * 📋 MOSTRAR DATOS MOCK
   */
  static showMockData(): void {
    const data = mockDatabase.getAllData()
    console.log('📊 DATOS MOCK:', data)
  }
}

// 🚀 INICIALIZACIÓN AUTOMÁTICA
if (MockUtils.isMockMode()) {
  MockUtils.showMockStatus()
}

export {
  MockHealthService as HealthService,
  MockAgentService as AgentService
}