# 🔧 iKaral AI Repair Pro

Sistem manajemen perbaikan elektronik dengan AI diagnostik powered by Google Gemini.

## 🚀 Cara Install di VPS (SANGAT MUDAH!)

### Langkah 1: Persiapan VPS
Pastikan VPS Anda sudah install Docker. Jika belum:
```bash
curl -fsSL https://get.docker.com | sh
```

### Langkah 2: Clone Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd ikaral-repair-pro
```

### Langkah 3: Jalankan Deploy Script
```bash
chmod +x deploy.sh
./deploy.sh
```

**ITU SAJA!** 🎉

### Langkah 4: Akses Aplikasi
Buka browser dan akses:
- `http://IP_VPS_ANDA:8080`
- Contoh: `http://103.123.45.67:8080`

## 🔑 Setup AI (Pilih Salah Satu)

Aplikasi mendukung **3 AI Provider**. Pilih sesuai kebutuhan:

### 🤖 Option 1: Google Gemini (Rekomendasi)
- **Keunggulan:** GRATIS, Cepat, Mudah
- **Cara:**
  1. Dapatkan API Key di: https://aistudio.google.com/app/apikey
  2. Buka aplikasi → **Pengaturan AI**
  3. Aktifkan AI → Pilih **Gemini** → Paste API Key
  4. Klik **Simpan Pengaturan**

### 🧠 Option 2: Anthropic Claude
- **Keunggulan:** Analisa mendalam, Reasoning terbaik
- **Cara:**
  1. Daftar di: https://console.anthropic.com/
  2. Dapatkan $5 kredit gratis untuk percobaan
  3. Pilih **Claude** di Pengaturan AI → Input API Key

### 🔥 Option 3: DeepSeek
- **Keunggulan:** Harga sangat murah, Performa tinggi
- **Cara:**
  1. Daftar di: https://platform.deepseek.com/
  2. Top up mulai dari $1 (cukup untuk ribuan request)
  3. Pilih **DeepSeek** di Pengaturan AI → Input API Key

## 📱 Fitur Utama

- ✅ Dashboard manajemen perbaikan
- 🤖 **AI Diagnostik Multi-Provider** (Gemini, Claude, DeepSeek)
- 🔄 Switch AI provider on-the-fly
- 📄 Generate PDF Invoice otomatis
- 📊 Statistik real-time
- 🔍 Search & filter data
- 📱 Responsive design (mobile-friendly)

## 🛠️ Commands Berguna

```bash
# Lihat status aplikasi
docker-compose ps

# Lihat logs real-time
docker-compose logs -f

# Stop aplikasi
docker-compose down

# Restart aplikasi
docker-compose restart

# Update aplikasi (setelah git pull)
docker-compose down
docker-compose build
docker-compose up -d
```

## 🔄 Update Aplikasi

Jika ada update kode baru:
```bash
cd ikaral-repair-pro
git pull
./deploy.sh
```

## ⚙️ Konfigurasi Port

Default port: `8080`

Untuk ganti port, edit file `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Ganti 8080 jadi port lain
```

## 🆘 Troubleshooting

### Port sudah dipakai
```bash
# Cek proses yang pakai port 8080
sudo lsof -i :8080

# Kill proses
sudo kill -9 <PID>
```

### Container tidak jalan
```bash
# Cek logs error
docker-compose logs

# Restart dari nol
docker-compose down
docker system prune -a
./deploy.sh
```

### Tidak bisa akses dari browser
1. Cek firewall VPS: `sudo ufw allow 8080`
2. Cek IP VPS: `curl ifconfig.me`

## 📞 Support

Jika butuh bantuan, buat issue di repository ini.

---

**Dibuat dengan ❤️ untuk iKaral Repair Center**
