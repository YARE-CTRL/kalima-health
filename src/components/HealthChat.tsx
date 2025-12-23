import React, { useState, useEffect, useRef } from 'react'
import { HealthService } from '../services/healthServiceHybrid'
import { HealthBot } from '../services/triageBot'
import { AgentService } from '../services/agentServiceHybrid'
import type { AnalisisTriage } from '../services/triageBot'
import type { Message, Conversation, User } from '../services/supabase'
import kalimaImage from '../assets/kallima.png'

interface HealthChatProps {
  phone: string
  userName?: string
}

// 🎨 Iconos SVG para reemplazar emojis
const Icons = {
  hospital: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  urgent: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  appointment: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  loading: (
    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  brain: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  stomach: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  thermometer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  cough: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  bone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

// 🚀 Opciones rápidas - Solo 6 síntomas más urgentes y comunes
const quickSymptoms = [
  // URGENTES - Rojo (3 más críticos)
  { text: 'Me duele el pecho', icon: Icons.heart, urgent: true, level: 'urgente' },
  { text: 'Dificultad para respirar', icon: Icons.urgent, urgent: true, level: 'urgente' },
  { text: 'Sangra mucho', icon: Icons.urgent, urgent: true, level: 'urgente' },
  
  // CITA MÉDICA - Amarillo (3 más comunes)
  { text: 'Me duele la cabeza', icon: Icons.brain, urgent: false, level: 'cita' },
  { text: 'Tengo fiebre', icon: Icons.thermometer, urgent: false, level: 'cita' },
  { text: 'Dolor de estómago', icon: Icons.stomach, urgent: false, level: 'cita' }
]

export const HealthChat: React.FC<HealthChatProps> = ({ phone, userName }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentTriage, setCurrentTriage] = useState<AnalisisTriage | null>(null)
  const [triageLevel, setTriageLevel] = useState<'autocuidado' | 'cita' | 'urgente' | null>(null)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 🎨 Obtener colores según el nivel de triage
  const getTriageColors = (level: 'autocuidado' | 'cita' | 'urgente' | null) => {
    switch (level) {
      case 'urgente':
        return {
          background: 'bg-red-50',
          border: 'border-red-200',
          header: 'bg-red-500',
          text: 'text-red-800',
          accent: 'text-red-600'
        }
      case 'cita':
        return {
          background: 'bg-yellow-50',
          border: 'border-yellow-200',
          header: 'bg-yellow-500',
          text: 'text-yellow-800',
          accent: 'text-yellow-600'
        }
      case 'autocuidado':
        return {
          background: 'bg-green-50',
          border: 'border-green-200',
          header: 'bg-green-500',
          text: 'text-green-800',
          accent: 'text-green-600'
        }
      default:
        return {
          background: 'bg-gray-50',
          border: 'border-gray-200',
          header: 'bg-gray-500',
          text: 'text-gray-800',
          accent: 'text-gray-600'
        }
    }
  }

  const colors = getTriageColors(triageLevel)

  useEffect(() => {
    initializeChat()
  }, [phone])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeChat = async () => {
    try {
      // Inicializar sistema A2A (agentes)
      AgentService.configurarAgentesBasicos()
      
      // Crear o abrir conversación
      const result = await HealthService.iniciarConversacionSalud(phone, userName)
      setUser(result.user)
      setConversation(result.conversation)
      
      // Cargar resultados de triage existentes
      await HealthService.obtenerResultadosTriage(result.conversation.id)
      
      // Mensaje de bienvenida
      const welcomeMsg = await HealthService.enviarMensaje(
        result.conversation.id, 
        'bot', 
        `¡Hola ${result.user.name}! Soy KALIMA, tu asistente de salud. ¿Qué síntomas tienes? Puedes usar las opciones rápidas de abajo o escribir libremente.`
      )
      setMessages([welcomeMsg])
      setIsInitialized(true)
    } catch (error) {
      console.error('Error inicializando chat:', error)
      setIsInitialized(true) // Mostrar error en lugar de loading infinito
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || loading) return

    setLoading(true)
    
    try {
      // Mensaje del usuario
      const userMsg = await HealthService.enviarMensaje(conversation.id, 'user', newMessage)
      setMessages(prev => [...prev, userMsg])
      
      // Obtener historial para contexto
      const history = messages.map(m => m.content)
      
      // Procesar con el bot médico simplificado
      const { respuesta: botResponse, triage } = await HealthBot.procesarMensaje(
        newMessage, 
        history, 
        conversation.id, 
        user?.id
      )
      
      // Guardar resultado de triage si es significativo
      if (triage.confianza > 0.6) {
        const triageResult = await HealthService.guardarResultadoTriage(
          conversation.id,
          triage.nivel,
          `${triage.explicacion} (Confianza: ${Math.round(triage.confianza * 100)}%)`,
          user?.id,
          newMessage
        )
        // Guardar resultado de triage (para futuras funcionalidades)
        console.log('Triage guardado:', triageResult)
        setCurrentTriage(triage)
        setTriageLevel(triage.nivel) // Actualizar nivel de triage para colores
      }
      
      // Enviar respuesta del bot
      const botMsg = await HealthService.enviarMensaje(conversation.id, 'bot', botResponse)
      setMessages(prev => [...prev, botMsg])
      setNewMessage('')
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      // Mostrar mensaje de error al usuario
      const errorMsg = await HealthService.enviarMensaje(
        conversation.id, 
        'bot', 
        'Lo siento, hubo un problema procesando tu mensaje. Por favor intenta de nuevo.'
      )
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 🚀 Manejar opción rápida
  const handleQuickSymptom = (symptomText: string) => {
    setNewMessage(symptomText)
    // Auto-enviar después de un breve delay para que el usuario vea que se seleccionó
    setTimeout(() => {
      if (conversation) {
        sendMessage()
      }
    }, 300)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando asistente de salud...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-[90vh] min-h-[800px] ${colors.background} border ${colors.border} rounded-xl shadow-2xl transition-colors duration-300`}>
      {/* Header */}
      <div className={`${colors.header} text-white p-6 rounded-t-xl`}>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center">
            <img 
              src={kalimaImage} 
              alt="KALIMA" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl">KALIMA</h3>
            <p className="text-base opacity-90">
              Asistente de Salud • {user?.name} • {user?.region || 'Zona Rural'}
            </p>
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
            title="Información sobre KALIMA"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {currentTriage && (
            <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 ${
              currentTriage.nivel === 'urgente' 
                ? 'bg-red-600 text-white' 
                : currentTriage.nivel === 'cita'
                ? 'bg-yellow-600 text-white'
                : 'bg-green-600 text-white'
            }`}>
              {currentTriage.nivel === 'urgente' ? Icons.urgent : 
               currentTriage.nivel === 'cita' ? Icons.appointment : 
               Icons.home}
              <span>
                {currentTriage.nivel === 'urgente' ? 'URGENTE' : 
                 currentTriage.nivel === 'cita' ? 'CITA MÉDICA' : 
                 'AUTOCUIDADO'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}
          >
            {/* Avatar para mensajes de IA */}
            {message.sender !== 'user' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            )}
            
            <div className="max-w-md lg:max-w-2xl">
              {/* Etiqueta del remitente */}
              <div className={`text-xs font-semibold mb-1 ${
                message.sender === 'user' 
                  ? 'text-right text-gray-600' 
                  : 'text-left text-green-700'
              }`}>
                {message.sender === 'user' ? 'Tú' : '🏥 Dr. KALIMA'}
              </div>
              
              {/* Burbuja del mensaje */}
              <div
                className={`px-6 py-4 rounded-2xl shadow-lg relative ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                    : message.sender === 'bot'
                    ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    : 'bg-gradient-to-br from-green-50 to-green-100 text-green-900 border border-green-200 rounded-bl-md'
                }`}
              >
                {/* Flecha de la burbuja */}
                <div className={`absolute ${
                  message.sender === 'user' 
                    ? 'right-0 top-4 transform translate-x-1' 
                    : 'left-0 top-4 transform -translate-x-1'
                } w-0 h-0 ${
                  message.sender === 'user'
                    ? 'border-l-8 border-l-blue-500 border-t-8 border-t-transparent border-b-8 border-b-transparent'
                    : message.sender === 'bot'
                    ? 'border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
                    : 'border-r-8 border-r-green-50 border-t-8 border-t-transparent border-b-8 border-b-transparent'
                }`}></div>
                
                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {message.content}
                </div>
                
                {/* Timestamp */}
                <div className={`text-xs mt-3 flex items-center space-x-2 ${
                  message.sender === 'user' ? 'text-blue-100 justify-end' : 'text-gray-400 justify-start'
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatTime(message.created_at)}</span>
                  
                  {/* Estado del mensaje para usuario */}
                  {message.sender === 'user' && (
                    <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            
            {/* Avatar para mensajes del usuario */}
            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start items-end space-x-2">
            {/* Avatar para mensaje de carga */}
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            
            <div className="max-w-md">
              <div className="text-xs font-semibold mb-1 text-left text-green-700">
                🏥 Dr. KALIMA
              </div>
              <div className="bg-white text-gray-800 px-6 py-4 rounded-2xl border border-gray-200 shadow-lg rounded-bl-md relative">
                {/* Flecha */}
                <div className="absolute left-0 top-4 transform -translate-x-1 w-0 h-0 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent"></div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Analizando síntomas...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Opciones Rápidas - Compactas */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Síntomas comunes:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickSymptoms.map((symptom, index) => (
              <button
                key={index}
                onClick={() => handleQuickSymptom(symptom.text)}
                disabled={loading}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  symptom.urgent 
                    ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200' 
                    : 'bg-white hover:bg-yellow-50 text-gray-700 border border-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="flex-shrink-0">{symptom.icon}</span>
                <span className="truncate">{symptom.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe tus síntomas con detalle..."
            className="flex-1 border border-gray-300 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-xl transition-all duration-200 font-bold flex items-center space-x-2 shadow-lg"
          >
            {loading ? Icons.loading : Icons.send}
            <span className="hidden sm:inline">{loading ? 'Analizando...' : 'Enviar'}</span>
          </button>
        </div>
        
        <div className="mt-4 text-base text-gray-600 text-center flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Describe tus síntomas con detalle para una mejor evaluación médica</span>
        </div>
      </div>

      {/* Triage Info Panel */}
      {currentTriage && (
        <div className={`border-t p-6 ${colors.background} ${colors.border}`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.header} text-white flex-shrink-0`}>
              {currentTriage.nivel === 'urgente' ? Icons.urgent : 
               currentTriage.nivel === 'cita' ? Icons.appointment : Icons.home}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg mb-3">
                {currentTriage.nivel === 'urgente' ? 'ATENCIÓN URGENTE' : 
                 currentTriage.nivel === 'cita' ? 'Consulta Médica Recomendada' : 
                 'Autocuidado'}
              </div>
              <div className={`text-base ${colors.text} mb-4 leading-relaxed`}>
                {currentTriage.explicacion}
              </div>
              {currentTriage.consejos.length > 0 && (
                <div className="space-y-2">
                  <h6 className="font-semibold text-base mb-2">Recomendaciones:</h6>
                  {currentTriage.consejos.map((consejo: string, index: number) => (
                    <div key={index} className={`text-base ${colors.accent} flex items-start space-x-3`}>
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{consejo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Información sobre KALIMA */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center">
                  <img 
                    src={kalimaImage} 
                    alt="KALIMA" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">KALIMA</h2>
                  <p className="text-lg opacity-90">Asistente de Salud Inteligente</p>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Quién es KALIMA */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>¿Quién es KALIMA?</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  KALIMA es un asistente de salud inteligente diseñado específicamente para comunidades rurales. 
                  Combina inteligencia artificial avanzada con protocolos médicos establecidos para brindar 
                  orientación médica básica las 24 horas del día, los 7 días de la semana.
                </p>
              </div>

              {/* Qué hace KALIMA */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>¿Qué hace KALIMA?</span>
                </h3>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Analiza síntomas y clasifica el nivel de urgencia médica</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Proporciona recomendaciones médicas básicas y seguras</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Identifica emergencias médicas y activa protocolos de urgencia</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mantiene historial médico digital de cada paciente</span>
                  </li>
                </ul>
              </div>

              {/* Cómo ayuda KALIMA */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>¿Cómo ayuda KALIMA?</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Para Pacientes</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Acceso 24/7 a orientación médica</li>
                      <li>• Evaluación inmediata de síntomas</li>
                      <li>• Recomendaciones personalizadas</li>
                      <li>• Historial médico digital</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Para Comunidades</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Reduce carga en centros de salud</li>
                      <li>• Mejora acceso a atención médica</li>
                      <li>• Identifica emergencias temprano</li>
                      <li>• Datos para políticas públicas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Características Técnicas */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Características Técnicas</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">IA Avanzada</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">Tiempo Real</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">Seguro</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-gray-700">Rápido</div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Importante</h4>
                    <p className="text-sm text-yellow-700">
                      KALIMA es un asistente de orientación médica básica. No reemplaza la consulta médica profesional. 
                      En caso de emergencias médicas, contacta inmediatamente a los servicios de urgencias.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  KALIMA Health Assistant • Versión 1.0
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
