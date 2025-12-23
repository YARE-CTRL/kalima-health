// 🎭 DATOS MOCK PARA DESARROLLO RÁPIDO
// Simula la funcionalidad de Supabase sin configuración

export interface MockUser {
  id: string
  phone: string
  name?: string
  region?: string
  created_at: string
}

export interface MockConversation {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface MockMessage {
  id: string
  conversation_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export interface MockTriageResult {
  id: string
  conversation_id: string
  nivel: 'autocuidado' | 'cita' | 'urgente'
  confianza: number
  explicacion: string
  consejos: string[]
  created_at: string
}

// 🎭 BASE DE DATOS EN MEMORIA
class MockDatabase {
  private users: MockUser[] = [
    {
      id: '1',
      phone: '+57 300 123 4567',
      name: 'María González',
      region: 'Antioquia',
      created_at: '2023-12-20T10:00:00Z'
    },
    {
      id: '2', 
      phone: '+57 301 987 6543',
      name: 'Carlos Rodríguez',
      region: 'Cundinamarca',
      created_at: '2023-12-21T08:30:00Z'
    }
  ]

  private conversations: MockConversation[] = [
    {
      id: '1',
      user_id: '1',
      title: 'Consulta sobre dolor de cabeza',
      created_at: '2023-12-20T10:05:00Z'
    },
    {
      id: '2',
      user_id: '2', 
      title: 'Síntomas de gripe',
      created_at: '2023-12-21T08:35:00Z'
    }
  ]

  private messages: MockMessage[] = [
    {
      id: '1',
      conversation_id: '1',
      content: 'Hola, tengo un dolor de cabeza fuerte desde esta mañana',
      role: 'user',
      created_at: '2023-12-20T10:05:00Z'
    },
    {
      id: '2',
      conversation_id: '1', 
      content: 'Hola María. Entiendo que tienes dolor de cabeza fuerte. ¿Puedes contarme más detalles sobre el dolor? ¿Es pulsátil, constante, en qué zona de la cabeza?',
      role: 'assistant',
      created_at: '2023-12-20T10:05:30Z'
    }
  ]

  private triageResults: MockTriageResult[] = [
    {
      id: '1',
      conversation_id: '1',
      nivel: 'cita',
      confianza: 75,
      explicacion: 'Dolor de cabeza persistente requiere evaluación médica',
      consejos: [
        'Mantente hidratado',
        'Descansa en lugar tranquilo',
        'Evita luces brillantes',
        'Agenda cita médica si persiste'
      ],
      created_at: '2023-12-20T10:10:00Z'
    }
  ]

  // 👤 MÉTODOS DE USUARIOS
  async findUser(phone: string): Promise<MockUser | null> {
    await this.delay(300) // Simular latencia de red
    return this.users.find(u => u.phone === phone) || null
  }

  async createUser(userData: Omit<MockUser, 'id' | 'created_at'>): Promise<MockUser> {
    await this.delay(500)
    const newUser: MockUser = {
      ...userData,
      id: (this.users.length + 1).toString(),
      created_at: new Date().toISOString()
    }
    this.users.push(newUser)
    return newUser
  }

  // 💬 MÉTODOS DE CONVERSACIONES
  async createConversation(userId: string, title: string): Promise<MockConversation> {
    await this.delay(400)
    const newConversation: MockConversation = {
      id: (this.conversations.length + 1).toString(),
      user_id: userId,
      title,
      created_at: new Date().toISOString()
    }
    this.conversations.push(newConversation)
    return newConversation
  }

  async getConversations(userId: string): Promise<MockConversation[]> {
    await this.delay(300)
    return this.conversations.filter(c => c.user_id === userId)
  }

  // 📨 MÉTODOS DE MENSAJES
  async createMessage(messageData: Omit<MockMessage, 'id' | 'created_at'>): Promise<MockMessage> {
    await this.delay(200)
    const newMessage: MockMessage = {
      ...messageData,
      id: (this.messages.length + 1).toString(),
      created_at: new Date().toISOString()
    }
    this.messages.push(newMessage)
    return newMessage
  }

  async getMessages(conversationId: string): Promise<MockMessage[]> {
    await this.delay(300)
    return this.messages.filter(m => m.conversation_id === conversationId)
  }

  // 🏥 MÉTODOS DE TRIAGE
  async createTriageResult(triageData: Omit<MockTriageResult, 'id' | 'created_at'>): Promise<MockTriageResult> {
    await this.delay(600)
    const newTriage: MockTriageResult = {
      ...triageData,
      id: (this.triageResults.length + 1).toString(),
      created_at: new Date().toISOString()
    }
    this.triageResults.push(newTriage)
    return newTriage
  }

  // ⏱️ Simular latencia de red
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 📊 Métodos de utilidad
  getAllData() {
    return {
      users: this.users,
      conversations: this.conversations,
      messages: this.messages,
      triageResults: this.triageResults
    }
  }

  clearAll() {
    this.users = []
    this.conversations = []
    this.messages = []
    this.triageResults = []
  }
}

// 🎭 INSTANCIA GLOBAL MOCK
export const mockDatabase = new MockDatabase()

// 🎯 RESPUESTAS MOCK PARA EL CHAT
export const mockChatResponses = [
  "Hola, soy tu asistente médico virtual. ¿En qué puedo ayudarte hoy?",
  "Entiendo tu preocupación. ¿Puedes contarme más detalles sobre los síntomas?",
  "Gracias por la información. Basándome en lo que me cuentas, te voy a hacer algunas preguntas más específicas.",
  "¿Cuándo comenzaron estos síntomas? ¿Han empeorado con el tiempo?",
  "¿Has tenido fiebre? ¿Has tomado algún medicamento?",
  "Basándome en tus síntomas, creo que necesitas una evaluación médica. Te recomiendo agendar una cita."
]

// 🎲 FUNCIONES ÚTILES
export const getRandomResponse = () => {
  return mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)]
}

export const generateMockTriage = (symptoms: string) => {
  const urgentKeywords = ['dolor pecho', 'dificultad respirar', 'sangrado', 'desmayo']
  const isUrgent = urgentKeywords.some(keyword => 
    symptoms.toLowerCase().includes(keyword)
  )
  
  if (isUrgent) {
    return {
      nivel: 'urgente' as const,
      confianza: 90,
      explicacion: 'Los síntomas descritos requieren atención médica inmediata',
      consejos: [
        'Busca atención médica de emergencia inmediatamente',
        'No conduzcas, pide que te lleven',
        'Mantén la calma',
        'Si tienes medicamentos de emergencia, úsalos según indicaciones médicas'
      ]
    }
  }
  
  const appointmentKeywords = ['dolor', 'malestar', 'síntomas', 'molestia']
  const needsAppointment = appointmentKeywords.some(keyword =>
    symptoms.toLowerCase().includes(keyword)
  )
  
  if (needsAppointment) {
    return {
      nivel: 'cita' as const,
      confianza: 75,
      explicacion: 'Los síntomas requieren evaluación médica profesional',
      consejos: [
        'Agenda una cita médica en los próximos días',
        'Mantén un registro de tus síntomas',
        'Descansa adecuadamente',
        'Mantente hidratado'
      ]
    }
  }
  
  return {
    nivel: 'autocuidado' as const,
    confianza: 60,
    explicacion: 'Los síntomas parecen leves y manejables con cuidados básicos',
    consejos: [
      'Descansa lo suficiente',
      'Mantente hidratado', 
      'Mantén una dieta balanceada',
      'Si los síntomas empeoran, busca atención médica'
    ]
  }
}