#!/bin/bash

echo "=========================================="
echo "  🚀 iKaral AI Repair Pro - Deployment"
echo "=========================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fungsi untuk cek command
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fungsi untuk menjalankan docker compose (support versi lama & baru)
docker_compose_cmd() {
    if command_exists docker-compose; then
        docker-compose "$@"
    elif docker compose version >/dev/null 2>&1; then
        docker compose "$@"
    else
        echo -e "${RED}❌ Docker Compose tidak ditemukan!${NC}"
        exit 1
    fi
}

# 1. Cek Docker
echo "📦 Mengecek Docker..."
if ! command_exists docker; then
    echo -e "${RED}❌ Docker belum terinstall!${NC}"
    echo "Install Docker dengan: curl -fsSL https://get.docker.com | sh"
    exit 1
fi
echo -e "${GREEN}✅ Docker sudah terinstall${NC}"

# 2. Cek Docker Compose
echo "📦 Mengecek Docker Compose..."
if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose belum terinstall!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose sudah terinstall${NC}"

# 3. Stop container lama jika ada
echo ""
echo "🛑 Menghentikan container lama (jika ada)..."
docker_compose_cmd down 2>/dev/null || true

# 4. Build image
echo ""
echo "🔨 Building Docker image..."
docker_compose_cmd build

# 5. Start container
echo ""
echo "🚀 Menjalankan aplikasi..."
docker_compose_cmd up -d

# 6. Cek status
echo ""
sleep 3
if docker ps | grep -q ikaral-repair-pro; then
    echo -e "${GREEN}=========================================="
    echo "  ✅ DEPLOYMENT BERHASIL!"
    echo "==========================================${NC}"
    echo ""
    echo "📱 Akses aplikasi di:"
    echo "   → http://localhost:8080"
    echo "   → http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    echo "🔧 Commands:"
    if command_exists docker-compose; then
        echo "   → Lihat logs: docker-compose logs -f"
        echo "   → Stop app: docker-compose down"
        echo "   → Restart: docker-compose restart"
    else
        echo "   → Lihat logs: docker compose logs -f"
        echo "   → Stop app: docker compose down"
        echo "   → Restart: docker compose restart"
    fi
    echo ""
else
    echo -e "${RED}❌ Deployment gagal! Cek logs dengan: docker compose logs${NC}"
    exit 1
fi
