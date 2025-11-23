import React, { useState, useEffect } from 'react';
import { Wrench, Smartphone, Users, TrendingUp, Search, Plus, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [repairs, setRepairs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRepair, setShowAddRepair] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  // Stats data
  const stats = {
    totalRepairs: repairs.length,
    completedRepairs: repairs.filter(r => r.status === 'completed').length,
    pendingRepairs: repairs.filter(r => r.status === 'pending').length,
    inProgressRepairs: repairs.filter(r => r.status === 'in-progress').length,
  };

  // AI Diagnostic Function
  const runAIDiagnostic = (deviceType, problem) => {
    const diagnostics = {
      smartphone: {
        'tidak bisa nyala': {
          cause: 'Kemungkinan masalah pada baterai atau IC power',
          solution: 'Periksa baterai, konektor charging, dan IC power',
          parts: ['Baterai', 'Konektor Charging', 'IC Power'],
          estimatedCost: 150000,
          estimatedTime: '2-3 hari'
        },
        'layar pecah': {
          cause: 'LCD/touchscreen rusak akibat benturan',
          solution: 'Ganti LCD dan touchscreen',
          parts: ['LCD', 'Touchscreen'],
          estimatedCost: 500000,
          estimatedTime: '1 hari'
        },
        'baterai boros': {
          cause: 'Baterai sudah melemah atau ada aplikasi yang boros',
          solution: 'Ganti baterai atau optimasi software',
          parts: ['Baterai'],
          estimatedCost: 200000,
          estimatedTime: '1 hari'
        }
      },
      laptop: {
        'tidak bisa nyala': {
          cause: 'Kemungkinan masalah pada RAM, HDD, atau motherboard',
          solution: 'Periksa RAM, HDD/SSD, dan motherboard',
          parts: ['RAM', 'HDD/SSD', 'Motherboard'],
          estimatedCost: 300000,
          estimatedTime: '3-5 hari'
        },
        'overheat': {
          cause: 'Sistem pendingin tidak optimal atau thermal paste kering',
          solution: 'Bersihkan fan, ganti thermal paste',
          parts: ['Thermal Paste', 'Cooling Fan'],
          estimatedCost: 150000,
          estimatedTime: '1-2 hari'
        }
      }
    };

    const problemLower = problem.toLowerCase();
    const deviceDiag = diagnostics[deviceType] || diagnostics.smartphone;

    for (let key in deviceDiag) {
      if (problemLower.includes(key)) {
        return deviceDiag[key];
      }
    }

    return {
      cause: 'Perlu pemeriksaan lebih lanjut',
      solution: 'Teknisi akan melakukan diagnosa mendetail',
      parts: ['Akan ditentukan setelah pemeriksaan'],
      estimatedCost: 100000,
      estimatedTime: '1-3 hari'
    };
  };

  // Add Repair Function
  const addRepair = (repairData) => {
    const diagnostic = runAIDiagnostic(repairData.deviceType, repairData.problem);
    const newRepair = {
      id: Date.now(),
      ...repairData,
      status: 'pending',
      diagnostic,
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

    // Header
    doc.setFontSize(20);
    doc.text('iKaral AI Repair Pro', 20, 20);
    doc.setFontSize(12);
    doc.text('Invoice Perbaikan', 20, 30);

    // Repair Details
    doc.setFontSize(10);
    doc.text(`ID: ${repair.id}`, 20, 45);
    doc.text(`Tanggal: ${new Date(repair.createdAt).toLocaleDateString('id-ID')}`, 20, 52);
    doc.text(`Status: ${repair.status.toUpperCase()}`, 20, 59);

    // Customer Info
    doc.setFontSize(12);
    doc.text('Informasi Pelanggan:', 20, 75);
    doc.setFontSize(10);
    doc.text(`Nama: ${repair.customerName}`, 20, 82);
    doc.text(`Telepon: ${repair.customerPhone}`, 20, 89);

    // Device Info
    doc.setFontSize(12);
    doc.text('Informasi Perangkat:', 20, 105);
    doc.setFontSize(10);
    doc.text(`Jenis: ${repair.deviceType}`, 20, 112);
    doc.text(`Model: ${repair.deviceModel}`, 20, 119);
    doc.text(`Keluhan: ${repair.problem}`, 20, 126);

    // AI Diagnostic
    doc.setFontSize(12);
    doc.text('Hasil AI Diagnostik:', 20, 142);
    doc.setFontSize(10);
    doc.text(`Penyebab: ${repair.diagnostic.cause}`, 20, 149);
    doc.text(`Solusi: ${repair.diagnostic.solution}`, 20, 156);
    doc.text(`Estimasi Biaya: Rp ${repair.diagnostic.estimatedCost.toLocaleString('id-ID')}`, 20, 163);
    doc.text(`Estimasi Waktu: ${repair.diagnostic.estimatedTime}`, 20, 170);

    // Parts
    doc.setFontSize(12);
    doc.text('Sparepart Diperlukan:', 20, 186);
    doc.setFontSize(10);
    repair.diagnostic.parts.forEach((part, index) => {
      doc.text(`${index + 1}. ${part}`, 20, 193 + (index * 7));
    });

    // Footer
    doc.setFontSize(8);
    doc.text('Terima kasih telah menggunakan layanan iKaral AI Repair Pro', 20, 280);

    doc.save(`invoice-${repair.id}.pdf`);
  };

  // Filter repairs based on search
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
              <span className="text-sm text-gray-500">AI-Powered Diagnostics</span>
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'repairs'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Perbaikan
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            {/* Stats Cards */}
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

            {/* Recent Repairs */}
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

        {activeTab === 'repairs' && (
          <div className="animate-fade-in">
            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pelanggan, model, atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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

            {/* Repairs List */}
            {showAddRepair && (
              <AddRepairForm
                onAdd={addRepair}
                onCancel={() => setShowAddRepair(false)}
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
const AddRepairForm = ({ onAdd, onCancel }) => {
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
    setFormData({
      customerName: '',
      customerPhone: '',
      deviceType: 'smartphone',
      deviceModel: '',
      problem: ''
    });
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              required
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Perangkat</label>
            <select
              value={formData.deviceType}
              onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Jelaskan masalah yang dialami..."
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Simpan & Diagnosa AI
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
        <h2 className="text-2xl font-bold text-gray-900">Detail Perbaikan #{repair.id}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Informasi Pelanggan</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nama:</strong> {repair.customerName}</p>
            <p><strong>Telepon:</strong> {repair.customerPhone}</p>
            <p><strong>Status:</strong> {statusLabels[repair.status]}</p>
            <p><strong>Tanggal Masuk:</strong> {new Date(repair.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Device Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Informasi Perangkat</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Jenis:</strong> {repair.deviceType}</p>
            <p><strong>Model:</strong> {repair.deviceModel}</p>
            <p><strong>Keluhan:</strong> {repair.problem}</p>
          </div>
        </div>

        {/* AI Diagnostic */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">AI Diagnostik</h3>
          <div className="bg-indigo-50 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-sm font-medium text-indigo-900">Penyebab:</p>
              <p className="text-sm text-indigo-700">{repair.diagnostic.cause}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">Solusi:</p>
              <p className="text-sm text-indigo-700">{repair.diagnostic.solution}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-indigo-900">Estimasi Biaya:</p>
                <p className="text-lg font-bold text-indigo-600">Rp {repair.diagnostic.estimatedCost.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Estimasi Waktu:</p>
                <p className="text-lg font-bold text-indigo-600">{repair.diagnostic.estimatedTime}</p>
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

      {/* Actions */}
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
