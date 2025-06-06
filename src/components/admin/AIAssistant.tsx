import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Globe, 
  MessageSquare,
  Sparkles,
  Clock,
  User,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language: string;
}

interface AIAssistantProps {
  onClose: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Halo! Saya Jenny, asisten AI Anda. Saya dapat membantu Anda dalam bahasa Indonesia, Jawa, Bali, Mandarin, dan Inggris. Bagaimana saya bisa membantu Anda hari ini?',
      timestamp: '10:30',
      language: 'id'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('id');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'jv', name: 'Bahasa Jawa', flag: '🇮🇩' },
    { code: 'ban', name: 'Bahasa Bali', flag: '🇮🇩' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const quickActions = [
    { text: 'Cara menambah properti baru', language: 'id' },
    { text: 'How to manage clients?', language: 'en' },
    { text: 'Bantuan pembayaran', language: 'id' },
    { text: 'Legal document help', language: 'en' }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        id: [
          'Saya akan membantu Anda dengan itu. Apakah Anda memerlukan panduan langkah demi langkah?',
          'Tentu saja! Saya dapat menjelaskan prosesnya dengan detail.',
          'Baik, mari kita selesaikan masalah ini bersama-sama.'
        ],
        en: [
          'I\'ll help you with that. Would you like a step-by-step guide?',
          'Certainly! I can explain the process in detail.',
          'Great, let\'s solve this together.'
        ],
        jv: [
          'Kula badhe ngewangi panjenengan. Menapa panjenengan perlu pandhuan ingkang cetha?',
          'Inggih, kula saged nerangaken kanthi detail.'
        ],
        ban: [
          'Tiang jagi nunas ngwantu ida. Napi ida perlu panuntun sane jelas?',
          'Inggih, tiang prasida ngwedarang antuk detail.'
        ],
        zh: [
          '我会帮助您解决这个问题。您需要详细的步骤指导吗？',
          '当然可以！我可以详细解释这个过程。'
        ]
      };

      const responseArray = responses[selectedLanguage as keyof typeof responses] || responses.en;
      const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        language: selectedLanguage
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Implement voice recognition logic here
  };

  const handleSpeakToggle = () => {
    setIsSpeaking(!isSpeaking);
    // Implement text-to-speech logic here
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Jenny AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-neutral-600">Online - Multi-language Support</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                  {message.type === 'assistant' && (
                    <button
                      onClick={handleSpeakToggle}
                      className="p-1 hover:bg-neutral-200 rounded transition-colors duration-200"
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3 h-3" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-neutral-100">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.text)}
                className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors duration-200"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  selectedLanguage === 'id' ? 'Ketik pesan Anda...' :
                  selectedLanguage === 'en' ? 'Type your message...' :
                  selectedLanguage === 'jv' ? 'Ketik pesen panjenengan...' :
                  selectedLanguage === 'ban' ? 'Ketik pesen ida...' :
                  selectedLanguage === 'zh' ? '输入您的消息...' :
                  'Type your message...'
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={handleVoiceToggle}
                  className={`p-1 rounded transition-colors duration-200 ${
                    isListening ? 'text-red-600 bg-red-50' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {/* Features */}
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>5 Languages</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mic className="w-3 h-3" />
                <span>Voice Support</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;