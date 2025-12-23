/**
 * 🚀 SERVICIO SIMPLE DE COMUNICACIÓN ENTRE AGENTES
 * 
 * ¿Qué hace esto?
 * - Los agentes son como "robots" que se comunican entre sí
 * - Cuando un usuario tiene síntomas, los agentes hablan entre ellos
 * - Es como un chat entre robots para coordinar la atención médica
 */

// 📝 TIPOS SIMPLES (como plantillas)
export interface MensajeAgente {
  de: string           // Quién envía el mensaje
  para: string         // A quién va dirigido
  tipo: string         // Qué tipo de mensaje es
  datos: any           // La información que se envía
  hora: string         // Cuándo se envió
  importante: boolean  // Si es urgente o no
}

export interface Agente {
  id: string           // Nombre único del agente
  nombre: string       // Nombre que se muestra
  queHace: string[]    // Qué puede hacer este agente
  activo: boolean      // Si está funcionando o no
}

// 🤖 CLASE PRINCIPAL (muy simplificada)
export class AgentService {
  // 📚 Lista de agentes registrados
  private static agentes: Agente[] = []
  
  // 📨 Lista de mensajes enviados
  private static mensajes: MensajeAgente[] = []

  /**
   * 📝 REGISTRAR UN AGENTE
   * Es como agregar un robot a la lista de robots disponibles
   */
  static registrarAgente(agente: Agente): void {
    this.agentes.push(agente)
    console.log(`✅ Agente ${agente.nombre} registrado`)
  }

  /**
   * 📤 ENVIAR MENSAJE ENTRE AGENTES
   * Es como enviar un WhatsApp entre robots
   */
  static async enviarMensaje(mensaje: MensajeAgente): Promise<boolean> {
    try {
      // Verificar que el agente destino existe
      const agenteDestino = this.agentes.find(a => a.id === mensaje.para)
      if (!agenteDestino) {
        console.log(`❌ Agente ${mensaje.para} no encontrado`)
        return false
      }

      // Agregar mensaje a la lista
      this.mensajes.push(mensaje)
      
      // Mostrar en consola (para debugging)
      console.log(`📨 ${mensaje.de} → ${mensaje.para}: ${mensaje.tipo}`)
      
      // Procesar el mensaje
      await this.procesarMensaje(mensaje)
      
      return true
    } catch (error) {
      console.log('❌ Error enviando mensaje:', error)
      return false
    }
  }

  /**
   * 🔄 PROCESAR MENSAJE
   * Decidir qué hacer con cada tipo de mensaje
   */
  private static async procesarMensaje(mensaje: MensajeAgente): Promise<void> {
    switch (mensaje.tipo) {
      case 'solicitud_triage':
        await this.manejarSolicitudTriage(mensaje)
        break
      case 'respuesta_triage':
        await this.manejarRespuestaTriage(mensaje)
        break
      case 'escalacion':
        await this.manejarEscalacion(mensaje)
        break
      default:
        console.log(`📢 Mensaje de tipo: ${mensaje.tipo}`)
    }
  }

  /**
   * 🏥 MANEJAR SOLICITUD DE TRIAGE
   * Cuando un agente pide ayuda para analizar síntomas
   */
  private static async manejarSolicitudTriage(mensaje: MensajeAgente): Promise<void> {
    console.log(`🔍 ${mensaje.de} pide ayuda para analizar síntomas`)
    
    // Crear respuesta automática
    const respuesta: MensajeAgente = {
      de: mensaje.para,
      para: mensaje.de,
      tipo: 'respuesta_triage',
      datos: {
        nivel: 'cita',  // Por defecto, necesita cita
        confianza: 0.8,
        recomendacion: 'Consulta médica recomendada'
      },
      hora: new Date().toISOString(),
      importante: false
    }

    // Enviar respuesta
    await this.enviarMensaje(respuesta)
  }

  /**
   * ✅ MANEJAR RESPUESTA DE TRIAGE
   * Cuando un agente responde sobre el análisis de síntomas
   */
  private static async manejarRespuestaTriage(mensaje: MensajeAgente): Promise<void> {
    console.log(`✅ ${mensaje.de} responde: ${mensaje.datos.nivel}`)
    
    // Si es urgente, escalar
    if (mensaje.datos.nivel === 'urgente') {
      const escalacion: MensajeAgente = {
        de: 'sistema',
        para: 'supervisor',
        tipo: 'escalacion',
        datos: {
          razon: 'Caso urgente detectado',
          agenteOriginal: mensaje.de
        },
        hora: new Date().toISOString(),
        importante: true
      }

      await this.enviarMensaje(escalacion)
    }
  }

  /**
   * 🚨 MANEJAR ESCALACIÓN
   * Cuando algo urgente necesita atención especial
   */
  private static async manejarEscalacion(mensaje: MensajeAgente): Promise<void> {
    console.log(`🚨 ESCALACIÓN: ${mensaje.datos.razon}`)
    console.log(`👨‍⚕️ Supervisor notificado sobre caso urgente`)
  }

  /**
   * 📋 OBTENER AGENTES DISPONIBLES
   * Lista de robots que están funcionando
   */
  static obtenerAgentesDisponibles(): Agente[] {
    return this.agentes.filter(agente => agente.activo)
  }

  /**
   * 📚 OBTENER HISTORIAL DE MENSAJES
   * Ver todos los mensajes enviados
   */
  static obtenerHistorial(): MensajeAgente[] {
    return this.mensajes
  }

  /**
   * 🚀 CONFIGURAR AGENTES POR DEFECTO
   * Crear los robots básicos del sistema
   */
  static configurarAgentesBasicos(): void {
    // 🤖 Agente Clínico (analiza síntomas)
    this.registrarAgente({
      id: 'clinico',
      nombre: 'Dr. Robot Clínico',
      queHace: ['analizar_sintomas', 'hacer_triage', 'dar_consejos'],
      activo: true
    })

    // 🤖 Agente Operacional (envía notificaciones)
    this.registrarAgente({
      id: 'operacional',
      nombre: 'Robot Notificaciones',
      queHace: ['enviar_sms', 'enviar_email', 'crear_recordatorios'],
      activo: true
    })

    // 🤖 Agente Supervisor (supervisa casos urgentes)
    this.registrarAgente({
      id: 'supervisor',
      nombre: 'Dr. Supervisor',
      queHace: ['revisar_casos_urgentes', 'escalar_casos', 'supervisar_calidad'],
      activo: true
    })

    console.log('🤖 Sistema de agentes inicializado con', this.agentes.length, 'agentes')
  }

  /**
   * 💬 SIMULAR COMUNICACIÓN A2A
   * Función simple para que los agentes hablen entre ellos
   */
  static async simularComunicacionA2A(
    sintomas: string, 
    _idConversacion: string, 
    _idUsuario: string
  ): Promise<void> {
    // Crear mensaje simple
    const mensaje: MensajeAgente = {
      de: 'clinico',
      para: 'operacional',
      tipo: 'solicitud_triage',
      datos: {
        sintomas: sintomas,
        necesitaNotificacion: true
      },
      hora: new Date().toISOString(),
      importante: false
    }

    // Enviar mensaje
    await this.enviarMensaje(mensaje)
  }
}