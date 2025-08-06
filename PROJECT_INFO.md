# K.M.T Author Website & API Project Documentation

## 🏠 Project Overview

This is a **Windows 95-styled website** for K.M.T, a **dark fantasy author** and **D&D Dungeon Master**. The website serves as a portfolio showcasing their work "Unyielding" and features D&D content for the custom "Aetherial" campaign setting.

**Live Environment:** https://catto.at (no localhost - working on live server)

---

## 📖 Main Book: "UNYIELDING"

**Genre:** Dark Fantasy Novel  
**Author:** K.M.T  
**Status:** Actively publishing chapters across multiple platforms

### 📚 Official Book Links (Current & Verified)
```
Wattpad: https://www.wattpad.com/story/390996157-unyielding
Tapas: https://tapas.io/series/unyielding_
Archive of Our Own (AO3): https://archiveofourown.org/works/64068811
GetInkspired: https://getinkspired.com/de/story/558599/unyielding
Royal Road: https://www.royalroad.com/fiction/110754/unyielding
ScribbleHub: https://www.scribblehub.com/series/1514528/unyielding/
```

**Synopsis:** A dark fantasy tale that explores the depths of human resilience and the price of power. Follow the journey through a world where magic comes with consequences and heroes are forged in the crucible of impossible choices.

---

## 🌐 Website Features & Structure

### Windows 95 Interface Elements
- **Desktop Icons** with functional click/double-click
- **Taskbar** with Start button and clock
- **Start Menu** with organized program shortcuts
- **Window System** with minimize/maximize/close buttons
- **Menu Bars** on all windows (File, Edit, View, etc.)

### Core Applications/Windows:

1. **📝 Unyielding.doc** - Main manuscript window showcasing the book
2. **📁 Text Samples** - Folder containing story samples
3. **🌍 Aetherial Wiki** - D&D campaign setting documentation
4. **🎮 Character Creator 95** - Full D&D 5.24e character creation tool
5. **🗺️ Dungeon Mapper** - Interactive dungeon mapping tool
6. **✉️ Mail Client** - Contact form styled as Outlook Express
7. **📰 Chapter Updates** - **THE MAIN API FEATURE** (news window)
8. **💰 Support Me** - Ko-fi integration page
9. **🔗 Repositories** - GitHub link

---

## 🔥 THE BIG FEATURE: Chapter Updates API

### Current Status: ✅ WORKING
**Location:** `Backend/simple-api.js`
**Port:** 3001 (HTTP) / 8443 (HTTPS)
**Server:** Live on catto.at

### API Endpoints:
- `GET /api/platforms/status` - Get platform-specific chapter data
- `GET /api/chapters/recent` - Get recent updates feed
- `POST /api/sync/trigger` - Manually trigger data refresh
- `GET /health` - Health check

### Current Functionality:
✅ **Royal Road** - Successfully scraping real data (3,792+ views, Chapter 18)  
⚠️ **Wattpad** - Fallback data (sites blocking requests)  
⚠️ **Tapas** - Fallback data (sites blocking requests)  
⚠️ **AO3** - Fallback with RSS + direct scraping attempts  
⚠️ **GetInkspired** - Fallback data  
⚠️ **ScribbleHub** - Blocked (403 error)  

### Requirements Met:
- ✅ Finds chapters automatically where possible
- ✅ Shows real platform links (not blanks) as fallback
- ✅ Live data from platforms that allow scraping
- ✅ Graceful fallback to useful link data
- ✅ Real-time status updates in the news window
- ✅ Responsive chapter update blog interface

---

## 🎲 D&D Features: Aetherial Campaign

### Character Creator 95
- **Full D&D 5.24e character creation**
- **Custom Races:** Voidling, Vampire, Werewolf, Fae, Succubus/Incubus, Ratfolk, Kitsune (marked with ⭐)
- **Custom Classes:** Tactician, Voidwalker, Soulbinder, Mana Knight, Doomkeeper, Crystal Sage, Shadow Dancer
- **Point Buy / Standard Array / 4d6 Rolling**
- **Racial abilities and class features**
- **Export to Roll20**

### Dungeon Mapper
- **Grid-based map creation (20x15)**
- **Tools:** Wall, Floor, Door, Trap, Monster, Treasure, Erase
- **Export to Roll20**
- **Save/Load maps**

### Aetherial Wiki Integration
- **Links to:** https://aetherial.fandom.com/wiki/Aetherial_Wiki
- **Custom pantheon, magic system, races, world lore**

---

## 🔧 Technical Architecture

### Frontend
- **Pure HTML/CSS/JavaScript** (no frameworks)
- **Windows 95 styling** throughout
- **Desktop metaphor** with draggable windows
- **Responsive design** within retro constraints

### Backend API
- **Node.js + Express**
- **Web scraping:** Axios + Cheerio
- **CORS enabled** for cross-origin requests
- **SSL/HTTPS support** (port 8443)
- **Caching system** (1-hour refresh intervals)
- **Fallback data system** for blocked sites

### External Integrations
- **Ko-fi** for support/donations
- **GitHub** for repositories
- **Roll20** for D&D character/map exports
- **Multiple publishing platforms** for book updates

---

## 📋 Current Priorities & Status

### ✅ COMPLETED
1. ✅ API is functional and live
2. ✅ Real data extraction from Royal Road
3. ✅ Fallback system working for blocked platforms
4. ✅ Chapter Updates window displaying real data
5. ✅ All book links correctly configured
6. ✅ Windows 95 interface fully functional

### 🔄 ONGOING
- **Monitoring API performance** on live server
- **Improving scraping reliability** where possible
- **Content updates** for Unyielding chapters

### 💡 FUTURE ENHANCEMENTS
- Additional platform integrations
- Enhanced scraping methods for blocked sites
- More D&D tools and features
- Community features for readers

---

## 🎯 Project Goals Achieved

1. ✅ **Unique Windows 95 aesthetic** - Nostalgic, functional interface
2. ✅ **Multi-platform book promotion** - All 6 major platforms linked
3. ✅ **Real-time chapter tracking** - API successfully monitors updates
4. ✅ **D&D content integration** - Full character creator and dungeon tools
5. ✅ **Professional author presence** - Complete portfolio site
6. ✅ **Reader engagement** - Support integration and contact features

---

## 🚀 Live Deployment Notes

- **Domain:** catto.at
- **Environment:** Live server (not localhost)
- **SSL:** Enabled on port 8443
- **API Status:** Operational with real-time data
- **Platform Links:** All verified and functional
- **Fallback System:** Ensures users always see useful links instead of blanks

---

**Last Updated:** August 2025  
**Maintainer:** K.M.T  
**Status:** ✅ Production Ready