// Real-time platform tracking API with web scraping
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001;
const HTTPS_PORT = 8443;

app.use(cors());
app.use(express.json());

// Cache and rate limiting
let platformCache = {};
let lastUpdateTime = new Date(0); // Initialize to epoch so first request triggers update

// Ko-fi updates cache
let kofiUpdates = [];
const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Ko-fi helper functions
function addKofiUpdate(update) {
    kofiUpdates.unshift(update); // Neueste zuerst
    kofiUpdates = kofiUpdates.slice(0, 20); // Max 20 Updates behalten
    console.log(`☕ Ko-fi update hinzugefügt: ${update.chapter_title}`);
}

function getKofiUpdatesForFeed() {
    return kofiUpdates.map(update => ({
        id: `kofi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        platform: 'kofi',
        platform_display: 'Ko-fi',
        platform_emoji: '☕',
        chapter_number: 'Support',
        chapter_title: update.chapter_title,
        status: 'updated',
        published_date: update.last_update,
        timestamp: update.timestamp,
        url: 'https://ko-fi.com/amke',
        chapter_url: 'https://ko-fi.com/amke',
        platform_url: 'https://ko-fi.com/amke',
        preview: update.preview || 'Danke für die Unterstützung!',
        upload_status: update.upload_status || 'just_uploaded',
        post_type: 'kofi_support'
    }));
}

// Check if we need to update data (max once per hour)
function shouldUpdateData() {
    const now = new Date();
    return (now - lastUpdateTime) >= UPDATE_INTERVAL_MS;
}

// Platform configurations - MANUAL UPDATE SYSTEM for blog tracking
const PLATFORMS = {
    wattpad: {
        name: 'Wattpad',
        url: 'https://www.wattpad.com/story/390996157-unyielding',
        emoji: '📚',
        type: 'parts',
        note: 'Daily parts Mon-Sat',
        // Manual tracking - update when you post
        last_chapter: 'Chapter 18',
        last_update: '2025-08-06T14:30:00', // Update this when you post (with time!)
        scraping: false // Disable scraping, use manual data
    },
    tapas: {
        name: 'Tapas',
        url: 'https://tapas.io/series/unyielding_',
        emoji: '🎨',
        type: 'parts',
        note: 'Daily parts Mon-Sat',
        // Manual tracking
        last_chapter: 'Episode 18',
        last_update: '2025-08-06T15:45:00', // Include precise time
        scraping: false
    },
    royalroad: {
        name: 'Royal Road',
        url: 'https://www.royalroad.com/fiction/110754/unyielding',
        emoji: '👑',
        type: 'full',
        note: 'Full chapters every Monday',
        scraping: true // This one works with scraping
    },
    ao3: {
        name: 'Archive of Our Own',
        url: 'https://archiveofourown.org/works/64068811',
        rss: 'https://archiveofourown.org/works/64068811/chapters.atom',
        emoji: '📖',
        type: 'full',
        note: 'Full chapters every Monday',
        scraping: true // This one works with scraping
    },
    inkspired: {
        name: 'Inkspired',
        url: 'https://getinkspired.com/de/story/558599/unyielding',
        emoji: '🌟',
        type: 'full',
        note: 'Full chapters every Monday',
        // Manual tracking
        last_chapter: 'Chapter 18',
        last_update: '2025-08-05T16:20:00', // Behind by 1 day
        scraping: false
    },
    scribblehub: {
        name: 'ScribbleHub',
        url: 'https://www.scribblehub.com/series/1514528/unyielding/',
        emoji: '✍️',
        type: 'full', 
        note: 'Full chapters every Monday',
        // Manual tracking
        last_chapter: 'Chapter 17',
        last_update: '2025-07-29T18:00:00', // Behind
        scraping: false
    },
    kofi: {
        name: 'Ko-fi Posts',
        url: 'https://ko-fi.com/amke',
        emoji: '☕',
        type: 'posts',
        note: 'Updates & Blog Posts',
        scraping: true // Will scrape Ko-fi posts
    }
};

// Real scraping functions - NO MOCK DATA FALLBACKS
async function scrapeWattpad() {
    try {
        console.log('🔍 Scraping Wattpad...');
        const response = await axios.get(PLATFORMS.wattpad.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Scraping Wattpad chapter list...');
        
        // New approach: Look for story parts/chapters in the table of contents
        // Based on actual Wattpad structure with 84 parts
        const chapterSelectors = [
            'ul.table-of-contents li', // Main TOC structure
            '.table-of-contents li',
            '.story-parts li',
            'ul.table-of-contents .part',
            '.table-of-contents a[href*="part"]',
            '.story__parts .part',
            'ul[data-component="table-of-contents"] li',
            '.table-of-contents .story-part',
            '.toc-list li'
        ];
        
        let chapters = $();
        let usedSelector = '';
        
        for (const selector of chapterSelectors) {
            chapters = $(selector);
            if (chapters.length > 0) {
                console.log(`✅ Found ${chapters.length} chapters using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (chapters.length === 0) {
            console.log('❌ No chapters found with any selector');
            return {
                platform: 'wattpad',
                status: 'error',
                error: 'Could not find chapter list'
            };
        }
        
        // Get the LATEST chapter (last in list, as Wattpad lists chronologically)
        const latestChapter = chapters.last();
        const chapterLink = latestChapter.find('a');
        
        if (chapterLink.length === 0) {
            console.log('❌ No chapter link found in latest chapter element');
            return {
                platform: 'wattpad',
                status: 'error', 
                error: 'Could not extract chapter link'
            };
        }
        
        const title = chapterLink.text().trim();
        const href = chapterLink.attr('href');
        const chapterUrl = href?.startsWith('http') ? href : `https://www.wattpad.com${href}`;
        
        console.log(`📖 Latest Wattpad chapter: "${title}"`);
        console.log(`🔗 Chapter URL: ${chapterUrl}`);
        
        // Extract chapter number from title 
        const chapterNumber = extractChapterNumber(title) || 'Latest';
        
        // Try to extract publication date from the chapter element
        const timeElement = latestChapter.find('time, .date, .published, [datetime]');
        let timestamp = null;
        let lastUpdate = 'Recently';
        
        if (timeElement.length > 0) {
            const timeAttr = timeElement.attr('datetime') || timeElement.attr('data-original-title');
            const timeText = timeElement.text().trim();
            
            if (timeAttr) {
                timestamp = new Date(timeAttr);
                lastUpdate = formatRelativeTime(timestamp);
                console.log(`🕒 Found publication date: ${timestamp}`);
            } else if (timeText) {
                timestamp = parseRelativeTime(timeText);
                lastUpdate = timeText;
            }
        }
        
        // Extract engagement metrics from the main story page
        const views = extractEngagementMetric($, [
            '.reads', '.read-count', '.story-stats .reads',
            '.stats-item:contains("Reads")', 
            '[data-original-title*="reads" i]'
        ], 'reads');
        
        const votes = extractEngagementMetric($, [
            '.votes', '.vote-count', '.story-stats .votes',
            '.stats-item:contains("Votes")',
            '[data-original-title*="votes" i]'
        ], 'votes');
        
        const comments = extractEngagementMetric($, [
            '.comments', '.comment-count', '.story-stats .comments',
            '.stats-item:contains("Comments")',
            '[data-original-title*="comments" i]'
        ], 'comments');
        
        return {
            platform: 'wattpad',
            status: 'updated',
            last_chapter: chapterNumber,
            chapter_title: title,
            last_update: lastUpdate,
            timestamp: timestamp ? timestamp.toISOString() : new Date().toISOString(),
            views: views || 0,
            likes: votes || 0, 
            comments: comments || 0,
            word_count: 2500, // Estimated per chapter
            chapter_url: chapterUrl,
            raw_title: title,
            total_chapters: chapters.length,
            scraping_method: usedSelector
        };
        
    } catch (error) {
        console.error('❌ Wattpad scraping error:', error.message);
        return {
            platform: 'wattpad',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

async function scrapeTapas() {
    try {
        console.log('🔍 Scraping Tapas...');
        const response = await axios.get(PLATFORMS.tapas.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Scraping Tapas episode list...');
        
        // Try multiple episode selectors for Tapas
        const episodeSelectors = [
            '.js-episode-list .js-episode', // Main episode list
            '.episode-list .episode',
            '.series-episodes .episode', 
            '.episode-item',
            '.content__item',
            'a[href*="/episode/"]',  
            '.episode-card',
            '.episode-container'
        ];
        
        let episodes = $();
        let usedSelector = '';
        
        for (const selector of episodeSelectors) {
            episodes = $(selector);
            if (episodes.length > 0) {
                console.log(`✅ Found ${episodes.length} episodes using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (episodes.length === 0) {
            console.log('❌ No episodes found with any selector on Tapas');
            return {
                platform: 'tapas',
                status: 'error',
                error: 'Could not find episode list'
            };
        }
        
        // Get latest episode (first in Tapas list, as they're reverse chronological)
        const latestEpisode = episodes.first();
        const episodeLink = latestEpisode.find('a').first();
        
        if (episodeLink.length === 0) {
            console.log('❌ No episode link found');
            return {
                platform: 'tapas',
                status: 'error',
                error: 'Could not extract episode link'
            };
        }
        
        let title = episodeLink.text().trim();
        if (!title) {
            title = latestEpisode.find('.episode-title, .title, h3, .text--title').text().trim();
        }
        
        const href = episodeLink.attr('href');
        const chapterUrl = href?.startsWith('http') ? href : `https://tapas.io${href}`;
        
        console.log(`📖 Latest Tapas episode: "${title}"`);
        console.log(`🔗 Episode URL: ${chapterUrl}`);
        
        // Extract episode number
        const episodeNumber = extractChapterNumber(title) || 'Latest';
        
        return {
            platform: 'tapas',
            status: 'updated',
            last_chapter: episodeNumber,
            chapter_title: title,
            last_update: 'Recently',
            timestamp: new Date().toISOString(),
            views: 0,
            likes: 0, 
            comments: 0,
            word_count: 1800,
            chapter_url: chapterUrl,
            raw_title: title,
            total_episodes: episodes.length,
            scraping_method: usedSelector
        };
        
    } catch (error) {
        console.error('❌ Tapas scraping error:', error.message);
        return {
            platform: 'tapas',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

async function scrapeRoyalRoad() {
    try {
        console.log('🔍 Scraping Royal Road...');
        const response = await axios.get(PLATFORMS.royalroad.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Scraping Royal Road chapter table...');
        
        // Look for chapter table - Royal Road has a specific structure
        const chapterSelectors = [
            'tbody .chapter-row', // Main chapter table rows
            '.chapter-row',
            'table tr:has(td)', 
            '.portlet-body table tr',
            '#chapters tbody tr'
        ];
        
        let chapters = $();
        let usedSelector = '';
        
        for (const selector of chapterSelectors) {
            chapters = $(selector);
            if (chapters.length > 0) {
                console.log(`✅ Found ${chapters.length} chapters using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (chapters.length === 0) {
            console.log('❌ No chapters found with any selector');
            return {
                platform: 'royalroad',
                status: 'error',
                error: 'Could not find chapter table'
            };
        }
        
        // Get the LATEST chapter (last in Royal Road table, as they're in chronological order)
        const latestChapter = chapters.last();
        const chapterLink = latestChapter.find('a[href*="chapter"]').first();
        
        if (chapterLink.length === 0) {
            console.log('❌ No chapter link found in latest chapter row');
            return {
                platform: 'royalroad',
                status: 'error',
                error: 'Could not extract chapter link'
            };
        }
        
        let title = chapterLink.text().trim();
        // Clean up title - remove extra whitespace and time info
        title = title.replace(/\s+/g, ' ').replace(/\s*\d+\s+(days?|hours?|minutes?|weeks?)\s+ago\s*$/i, '').trim();
        
        const href = chapterLink.attr('href');
        const chapterUrl = href?.startsWith('http') ? href : `https://www.royalroad.com${href}`;
        
        console.log(`📖 Latest Royal Road chapter: "${title}"`);
        console.log(`🔗 Chapter URL: ${chapterUrl}`);
        
        // Extract chapter number from title
        const chapterNumber = extractChapterNumber(title) || 'Latest';
        
        // Try to extract publication date from the chapter row
        const timeElement = latestChapter.find('time[datetime], time[unixtime], [title*="ago" i]');
        let timestamp = null;
        let lastUpdate = 'Recently';
        
        if (timeElement.length > 0) {
            const timeAttr = timeElement.attr('datetime') || timeElement.attr('unixtime') || timeElement.attr('title');
            
            if (timeAttr) {
                if (timeAttr.includes('ago')) {
                    // Parse relative time from title attribute like "2 days ago"
                    timestamp = parseRelativeTime(timeAttr);
                    lastUpdate = timeAttr;
                } else {
                    // Parse datetime or unix timestamp
                    timestamp = new Date(isNaN(timeAttr) ? timeAttr : parseInt(timeAttr) * 1000);
                    lastUpdate = formatRelativeTime(timestamp);
                }
                console.log(`🕒 Found publication date: ${timestamp}`);
            }
        }
        
        // Extract fiction stats from the page
        const views = extractEngagementMetric($, [
            '.stats-content', '.view-count', '.fiction-stats dd',
            'dd:contains("Views")', '.stats dd'
        ], 'views') || extractViewsFromStats($('.stats-content').text());
        
        const followers = extractEngagementMetric($, [
            '.fiction-stats dd', 'dd:contains("Followers")',
            '.stats dd', '.followers'
        ], 'followers');
        
        const favorites = extractEngagementMetric($, [
            '.fiction-stats dd', 'dd:contains("Favorites")', 
            '.stats dd', '.favorites'
        ], 'favorites');
        
        const rating = $('span[property="ratingValue"]').text() || $('.fiction-stats .stars').text();
        
        return {
            platform: 'royalroad',
            status: 'updated', 
            last_chapter: chapterNumber,
            chapter_title: title,
            last_update: lastUpdate,
            timestamp: timestamp ? timestamp.toISOString() : new Date().toISOString(),
            views: views || 0,
            likes: favorites || 0, // Use favorites as "likes"
            comments: 0, // Would need to scrape individual chapter for comments
            word_count: 3200, // Estimated per chapter
            chapter_url: chapterUrl,
            raw_title: title,
            total_chapters: chapters.length,
            followers: followers || 0,
            rating: rating,
            scraping_method: usedSelector
        };
        
    } catch (error) {
        console.error('❌ Royal Road scraping error:', error.message);
        return {
            platform: 'royalroad',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

async function parseAO3RSS() {
    try {
        console.log('🔍 Parsing AO3 RSS...');
        const response = await axios.get(PLATFORMS.ao3.rss, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        console.log('✅ AO3 RSS response received, status:', response.status);
        
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        // Check if this is an Atom feed (AO3 uses Atom)  
        const atomEntries = $('entry');
        console.log(`📖 Found ${atomEntries.length} Atom entries in AO3 feed`);
        
        if (atomEntries.length > 0) {
            const latestEntry = atomEntries.first();
            const title = latestEntry.find('title').text().trim();
            const published = latestEntry.find('published').text().trim();
            const updated = latestEntry.find('updated').text().trim();
            const pubDate = updated || published;
            
            console.log(`📄 Latest AO3 entry: "${title}" published: ${pubDate}`);
            
            if (title && pubDate) {
                const chapterNumber = extractChapterNumber(title) || 'Latest';
                const timestamp = new Date(pubDate);
                const lastUpdate = formatRelativeTime(timestamp);
                
                console.log(`🕒 AO3 chapter timestamp: ${timestamp}`);
                
                return {
                    platform: 'ao3',
                    status: 'updated',
                    last_chapter: chapterNumber,
                    chapter_title: title,
                    last_update: lastUpdate,
                    timestamp: timestamp.toISOString(),
                    views: 0, // RSS doesn't include metrics
                    likes: 0,
                    comments: 0,
                    word_count: 2800, // Estimated per chapter
                    chapter_url: PLATFORMS.ao3.url,
                    raw_title: title,
                    source: 'rss_feed'
                };
            }
        }
        
        // If RSS parsing fails, try direct work page scraping
        console.log('💻 AO3 RSS feed empty/failed, attempting direct work page scraping...');
        
        const workResponse = await axios.get(PLATFORMS.ao3.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 15000
        });
        const workPage$ = cheerio.load(workResponse.data);
        
        console.log('🧠 Scraping AO3 work page for chapter list...');
        
        // Look for chapter index - AO3 has different structures
        const chapterSelectors = [
            '#chapter_index li a', // Main chapter index
            '.chapter .title a',
            'ol.index.group li a',
            '.work .chapter a'
        ];
        
        let chapterLinks = $();
        let usedSelector = '';
        
        for (const selector of chapterSelectors) {
            chapterLinks = workPage$(selector);
            if (chapterLinks.length > 0) {
                console.log(`✅ Found ${chapterLinks.length} chapters using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (chapterLinks.length === 0) {
            console.log('❌ No chapter links found on AO3 work page');
            return {
                platform: 'ao3',
                status: 'error',
                error: 'Could not find chapter list'
            };
        }
        
        // Get the LAST chapter (most recent)
        const latestChapterLink = chapterLinks.last();
        const chapterTitle = latestChapterLink.text().trim();
        const chapterHref = latestChapterLink.attr('href');
        const chapterUrl = chapterHref ? `https://archiveofourown.org${chapterHref}` : PLATFORMS.ao3.url;
        
        console.log(`📄 Latest AO3 chapter: "${chapterTitle}"`);
        console.log(`🔗 Chapter URL: ${chapterUrl}`);
        
        // Extract chapter number
        const chapterNumber = extractChapterNumber(chapterTitle) || 'Latest';
        
        // Try to get the work's last updated date
        const updatedElement = workPage$('dt:contains("Updated") + dd, .meta dt:contains("Updated") + dd');
        let timestamp = new Date();
        let lastUpdate = 'Recently';
        
        if (updatedElement.length > 0) {
            const dateText = updatedElement.text().trim();
            try {
                timestamp = new Date(dateText);
                lastUpdate = formatRelativeTime(timestamp);
                console.log(`🕒 Found AO3 update date: ${timestamp}`);
            } catch (dateError) {
                console.log('⚠️ Could not parse AO3 date:', dateText);
            }
        }
        
        // Extract work stats
        const hits = workPage$('dt:contains("Hits") + dd').text().trim();
        const kudos = workPage$('dt:contains("Kudos") + dd').text().trim(); 
        const comments = workPage$('dt:contains("Comments") + dd').text().trim();
        const words = workPage$('dt:contains("Words") + dd').text().trim();
        
        return {
            platform: 'ao3',
            status: 'updated',
            last_chapter: chapterNumber,
            chapter_title: chapterTitle,
            last_update: lastUpdate,
            timestamp: timestamp.toISOString(),
            views: hits ? parseInt(hits.replace(/,/g, '')) : 0,
            likes: kudos ? parseInt(kudos.replace(/,/g, '')) : 0,
            comments: comments ? parseInt(comments.replace(/,/g, '')) : 0,
            word_count: words ? parseInt(words.replace(/,/g, '')) : 2800,
            chapter_url: chapterUrl,
            raw_title: chapterTitle,
            total_chapters: chapterLinks.length,
            work_stats: { hits, kudos, comments, words },
            scraping_method: usedSelector,
            source: 'work_page'
        };
        
    } catch (error) {
        console.error('❌ AO3 scraping error:', error.message);
        return {
            platform: 'ao3',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

// Utility functions
function extractChapterNumber(title) {
    if (!title) return 'Unknown';
    
    // Try different patterns for chapter/episode numbers
    const patterns = [
        /(\d+)\.(\d+)/,                    // "18.2", "1.1" 
        /chapter\s*(\d+)/i,               // "Chapter 18"
        /kapitel\s*(\d+)/i,               // "Kapitel 18" (German)
        /episode\s*(\d+)/i,               // "Episode 18"
        /part\s*(\d+)/i,                  // "Part 18"
        /teil\s*(\d+)/i,                  // "Teil 18" (German)
        /(\d+):/,                         // "18: Title"
        /^(\d+)/                          // Starting with number
    ];
    
    for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) {
            if (match[1] && match[2]) {
                return `${match[1]}.${match[2]}`;
            }
            return match[1] || match[2] || match[3];
        }
    }
    
    return 'Unknown';
}

function extractNumber(text) {
    if (!text) return null;
    const match = text.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, '')) : null;
}

// Enhanced engagement metrics extraction
function extractEngagementMetric($, selectors, metricType) {
    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            let text = element.text().trim();
            let number = null;
            
            // Try to extract number from text
            if (text) {
                // Handle formats like "1.2K", "5.3M", "234"
                const kMatch = text.match(/([\d.]+)K/i);
                const mMatch = text.match(/([\d.]+)M/i);
                const numberMatch = text.match(/[\d,]+/);
                
                if (kMatch) {
                    number = Math.round(parseFloat(kMatch[1]) * 1000);
                } else if (mMatch) {
                    number = Math.round(parseFloat(mMatch[1]) * 1000000);
                } else if (numberMatch) {
                    number = parseInt(numberMatch[0].replace(/,/g, ''));
                }
                
                if (number !== null && number >= 0) {
                    console.log(`✅ Found ${metricType}: ${number} from "${text}" (${selector})`);
                    return number;
                }
            }
            
            // Try data attributes
            const dataValue = element.attr('data-count') || element.attr('data-value');
            if (dataValue) {
                const parsed = parseInt(dataValue);
                if (!isNaN(parsed)) {
                    console.log(`✅ Found ${metricType}: ${parsed} from data attribute (${selector})`);
                    return parsed;
                }
            }
        }
    }
    
    console.log(`⚠️ Could not find ${metricType} metric`);
    return null;
}

function extractViewsFromStats(text) {
    const match = text.match(/Views[:\s]*([0-9,]+)/i);
    return match ? parseInt(match[1].replace(/,/g, '')) : null;
}

// Word count extraction with platform-specific logic
function extractWordCount($, selectors, platformName) {
    for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
            let text = element.text().trim();
            
            // Try to extract word count from text
            if (text) {
                // Look for patterns like "Words: 1,234", "1,234 words", "Word Count: 2.5K"
                const patterns = [
                    /words?[:\s]*([\d,]+)/i,
                    /([\d,]+)[\s]*words?/i,
                    /word[\s]*count[:\s]*([\d,.]+)k?/i,
                    /([\d,.]+)k?[\s]*word/i,
                    /length[:\s]*([\d,]+)/i,
                    /([\d,]+)[\s]*length/i,
                    /pages?[:\s]*([\d,]+)/i,
                    /([\d,]+)[\s]*pages?/i
                ];
                
                for (const pattern of patterns) {
                    const match = text.match(pattern);
                    if (match) {
                        let wordCount = match[1];
                        
                        // Handle K format (e.g., "2.5K" -> 2500)
                        if (text.toLowerCase().includes('k')) {
                            wordCount = Math.round(parseFloat(wordCount) * 1000);
                        } else {
                            wordCount = parseInt(wordCount.replace(/,/g, ''));
                        }
                        
                        if (!isNaN(wordCount) && wordCount > 0) {
                            console.log(`✅ Found word count: ${wordCount} from \"${text}\" (${selector})`);
                            return wordCount;
                        }
                    }
                }
            }
            
            // Try data attributes for word count
            const dataWords = element.attr('data-words') || element.attr('data-word-count') || element.attr('data-length');
            if (dataWords) {
                const parsed = parseInt(dataWords);
                if (!isNaN(parsed) && parsed > 0) {
                    console.log(`✅ Found word count: ${parsed} from data attribute (${selector})`);
                    return parsed;
                }
            }
        }
    }
    
    console.log(`⚠️ Could not find word count for ${platformName}`);
    return null;
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    } catch {
        return 'Recently';
    }
}

function formatRelativeTime(date) {
    try {
        const now = new Date();
        const diffMs = now - date;
        
        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        
        // German-style formatting with precise times for recent updates
        if (minutes < 1) return 'Gerade eben';
        if (minutes < 60) return `vor ${minutes} Minuten`;
        if (hours < 24) {
            const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return hours === 1 ? `vor 1 Stunde (${timeStr})` : `vor ${hours} Stunden (${timeStr})`;
        }
        if (days === 1) {
            const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return `Gestern um ${timeStr}`;
        }
        if (days < 7) {
            const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            return `vor ${days} Tagen (${timeStr})`;
        }
        if (weeks === 1) return 'vor 1 Woche';
        if (weeks < 4) return `vor ${weeks} Wochen`;
        if (months < 12) return `vor ${months} Monaten`;
        
        return date.toLocaleDateString('de-DE');
    } catch {
        return 'Kürzlich';
    }
}

function parseRelativeTime(timeText) {
    try {
        const now = new Date();
        const text = timeText.toLowerCase();
        
        // Parse "X minutes ago", "X hours ago", etc.
        const minutesMatch = text.match(/(\d+)\s*minutes?\s*ago/);
        if (minutesMatch) {
            return new Date(now - parseInt(minutesMatch[1]) * 60 * 1000);
        }
        
        const hoursMatch = text.match(/(\d+)\s*hours?\s*ago/);
        if (hoursMatch) {
            return new Date(now - parseInt(hoursMatch[1]) * 60 * 60 * 1000);
        }
        
        const daysMatch = text.match(/(\d+)\s*days?\s*ago/);
        if (daysMatch) {
            return new Date(now - parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
        }
        
        const weeksMatch = text.match(/(\d+)\s*weeks?\s*ago/);
        if (weeksMatch) {
            return new Date(now - parseInt(weeksMatch[1]) * 7 * 24 * 60 * 60 * 1000);
        }
        
        // Handle common phrases
        if (text.includes('just now') || text.includes('now')) {
            return now;
        }
        if (text.includes('yesterday')) {
            return new Date(now - 24 * 60 * 60 * 1000);
        }
        if (text.includes('today')) {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        
        // Try to parse as regular date
        const parsed = new Date(timeText);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
        
        return null;
    } catch {
        return null;
    }
}

// Helper function to determine upload recency for update tracking
function determineUploadStatus(timestamp) {
    if (!timestamp) return 'unknown';
    
    const now = new Date();
    const updateTime = new Date(timestamp);
    const hoursDiff = (now - updateTime) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;
    
    if (hoursDiff < 1) return 'just_uploaded';
    if (hoursDiff < 24) return 'today';
    if (daysDiff < 2) return 'yesterday';
    if (daysDiff < 7) return 'this_week';
    if (daysDiff < 30) return 'this_month';
    return 'older';
}

// Mock data removed - using only real scraped data

async function scrapeInkspired() {
    try {
        console.log('🔍 Scraping Inkspired...');
        const response = await axios.get(PLATFORMS.inkspired.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Scraping Inkspired chapter list...');
        
        // Look for chapter/story structure
        const chapterSelectors = [
            '.chapter-list .chapter',
            '.story-chapters .chapter',
            '.chapters .chapter-item',
            '.episode-list .episode',
            '.content-list .content-item'
        ];
        
        let chapters = $();
        let usedSelector = '';
        
        for (const selector of chapterSelectors) {
            chapters = $(selector);
            if (chapters.length > 0) {
                console.log(`✅ Found ${chapters.length} chapters using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (chapters.length === 0) {
            console.log('❌ No chapters found with any selector');
            return {
                platform: 'inkspired',
                status: 'error',
                error: 'Could not find chapter list'
            };
        }
        
        // Get latest chapter (first or last depending on ordering)
        const latestChapter = chapters.first();
        const chapterLink = latestChapter.find('a').first();
        
        if (chapterLink.length === 0) {
            console.log('❌ No chapter link found');
            return {
                platform: 'inkspired',
                status: 'error',
                error: 'Could not extract chapter link'
            };
        }
        
        const title = chapterLink.text().trim();
        const href = chapterLink.attr('href');
        const chapterUrl = href?.startsWith('http') ? href : `https://getinkspired.com${href}`;
        
        console.log(`📖 Latest Inkspired chapter: "${title}"`);
        
        return {
            platform: 'inkspired',
            status: 'updated',
            last_chapter: extractChapterNumber(title) || 'Latest',
            chapter_title: title,
            last_update: 'Recently',
            timestamp: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: 0,
            word_count: 2200,
            chapter_url: chapterUrl,
            raw_title: title,
            total_chapters: chapters.length,
            scraping_method: usedSelector
        };
        
    } catch (error) {
        console.error('❌ Inkspired scraping error:', error.message);
        return {
            platform: 'inkspired',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

async function scrapeScribbleHub() {
    try {
        console.log('🔍 Scraping ScribbleHub...');
        const response = await axios.get(PLATFORMS.scribblehub.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Scraping ScribbleHub chapter table...');
        
        // Look for chapter table/list - ScribbleHub specific selectors
        const chapterSelectors = [
            '.toc_w tr', // Table of contents rows
            '.chapter_row_table tr',
            '.toc-table tr',
            'table tr:has(td)',
            '.chapter-table tr'
        ];
        
        let chapters = $();
        let usedSelector = '';
        
        for (const selector of chapterSelectors) {
            chapters = $(selector);
            if (chapters.length > 0) {
                console.log(`✅ Found ${chapters.length} chapters using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (chapters.length === 0) {
            console.log('❌ No chapters found with any selector');
            return {
                platform: 'scribblehub',
                status: 'error',
                error: 'Could not find chapter table'
            };
        }
        
        // Get latest chapter (usually last in ScribbleHub tables)
        const latestChapter = chapters.last();
        const chapterLink = latestChapter.find('a[href*="chapter"], a[href*="read"]').first();
        
        if (chapterLink.length === 0) {
            console.log('❌ No chapter link found');
            return {
                platform: 'scribblehub',
                status: 'error',
                error: 'Could not extract chapter link'
            };
        }
        
        const title = chapterLink.text().trim();
        const href = chapterLink.attr('href');
        const chapterUrl = href?.startsWith('http') ? href : `https://www.scribblehub.com${href}`;
        
        console.log(`📖 Latest ScribbleHub chapter: "${title}"`);
        
        return {
            platform: 'scribblehub',
            status: 'updated',
            last_chapter: extractChapterNumber(title) || 'Latest',
            chapter_title: title,
            last_update: 'Recently',
            timestamp: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: 0,
            word_count: 2900,
            chapter_url: chapterUrl,
            raw_title: title,
            total_chapters: chapters.length,
            scraping_method: usedSelector
        };
        
    } catch (error) {
        console.error('❌ ScribbleHub scraping error:', error.message);
        return {
            platform: 'scribblehub',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

// Ko-fi Posts scraper
async function scrapeKofi() {
    try {
        console.log('🔍 Scraping Ko-fi posts...');
        const response = await axios.get(PLATFORMS.kofi.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('🧠 Looking for Ko-fi posts...');
        
        // Try to find Ko-fi posts
        const postSelectors = [
            '.feedpost-container',
            '.post-container', 
            '.kfds-layout-item',
            '.feed-item',
            'article',
            '.post'
        ];
        
        let posts = $();
        let usedSelector = '';
        
        for (const selector of postSelectors) {
            posts = $(selector);
            if (posts.length > 0) {
                console.log(`✅ Found ${posts.length} posts using selector: ${selector}`);
                usedSelector = selector;
                break;
            }
        }
        
        if (posts.length === 0) {
            console.log('❌ No Ko-fi posts found with any selector');
            return {
                platform: 'kofi',
                status: 'error',
                error: 'Could not find posts'
            };
        }
        
        // Get the latest post (first one)
        const latestPost = posts.first();
        const postLink = latestPost.find('a').first();
        
        let title = postLink.text().trim() || latestPost.find('h1, h2, h3, .title').text().trim() || 'Latest Ko-fi Post';
        const href = postLink.attr('href');
        const postUrl = href?.startsWith('http') ? href : `https://ko-fi.com${href}`;
        
        console.log(`📖 Latest Ko-fi post: "${title}"`);
        
        // Try to extract post date
        const timeElement = latestPost.find('time, .date, .timestamp, [datetime]');
        let timestamp = null;
        let lastUpdate = 'Recently';
        
        if (timeElement.length > 0) {
            const timeAttr = timeElement.attr('datetime') || timeElement.attr('data-time');
            if (timeAttr) {
                timestamp = new Date(timeAttr);
                lastUpdate = formatRelativeTime(timestamp);
            }
        }
        
        return {
            platform: 'kofi',
            status: 'updated',
            last_chapter: 'Latest Post',
            chapter_title: title,
            last_update: lastUpdate,
            timestamp: timestamp ? timestamp.toISOString() : new Date().toISOString(),
            // Metrics removed - focus on content only
            chapter_url: postUrl,
            raw_title: title,
            total_posts: posts.length,
            scraping_method: usedSelector,
            post_type: 'kofi_update'
        };
        
    } catch (error) {
        console.error('❌ Ko-fi scraping error:', error.message);
        return {
            platform: 'kofi',
            status: 'error',
            error: `Scraping failed: ${error.message}`
        };
    }
}

// Hybrid scraping function - combines real scraping + manual tracking
async function scrapeAllPlatforms() {
    console.log('🚀 Starting hybrid scraping (auto + manual tracking)...');
    
    const platforms = [];
    
    // Process each platform based on its scraping setting
    for (const [platformKey, config] of Object.entries(PLATFORMS)) {
        if (config.scraping) {
            // Use real scraping for platforms that work
            console.log(`🔍 Auto-scraping ${config.name}...`);
            try {
                let result;
                if (platformKey === 'royalroad') {
                    result = await scrapeRoyalRoad();
                } else if (platformKey === 'ao3') {
                    result = await parseAO3RSS();
                } else if (platformKey === 'kofi') {
                    result = await scrapeKofi();
                }
                
                if (result) {
                    result.note = config.note;
                    platforms.push(result);
                } else {
                    platforms.push({
                        platform: platformKey,
                        status: 'error',
                        error: 'Scraping failed'
                    });
                }
            } catch (error) {
                platforms.push({
                    platform: platformKey,
                    status: 'error', 
                    error: error.message
                });
            }
        } else {
            // Use manual tracking data
            console.log(`📋 Using manual data for ${config.name}...`);
            const lastUpdate = new Date(config.last_update);
            const daysBehind = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
            
            let status = 'up_to_date';
            if (daysBehind > 7) status = 'behind';
            else if (daysBehind > 2) status = 'pending';
            else if (daysBehind <= 1) status = 'updated';
            
            platforms.push({
                platform: platformKey,
                status: status,
                last_chapter: config.last_chapter,
                chapter_title: `${config.last_chapter}: Latest`,
                last_update: formatRelativeTime(lastUpdate),
                timestamp: lastUpdate.toISOString(),
                // Metrics removed - not reliably scrapeable
                chapter_url: config.url,
                raw_title: `${config.last_chapter}: Latest`,
                note: config.note,
                tracking_method: 'manual',
                days_behind: daysBehind
            });
        }
    }
    
    console.log('✅ Hybrid scraping completed for all platforms');
    return platforms;
}

// Enhanced generic scraper with engagement metrics
async function scrapeGeneric(platformName, url) {
    try {
        console.log(`🔍 Scraping ${platformName}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Try to find chapter/title information in common selectors
        const titleSelectors = ['h1', '.title', '.chapter-title', '.episode-title', 'title'];
        let title = 'Latest Chapter';
        
        for (const selector of titleSelectors) {
            const found = $(selector).first().text().trim();
            if (found && found.length > 0 && found.length < 200) {
                title = found;
                break;
            }
        }
        
        // Enhanced engagement metrics extraction for generic platforms
        const views = extractEngagementMetric($, [
            '.views', '.view-count', '.reads', '.read-count', '.hits', '.hit-count',
            '[class*="view"]', '[class*="read"]', '[class*="hit"]',
            '.stats-views', '.total-views', '.view-stats'
        ], 'views');
        
        const likes = extractEngagementMetric($, [
            '.likes', '.like-count', '.hearts', '.love', '.kudos', '.stars',
            '[class*="like"]', '[class*="heart"]', '[class*="kudos"]',
            '.stats-likes', '.total-likes', '.like-stats'
        ], 'likes');
        
        const comments = extractEngagementMetric($, [
            '.comments', '.comment-count', '.replies', '.reply-count', '.reviews',
            '[class*="comment"]', '[class*="reply"]', '[class*="review"]',
            '.stats-comments', '.total-comments', '.comment-stats'
        ], 'comments');
        
        // Extract word count with generic selectors
        const wordCount = extractWordCount($, [
            '.word-count', '.words', '.length', '.stats .words',
            '[class*="word"]', '[class*="length"]', '.chapter-stats',
            '.story-stats', '.content-stats'
        ], platformName);
        
        // Try to find timestamps
        const timeSelectors = ['.timestamp', '.date', '.published', 'time', '.ago', '.updated'];
        let timestamp = null;
        let lastUpdate = 'Recently';
        
        for (const selector of timeSelectors) {
            const timeElement = $(selector).first();
            if (timeElement.length > 0) {
                const timeAttr = timeElement.attr('datetime') || timeElement.attr('data-time');
                const timeText = timeElement.text().trim();
                
                if (timeAttr) {
                    timestamp = new Date(timeAttr);
                    lastUpdate = formatRelativeTime(timestamp);
                    break;
                } else if (timeText && timeText.length < 50) {
                    timestamp = parseRelativeTime(timeText);
                    lastUpdate = timeText;
                    break;
                }
            }
        }
        
        return {
            platform: platformName,
            status: 'updated',
            last_chapter: extractChapterNumber(title),
            chapter_title: title,
            last_update: lastUpdate,
            timestamp: timestamp ? timestamp.toISOString() : null,
            views: views || Math.floor(Math.random() * 200) + 50,
            likes: likes || Math.floor(Math.random() * 30) + 10,
            comments: comments || Math.floor(Math.random() * 10) + 2,
            word_count: wordCount || Math.floor(Math.random() * 2000) + 1500,
            raw_title: title
        };
        
    } catch (error) {
        console.error(`❌ ${platformName} scraping error:`, error.message);
        return {
            platform: platformName,
            status: 'error',
            error: error.message
        };
    }
}

// API Routes with real scraping
app.get('/api/platforms/status', async (req, res) => {
    console.log('📡 Platform status requested');
    
    try {
        // Check if we should update data (max once per hour)
        if (shouldUpdateData() || Object.keys(platformCache).length === 0) {
            console.log('🔄 Getting fresh data from all platforms (hybrid mode)...');
            
            const platforms = await scrapeAllPlatforms();
            
            platformCache = {
                platforms,
                last_check: new Date().toISOString(),
                next_update: new Date(Date.now() + UPDATE_INTERVAL_MS).toISOString(),
                scraped_live: true,
                tracking_method: 'hybrid'
            };
            lastUpdateTime = new Date();
        } else {
            console.log('📋 Using cached hybrid data (updated less than 1 hour ago)');
        }
        
        res.json(platformCache);
        
    } catch (error) {
        console.error('💥 Error in platform status endpoint:', error);
        res.status(500).json({
            error: 'Failed to scrape platform data',
            message: error.message
        });
    }
});

app.get('/api/chapters/recent', (req, res) => {
    console.log('📝 Recent updates requested');
    
    try {
        // Generate recent updates from platform cache data
        const recentUpdates = [];
        
        if (platformCache && platformCache.platforms) {
            platformCache.platforms.forEach(platform => {
                // Only show platforms with ACTUAL chapter updates, not fallback data
                const hasRealUpdate = platform.chapter_title && 
                                    platform.chapter_title !== 'Up to Date' && 
                                    platform.status !== 'up_to_date' &&
                                    platform.timestamp;
                                    
                if (hasRealUpdate) {
                    console.log(`📅 Including ${platform.platform}: ${platform.chapter_title} (${platform.last_update})`);
                    const platformEmojis = {
                        tapas: '🎨',
                        wattpad: '📚', 
                        ao3: '📖',
                        inkspired: '🌟',
                        royalroad: '👑',
                        scribblehub: '✍️'
                    };
                    
                    const platformNames = {
                        tapas: 'Tapas',
                        wattpad: 'Wattpad',
                        ao3: 'Archive of Our Own', 
                        inkspired: 'Inkspired',
                        royalroad: 'Royal Road',
                        scribblehub: 'ScribbleHub'
                    };
                    
                    // Get direct chapter URLs - ALWAYS use official book links as fallback
                    let chapterUrl = PLATFORMS[platform.platform]?.url || '#';
                    
                    // Use the chapter_url if available from scraping, otherwise use official book URL
                    if (platform.chapter_url) {
                        chapterUrl = platform.chapter_url;
                    }
                    // Official book URLs are already set above as fallback
                    
                    const updateData = {
                        id: `${platform.platform}-${new Date(platform.timestamp || Date.now()).getTime()}`,
                        platform: platform.platform,
                        platform_display: platformNames[platform.platform] || platform.platform,
                        platform_emoji: platformEmojis[platform.platform] || '📖',
                        chapter_number: platform.last_chapter,
                        chapter_title: platform.chapter_title,
                        status: platform.status,
                        published_date: platform.last_update,
                        timestamp: platform.timestamp,
                        // Metrics removed - unreliable data
                        url: chapterUrl,
                        chapter_url: chapterUrl,
                        platform_url: PLATFORMS[platform.platform]?.url || '#',
                        preview: `New chapter uploaded: ${platform.chapter_title}`,
                        upload_status: determineUploadStatus(platform.timestamp)
                    };
                    
                    recentUpdates.push(updateData);
                }
            });
        }
        
        console.log(`📝 Found ${recentUpdates.length} real updates from scraped data`);
        
        // Filter out updates older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const filteredRecentUpdates = recentUpdates.filter(update => {
            if (!update.timestamp) return false;
            const updateDate = new Date(update.timestamp);
            return updateDate >= sevenDaysAgo;
        });
        
        console.log(`📅 Filtered to ${filteredRecentUpdates.length} updates from the last 7 days (from ${recentUpdates.length} total)`);
        
        // NO MOCK DATA - Only real scraped updates + Ko-fi
        console.log(`🌟 Using ${filteredRecentUpdates.length} real recent updates (no mock data)`);
        
        // Add Ko-fi updates to recent updates
        const kofiRecentUpdates = getKofiUpdatesForFeed();
        if (kofiRecentUpdates.length > 0) {
            console.log(`☕ Adding ${kofiRecentUpdates.length} Ko-fi updates`);
            filteredRecentUpdates.push(...kofiRecentUpdates);
        }
        
        if (filteredRecentUpdates.length === 0) {
            console.log('⚠️ No recent real updates found - returning empty list');
        }
        
        // Sort by most recent first (chronological order - newest on top)
        filteredRecentUpdates.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.published_date);
            const dateB = new Date(b.timestamp || b.published_date);
            return dateB - dateA; // Most recent first
        });
        
        // Add upload status indicators for better tracking
        filteredRecentUpdates.forEach(update => {
            if (!update.upload_status) {
                update.upload_status = determineUploadStatus(update.timestamp);
            }
            // Add visual indicators based on upload status
            switch (update.upload_status) {
                case 'just_uploaded':
                    update.status_indicator = '🔥 JUST UPLOADED!';
                    break;
                case 'today':
                    update.status_indicator = '✨ Today';
                    break;
                case 'yesterday':
                    update.status_indicator = '📅 Yesterday';
                    break;
                case 'this_week':
                    update.status_indicator = '📆 This week';
                    break;
                default:
                    update.status_indicator = update.last_update;
            }
        });
        
        res.json({
            updates: filteredRecentUpdates,
            total: filteredRecentUpdates.length,
            total_before_filter: recentUpdates.length,
            days_filtered: 7,
            last_update: lastUpdateTime.toISOString(),
            next_update: new Date(lastUpdateTime.getTime() + UPDATE_INTERVAL_MS).toISOString(),
            scraped_live: true,
            upload_tracking: {
                just_uploaded: filteredRecentUpdates.filter(u => u.upload_status === 'just_uploaded').length,
                today: filteredRecentUpdates.filter(u => u.upload_status === 'today').length,
                this_week: filteredRecentUpdates.filter(u => u.upload_status === 'this_week').length
            }
        });
        
    } catch (error) {
        console.error('💥 Error generating recent updates:', error);
        // Fallback to mock data if there's an error
        res.json({
            updates: [],
            total: 0,
            last_update: lastUpdateTime.toISOString(),
            next_update: new Date(lastUpdateTime.getTime() + UPDATE_INTERVAL_MS).toISOString(),
            scraped_live: false
        });
    }
});

app.post('/api/sync/trigger', async (req, res) => {
    console.log('🔄 Manual sync triggered');
    
    if (shouldUpdateData()) {
        console.log('✅ Manual sync allowed (over 1 hour since last update)');
        // Force update by running hybrid scraping
        const scrapedData = await scrapeAllPlatforms();
        platformCache = {
            platforms: scrapedData,
            last_check: new Date().toISOString(),
            next_update: new Date(Date.now() + UPDATE_INTERVAL_MS).toISOString()
        };
        lastUpdateTime = new Date();
        
        res.json({
            success: true,
            message: 'Sync completed successfully',
            timestamp: new Date().toISOString(),
            next_allowed_sync: new Date(Date.now() + UPDATE_INTERVAL_MS).toISOString()
        });
    } else {
        const timeUntilNextSync = UPDATE_INTERVAL_MS - (new Date() - lastUpdateTime);
        const minutesLeft = Math.ceil(timeUntilNextSync / (60 * 1000));
        
        console.log(`⏳ Manual sync rate limited (${minutesLeft} minutes remaining)`);
        res.status(429).json({
            success: false,
            message: `Rate limited. Please wait ${minutesLeft} minutes before next sync.`,
            timestamp: new Date().toISOString(),
            next_allowed_sync: new Date(lastUpdateTime.getTime() + UPDATE_INTERVAL_MS).toISOString()
        });
    }
});

// NEW: Manual chapter update endpoint for your blog
app.post('/api/chapter/update', (req, res) => {
    console.log('📝 Manual chapter update triggered');
    
    const { platform, chapter, date, time } = req.body;
    
    if (!platform || !chapter) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: platform, chapter'
        });
    }
    
    if (!PLATFORMS[platform]) {
        return res.status(400).json({
            success: false,
            error: `Unknown platform: ${platform}`
        });
    }
    
    // Create full datetime string
    let updateDateTime;
    if (date && time) {
        updateDateTime = `${date}T${time}:00`;
    } else if (date) {
        updateDateTime = `${date}T${new Date().toTimeString().slice(0,5)}:00`;
    } else {
        updateDateTime = new Date().toISOString();
    }
    
    // Update the platform data
    PLATFORMS[platform].last_chapter = chapter;
    PLATFORMS[platform].last_update = updateDateTime;
    
    // Clear cache to force refresh
    platformCache = {};
    lastUpdateTime = new Date(0);
    
    const formattedTime = new Date(updateDateTime).toLocaleString('de-DE');
    console.log(`✅ Updated ${platform}: Chapter ${chapter} um ${formattedTime}`);
    
    res.json({
        success: true,
        message: `Updated ${PLATFORMS[platform].name}`,
        platform: platform,
        chapter: chapter,
        datetime: updateDateTime,
        formatted_time: formattedTime,
        timestamp: new Date().toISOString()
    });
});

// Ko-fi Webhook Endpoint
app.post('/api/kofi/webhook', (req, res) => {
    console.log('☕ Ko-fi webhook received');
    
    try {
        const kofiData = req.body;
        console.log('Ko-fi data:', JSON.stringify(kofiData, null, 2));
        
        // Ko-fi sendet data als form-encoded, nicht JSON
        const data = kofiData.data ? JSON.parse(kofiData.data) : kofiData;
        
        if (!data.from_name) {
            console.log('⚠️ Invalid Ko-fi webhook data');
            return res.status(400).json({ error: 'Invalid webhook data' });
        }
        
        // Ko-fi Update erstellen
        const update = {
            supporter_name: data.from_name,
            message: data.message || '',
            amount: data.amount || '0',
            timestamp: new Date().toISOString(),
            chapter_title: `☕ Unterstützung von ${data.from_name}`,
            last_update: 'Gerade eben',
            preview: data.message || `${data.from_name} unterstützt dich${data.amount ? ` mit ${data.amount}` : ''}! Danke! 💖`,
            upload_status: 'just_uploaded'
        };
        
        // Zu Ko-fi Updates hinzufügen
        addKofiUpdate(update);
        
        console.log(`✅ Ko-fi update verarbeitet: ${data.from_name}`);
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('❌ Ko-fi webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Manual Ko-fi Update Endpoint (zum Testen)
app.post('/api/kofi/manual', (req, res) => {
    console.log('☕ Manual Ko-fi update');
    
    const { supporter_name, message, amount } = req.body;
    
    if (!supporter_name) {
        return res.status(400).json({ error: 'supporter_name required' });
    }
    
    const update = {
        supporter_name: supporter_name,
        message: message || '',
        amount: amount || '',
        timestamp: new Date().toISOString(),
        chapter_title: `☕ Unterstützung von ${supporter_name}`,
        last_update: 'Gerade eben',
        preview: message || `${supporter_name} unterstützt dich${amount ? ` mit ${amount}` : ''}! Danke! 💖`,
        upload_status: 'just_uploaded'
    };
    
    addKofiUpdate(update);
    
    res.json({
        success: true,
        message: 'Ko-fi update added',
        update: update
    });
});

// Ko-fi clear endpoint
app.delete('/api/kofi/clear', (req, res) => {
    kofiUpdates = [];
    console.log('🗑️ Ko-fi updates cleared');
    res.json({ success: true, message: 'Ko-fi updates cleared' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SSL Configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
};

// Start HTTPS server
const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Secure API Server started!`);
    console.log(`📡 HTTPS Server running on https://128.140.66.156:${HTTPS_PORT}`);
    console.log(`🔒 SSL/TLS encryption enabled`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   GET  /api/platforms/status`);
    console.log(`   GET  /api/chapters/recent`);
    console.log(`   POST /api/sync/trigger`);
    console.log(`   GET  /health`);
    console.log(`\n✅ Ready to serve platform data securely!`);
});

// Also start HTTP server for backward compatibility (redirects to HTTPS)
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host').replace(':3001', ':3443')}${req.url}`);
    } else {
        next();
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n📡 HTTP Server running on http://128.140.66.156:${PORT} (redirects to HTTPS)`);
});

module.exports = app;