# Unyielding Platform Tracker API

Automatisches System zum Tracken von Kapitel-Updates für "Unyielding" across verschiedenen Writing-Plattformen.

## 🚀 Quick Start

### 1. Dependencies installieren
```bash
cd Backend
npm install
```

### 2. API Server starten
```bash
npm start
# oder für Development mit Auto-Reload:
npm run dev
```

### 3. API testen
```bash
# Platform Status abrufen:
curl http://localhost:3001/api/platforms/status

# Recent Updates abrufen:
curl http://localhost:3001/api/chapters/recent

# Manual Sync triggern:
curl -X POST http://localhost:3001/api/sync/trigger
```

## 📡 API Endpoints

| Endpoint | Method | Beschreibung |
|----------|--------|--------------|
| `/api/platforms/status` | GET | Status aller Plattformen mit letzten Kapiteln |
| `/api/chapters/recent` | GET | Chronologische Liste der neuesten Updates |
| `/api/sync/trigger` | POST | Manueller Sync aller Plattformen |

## 🌐 Unterstützte Plattformen

- **🎨 Tapas** - RSS Feed + Web Scraping
- **📚 Wattpad** - Web Scraping
- **📖 Archive of Our Own** - RSS Feed
- **🌟 Inkspired** - Web Scraping 
- **👑 Royal Road** - Official API + Web Scraping
- **✍️ ScribbleHub** - Web Scraping

## 🔧 Features

### Aktuell implementiert:
- ✅ Web Scraping für Tapas und Royal Road
- ✅ RSS Feed Parsing für AO3
- ✅ Mock-Daten für andere Plattformen
- ✅ Auto-Refresh alle 5 Minuten
- ✅ Caching System
- ✅ Error Handling und Fallbacks
- ✅ CORS Support für Frontend Integration

### Geplante Erweiterungen:
- 🔄 Vollständiges Web Scraping für alle Plattformen
- 📊 Engagement Metrics Tracking
- 🔔 Push Notifications für neue Kapitel
- 📈 Analytics und Trends
- 🤖 Smart Publishing Schedule Suggestions

## 🛠️ Technical Details

### Architektur:
- **Backend**: Node.js + Express
- **Scraping**: Cheerio + Axios
- **Database**: In-Memory (später SQLite/PostgreSQL)
- **Frontend Integration**: Fetch API mit Auto-Updates

### Scraping Strategien:
- **RSS Feeds**: Direkt von Plattformen die sie anbieten
- **Official APIs**: Royal Road, etc.
- **Web Scraping**: Respectful scraping mit User-Agent rotation
- **Rate Limiting**: Verhindert Overload der Ziel-Server

## 📋 Response Beispiele

### Platform Status Response:
```json
{
  "platforms": [
    {
      "platform": "tapas",
      "status": "updated",
      "last_chapter": 25,
      "chapter_title": "The Rising Storm",
      "last_update": "2 days ago",
      "views": 1234,
      "likes": 89,
      "comments": 12
    }
  ],
  "last_check": "2024-01-05T14:30:00Z"
}
```

### Recent Updates Response:
```json
{
  "updates": [
    {
      "platform": "royalroad",
      "platform_display": "Royal Road",
      "platform_emoji": "👑",
      "chapter_number": 26,
      "chapter_title": "Shadows and Light",
      "status": "latest",
      "published_date": "1 day ago",
      "word_count": 2847,
      "views": 1856,
      "likes": 124,
      "comments": 23,
      "preview": "The battle intensifies as our heroes face..."
    }
  ],
  "total": 15,
  "last_update": "2024-01-05T14:30:00Z"
}
```

## 🔒 Security & Ethics

### Rate Limiting:
- Respectful intervals zwischen Requests (30s - 2min)
- User-Agent rotation um Blocking zu vermeiden
- Honor robots.txt und Platform ToS

### Privacy:
- Nur öffentlich verfügbare Daten sammeln
- Keine persönlichen Reader-Daten
- Compliance mit Platform Policies

## 🐛 Troubleshooting

### Common Issues:

**API Server startet nicht:**
```bash
# Check if port 3001 is free:
lsof -i :3001
# Kill process if needed:
kill -9 <PID>
```

**CORS Errors im Frontend:**
- API Server muss laufen bevor Frontend geöffnet wird
- Check Browser Developer Console für Details

**Platform Data lädt nicht:**
- Check API Server Logs für Scraping Errors
- Manche Plattformen können temporär unavailable sein

### Debug Commands:
```bash
# Check API Status:
curl -v http://localhost:3001/api/platforms/status

# View Server Logs:
npm start

# Test einzelne Platform:
node -e "const api = require('./api.js'); api.scrapeTapas().then(console.log);"
```

## 📈 Monitoring

### Logs zeigen:
- 🔍 Scraping Success/Failure
- ⏰ Auto-refresh Aktivität  
- 📊 Response Times
- ❌ Error Details

### Performance Metrics:
- Platform Response Times
- Success/Failure Rates
- Cache Hit Ratios
- API Request Frequencies

---

**Made with ❤️ for the "Unyielding" Community by K.M.T**