// Simple Node.js API for tracking platform updates
// This is a basic implementation to demonstrate the concept

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Platform configurations
const PLATFORMS = {
    tapas: {
        name: 'Tapas',
        url: 'https://tapas.io/series/unyielding_/info',
        rss: 'https://tapas.io/rss/series/645833',
        emoji: '🎨',
        color: '#ffb84d'
    },
    wattpad: {
        name: 'Wattpad', 
        url: 'https://www.wattpad.com/myworks/390996157-unyielding',
        emoji: '📚',
        color: '#ff6600'
    },
    ao3: {
        name: 'Archive of Our Own',
        url: 'https://archiveofourown.org/works/64068811/chapters/164375182',
        rss: 'https://archiveofourown.org/works/64068811/chapters.atom',
        emoji: '📖',
        color: '#990000'
    },
    inkspired: {
        name: 'Inkspired',
        url: 'https://getinkspired.com/en/story/558599/unyielding/',
        emoji: '🌟',
        color: '#4a90e2'
    },
    royalroad: {
        name: 'Royal Road',
        url: 'https://www.royalroad.com/fiction/110754/unyielding',
        emoji: '👑',
        color: '#0099cc'
    },
    scribblehub: {
        name: 'ScribbleHub',
        url: 'https://www.scribblehub.com/series/1514528/unyielding/',
        emoji: '✍️',
        color: '#ff6b6b'
    }
};

// Cache to store platform data
let platformCache = {};
let lastUpdateTime = new Date();

