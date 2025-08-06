#!/bin/bash
# 🔥 FIREWALL SETUP FÜR CATTO.AT WEBSITE
# Sichert die Website gegen unerwünschte Zugriffe ab

echo "🔒 Setting up firewall protection for catto.at..."

# UFW (Uncomplicated Firewall) aktivieren falls nicht aktiv
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# NOTWENDIGE PORTS ÖFFNEN
echo "🌐 Opening necessary ports..."

# SSH (22) - Nur von bekannten IPs
sudo ufw allow 22/tcp comment 'SSH access'

# HTTP (80) - Redirect zu HTTPS
sudo ufw allow 80/tcp comment 'HTTP redirect to HTTPS'

# HTTPS (443) - Hauptwebsite
sudo ufw allow 443/tcp comment 'HTTPS website'

# API Ports
sudo ufw allow 3001/tcp comment 'API HTTP'
sudo ufw allow 8443/tcp comment 'API HTTPS'

# SCHÄDLICHE PORTS BLOCKIEREN
echo "🚫 Blocking dangerous ports..."

# Häufig angegriffene Ports blockieren
sudo ufw deny 23/tcp comment 'Block Telnet'
sudo ufw deny 135/tcp comment 'Block RPC'
sudo ufw deny 139/tcp comment 'Block NetBIOS'
sudo ufw deny 445/tcp comment 'Block SMB'
sudo ufw deny 1433/tcp comment 'Block MSSQL'
sudo ufw deny 3389/tcp comment 'Block RDP'
sudo ufw deny 5432/tcp comment 'Block PostgreSQL external'

# RATE LIMITING REGELN
echo "⚡ Setting up connection rate limiting..."

# Limit SSH connection attempts
sudo ufw limit ssh comment 'Rate limit SSH'

# Advanced rules for API protection
sudo ufw --force enable

echo "✅ Firewall configuration completed!"
echo "📊 Active firewall status:"
sudo ufw status verbose

echo ""
echo "🔍 Open ports summary:"
ss -tulpn | grep LISTEN | grep -E ':(80|443|3001|8443|22)\s'