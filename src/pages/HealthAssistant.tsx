import React, { useState } from 'react'
import { HealthChat } from '../components/HealthChat'

export const HealthAssistant: React.FC = () => {
  const [phone, setPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [region, setRegion] = useState('')
  const [chatStarted, setChatStarted] = useState(false)

  const startChat = () => {
    if (phone.trim()) {
      setChatStarted(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      startChat()
    }
  }

  if (chatStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-4 text-center">
            <button
              onClick={() => setChatStarted(false)}
              className="text-green-600 hover:text-green-700 flex items-center mx-auto space-x-2"
            >
              <span>←</span>
              <span>Volver al inicio</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-2">
            <HealthChat phone={phone} userName={userName} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Asistente de Salud Rural
          </h1>
          <p className="text-gray-600">
            Consulta médica básica disponible 24/7
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tu número de teléfono"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tu nombre (opcional)"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={startChat}
            disabled={!phone.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg text-lg"
          >
            Iniciar Consulta
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Información importante:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Este es un asistente de orientación médica básica</li>
            <li>• No reemplaza la consulta médica profesional</li>
            <li>• En emergencias, contacta servicios de urgencias</li>
            <li>• Disponible 24 horas, 7 días a la semana</li>
          </ul>
        </div>

        {/* Emergency */}
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Emergencias:</h3>
          <p className="text-sm text-red-700">
            Si tienes una emergencia médica, llama inmediatamente al <strong>123</strong> o dirígete al centro de salud más cercano.
          </p>
        </div>
      </div>
    </div>
  )
}