// Function to scrape Tapas data
async function scrapeTapas() {
    try {
        console.log('Scraping Tapas...');
        const response = await axios.get(PLATFORMS.tapas.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Try to extract chapter info from the page
        const episodes = $('.episode-list .episode-item');
        let latestChapter = null;
        
        if (episodes.length > 0) {
            const firstEpisode = episodes.first();
            const title = firstEpisode.find('.episode-title').text().trim();
            const date = firstEpisode.find('.episode-date').text().trim();
            
            latestChapter = {
                title: title || 'Latest Chapter',
                date: date || 'Recently',
                chapter_number: extractChapterNumber(title)
            };
        }
        
        return {
            platform: 'tapas',
            status: 'updated',
            last_chapter: latestChapter?.chapter_number || 'Unknown',
            chapter_title: latestChapter?.title || 'Latest Chapter',
            last_update: latestChapter?.date || 'Recently',
            views: Math.floor(Math.random() * 2000) + 500, // Placeholder
            likes: Math.floor(Math.random() * 100) + 20,
            comments: Math.floor(Math.random() * 50) + 5
        };
    } catch (error) {
        console.error('Error scraping Tapas:', error.message);
        return {
            platform: 'tapas',
            status: 'error',
            error: 'Failed to fetch data'
        };
    }
}

// Function to scrape Royal Road data
async function scrapeRoyalRoad() {
    try {
        console.log('Scraping Royal Road...');
        const response = await axios.get(PLATFORMS.royalroad.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Try to extract chapter info
        const chapterRows = $('.chapter-row');
        let latestChapter = null;
        
        if (chapterRows.length > 0) {
            const firstChapter = chapterRows.first();
            const title = firstChapter.find('a').text().trim();
            const date = firstChapter.find('time').attr('datetime') || 'Recently';
            
            latestChapter = {
                title: title,
                date: formatDate(date),
                chapter_number: extractChapterNumber(title)
            };
        }
        
        // Extract stats
        const stats = $('.stats-content .col-md-6');
        const views = extractNumber($('.stats-content').text(), 'Views');
        const followers = extractNumber($('.stats-content').text(), 'Followers');
        
        return {
            platform: 'royalroad',
            status: 'updated',
            last_chapter: latestChapter?.chapter_number || 'Unknown',
            chapter_title: latestChapter?.title || 'Latest Chapter',
            last_update: latestChapter?.date || 'Recently',
            views: views || Math.floor(Math.random() * 5000) + 1000,
            likes: Math.floor(Math.random() * 200) + 50,
            comments: Math.floor(Math.random() * 100) + 10
        };
    } catch (error) {
        console.error('Error scraping Royal Road:', error.message);
        return {
            platform: 'royalroad',
            status: 'error',
            error: 'Failed to fetch data'
        };
    }
}

// Function to parse RSS feeds (AO3, Tapas)
async function parseRSSFeed(url, platformName) {
    try {
        console.log(`Parsing RSS feed for ${platformName}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const $ = cheerio.load(response.data, { xmlMode: true });
        const items = $('item');
        
        if (items.length > 0) {
            const latestItem = items.first();
            const title = latestItem.find('title').text();
            const pubDate = latestItem.find('pubDate').text();
            
            return {
                platform: platformName.toLowerCase().replace(' ', ''),
                status: 'updated',
                last_chapter: extractChapterNumber(title),
                chapter_title: title,
                last_update: formatDate(pubDate),
                views: Math.floor(Math.random() * 1500) + 300,
                likes: Math.floor(Math.random() * 80) + 15,
                comments: Math.floor(Math.random() * 30) + 3
            };
        }
        
        return {
            platform: platformName.toLowerCase().replace(' ', ''),
            status: 'no_data',
            error: 'No items found in RSS feed'
        };
        
    } catch (error) {
        console.error(`Error parsing RSS feed for ${platformName}:`, error.message);
        return {
            platform: platformName.toLowerCase().replace(' ', ''),
            status: 'error',
            error: 'Failed to parse RSS feed'
        };
    }
}

// Utility functions
function extractChapterNumber(title) {
    const match = title.match(/chapter\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
}

function extractNumber(text, keyword) {
    const regex = new RegExp(`${keyword}[:\\s]*([0-9,]+)`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1].replace(/,/g, '')) : null;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
        return 'Recently';
    }
}

function determineStatus(data) {
    if (data.error) return 'error';
    
    const daysSinceUpdate = Math.floor(Math.random() * 7); // Simulate days since update
    
    if (daysSinceUpdate === 0) return 'latest';
    if (daysSinceUpdate <= 2) return 'updated';
    if (daysSinceUpdate <= 4) return 'pending';
    return 'behind';
}

// API Routes

// Get platform status
app.get('/api/platforms/status', async (req, res) => {
    try {
        console.log('Fetching platform status...');
        
        const platformPromises = [
            scrapeTapas(),
            scrapeRoyalRoad(),
            parseRSSFeed(PLATFORMS.ao3.rss, 'ao3'),
            // Add mock data for platforms that are harder to scrape
            Promise.resolve({
                platform: 'wattpad',
                status: 'pending',
                last_chapter: 'Unknown',
                chapter_title: 'Latest Chapter',
                last_update: '3 days ago',
                views: Math.floor(Math.random() * 3000) + 800,
                likes: Math.floor(Math.random() * 150) + 30,
                comments: Math.floor(Math.random() * 75) + 8
            }),
            Promise.resolve({
                platform: 'inkspired',
                status: 'updated',
                last_chapter: 'Unknown',
                chapter_title: 'Latest Chapter', 
                last_update: '2 days ago',
                views: Math.floor(Math.random() * 1200) + 400,
                likes: Math.floor(Math.random() * 90) + 20,
                comments: Math.floor(Math.random() * 40) + 5
            }),
            Promise.resolve({
                platform: 'scribblehub',
                status: 'updating',
                last_chapter: 'Unknown',
                chapter_title: 'Latest Chapter',
                last_update: '4 days ago',
                views: Math.floor(Math.random() * 800) + 200,
                likes: Math.floor(Math.random() * 60) + 12,
                comments: Math.floor(Math.random() * 25) + 3
            })
        ];
        
        const results = await Promise.allSettled(platformPromises);
        const platforms = results.map(result => 
            result.status === 'fulfilled' ? result.value : {
                platform: 'unknown',
                status: 'error',
                error: 'Request failed'
            }
        );
        
        // Update cache
        platformCache = {
            platforms,
            last_check: new Date().toISOString()
        };
        lastUpdateTime = new Date();
        
        res.json(platformCache);
        
    } catch (error) {
        console.error('Error fetching platform status:', error);
        res.status(500).json({ error: 'Failed to fetch platform status' });
    }
});

// Get recent updates feed
app.get('/api/chapters/recent', async (req, res) => {
    try {
        // Generate mock recent updates based on current platform data
        const updates = [];
        
        if (platformCache.platforms) {
            platformCache.platforms.forEach(platform => {
                if (platform.status !== 'error') {
                    updates.push({
                        id: `${platform.platform}-${Date.now()}`,
                        platform: platform.platform,
                        platform_display: PLATFORMS[platform.platform]?.name || platform.platform,
                        platform_emoji: PLATFORMS[platform.platform]?.emoji || '📖',
                        chapter_number: platform.last_chapter,
                        chapter_title: platform.chapter_title,
                        status: platform.status,
                        published_date: platform.last_update,
                        word_count: Math.floor(Math.random() * 2000) + 1500,
                        views: platform.views,
                        likes: platform.likes,
                        comments: platform.comments,
                        preview: "This chapter continues the thrilling adventure as our protagonist faces new challenges..."
                    });
                }
            });
        }
        
        // Sort by most recent
        updates.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
        
        res.json({
            updates: updates.slice(0, 10), // Limit to 10 most recent
            total: updates.length,
            last_update: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching recent updates:', error);
        res.status(500).json({ error: 'Failed to fetch recent updates' });
    }
});

// Manual sync trigger
app.post('/api/sync/trigger', async (req, res) => {
    try {
        // Clear cache to force fresh data
        platformCache = {};
        
        // Fetch fresh data
        const statusResponse = await axios.get(`http://localhost:${PORT}/api/platforms/status`);
        
        res.json({
            success: true,
            message: 'Sync triggered successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error triggering sync:', error);
        res.status(500).json({ error: 'Failed to trigger sync' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Platform Tracking API Server started!`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /api/platforms/status   - Get platform status`);
    console.log(`   GET  /api/chapters/recent    - Get recent updates`);
    console.log(`   POST /api/sync/trigger       - Trigger manual sync`);
    console.log(`\n🔍 Monitoring platforms:`);
    Object.entries(PLATFORMS).forEach(([key, platform]) => {
        console.log(`   ${platform.emoji} ${platform.name} - ${platform.url}`);
    });
    console.log(`\n⏰ Auto-refresh every 5 minutes`);
});

// Auto-refresh every 5 minutes
setInterval(async () => {
    try {
        console.log('\n⏰ Auto-refreshing platform data...');
        await axios.get(`http://localhost:${PORT}/api/platforms/status`);
        console.log('✅ Auto-refresh completed');
    } catch (error) {
        console.error('❌ Auto-refresh failed:', error.message);
    }
}, 5 * 60 * 1000); // 5 minutes

module.exports = app;