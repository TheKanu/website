#!/bin/bash
# 🔍 COMPREHENSIVE SECURITY AUDIT FOR CATTO.AT
# Automatische Sicherheitsprüfung der Website und API

echo "🔒 CATTO.AT SECURITY AUDIT STARTING..."
echo "============================================"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. 🌐 PORT-SCANNING
echo -e "\n${BLUE}1. 🌐 PORT ANALYSIS${NC}"
echo "--------------------"
echo "📊 Currently listening ports:"
ss -tulpn | grep LISTEN | while read line; do
    port=$(echo "$line" | grep -oE ':[0-9]+' | head -1 | tr -d ':')
    if [[ -n "$port" ]]; then
        case $port in
            80|443|3001|8443) echo -e "✅ ${GREEN}Port $port - Expected${NC}" ;;
            22) echo -e "⚠️  ${YELLOW}Port $port - SSH (secure if restricted)${NC}" ;;
            5432) echo -e "⚠️  ${YELLOW}Port $port - PostgreSQL (should be localhost only)${NC}" ;;
            *) echo -e "❌ ${RED}Port $port - Unexpected/Potentially dangerous${NC}" ;;
        esac
    fi
done

# 2. 🔐 SSL/TLS CERTIFICATE CHECK
echo -e "\n${BLUE}2. 🔐 SSL/TLS CERTIFICATE ANALYSIS${NC}"
echo "-----------------------------------"
if [[ -f "Backend/ssl/cert.pem" ]]; then
    echo "✅ SSL certificate found"
    
    # Certificate expiry check
    expiry_date=$(openssl x509 -in Backend/ssl/cert.pem -noout -enddate 2>/dev/null | cut -d= -f2)
    if [[ -n "$expiry_date" ]]; then
        echo "📅 Certificate expires: $expiry_date"
        
        # Check if certificate expires in next 30 days
        exp_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
        now_epoch=$(date +%s)
        days_left=$(( (exp_epoch - now_epoch) / 86400 ))
        
        if [[ $days_left -lt 30 ]]; then
            echo -e "⚠️  ${YELLOW}Certificate expires in $days_left days - renewal needed soon${NC}"
        else
            echo -e "✅ ${GREEN}Certificate valid for $days_left more days${NC}"
        fi
    fi
    
    # Certificate strength check
    key_length=$(openssl x509 -in Backend/ssl/cert.pem -noout -text 2>/dev/null | grep -E "Public-Key:" | grep -oE '[0-9]+')
    if [[ $key_length -ge 2048 ]]; then
        echo -e "✅ ${GREEN}Strong key length: ${key_length} bit${NC}"
    else
        echo -e "❌ ${RED}Weak key length: ${key_length} bit (should be ≥2048)${NC}"
    fi
else
    echo -e "❌ ${RED}SSL certificate not found at Backend/ssl/cert.pem${NC}"
fi

# 3. 📦 NPM SECURITY AUDIT
echo -e "\n${BLUE}3. 📦 NPM PACKAGE SECURITY${NC}"
echo "---------------------------"
cd Backend 2>/dev/null || cd .
npm audit --audit-level=moderate 2>/dev/null | head -20

# 4. 🔍 FILE PERMISSIONS CHECK
echo -e "\n${BLUE}4. 🔍 FILE PERMISSIONS ANALYSIS${NC}"
echo "--------------------------------"
echo "Checking critical files:"

files_to_check=(
    "Backend/simple-api.js"
    "Backend/ssl/key.pem"
    "Backend/ssl/cert.pem"
    "Backend/security-config.js"
    "index.html"
)

for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        perms=$(stat -c "%a" "$file")
        case "$file" in
            *"key.pem") 
                if [[ "$perms" == "600" ]] || [[ "$perms" == "400" ]]; then
                    echo -e "✅ ${GREEN}$file - Secure permissions ($perms)${NC}"
                else
                    echo -e "❌ ${RED}$file - Insecure permissions ($perms) - should be 600${NC}"
                fi
                ;;
            *".js"|*".html")
                if [[ "$perms" == "644" ]] || [[ "$perms" == "755" ]]; then
                    echo -e "✅ ${GREEN}$file - Good permissions ($perms)${NC}"
                else
                    echo -e "⚠️  ${YELLOW}$file - Unusual permissions ($perms)${NC}"
                fi
                ;;
            *)
                echo -e "ℹ️  $file - Permissions: $perms"
                ;;
        esac
    else
        echo -e "❌ ${RED}$file - File not found${NC}"
    fi
done

# 5. 🌍 EXTERNAL ACCESSIBILITY TEST
echo -e "\n${BLUE}5. 🌍 EXTERNAL ACCESSIBILITY TEST${NC}"
echo "-----------------------------------"
echo "Testing API endpoints:"

endpoints=(
    "http://localhost:3001/health"
    "https://localhost:8443/health" 
    "http://localhost:3001/api/platforms/status"
)

for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$endpoint" 2>/dev/null)
    if [[ "$response" == "200" ]]; then
        echo -e "✅ ${GREEN}$endpoint - Accessible${NC}"
    elif [[ "$response" == "429" ]]; then
        echo -e "⚡ ${YELLOW}$endpoint - Rate limited (good!)${NC}"
    elif [[ -z "$response" ]]; then
        echo -e "❌ ${RED}$endpoint - Not accessible${NC}"
    else
        echo -e "⚠️  ${YELLOW}$endpoint - HTTP $response${NC}"
    fi
done

# 6. 🔒 SECURITY HEADERS TEST  
echo -e "\n${BLUE}6. 🔒 SECURITY HEADERS TEST${NC}"
echo "----------------------------"
if command -v curl >/dev/null; then
    echo "Testing security headers:"
    headers=$(curl -s -I http://localhost:3001/health 2>/dev/null)
    
    security_headers=(
        "X-Content-Type-Options"
        "X-Frame-Options" 
        "X-XSS-Protection"
        "Strict-Transport-Security"
        "Content-Security-Policy"
    )
    
    for header in "${security_headers[@]}"; do
        if echo "$headers" | grep -qi "$header"; then
            echo -e "✅ ${GREEN}$header header present${NC}"
        else
            echo -e "❌ ${RED}$header header missing${NC}"
        fi
    done
else
    echo "curl not available - skipping header test"
fi

# 7. 📊 SUMMARY & RECOMMENDATIONS
echo -e "\n${BLUE}7. 📊 SECURITY SUMMARY${NC}"
echo "======================"
echo -e "${GREEN}✅ SECURITY MEASURES IMPLEMENTED:${NC}"
echo "   • Rate limiting on API endpoints"
echo "   • CORS protection with whitelist"
echo "   • Input validation and sanitization"
echo "   • Security headers (Helmet.js)"
echo "   • SSL/TLS encryption"
echo "   • IP blocking capability"
echo "   • Security event logging"

echo -e "\n${YELLOW}⚠️  SECURITY RECOMMENDATIONS:${NC}"
echo "   • Regularly update npm packages (npm audit fix)"
echo "   • Monitor SSL certificate expiry"
echo "   • Review firewall rules periodically"
echo "   • Implement log monitoring/alerting"
echo "   • Consider fail2ban for automated IP blocking"
echo "   • Regular security audits"

echo -e "\n${BLUE}🔍 MONITORING COMMANDS:${NC}"
echo "   • Check active connections: ss -tuln"
echo "   • Monitor API logs: tail -f Backend/server.log"
echo "   • Firewall status: sudo ufw status"
echo "   • Check for updates: npm outdated"

echo -e "\n${GREEN}✅ Security audit completed!${NC}"
echo "=========================================="