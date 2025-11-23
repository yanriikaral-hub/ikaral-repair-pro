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

## 🔑 Setup Google Gemini API

1. Dapatkan API Key GRATIS di: https://aistudio.google.com/app/apikey
2. Buka aplikasi → Menu **Settings (API)**
3. Paste API Key Anda
4. Klik **Simpan**

Selesai! AI sudah siap digunakan.

## 📱 Fitur Utama

- ✅ Dashboard manajemen perbaikan
- 🤖 AI Diagnostik otomatis (Google Gemini)
- 📄 Generate PDF Invoice
- 🖨️ Print thermal receipt
- 📊 Statistik real-time
- 🔧 AI Training - customize logika AI sesuai bisnis Anda

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
