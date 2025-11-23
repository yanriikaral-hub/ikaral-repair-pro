import React, { useState, useEffect } from 'react';
import { Wrench, Smartphone, Search, Plus, Download, Eye, CheckCircle, Clock, AlertCircle, Settings, Brain } from 'lucide-react';
import jsPDF from 'jspdf';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  // AI Configuration
  const [aiProvider, setAiProvider] = useState('gemini');
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    claude: '',
    deepseek: ''
  });
  const [useAI, setUseAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedProvider = localStorage.getItem('ikaral_ai_provider');
    const savedKeys = localStorage.getItem('ikaral_api_keys');
    const savedUseAI = localStorage.getItem('ikaral_use_ai');

    if (savedProvider) setAiProvider(savedProvider);
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    if (savedUseAI) setUseAI(savedUseAI === 'true');
  }, []);

  // Stats data
  const stats = {
    totalRepairs: repairs.length,
    completedRepairs: repairs.filter(r => r.status === 'completed').length,
    pendingRepairs: repairs.filter(r => r.status === 'pending').length,
    inProgressRepairs: repairs.filter(r => r.status === 'in-progress').length,
  };

  // AI Diagnostic Functions for each provider
  const callGeminiAPI = async (prompt) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKeys.gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error('Gemini API Error');
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const callClaudeAPI = async (prompt) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKeys.claude,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error('Claude API Error');
    const data = await response.json();
    return data.content[0].text;
  };

  const callDeepSeekAPI = async (prompt) => {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeys.deepseek}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error('DeepSeek API Error');
    const data = await response.json();
    return data.choices[0].message.content;
  };

  // Main AI Diagnostic Function
  const runAIDiagnostic = async (deviceType, deviceModel, problem) => {
    // Fallback diagnostic if AI is disabled
    const fallbackDiagnostic = {
      cause: 'Perlu pemeriksaan lebih lanjut oleh teknisi',
      solution: 'Teknisi akan melakukan diagnosa mendetail',
      parts: ['Akan ditentukan setelah pemeriksaan'],
      estimatedCost: 100000,
      estimatedTime: '1-3 hari',
      riskLevel: 'Sedang'
    };

    // If AI is disabled or no API key, return fallback
    if (!useAI || !apiKeys[aiProvider]) {
      return fallbackDiagnostic;
    }

    try {
      const prompt = `
Anda adalah teknisi ahli perbaikan elektronik. Analisa kerusakan berikut:

PERANGKAT:
- Jenis: ${deviceType}
- Model: ${deviceModel}
- Keluhan: ${problem}

TUGAS: Berikan analisa dalam format JSON berikut (HANYA JSON, tanpa markdown):
{
  "cause": "Penyebab kerusakan dalam 1-2 kalimat",
  "solution": "Solusi perbaikan yang direkomendasikan",
  "parts": ["Komponen 1", "Komponen 2"],
  "estimatedCost": 150000,
  "estimatedTime": "1-3 hari",
  "riskLevel": "Rendah/Sedang/Tinggi"
}

PENTING: Estimasi biaya dalam Rupiah, waktu realistis, dan komponen yang mungkin perlu diganti.
`;

      setAiLoading(true);
      let aiResponse;

      switch (aiProvider) {
        case 'gemini':
          aiResponse = await callGeminiAPI(prompt);
          break;
        case 'claude':
          aiResponse = await callClaudeAPI(prompt);
          break;
        case 'deepseek':
          aiResponse = await callDeepSeekAPI(prompt);
          break;
        default:
          throw new Error('Invalid AI provider');
      }

      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      return fallbackDiagnostic;
    } catch (error) {
      console.error('AI Diagnostic Error:', error);
      return fallbackDiagnostic;
    } finally {
      setAiLoading(false);
    }
  };

  // Add Repair Function
  const addRepair = async (repairData) => {
    const diagnostic = await runAIDiagnostic(repairData.deviceType, repairData.deviceModel, repairData.problem);
    const newRepair = {
      id: Date.now(),
      ...repairData,
      status: 'pending',
      diagnostic,
      aiProvider: useAI ? aiProvider : 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setRepairs([...repairs, newRepair]);
    setShowAddRepair(false);
  };

  // Update Repair Status
  const updateRepairStatus = (id, newStatus) => {
    setRepairs(repairs.map(r =>
      r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
    ));
  };

  // Generate PDF Invoice
  const generatePDF = (repair) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('iKaral AI Repair Pro', 20, 20);
    doc.setFontSize(12);
    doc.text('Invoice Perbaikan', 20, 30);

    doc.setFontSize(10);
    doc.text(`ID: ${repair.id}`, 20, 45);
    doc.text(`Tanggal: ${new Date(repair.createdAt).toLocaleDateString('id-ID')}`, 20, 52);
    doc.text(`Status: ${repair.status.toUpperCase()}`, 20, 59);
    doc.text(`AI: ${repair.aiProvider?.toUpperCase() || 'Manual'}`, 20, 66);

    doc.setFontSize(12);
    doc.text('Informasi Pelanggan:', 20, 80);
    doc.setFontSize(10);
    doc.text(`Nama: ${repair.customerName}`, 20, 87);
    doc.text(`Telepon: ${repair.customerPhone}`, 20, 94);

    doc.setFontSize(12);
    doc.text('Informasi Perangkat:', 20, 108);
    doc.setFontSize(10);
    doc.text(`Jenis: ${repair.deviceType}`, 20, 115);
    doc.text(`Model: ${repair.deviceModel}`, 20, 122);
    doc.text(`Keluhan: ${repair.problem}`, 20, 129);

    doc.setFontSize(12);
    doc.text('Hasil Diagnostik:', 20, 143);
    doc.setFontSize(10);
    doc.text(`Penyebab: ${repair.diagnostic.cause}`, 20, 150);
    doc.text(`Solusi: ${repair.diagnostic.solution}`, 20, 157);
    doc.text(`Estimasi Biaya: Rp ${repair.diagnostic.estimatedCost.toLocaleString('id-ID')}`, 20, 164);
    doc.text(`Estimasi Waktu: ${repair.diagnostic.estimatedTime}`, 20, 171);
    doc.text(`Risiko: ${repair.diagnostic.riskLevel}`, 20, 178);

    doc.setFontSize(12);
    doc.text('Sparepart Diperlukan:', 20, 192);
    doc.setFontSize(10);
    repair.diagnostic.parts.forEach((part, index) => {
      doc.text(`${index + 1}. ${part}`, 20, 199 + (index * 7));
    });

    doc.setFontSize(8);
    doc.text('Terima kasih telah menggunakan layanan iKaral AI Repair Pro', 20, 280);

    doc.save(`invoice-${repair.id}.pdf`);
  };

  // Save Settings
  const saveSettings = () => {
    localStorage.setItem('ikaral_ai_provider', aiProvider);
    localStorage.setItem('ikaral_api_keys', JSON.stringify(apiKeys));
    localStorage.setItem('ikaral_use_ai', useAI.toString());
    alert('Pengaturan berhasil disimpan!');
  };

  // Filter repairs
  const filteredRepairs = repairs.filter(r =>
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">iKaral AI Repair Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              {useAI && (
                <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                  AI: {aiProvider.toUpperCase()}
                </span>
              )}
              <button
                onClick={() => setActiveTab('settings')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'repairs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Perbaikan
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pengaturan AI
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Perbaikan"
                value={stats.totalRepairs}
                icon={<Smartphone className="h-8 w-8 text-blue-500" />}
                color="blue"
              />
              <StatCard
                title="Selesai"
                value={stats.completedRepairs}
                icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                color="green"
              />
              <StatCard
                title="Dalam Proses"
                value={stats.inProgressRepairs}
                icon={<Clock className="h-8 w-8 text-yellow-500" />}
                color="yellow"
              />
              <StatCard
                title="Menunggu"
                value={stats.pendingRepairs}
                icon={<AlertCircle className="h-8 w-8 text-red-500" />}
                color="red"
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Perbaikan Terbaru</h2>
              {repairs.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada data perbaikan</p>
                  <button
                    onClick={() => {
                      setActiveTab('repairs');
                      setShowAddRepair(true);
                    }}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Tambah Perbaikan Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {repairs.slice(0, 5).map(repair => (
                    <RepairCard
                      key={repair.id}
                      repair={repair}
                      onViewDetails={(r) => {
                        setSelectedRepair(r);
                        setActiveTab('repairs');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Repairs Tab */}
        {activeTab === 'repairs' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pelanggan, model, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setShowAddRepair(true)}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Tambah Perbaikan</span>
              </button>
            </div>

            {showAddRepair && (
              <AddRepairForm
                onAdd={addRepair}
                onCancel={() => setShowAddRepair(false)}
                aiLoading={aiLoading}
                useAI={useAI}
              />
            )}

            {selectedRepair && (
              <RepairDetails
                repair={selectedRepair}
                onClose={() => setSelectedRepair(null)}
                onUpdateStatus={updateRepairStatus}
                onGeneratePDF={generatePDF}
              />
            )}

            <div className="space-y-4">
              {filteredRepairs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada hasil ditemukan</p>
                </div>
              ) : (
                filteredRepairs.map(repair => (
                  <RepairCard
                    key={repair.id}
                    repair={repair}
                    onViewDetails={setSelectedRepair}
                    onUpdateStatus={updateRepairStatus}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-6 w-6 text-indigo-600" />
                Pengaturan AI Diagnostik
              </h2>

              {/* AI Toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="font-medium text-gray-900">Aktifkan AI Diagnostik</span>
                    <p className="text-sm text-gray-500">Gunakan AI untuk analisa otomatis</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-indigo-600 relative cursor-pointer transition-colors"
                  />
                </label>
              </div>

              {useAI && (
                <>
                  {/* AI Provider Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih AI Provider
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setAiProvider('gemini')}
                        className={`p-4 border-2 rounded-lg text-center transition ${
                          aiProvider === 'gemini'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">Google Gemini</div>
                        <div className="text-xs text-gray-500">Fast & Free</div>
                      </button>
                      <button
                        onClick={() => setAiProvider('claude')}
                        className={`p-4 border-2 rounded-lg text-center transition ${
                          aiProvider === 'claude'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">Claude</div>
                        <div className="text-xs text-gray-500">Advanced</div>
                      </button>
                      <button
                        onClick={() => setAiProvider('deepseek')}
                        className={`p-4 border-2 rounded-lg text-center transition ${
                          aiProvider === 'deepseek'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold">DeepSeek</div>
                        <div className="text-xs text-gray-500">Affordable</div>
                      </button>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-4">
                    {aiProvider === 'gemini' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Gemini API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeys.gemini}
                          onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                          placeholder="AIzaSy..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Dapatkan gratis di:{' '}
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline"
                          >
                            Google AI Studio
                          </a>
                        </p>
                      </div>
                    )}

                    {aiProvider === 'claude' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Anthropic Claude API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeys.claude}
                          onChange={(e) => setApiKeys({ ...apiKeys, claude: e.target.value })}
                          placeholder="sk-ant-..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Dapatkan di:{' '}
                          <a
                            href="https://console.anthropic.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline"
                          >
                            Anthropic Console
                          </a>
                        </p>
                      </div>
                    )}

                    {aiProvider === 'deepseek' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DeepSeek API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeys.deepseek}
                          onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                          placeholder="sk-..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Dapatkan di:{' '}
                          <a
                            href="https://platform.deepseek.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline"
                          >
                            DeepSeek Platform
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={saveSettings}
                className="mt-6 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Simpan Pengaturan
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Google Gemini</h3>
                <p className="text-sm text-blue-700">Model terbaru, gratis, dan cepat untuk diagnosa umum</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Anthropic Claude</h3>
                <p className="text-sm text-purple-700">Analisa mendalam dengan reasoning terbaik</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">DeepSeek</h3>
                <p className="text-sm text-orange-700">Harga terjangkau dengan performa tinggi</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`bg-${color}-100 p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

// RepairCard Component
const RepairCard = ({ repair, onViewDetails, onUpdateStatus }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  };

  const statusLabels = {
    'pending': 'Menunggu',
    'in-progress': 'Dalam Proses',
    'completed': 'Selesai'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{repair.customerName}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[repair.status]}`}>
              {statusLabels[repair.status]}
            </span>
            {repair.aiProvider && repair.aiProvider !== 'manual' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                AI: {repair.aiProvider.toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>ID:</strong> {repair.id}</p>
            <p><strong>Perangkat:</strong> {repair.deviceModel} ({repair.deviceType})</p>
            <p><strong>Keluhan:</strong> {repair.problem}</p>
            <p><strong>Estimasi Biaya:</strong> Rp {repair.diagnostic.estimatedCost.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col space-y-2">
          <button
            onClick={() => onViewDetails(repair)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Lihat Detail</span>
          </button>
          {repair.status !== 'completed' && onUpdateStatus && (
            <button
              onClick={() => onUpdateStatus(repair.id, repair.status === 'pending' ? 'in-progress' : 'completed')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              {repair.status === 'pending' ? 'Mulai Perbaikan' : 'Selesaikan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// AddRepairForm Component
const AddRepairForm = ({ onAdd, onCancel, aiLoading, useAI }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceType: 'smartphone',
    deviceModel: '',
    problem: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Tambah Perbaikan Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Perangkat</label>
            <select
              value={formData.deviceType}
              onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="smartphone">Smartphone</option>
              <option value="laptop">Laptop</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Perangkat</label>
            <input
              type="text"
              required
              value={formData.deviceModel}
              onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keluhan / Masalah</label>
          <textarea
            required
            value={formData.problem}
            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Jelaskan masalah yang dialami..."
          />
        </div>
        {useAI && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Brain className="inline h-4 w-4 mr-1" />
              AI akan menganalisa kerusakan secara otomatis
            </p>
          </div>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={aiLoading}
            className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {aiLoading ? 'Menganalisa dengan AI...' : 'Simpan & Diagnosa'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

// RepairDetails Component
const RepairDetails = ({ repair, onClose, onUpdateStatus, onGeneratePDF }) => {
  const statusLabels = {
    'pending': 'Menunggu',
    'in-progress': 'Dalam Proses',
    'completed': 'Selesai'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detail Perbaikan #{repair.id}</h2>
          {repair.aiProvider && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Analisa oleh: {repair.aiProvider.toUpperCase()}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Informasi Pelanggan</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nama:</strong> {repair.customerName}</p>
            <p><strong>Telepon:</strong> {repair.customerPhone}</p>
            <p><strong>Status:</strong> {statusLabels[repair.status]}</p>
            <p><strong>Tanggal Masuk:</strong> {new Date(repair.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Informasi Perangkat</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Jenis:</strong> {repair.deviceType}</p>
            <p><strong>Model:</strong> {repair.deviceModel}</p>
            <p><strong>Keluhan:</strong> {repair.problem}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Hasil Diagnostik</h3>
          <div className="bg-indigo-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-sm font-medium text-indigo-900">Penyebab:</p>
              <p className="text-sm text-indigo-700">{repair.diagnostic.cause}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">Solusi:</p>
              <p className="text-sm text-indigo-700">{repair.diagnostic.solution}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-900">Estimasi Biaya:</p>
                <p className="text-lg font-bold text-indigo-600">Rp {repair.diagnostic.estimatedCost.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Estimasi Waktu:</p>
                <p className="text-lg font-bold text-indigo-600">{repair.diagnostic.estimatedTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Tingkat Risiko:</p>
                <p className="text-lg font-bold text-indigo-600">{repair.diagnostic.riskLevel}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900 mb-2">Sparepart Diperlukan:</p>
              <ul className="list-disc list-inside text-sm text-indigo-700">
                {repair.diagnostic.parts.map((part, index) => (
                  <li key={index}>{part}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => onGeneratePDF(repair)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Invoice PDF</span>
        </button>
        {repair.status !== 'completed' && (
          <button
            onClick={() => {
              onUpdateStatus(repair.id, repair.status === 'pending' ? 'in-progress' : 'completed');
              if (repair.status === 'in-progress') {
                onClose();
              }
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            {repair.status === 'pending' ? 'Mulai Perbaikan' : 'Tandai Selesai'}
          </button>
        )}
        <button
          onClick={onClose}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default App;
