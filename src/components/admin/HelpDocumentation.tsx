import React, { useState } from 'react';
import { 
  HelpCircle, 
  Book, 
  Video, 
  Search, 
  ChevronRight, 
  Download, 
  Play,
  FileText,
  Globe,
  Headphones,
  MessageSquare,
  Star,
  Clock,
  User,
  Tag,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: 'getting-started' | 'properties' | 'clients' | 'payments' | 'legal' | 'troubleshooting';
  type: 'article' | 'video' | 'tutorial' | 'faq';
  language: 'id' | 'en';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  views: number;
  rating: number;
  lastUpdated: string;
  author: string;
  tags: string[];
  description: string;
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  views: number;
  rating: number;
  
  description: string;
}

const HelpDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');

  const helpArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Cari PropShop',
      category: 'getting-started',
      type: 'tutorial',
      language: 'id',
      difficulty: 'beginner',
      readTime: '5 min',
      views: 1245,
      rating: 4.8,
      lastUpdated: '2025-01-15',
      author: 'Admin Team',
      tags: ['setup', 'basics', 'introduction'],
      description: 'Complete guide to setting up and using the Cari PropShop platform'
    },
    {
      id: '2',
      title: 'How to Add New Properties',
      category: 'properties',
      type: 'tutorial',
      language: 'id',
      difficulty: 'beginner',
      readTime: '8 min',
      views: 892,
      rating: 4.6,
      lastUpdated: '2025-01-18',
      author: 'Property Team',
      tags: ['properties', 'upload', 'listing'],
      description: 'Step-by-step guide for adding and managing property listings'
    },
    {
      id: '3',
      title: 'Client Management Best Practices',
      category: 'clients',
      type: 'article',
      language: 'en',
      difficulty: 'intermediate',
      readTime: '12 min',
      views: 567,
      rating: 4.9,
      lastUpdated: '2025-01-12',
      author: 'CRM Specialist',
      tags: ['clients', 'crm', 'best-practices'],
      description: 'Advanced techniques for managing client relationships effectively'
    },
    {
      id: '4',
      title: 'Payment Processing Setup',
      category: 'payments',
      type: 'tutorial',
      language: 'id',
      difficulty: 'intermediate',
      readTime: '15 min',
      views: 734,
      rating: 4.7,
      lastUpdated: '2025-01-10',
      author: 'Finance Team',
      tags: ['payments', 'setup', 'banking'],
      description: 'Configure payment gateways and banking integration'
    },
    {
      id: '5',
      title: 'Legal Document Management',
      category: 'legal',
      type: 'article',
      language: 'id',
      difficulty: 'advanced',
      readTime: '20 min',
      views: 423,
      rating: 4.5,
      lastUpdated: '2025-01-08',
      author: 'Legal Team',
      tags: ['legal', 'documents', 'compliance'],
      description: 'Managing legal documents and ensuring compliance'
    },
    {
      id: '6',
      title: 'Troubleshooting Common Issues',
      category: 'troubleshooting',
      type: 'faq',
      language: 'en',
      difficulty: 'beginner',
      readTime: '10 min',
      views: 1156,
      rating: 4.4,
      lastUpdated: '2025-01-20',
      author: 'Support Team',
      tags: ['troubleshooting', 'faq', 'support'],
      description: 'Solutions to frequently encountered problems'
    }
  ];

  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Platform Overview and Navigation',
      duration: '8:45',
      thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Getting Started',
      views: 2341,
      rating: 4.8,
      description: 'Complete walkthrough of the Cari PropShop interface'
    },
    {
      id: '2',
      title: 'Adding Your First Property',
      duration: '12:30',
      thumbnail: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Properties',
      views: 1876,
      rating: 4.9,
      description: 'Step-by-step property listing creation'
    },
    {
      id: '3',
      title: 'Client Management Workflow',
      duration: '15:20',
      thumbnail: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'CRM',
      views: 1234,
      rating: 4.7,
      description: 'Effective client relationship management techniques'
    },
    {
      id: '4',
      title: 'Payment System Configuration',
      duration: '18:15',
      thumbnail: 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: 'Payments',
      views: 987,
      rating: 4.6,
      description: 'Setting up payment gateways and processing'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'getting-started', label: 'Getting Started' },
    { key: 'properties', label: 'Properties' },
    { key: 'clients', label: 'Clients' },
    { key: 'payments', label: 'Payments' },
    { key: 'legal', label: 'Legal' },
    { key: 'troubleshooting', label: 'Troubleshooting' }
  ];

  const languages = [
    { key: 'all', label: 'All Languages' },
    { key: 'id', label: 'Bahasa Indonesia' },
    { key: 'en', label: 'English' }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesLanguage = filterLanguage === 'all' || article.language === filterLanguage;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'tutorial': return <Book className="w-4 h-4" />;
      case 'faq': return <HelpCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderArticles = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.key} value={category.key}>{category.label}</option>
              ))}
            </select>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(language => (
                <option key={language.key} value={language.key}>{language.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getTypeIcon(article.type)}
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                  {article.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-neutral-600">{article.rating}</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{article.description}</p>
            
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>{article.language.toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">by {article.author}</span>
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <span>Read More</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Video Tutorials</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
          <Video className="w-4 h-4" />
          <span>Create Tutorial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoTutorials.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button className="bg-white bg-opacity-90 p-3 rounded-full hover:bg-opacity-100 transition-all duration-200">
                  <Play className="w-6 h-6 text-neutral-900" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-600 font-medium">{video.category}</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-neutral-600">{video.rating}</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-neutral-900 mb-2 line-clamp-2">{video.title}</h4>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Watch Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Frequently Asked Questions</h3>
      
      <div className="space-y-4">
        {[
          {
            question: "How do I reset my password?",
            answer: "You can reset your password by clicking the 'Forgot Password' link on the login page and following the instructions sent to your email."
          },
          {
            question: "How do I add multiple images to a property listing?",
            answer: "In the property upload form, you can drag and drop multiple images or click the upload button to select multiple files at once."
          },
          {
            question: "What payment methods are supported?",
            answer: "We support bank transfers, e-wallets (GoPay, OVO, DANA), credit/debit cards, and QRIS payments."
          },
          {
            question: "How do I schedule an appointment with a client?",
            answer: "Go to the Appointment Scheduler in the admin dashboard, click 'New Appointment', and fill in the client and property details."
          },
          {
            question: "Can I export client data?",
            answer: "Yes, you can export client data from the Client Management section using the 'Export' button in various formats including CSV and PDF."
          }
        ].map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <h4 className="font-semibold text-neutral-900 mb-3 flex items-center">
              <HelpCircle className="w-5 h-5 text-blue-600 mr-2" />
              {faq.question}
            </h4>
            <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
            <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-neutral-100">
              <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm">
                <ThumbsUp className="w-4 h-4" />
                <span>Helpful</span>
              </button>
              <button className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm">
                <ThumbsDown className="w-4 h-4" />
                <span>Not Helpful</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'articles', label: 'Articles', icon: <FileText className="w-4 h-4" /> },
    { id: 'videos', label: 'Video Tutorials', icon: <Video className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'downloads', label: 'Downloads', icon: <Download className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Help & Documentation</h2>
        <p className="text-sm text-neutral-600">Comprehensive guides and tutorials for using Cari PropShop</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Book className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{helpArticles.length}</div>
              <div className="text-sm text-neutral-600">Articles</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Video className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{videoTutorials.length}</div>
              <div className="text-sm text-neutral-600">Videos</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">2</div>
              <div className="text-sm text-neutral-600">Languages</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Headphones className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">24/7</div>
              <div className="text-sm text-neutral-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'articles' && renderArticles()}
      {activeTab === 'videos' && renderVideos()}
      {activeTab === 'faq' && renderFAQ()}
      {activeTab === 'downloads' && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
          <Download className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Downloads Center</h3>
          <p className="text-neutral-600">User manuals, templates, and resources</p>
        </div>
      )}
    </div>
  );
};

export default HelpDocumentation;