
// Platform tracking API integration
const API_BASE_URL = 'https://catto.at:8443/api';

// Platform tracking functions
async function fetchPlatformData() {
    try {
        const response = await fetch(`${API_BASE_URL}/platforms/status`);
        const data = await response.json();
        updatePlatformStatusCards(data.platforms);
        updateTimestamp('last-update', 'Just now');
        updateTimestamp('next-check', '1 hour');
        return data;
    } catch (error) {
        console.error('Error fetching platform data, using fallback:', error);
        // Fallback mock data if API is not reachable
        const mockData = {
            platforms: [
                {
                    platform: 'tapas',
                    status: 'behind',
                    last_chapter: '18.1',
                    chapter_title: 'Not Dying Quietly (Part 1)',
                    last_update: 'Yesterday',
                    views: 45,
                    likes: 8,
                    comments: 3,
                    note: 'Daily parts Mon-Sat'
                },
                {
                    platform: 'wattpad',
                    status: 'latest',
                    last_chapter: '18.2',
                    chapter_title: 'Not Dying Quietly (Part 2)',
                    last_update: '7 hours ago',
                    views: 494,
                    likes: 48,
                    comments: 8,
                    note: 'Daily parts Mon-Sat'
                },
                {
                    platform: 'ao3',
                    status: 'updated',
                    last_chapter: 18,
                    chapter_title: 'Not Dying Quietly (Full Chapter)',
                    last_update: 'This Monday',
                    views: 156,
                    likes: 23,
                    comments: 4,
                    note: 'Full chapters every Monday'
                },
                {
                    platform: 'inkspired',
                    status: 'updated',
                    last_chapter: 18,
                    chapter_title: 'Not Dying Quietly (Full Chapter)',
                    last_update: 'This Monday',
                    views: 89,
                    likes: 12,
                    comments: 3,
                    note: 'Full chapters every Monday'
                },
                {
                    platform: 'royalroad',
                    status: 'updated',
                    last_chapter: 18,
                    chapter_title: 'Not Dying Quietly (Full Chapter)',
                    last_update: 'This Monday',
                    views: 3776,
                    likes: 45,
                    comments: 12,
                    note: 'Full chapters every Monday'
                },
                {
                    platform: 'scribblehub',
                    status: 'updated',
                    last_chapter: 18,
                    chapter_title: 'Not Dying Quietly (Full Chapter)',
                    last_update: 'This Monday',
                    views: 134,
                    likes: 18,
                    comments: 5,
                    note: 'Full chapters every Monday'
                }
            ]
        };
        updatePlatformStatusCards(mockData.platforms);
        updateTimestamp('last-update', 'Just now (offline mode)');
        updateTimestamp('next-check', '1 hour');
        return mockData;
    }
}

async function fetchRecentUpdates() {
    try {
        const response = await fetch(`${API_BASE_URL}/chapters/recent`);
        const data = await response.json();
        updateUpdatesFeed(data.updates);
        return data;
    } catch (error) {
        console.error('Error fetching recent updates, using fallback:', error);
        // Fallback mock data if API is not reachable
        const mockUpdates = [
            {
                id: '1',
                platform: 'wattpad',
                platform_display: 'Wattpad',
                platform_emoji: '📚',
                chapter_number: '18.2',
                chapter_title: 'Not Dying Quietly (Part 2)',
                status: 'latest',
                published_date: '7 hours ago',
                word_count: 1600,
                views: 494,
                likes: 48,
                comments: 8,
                preview: 'Part 2 of Chapter 18 continues the intense battle. The warrior refuses to back down despite overwhelming odds...'
            },
            {
                id: '2',
                platform: 'tapas',
                platform_display: 'Tapas',
                platform_emoji: '🎨',
                chapter_number: '18.1',
                chapter_title: 'Not Dying Quietly (Part 1)',
                status: 'behind',
                published_date: 'Yesterday',
                word_count: 1500,
                views: 45,
                likes: 8,
                comments: 3,
                preview: 'Part 1 of Chapter 18 on Tapas. Still waiting for Part 2 to be published...'
            },
            {
                id: '3',
                platform: 'royalroad',
                platform_display: 'Royal Road',
                platform_emoji: '👑',
                chapter_number: '18',
                chapter_title: 'Not Dying Quietly (Full Chapter)',
                status: 'updated',
                published_date: 'This Monday',
                word_count: 3100,
                views: 3776,
                likes: 45,
                comments: 12,
                preview: 'The complete Chapter 18 released on Monday. An intense battle where our protagonist refuses to give in, fighting with every ounce of strength...'
            },
            {
                id: '4',
                platform: 'ao3',
                platform_display: 'Archive of Our Own',
                platform_emoji: '📖',
                chapter_number: '18',
                chapter_title: 'Not Dying Quietly (Full Chapter)',
                status: 'updated',
                published_date: 'This Monday',
                word_count: 3100,
                views: 156,
                likes: 23,
                comments: 4,
                preview: 'Chapter 18 released in full on AO3. The pivotal confrontation reaches its climax...'
            },
            {
                id: '5',
                platform: 'inkspired',
                platform_display: 'Inkspired',
                platform_emoji: '🌟',
                chapter_number: '18',
                chapter_title: 'Not Dying Quietly (Full Chapter)',
                status: 'updated',
                published_date: 'This Monday',
                word_count: 3100,
                views: 89,
                likes: 12,
                comments: 3,
                preview: 'The complete Chapter 18 on Inkspired showcases the warrior\'s determination in the face of overwhelming odds...'
            },
            {
                id: '6',
                platform: 'scribblehub',
                platform_display: 'ScribbleHub',
                platform_emoji: '✍️',
                chapter_number: '18',
                chapter_title: 'Not Dying Quietly (Full Chapter)',
                status: 'updated',
                published_date: 'This Monday',
                word_count: 3100,
                views: 134,
                likes: 18,
                comments: 5,
                preview: 'Chapter 18 complete release on ScribbleHub. The intense battle continues with no quarter given...'
            }
        ];
        updateUpdatesFeed(mockUpdates);
        return { updates: mockUpdates };
    }
}

function updatePlatformStatusCards(platforms) {
    const grid = document.getElementById('platform-status-grid');
    if (!grid || !platforms) return;
    
    const platformConfigs = {
        tapas: { emoji: '🎨', color: '#28a745', name: 'Tapas' },
        wattpad: { emoji: '📚', color: '#17a2b8', name: 'Wattpad' },
        ao3: { emoji: '📖', color: '#dc3545', name: 'AO3' },
        inkspired: { emoji: '🌟', color: '#6f42c1', name: 'Inkspired' },
        royalroad: { emoji: '👑', color: '#fd7e14', name: 'Royal Road' },
        scribblehub: { emoji: '✍️', color: '#20c997', name: 'ScribbleHub' }
    };
    
    const statusColors = {
        up_to_date: '#28a745',  // Green
        updated: '#007bff',     // Blue
        part_released: '#ffc107', // Yellow
        behind: '#dc3545',      // Red
        latest: '#28a745',
        pending: '#ffc107',
        updating: '#17a2b8',
        error: '#6c757d'
    };
    
    const statusBgColors = {
        up_to_date: '#28a745',  // Green
        updated: '#007bff',     // Blue
        part_released: '#ffc107', // Yellow
        behind: '#dc3545',      // Red
        latest: '#28a745',
        pending: '#ffc107', 
        updating: '#17a2b8',
        error: '#6c757d'
    };
    
    grid.innerHTML = '';
    
    platforms.forEach(platform => {
        const config = platformConfigs[platform.platform] || { emoji: '📖', color: '#6c757d', name: platform.platform };
        const statusColor = statusColors[platform.status] || '#6c757d';
        const statusBg = statusBgColors[platform.status] || '#6c757d';
        
        const card = document.createElement('div');
        card.style.cssText = `
            background: white; 
            border: 1px solid ${statusColor}; 
            padding: 8px; 
            border-radius: 3px; 
            text-align: center;
            transition: all 0.3s ease;
        `;
        
        const chapterInfo = platform.last_chapter !== 'Unknown' && platform.last_chapter ? 
            `Chapter ${platform.last_chapter} • ${platform.last_update}` : 
            `${platform.last_update}`;
            
        const noteText = platform.note ? `<div style="color: #6c757d; font-size: 7px; margin: 1px 0; font-style: italic;">${platform.note}</div>` : '';
        
        // Removed word count display as it was inaccurate
        const wordCountText = '';
            
        card.innerHTML = `
            <div style="color: ${statusColor}; font-weight: bold;">${config.emoji} ${config.name}</div>
            <div style="color: #6c757d; font-size: 9px; margin: 2px 0;">${chapterInfo}</div>
            ${noteText}
            <div style="background: ${statusBg}; color: white; border-radius: 2px; padding: 2px 4px; font-size: 8px; margin-top: 3px;">
                ${platform.status.toUpperCase()}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function updateUpdatesFeed(updates) {
    const feed = document.getElementById('updates-feed');
    if (!feed || !updates) return;
    
    const header = `<h3 style="color: #495057; margin-top: 0; font-size: 14px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">📝 Recent Chapter Updates</h3>`;
    
    if (updates.length === 0) {
        feed.innerHTML = header + `
            <div style="text-align: center; padding: 40px; color: #6c757d;">
                <div style="font-size: 24px; margin-bottom: 10px;">📭</div>
                <p style="margin: 0; font-size: 12px;">No recent updates found.</p>
                <p style="margin: 5px 0 0 0; font-size: 10px;">Check back later for new chapters!</p>
            </div>
        `;
        return;
    }
    
    const statusColors = {
        up_to_date: '#28a745',  // Green
        updated: '#007bff',     // Blue
        part_released: '#ffc107', // Yellow
        behind: '#dc3545',      // Red
        latest: '#28a745',
        pending: '#ffc107',
        error: '#dc3545'
    };
    
    const statusBgs = {
        up_to_date: '#f8fff8',    // Light green background
        updated: '#e7f3ff',       // Light blue background  
        part_released: '#fffdf0', // Light yellow background
        behind: '#fff5f5',        // Light red background
        latest: '#f8fff8',
        pending: '#fffdf0', 
        error: '#fff5f5'
    };
    
    let updatesHtml = header;
    
    updates.forEach(update => {
        const color = statusColors[update.status] || '#6c757d';
        const bg = statusBgs[update.status] || '#f8f9fa';
        
        // Format the published date to be more log-like
        let formattedDate = update.published_date;
        if (update.timestamp) {
            const date = new Date(update.timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffDays === 0) {
                if (diffHours === 0) {
                    formattedDate = 'Just now';
                } else {
                    formattedDate = `${diffHours}h ago`;
                }
            } else if (diffDays === 1) {
                formattedDate = '1 day ago';
            } else if (diffDays < 7) {
                formattedDate = `${diffDays} days ago`;
            } else {
                formattedDate = date.toLocaleDateString();
            }
        }
        
        updatesHtml += `
            <div style="border-left: 3px solid ${color}; padding: 8px 12px; margin: 8px 0; background: ${bg}; border-radius: 4px; transition: all 0.2s ease; cursor: pointer;" 
                 onclick="window.open('${update.url || '#'}', '_blank')" 
                 onmouseover="this.style.transform='translateX(2px)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" 
                 onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='none'">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="flex: 1;">
                        <div style="color: ${color}; font-size: 12px; font-weight: 600; margin-bottom: 2px;">
                            ${update.platform_emoji} ${update.chapter_title || `Chapter ${update.chapter_number}`}
                        </div>
                        <div style="color: #6c757d; font-size: 10px;">
                            ${update.platform_display} • ${formattedDate} • ${update.word_count} words
                        </div>
                    </div>
                    <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 8px; font-weight: 500;">
                        ${update.status.toUpperCase()}
                    </span>
                </div>
                <p style="color: #495057; font-size: 10px; margin: 6px 0 4px 0; line-height: 1.3;">
                    ${update.preview || 'New chapter available now!'}
                </p>
                <div style="font-size: 9px; color: #8e949e; display: flex; gap: 12px;">
                    <span>📊 ${update.views}</span>
                    <span>❤️ ${update.likes}</span>
                    <span>💬 ${update.comments}</span>
                    <span style="margin-left: auto; font-style: italic;">Click to read →</span>
                </div>
            </div>
        `;
    });
    
    feed.innerHTML = updatesHtml;
}

function showPlatformError() {
    const grid = document.getElementById('platform-status-grid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #dc3545;">
            <div style="font-size: 20px; margin-bottom: 10px;">⚠️</div>
            <p style="margin: 0; font-size: 12px;">Unable to fetch platform data</p>
            <p style="margin: 5px 0 0 0; font-size: 10px;">Please check if the API server is running</p>
        </div>
    `;
}

function showUpdatesError() {
    const feed = document.getElementById('updates-feed');
    if (!feed) return;
    
    feed.innerHTML = `
        <h3 style="color: #495057; margin-top: 0; font-size: 14px; border-bottom: 2px solid #e9ecef; padding-bottom: 5px;">📝 Recent Chapter Updates</h3>
        <div style="text-align: center; padding: 40px; color: #dc3545;">
            <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
            <p style="margin: 0; font-size: 12px;">Unable to load updates</p>
            <p style="margin: 5px 0 0 0; font-size: 10px;">Please check if the API server is running</p>
        </div>
    `;
}

function updateTimestamp(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

async function refreshPlatformData() {
    updateTimestamp('last-update', 'Checking...');
    
    try {
        const [platformData, updatesData] = await Promise.all([
            fetchPlatformData(),
            fetchRecentUpdates()
        ]);
        
        updateTimestamp('last-update', 'Just now');
        console.log('Platform data refreshed successfully');
        
        // Show rate limit info if available
        if (platformData && platformData.next_update) {
            const nextUpdate = new Date(platformData.next_update);
            const now = new Date();
            const hoursLeft = Math.ceil((nextUpdate - now) / (60 * 60 * 1000));
            updateTimestamp('next-check', `${hoursLeft}h remaining`);
        }
    } catch (error) {
        console.error('Error refreshing platform data:', error);
        updateTimestamp('last-update', 'Error');
    }
}

// Initialize platform tracking when news window opens
function initializePlatformTracking() {
    console.log('🚀 Initializing platform tracking...');
    console.log('📊 Loading platform status cards...');
    fetchPlatformData().then(() => {
        console.log('✅ Platform data loaded');
    }).catch(err => {
        console.error('❌ Platform data error:', err);
    });
    
    console.log('📝 Loading recent updates...');
    fetchRecentUpdates().then(() => {
        console.log('✅ Updates data loaded');
    }).catch(err => {
        console.error('❌ Updates data error:', err);
    });
    
    // Auto-refresh every hour (respecting API rate limits)
    setInterval(() => {
        console.log('⏰ Auto-refreshing platform data (hourly check)...');
        refreshPlatformData();
    }, 60 * 60 * 1000); // 1 hour
}

// Test function to manually trigger platform tracking

document.addEventListener('DOMContentLoaded', () => {
    try {
        // Clock
        function updateClock() {
            try {
                const now = new Date();
                const time = now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                const clockElem = document.getElementById('clock');
                if (clockElem) {
                    clockElem.textContent = time;
                }
            } catch (error) {
                // Fallback for clock display
            }
        }
        updateClock();
        setInterval(updateClock, 1000);

    // Start Menu
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    if (startButton && startMenu) {
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('open');
        });
    }

    // Schließe Start-Menü bei Klick außerhalb
    document.addEventListener('click', (e) => {
        if (startMenu && !startButton.contains(e.target) && !startMenu.contains(e.target)) {
            startMenu.classList.remove('open');
        }
    });

    // Window Management
    let activeWindow = null;
    let zIndex = 1000;
    const openWindows = new Map();

    function makeWindowActive(windowElement) {
        if (activeWindow) {
            activeWindow.classList.remove('active');
            const hdr = activeWindow.querySelector('.window-header');
            if (hdr) hdr.classList.add('inactive');
        }
        windowElement.classList.add('active');
        const hdrNew = windowElement.querySelector('.window-header');
        if (hdrNew) hdrNew.classList.remove('inactive');
        
        // Ensure the window appears on top by incrementing z-index
        zIndex++;
        windowElement.style.zIndex = zIndex;
        
        activeWindow = windowElement;
        updateTaskbar();
    }

    function openWindow(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (!win) return;
        
        // Store the computed position before any changes
        const rect = win.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(win);
        const originalTop = win.style.top || computedStyle.top;
        const originalLeft = win.style.left || computedStyle.left;
        
        win.style.display = 'flex';
        
        // Force exact position immediately
        win.style.top = originalTop;
        win.style.left = originalLeft;
        win.style.position = 'absolute';
        
        // Ensure new window appears on top of all others
        makeWindowActive(win);
        
        // Force position again after making active (in case z-index change affected layout)
        win.style.top = originalTop;
        win.style.left = originalLeft;
        
        // Initialize platform tracking if opening news window
        if (windowId === 'news') {
            console.log('📰 News window opened, initializing platform tracking...');
            setTimeout(() => {
                initializePlatformTracking();
            }, 100);
            // Also try immediate init in case timeout fails
            setTimeout(() => {
                const grid = document.getElementById('platform-status-grid');
                const feed = document.getElementById('updates-feed');
                if (grid && feed) {
                    console.log('🔧 Backup initialization triggered');
                    initializePlatformTracking();
                }
            }, 500);
        }
        
        if (!openWindows.has(windowId)) {
            const titleElem = win.querySelector('.window-title');
            const titleText = titleElem ? titleElem.textContent.split(' - ')[0] : windowId;
            openWindows.set(windowId, {
                element: win,
                title: titleText
            });
        }
        updateTaskbar();
    }

    function closeWindow(windowElement) {
        windowElement.style.display = 'none';
        const windowId = windowElement.id.replace(/^window-/, '');
        openWindows.delete(windowId);
        updateTaskbar();
        if (windowElement === activeWindow) activeWindow = null;
    }

    function minimizeWindow(windowElement) {
        windowElement.style.display = 'none';
        updateTaskbar();
    }

    function updateTaskbar() {
        const taskbarWindows = document.getElementById('taskbar-windows');
        if (!taskbarWindows) return;
        taskbarWindows.innerHTML = '';
        openWindows.forEach((windowInfo, windowId) => {
            const taskButton = document.createElement('button');
            taskButton.className = 'task-button';
            taskButton.textContent = windowInfo.title;
            if (windowInfo.element.style.display !== 'none' && windowInfo.element === activeWindow) {
                taskButton.classList.add('active');
            }
            taskButton.addEventListener('click', () => {
                if (windowInfo.element.style.display === 'none') {
                    // Store the computed position before any changes
                    const computedStyle = window.getComputedStyle(windowInfo.element);
                    const originalTop = windowInfo.element.style.top || computedStyle.top;
                    const originalLeft = windowInfo.element.style.left || computedStyle.left;
                    
                    windowInfo.element.style.display = 'flex';
                    
                    // Force exact position immediately
                    windowInfo.element.style.top = originalTop;
                    windowInfo.element.style.left = originalLeft;
                    windowInfo.element.style.position = 'absolute';
                    
                    makeWindowActive(windowInfo.element);
                    
                    // Force position again after making active
                    windowInfo.element.style.top = originalTop;
                    windowInfo.element.style.left = originalLeft;
                } else if (windowInfo.element === activeWindow) {
                    minimizeWindow(windowInfo.element);
                } else {
                    makeWindowActive(windowInfo.element);
                }
            });
            taskbarWindows.appendChild(taskButton);
        });
    }

    // Desktop Icons: Selektion und Doppelklick
    const desktopElem = document.getElementById('desktop');

    function clearIconSelection() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    document.querySelectorAll('.desktop-icon').forEach(icon => {
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let startPos = { x: 0, y: 0 };

        // Make icons draggable
        icon.draggable = true;
        icon.style.cursor = 'move';

        // Single-click: auswählen
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            clearIconSelection();
            icon.classList.add('selected');
        });

        // Double-click: öffnen / Link folgen
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            // Prüfe zuerst, ob ein data-url-Attribut existiert:
            const url = icon.dataset.url;
            if (url) {
                // Öffne in neuem Tab/Fenster
                window.open(url, '_blank');
                return;
            }
            // Falls kein data-url, wie bisher data-window / data-sample behandeln:
            const windowId = icon.dataset.window;
            const sampleId = icon.dataset.sample;
            if (windowId) {
                openWindow(windowId);
            } else if (sampleId) {
                openWindow(sampleId);
            }
        });

        // Drag start
        icon.addEventListener('dragstart', (e) => {
            isDragging = true;
            const rect = icon.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            startPos.x = rect.left;
            startPos.y = rect.top;
            
            // Make icon slightly transparent while dragging
            icon.style.opacity = '0.7';
            e.dataTransfer.effectAllowed = 'move';
        });

        // Drag end
        icon.addEventListener('dragend', (e) => {
            isDragging = false;
            icon.style.opacity = '1';
            
            // Calculate new position
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            
            // Make sure icon stays within screen bounds
            const maxX = window.innerWidth - icon.offsetWidth;
            const maxY = window.innerHeight - icon.offsetHeight - 50; // Leave space for taskbar
            
            const finalX = Math.max(0, Math.min(newX, maxX));
            const finalY = Math.max(0, Math.min(newY, maxY));
            
            // Update icon position
            icon.style.position = 'fixed';
            icon.style.left = finalX + 'px';
            icon.style.top = finalY + 'px';
            icon.style.right = 'auto';
            icon.style.bottom = 'auto';
        });
    });


    if (desktopElem) {
        desktopElem.addEventListener('click', () => {
            clearIconSelection();
        });

        // Allow dropping on desktop
        desktopElem.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        desktopElem.addEventListener('drop', (e) => {
            e.preventDefault();
            // Drop handling is done in dragend event of icons
        });
    }

    // Start-Menu Items
    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.dataset.window;
            const action = item.dataset.action;
            
            if (windowId) {
                openWindow(windowId);
                if (startMenu) startMenu.classList.remove('open');
            } else if (action === 'shutdown') {
                // "Shutdown" öffnet das 90er Fotoprogramm mit 404.jpg
                openWindow('photoshop');
                if (startMenu) startMenu.classList.remove('open');
            } else if (action === 'platform-submenu') {
                // Zeige alle Buchplattformen in einem kleinen Fenster
                showPlatformSubmenu();
                if (startMenu) startMenu.classList.remove('open');
            }
        });
    });

    // Fenster-Steuerung: close, minimize, maximize, drag
    document.querySelectorAll('.window').forEach(windowEl => {
        const header = windowEl.querySelector('.window-header');
        const closeBtn = windowEl.querySelector('.close');
        const minimizeBtn = windowEl.querySelector('.minimize');
        const maximizeBtn = windowEl.querySelector('.maximize');

        // Aktiv bei Mousedown
        windowEl.addEventListener('mousedown', () => {
            makeWindowActive(windowEl);
        });
        // Close
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeWindow(windowEl);
            });
        }
        // Minimize
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                minimizeWindow(windowEl);
            });
        }
        // Maximize / Restore
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isMax = windowEl.dataset.maximized === 'true';
                if (!isMax) {
                    // vorherige Position/Größe speichern
                    const prevLeft = windowEl.style.left || windowEl.offsetLeft + 'px';
                    const prevTop = windowEl.style.top || windowEl.offsetTop + 'px';
                    const prevWidth = windowEl.style.width || windowEl.offsetWidth + 'px';
                    const prevHeight = windowEl.style.height || windowEl.offsetHeight + 'px';
                    windowEl.dataset.prevLeft = prevLeft;
                    windowEl.dataset.prevTop = prevTop;
                    windowEl.dataset.prevWidth = prevWidth;
                    windowEl.dataset.prevHeight = prevHeight;
                    // Vollbild (innerhalb Desktop)
                    if (desktopElem) {
                        const desktopRect = desktopElem.getBoundingClientRect();
                        windowEl.style.left = '0px';
                        windowEl.style.top = '0px';
                        windowEl.style.width = desktopRect.width + 'px';
                        windowEl.style.height = desktopRect.height + 'px';
                    }
                    windowEl.dataset.maximized = 'true';
                    maximizeBtn.title = 'Restore Down';
                } else {
                    // Restore
                    if (windowEl.dataset.prevLeft) windowEl.style.left = windowEl.dataset.prevLeft;
                    if (windowEl.dataset.prevTop) windowEl.style.top = windowEl.dataset.prevTop;
                    if (windowEl.dataset.prevWidth) windowEl.style.width = windowEl.dataset.prevWidth;
                    if (windowEl.dataset.prevHeight) windowEl.style.height = windowEl.dataset.prevHeight;
                    windowEl.dataset.maximized = 'false';
                    maximizeBtn.title = 'Maximize';
                }
                makeWindowActive(windowEl);
            });
        }
        // Dragging
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;
        if (header) {
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('window-button')) return;
                isDragging = true;
                dragOffsetX = e.clientX - windowEl.offsetLeft;
                dragOffsetY = e.clientY - windowEl.offsetTop;
                document.addEventListener('mousemove', handleDrag);
                document.addEventListener('mouseup', stopDrag);
            });
        }
        function handleDrag(e) {
            if (isDragging) {
                windowEl.style.left = (e.clientX - dragOffsetX) + 'px';
                windowEl.style.top = (e.clientY - dragOffsetY) + 'px';
            }
        }
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        }

        // Add resize handles to the window
        addResizeHandles(windowEl);
    });

    // Function to add resize handles to a window
    function addResizeHandles(windowEl) {
        // Create resize handles
        const handles = [
            { class: 'resize-handle-n', direction: 'n' },
            { class: 'resize-handle-s', direction: 's' },
            { class: 'resize-handle-e', direction: 'e' },
            { class: 'resize-handle-w', direction: 'w' },
            { class: 'resize-handle-ne', direction: 'ne' },
            { class: 'resize-handle-nw', direction: 'nw' },
            { class: 'resize-handle-se', direction: 'se' },
            { class: 'resize-handle-sw', direction: 'sw' }
        ];

        handles.forEach(handleInfo => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${handleInfo.class}`;
            handle.dataset.direction = handleInfo.direction;
            windowEl.appendChild(handle);

            // Add resize functionality
            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(document.defaultView.getComputedStyle(windowEl).width, 10);
                startHeight = parseInt(document.defaultView.getComputedStyle(windowEl).height, 10);
                startLeft = windowEl.offsetLeft;
                startTop = windowEl.offsetTop;
                
                windowEl.classList.add('resizing');
                makeWindowActive(windowEl);
                
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
            });

            function handleResize(e) {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const direction = handle.dataset.direction;

                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;

                // Minimum dimensions
                const minWidth = 200;
                const minHeight = 150;

                // Handle different resize directions
                if (direction.includes('e')) {
                    newWidth = Math.max(minWidth, startWidth + deltaX);
                }
                if (direction.includes('w')) {
                    const proposedWidth = startWidth - deltaX;
                    if (proposedWidth >= minWidth) {
                        newWidth = proposedWidth;
                        newLeft = startLeft + deltaX;
                    }
                }
                if (direction.includes('s')) {
                    newHeight = Math.max(minHeight, startHeight + deltaY);
                }
                if (direction.includes('n')) {
                    const proposedHeight = startHeight - deltaY;
                    if (proposedHeight >= minHeight) {
                        newHeight = proposedHeight;
                        newTop = startTop + deltaY;
                    }
                }

                // Apply the new dimensions and position
                windowEl.style.width = newWidth + 'px';
                windowEl.style.height = newHeight + 'px';
                windowEl.style.left = newLeft + 'px';
                windowEl.style.top = newTop + 'px';
            }

            function stopResize() {
                isResizing = false;
                windowEl.classList.remove('resizing');
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
            }
        });
    }

    // Context-Menu: Desktop und Icons
    function removeCustomContextMenu() {
        const existing = document.getElementById('custom-context-menu');
        if (existing) existing.remove();
    }
    function showContextMenu(x, y, items) {
        removeCustomContextMenu();
        const menu = document.createElement('div');
        menu.id = 'custom-context-menu';
        menu.style.position = 'absolute';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.backgroundColor = '#c0c0c0';
        menu.style.border = '2px solid #000080';
        menu.style.fontFamily = '"MS Sans Serif", sans-serif';
        menu.style.fontSize = '11px';
        menu.style.zIndex = 2000;
        items.forEach(item => {
            const entry = document.createElement('div');
            entry.textContent = item.label;
            entry.style.padding = '2px 20px 2px 10px';
            entry.style.cursor = 'default';
            entry.addEventListener('mouseover', () => {
                entry.style.backgroundColor = '#000080';
                entry.style.color = 'white';
            });
            entry.addEventListener('mouseout', () => {
                entry.style.backgroundColor = '';
                entry.style.color = '';
            });
            entry.addEventListener('click', () => {
                item.action();
                removeCustomContextMenu();
            });
            menu.appendChild(entry);
        });
        document.body.appendChild(menu);
    }
    if (desktopElem) {
        desktopElem.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            clearIconSelection();
            removeCustomContextMenu();
            const x = e.clientX, y = e.clientY;
            const items = [
                {
                    label: 'Refresh',
                    action: () => { location.reload(); }
                },
                {
                    label: 'New Folder',
                    action: () => { alert('New Folder: nicht implementiert'); }
                },
                {
                    label: 'Properties',
                    action: () => { alert('Desktop Properties: nicht implementiert'); }
                }
            ];
            showContextMenu(x, y, items);
        });
    }
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            clearIconSelection();
            icon.classList.add('selected');
            const x = e.clientX, y = e.clientY;
            const itemNameElem = icon.querySelector('span');
            const itemName = itemNameElem ? itemNameElem.textContent : 'Item';
            const items = [
                {
                    label: 'Open',
                    action: () => {
                        const windowId = icon.dataset.window;
                        const sampleId = icon.dataset.sample;
                        if (windowId) {
                            openWindow(windowId);
                        } else if (sampleId) {
                            openWindow(sampleId);
                        } else {
                            const link = icon.querySelector('a');
                            if (link && link.href) {
                                window.open(link.href, '_blank');
                            }
                        }
                    }
                },
                {
                    label: 'Properties',
                    action: () => {
                        alert(`Properties für "${itemName}"\nTyp: Simulationseintrag`);
                    }
                },
                {
                    label: 'Delete',
                    action: () => {
                        if (confirm(`"${itemName}" löschen?`)) {
                            icon.remove();
                        }
                    }
                }
            ];
            showContextMenu(x, y, items);
        });
    });
    document.addEventListener('click', () => {
        removeCustomContextMenu();
    });

    // Dungeon Mapper Canvas logic
    const dungeonCanvas = document.getElementById('dungeon-canvas');
    if (dungeonCanvas) {
        const ctx = dungeonCanvas.getContext('2d');
        const gridSize = 20;
        let currentTool = 'wall';
        let isDrawing = false;
        const mapData = {}; // Store placed tiles
        
        // Tool definitions
        const tools = {
            wall: { color: '#333', symbol: '█', cursor: 'crosshair' },
            floor: { color: '#e8dcc0', symbol: '·', cursor: 'crosshair' },
            door: { color: '#8B4513', symbol: '▢', cursor: 'crosshair' },
            trap: { color: '#ff0000', symbol: '⚠', cursor: 'crosshair' },
            monster: { color: '#ff4444', symbol: '👹', cursor: 'crosshair' },
            treasure: { color: '#ffd700', symbol: '💎', cursor: 'crosshair' },
            erase: { color: '#f0f0f0', symbol: '', cursor: 'not-allowed' }
        };
        
        function drawGrid() {
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 0.5;
            for (let x = 0; x <= dungeonCanvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, dungeonCanvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= dungeonCanvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(dungeonCanvas.width, y);
                ctx.stroke();
            }
        }
        
        function drawTile(x, y, tool) {
            const toolData = tools[tool];
            ctx.fillStyle = toolData.color;
            ctx.fillRect(x, y, gridSize, gridSize);
            
            // Add symbols for special tiles
            if (toolData.symbol && tool !== 'wall' && tool !== 'floor' && tool !== 'erase') {
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(toolData.symbol, x + gridSize/2, y + gridSize/2 + 4);
            }
        }
        
        function redrawCanvas() {
            // Clear and redraw grid
            ctx.clearRect(0, 0, dungeonCanvas.width, dungeonCanvas.height);
            drawGrid();
            
            // Redraw all placed tiles
            for (const key in mapData) {
                const [x, y] = key.split(',').map(Number);
                drawTile(x, y, mapData[key]);
            }
        }
        
        function getGridPosition(e) {
            const rect = dungeonCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / gridSize) * gridSize;
            const y = Math.floor((e.clientY - rect.top) / gridSize) * gridSize;
            return { x, y };
        }
        
        function placeTile(x, y) {
            const key = `${x},${y}`;
            if (currentTool === 'erase') {
                delete mapData[key];
            } else {
                mapData[key] = currentTool;
            }
            redrawCanvas();
        }
        
        // Tool selection
        document.querySelectorAll('.dungeon-tool').forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tools
                document.querySelectorAll('.dungeon-tool').forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked tool
                button.classList.add('active');
                
                currentTool = button.dataset.tool;
                dungeonCanvas.style.cursor = tools[currentTool].cursor;
                
                // Update tool indicator
                const toolIndicator = document.getElementById('current-tool');
                if (toolIndicator) {
                    toolIndicator.textContent = button.textContent;
                }
            });
        });
        
        // Set initial active tool
        document.querySelector('[data-tool="wall"]').classList.add('active');
        
        // Canvas drawing events
        dungeonCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const { x, y } = getGridPosition(e);
            placeTile(x, y);
        });
        
        dungeonCanvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                const { x, y } = getGridPosition(e);
                placeTile(x, y);
            }
        });
        
        dungeonCanvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });
        
        dungeonCanvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });
        
        // Map control buttons
        const newMapBtn = document.getElementById('new-map');
        if (newMapBtn) {
            newMapBtn.addEventListener('click', () => {
                if (confirm('Clear the entire map? This cannot be undone.')) {
                    Object.keys(mapData).forEach(key => delete mapData[key]);
                    redrawCanvas();
                }
            });
        }
        
        const saveMapBtn = document.getElementById('save-map');
        if (saveMapBtn) {
            saveMapBtn.addEventListener('click', () => {
                const mapJson = JSON.stringify(mapData, null, 2);
                const blob = new Blob([mapJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dungeon-map.json';
                a.click();
                URL.revokeObjectURL(url);
                alert('Map saved as dungeon-map.json!');
            });
        }
        
        const exportMapBtn = document.getElementById('export-map');
        if (exportMapBtn) {
            exportMapBtn.addEventListener('click', () => {
                // Create a clean version for export
                const canvas = document.createElement('canvas');
                canvas.width = dungeonCanvas.width;
                canvas.height = dungeonCanvas.height;
                const exportCtx = canvas.getContext('2d');
                
                // White background
                exportCtx.fillStyle = '#ffffff';
                exportCtx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw map without grid
                for (const key in mapData) {
                    const [x, y] = key.split(',').map(Number);
                    const tool = mapData[key];
                    const toolData = tools[tool];
                    exportCtx.fillStyle = toolData.color;
                    exportCtx.fillRect(x, y, gridSize, gridSize);
                    
                    if (toolData.symbol && tool !== 'wall' && tool !== 'floor') {
                        exportCtx.fillStyle = '#000';
                        exportCtx.font = '12px Arial';
                        exportCtx.textAlign = 'center';
                        exportCtx.fillText(toolData.symbol, x + gridSize/2, y + gridSize/2 + 4);
                    }
                }
                
                // Download the image
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dungeon-map.png';
                    a.click();
                    URL.revokeObjectURL(url);
                    alert('Map exported as dungeon-map.png!');
                });
            });
        }
        
        // Initial draw
        drawGrid();
    }

    // Reading platform functionality
    const platformUrls = {
        unyielding: {
            tapas: 'https://tapas.io/series/unyielding_/info',
            wattpad: 'https://www.wattpad.com/myworks/390996157-unyielding',
            ao3: 'https://archiveofourown.org/works/64068811/chapters/164375182',
            getinkspired: 'https://getinkspired.com/en/story/558599/unyielding/',
            royalroad: 'https://www.royalroad.com/fiction/110754/unyielding',
            scribblehub: 'https://www.scribblehub.com/series/1514528/unyielding/'
        },
        echoes: {
            getinkspired: 'https://getinkspired.com/en/story/echoes-of-the-abyss',
            wattpad: 'https://www.wattpad.com/story/echoes-of-the-abyss',
            ao3: 'https://archiveofourown.org/works/echoes-of-the-abyss'
        }
    };

    // Handle platform button clicks
    document.querySelectorAll('.platform-btn').forEach(button => {
        button.addEventListener('click', () => {
            const story = button.dataset.story;
            const platform = button.dataset.platform;
            
            if (platform === 'local') {
                // Show local sample text
                const textDiv = document.getElementById(`${story}-text`);
                if (textDiv) {
                    textDiv.style.display = textDiv.style.display === 'none' ? 'block' : 'none';
                }
                return;
            }
            
            const url = platformUrls[story]?.[platform];
            if (url) {
                // Update address bar
                const urlInput = document.getElementById(`${story}-url`);
                if (urlInput) {
                    urlInput.value = url;
                }
                
                // Show loading state
                const contentDiv = document.getElementById(`${story}-content`);
                if (contentDiv) {
                    contentDiv.innerHTML = `
                        <div class="loading-content">
                            Loading ${platform}...<br>
                            <em>Opening ${url} in new tab</em>
                        </div>
                    `;
                    
                    // Open in new tab
                    window.open(url, '_blank');
                    
                    // Show success message after delay
                    setTimeout(() => {
                        contentDiv.innerHTML = `
                            <h2>📖 ${story === 'unyielding' ? 'UNYIELDING' : 'Echoes of the Abyss'}</h2>
                            <p>✅ <strong>Successfully opened on ${platform}!</strong></p>
                            <br>
                            <p>The story should now be loading in a new tab. If it didn't open automatically, you can click the link below:</p>
                            <br>
                            <p><a href="${url}" target="_blank">${url}</a></p>
                            <br>
                            <button class="button" onclick="location.reload()">← Back to Platform Selection</button>
                        `;
                    }, 1500);
                }
            }
        });
    });

    // Character Creator functionality
    const characterData = {
        name: '', race: 'human', class: 'fighter', level: 1,
        background: 'acolyte', alignment: 'n',
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        racialBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
    };

    // Race data with bonuses and abilities (Official Aetherial Campaign Setting)
    const raceData = {
        // MORTALS
        human: {
            bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
            abilities: ['Versatile', 'Extra Skill', 'Bonus Feat', 'Adaptive Nature'],
            speed: 30,
            description: 'Adaptable survivors in the harsh world of Aetherial'
        },
        dwarf: {
            bonuses: { con: 2, wis: 1 },
            abilities: ['Darkvision (60 ft)', 'Dwarven Resilience', 'Stonecunning', 'Dwarven Combat Training'],
            speed: 25,
            description: 'Hardy folk known for their resilience and craftsmanship'
        },
        'half-elf': {
            bonuses: { cha: 2, str: 1, dex: 1 },
            abilities: ['Darkvision (60 ft)', 'Fey Ancestry', 'Extra Skills (2)', 'Versatile'],
            speed: 30,
            description: 'Caught between two worlds, adaptable and charismatic'
        },
        halfling: {
            bonuses: { dex: 2, cha: 1 },
            abilities: ['Lucky', 'Brave', 'Halfling Nimbleness', 'Naturally Stealthy'],
            speed: 25,
            description: 'Small folk with big hearts and incredible luck'
        },
        gnome: {
            bonuses: { int: 2, con: 1 },
            abilities: ['Darkvision (60 ft)', 'Gnome Cunning', 'Tinker', 'Speak with Small Beasts'],
            speed: 25,
            description: 'Curious tinkerers with an affinity for magic and invention'
        },
        lizardfolk: {
            bonuses: { str: 2, wis: 1 },
            abilities: ['Natural Armor', 'Hold Breath', 'Hungry Jaws', 'Cunning Artisan', 'Hunter\'s Lore'],
            speed: 30,
            description: 'Reptilian humanoids with a pragmatic view of survival'
        },
        tortle: {
            bonuses: { str: 2, wis: 1 },
            abilities: ['Natural Armor', 'Shell Defense', 'Survival Instinct', 'Hold Breath'],
            speed: 30,
            description: 'Peaceful turtle-folk who carry their homes on their backs'
        },
        triton: {
            bonuses: { str: 1, con: 1, cha: 1 },
            abilities: ['Amphibious', 'Control Air and Water', 'Emissary of the Sea', 'Guardians of the Depths'],
            speed: 30,
            description: 'Aquatic guardians from the elemental plane of water'
        },

        // IMMORTALS
        aasimar: {
            bonuses: { cha: 2, wis: 1 },
            abilities: ['Darkvision (60 ft)', 'Celestial Resistance', 'Healing Hands', 'Light Bearer', 'Celestial Revelation'],
            speed: 30,
            description: 'Mortals touched by celestial power, bearing divine light'
        },
        elf: {
            bonuses: { dex: 2, int: 1 },
            abilities: ['Darkvision (60 ft)', 'Keen Senses', 'Fey Ancestry', 'Trance', 'Elf Weapon Training'],
            speed: 30,
            description: 'Graceful immortals with deep connections to magic and nature'
        },
        eladrin: {
            bonuses: { dex: 2, int: 1 },
            abilities: ['Darkvision (60 ft)', 'Fey Ancestry', 'Fey Step', 'Keen Senses', 'Trance', 'Seasonal Magic'],
            speed: 30,
            description: 'Elves of the Feywild who embody the changing seasons'
        },
        'shadar-kai': {
            bonuses: { dex: 2, con: 1 },
            abilities: ['Darkvision (60 ft)', 'Fey Ancestry', 'Necrotic Resistance', 'Blessing of the Raven Queen', 'Trance'],
            speed: 30,
            description: 'Shadow elves touched by the Shadowfell\'s dark power'
        },
        genasi: {
            bonuses: { con: 2, wis: 1 },
            abilities: ['Elemental Resistance', 'Elemental Magic', 'Unending Breath', 'Mingle with the Wind'],
            speed: 30,
            description: 'Humanoids infused with elemental power from the inner planes'
        },
        kalashtar: {
            bonuses: { wis: 2, cha: 1 },
            abilities: ['Dual Mind', 'Mental Discipline', 'Mind Link', 'Psychic Resistance', 'Telepathic'],
            speed: 30,
            description: 'Humans bonded with benevolent spirits from Dal Quor'
        },
        warforged: {
            bonuses: { con: 2, str: 1 },
            abilities: ['Constructed Resilience', 'Sentry\'s Rest', 'Integrated Protection', 'Specialized Design'],
            speed: 30,
            description: 'Living constructs created for war, now seeking purpose'
        },
        voidling: {
            bonuses: { int: 2, cha: 1 },
            abilities: ['Void Vision', 'Reality Shift', 'Abyssal Knowledge', 'Madness Resistance', 'Phase Step'],
            speed: 30,
            description: 'Beings from the void between worlds, masters of unreality ⭐'
        },
        vampire: {
            bonuses: { dex: 2, cha: 1 },
            abilities: ['Darkvision (120 ft)', 'Undead Resilience', 'Blood Drain', 'Charm', 'Mist Form'],
            speed: 30,
            description: 'Undead beings sustained by blood, cursed with eternal unlife ⭐'
        },
        werewolf: {
            bonuses: { str: 2, con: 1 },
            abilities: ['Keen Hearing and Smell', 'Shapechanger', 'Damage Immunities', 'Pack Tactics'],
            speed: 30,
            description: 'Cursed lycanthropes who transform under the moon ⭐'
        },
        centaur: {
            bonuses: { str: 2, wis: 1 },
            abilities: ['Charge', 'Hooves', 'Equine Build', 'Survivor'],
            speed: 40,
            description: 'Half-human, half-horse beings of the wild'
        },
        giant: {
            bonuses: { str: 3, con: 1 },
            abilities: ['Powerful Build', 'Stone\'s Endurance', 'Mountain Born', 'Giant Heritage'],
            speed: 30,
            description: 'Towering humanoids with the blood of ancient giants ⭐'
        },
        fae: {
            bonuses: { cha: 2, dex: 1 },
            abilities: ['Fey Magic', 'Glamer', 'Fey Step', 'Silvery Barbs', 'Misty Escape'],
            speed: 30,
            description: 'Pure fey beings from the realm of dreams and magic ⭐'
        },
        githyanki: {
            bonuses: { str: 2, int: 1 },
            abilities: ['Astral Knowledge', 'Githyanki Psionics', 'Mental Resistance', 'Martial Prodigy'],
            speed: 30,
            description: 'Fierce warriors from the Astral Plane'
        },

        // DEMONS
        tiefling: {
            bonuses: { int: 1, cha: 2 },
            abilities: ['Darkvision (60 ft)', 'Hellish Resistance', 'Infernal Legacy', 'Demonic Heritage'],
            speed: 30,
            description: 'Humanoids with infernal heritage and demonic power'
        },
        changeling: {
            bonuses: { cha: 2, dex: 1 },
            abilities: ['Shapechanger', 'Changeling Instincts', 'Divergent Persona'],
            speed: 30,
            description: 'Masters of disguise who can alter their appearance at will'
        },
        dhampir: {
            bonuses: { cha: 2, dex: 1 },
            abilities: ['Ancestral Legacy', 'Deathless Nature', 'Spider Climb', 'Vampiric Bite'],
            speed: 30,
            description: 'Half-vampires caught between life and undeath'
        },
        goblin: {
            bonuses: { dex: 2, con: 1 },
            abilities: ['Darkvision (60 ft)', 'Fury of the Small', 'Nimble Escape'],
            speed: 30,
            description: 'Small, cunning creatures driven by mischief and survival'
        },
        hobgoblin: {
            bonuses: { con: 2, int: 1 },
            abilities: ['Darkvision (60 ft)', 'Martial Training', 'Saving Face'],
            speed: 30,
            description: 'Disciplined and militaristic cousins of goblins'
        },
        kobold: {
            bonuses: { dex: 2, int: 1 },
            abilities: ['Darkvision (60 ft)', 'Grovel, Cower, and Beg', 'Pack Tactics', 'Sunlight Sensitivity'],
            speed: 30,
            description: 'Small draconic humanoids known for cunning and cowardice'
        },
        orc: {
            bonuses: { str: 2, con: 1 },
            abilities: ['Darkvision (60 ft)', 'Aggressive', 'Powerful Build', 'Relentless Endurance'],
            speed: 30,
            description: 'Savage warriors driven by strength and honor'
        },
        satyr: {
            bonuses: { cha: 2, dex: 1 },
            abilities: ['Fey', 'Ram', 'Magic Resistance', 'Mirthful Leaps', 'Reveler'],
            speed: 35,
            description: 'Hedonistic fey creatures who love music and revelry'
        },
        shifter: {
            bonuses: { dex: 1, wis: 2 },
            abilities: ['Darkvision (60 ft)', 'Keen Senses', 'Shifting', 'Mark of the Hunt'],
            speed: 30,
            description: 'Descendants of lycanthropes with bestial aspects'
        },
        succubus: {
            bonuses: { cha: 3 },
            abilities: ['Charm', 'Shapechanger', 'Telepathic Bond', 'Draining Kiss', 'Ethereal Jaunt'],
            speed: 30,
            description: 'Seductive fiends who feed on life energy and desire ⭐'
        },
        hexblood: {
            bonuses: { int: 1, wis: 1, cha: 1 },
            abilities: ['Ancestral Legacy', 'Hex Magic', 'Magic Token', 'Eerie Token'],
            speed: 30,
            description: 'Beings transformed by hag magic, caught between humanoid and fey'
        },
        firbolg: {
            bonuses: { wis: 2, str: 1 },
            abilities: ['Firbolg Magic', 'Hidden Step', 'Powerful Build', 'Speech of Beast and Leaf'],
            speed: 30,
            description: 'Giant-kin who serve as guardians of the natural world'
        },

        // TIERFOLK
        tabaxi: {
            bonuses: { dex: 2, cha: 1 },
            abilities: ['Darkvision (60 ft)', 'Feline Agility', 'Cat\'s Claws', 'Cat\'s Talents'],
            speed: 30,
            description: 'Curious cat-folk driven by wanderlust and discovery'
        },
        kenku: {
            bonuses: { dex: 2, wis: 1 },
            abilities: ['Expert Forgery', 'Kenku Training', 'Mimicry'],
            speed: 30,
            description: 'Flightless bird-folk cursed to mimic rather than create'
        },
        minotaur: {
            bonuses: { str: 2, con: 1 },
            abilities: ['Horns', 'Goring Rush', 'Hammering Horns', 'Labyrinthine Recall'],
            speed: 30,
            description: 'Bull-headed humanoids with an innate sense of direction'
        },
        gnoll: {
            bonuses: { str: 2, con: 1 },
            abilities: ['Darkvision (60 ft)', 'Bite', 'Rampage', 'Hyena Ancestry'],
            speed: 30,
            description: 'Savage hyena-like humanoids driven by hunger and pack instincts'
        },
        hadozee: {
            bonuses: { dex: 2, wis: 1 },
            abilities: ['Dexterous Feet', 'Glide', 'Hadozee Resilience'],
            speed: 30,
            description: 'Simian humanoids capable of gliding through the air'
        },
        ratfolk: {
            bonuses: { dex: 2, int: 1 },
            abilities: ['Darkvision (60 ft)', 'Keen Smell', 'Nimble', 'Scurry', 'Swarming'],
            speed: 25,
            description: 'Clever rat-like humanoids who thrive in urban environments ⭐'
        },
        kitsune: {
            bonuses: { cha: 2, wis: 1 },
            abilities: ['Darkvision (60 ft)', 'Shapechanger', 'Fox Magic', 'Keen Senses', 'Nine Lives'],
            speed: 30,
            description: 'Mystical fox-folk with powerful illusion magic ⭐'
        }
    };

    // Class data with features and hit dice (Complete D&D + Aetherial Classes)
    const classData = {
        // CORE D&D CLASSES
        barbarian: {
            hitDie: 12,
            savingThrows: ['Strength', 'Constitution'],
            skillChoices: 2,
            features: ['Rage', 'Unarmored Defense', 'Reckless Attack', 'Danger Sense'],
            description: 'Fierce warriors fueled by primal rage and incredible endurance'
        },
        bard: {
            hitDie: 8,
            savingThrows: ['Dexterity', 'Charisma'],
            skillChoices: 3,
            features: ['Spellcasting', 'Bardic Inspiration', 'Jack of All Trades', 'Song of Rest'],
            description: 'Masters of song, speech, and the magic they contain'
        },
        cleric: {
            hitDie: 8,
            savingThrows: ['Wisdom', 'Charisma'],
            skillChoices: 2,
            features: ['Divine Domain', 'Spellcasting', 'Channel Divinity', 'Divine Intervention'],
            description: 'Holy warriors serving gods in a world where divinity is tested daily'
        },
        druid: {
            hitDie: 8,
            savingThrows: ['Intelligence', 'Wisdom'],
            skillChoices: 2,
            features: ['Druidcraft', 'Spellcasting', 'Wild Shape', 'Natural Recovery'],
            description: 'Wielders of elemental forces and nature\'s power'
        },
        fighter: {
            hitDie: 10,
            savingThrows: ['Strength', 'Constitution'],
            skillChoices: 2,
            features: ['Fighting Style', 'Second Wind', 'Action Surge', 'Martial Archetype'],
            description: 'Warriors who have survived the harsh battlefields of Aetherial'
        },
        monk: {
            hitDie: 8,
            savingThrows: ['Strength', 'Dexterity'],
            skillChoices: 2,
            features: ['Unarmored Defense', 'Martial Arts', 'Ki', 'Unarmored Movement'],
            description: 'Masters of martial arts, harnessing inner power through discipline'
        },
        paladin: {
            hitDie: 10,
            savingThrows: ['Wisdom', 'Charisma'],
            skillChoices: 2,
            features: ['Divine Sense', 'Lay on Hands', 'Fighting Style', 'Spellcasting', 'Divine Smite'],
            description: 'Holy knights maintaining their oaths in a world of darkness'
        },
        ranger: {
            hitDie: 10,
            savingThrows: ['Strength', 'Dexterity'],
            skillChoices: 3,
            features: ['Favored Enemy', 'Natural Explorer', 'Fighting Style', 'Spellcasting'],
            description: 'Wilderness experts who track monsters across the corrupted lands'
        },
        rogue: {
            hitDie: 8,
            savingThrows: ['Dexterity', 'Intelligence'],
            skillChoices: 4,
            features: ['Expertise', 'Sneak Attack', 'Thieves\' Cant', 'Cunning Action'],
            description: 'Survivors who thrive in the shadows of a dangerous world'
        },
        sorcerer: {
            hitDie: 6,
            savingThrows: ['Constitution', 'Charisma'],
            skillChoices: 2,
            features: ['Spellcasting', 'Sorcerous Origin', 'Font of Magic', 'Metamagic'],
            description: 'Magic users whose power comes from within, shaped by draconic bloodlines or chaotic forces'
        },
        warlock: {
            hitDie: 8,
            savingThrows: ['Wisdom', 'Charisma'],
            skillChoices: 2,
            features: ['Otherworldly Patron', 'Pact Magic', 'Eldritch Invocations', 'Pact Boon'],
            description: 'Wielders of magic derived from bargains with extraplanar entities'
        },
        wizard: {
            hitDie: 6,
            savingThrows: ['Intelligence', 'Wisdom'],
            skillChoices: 2,
            features: ['Spellcasting', 'Arcane Recovery', 'Ritual Casting', 'Spellbook'],
            description: 'Scholars who study the corrupted magic that permeates Aetherial'
        },

        // AETHERIAL CUSTOM CLASSES
        tactician: {
            hitDie: 8,
            savingThrows: ['Intelligence', 'Wisdom'],
            skillChoices: 4,
            features: ['Battle Tactics ⭐', 'Commander\'s Presence', 'Strategic Mind', 'Rally Allies', 'Battlefield Control'],
            description: 'Master strategists who lead from the front and coordinate allies ⭐'
        },
        voidwalker: {
            hitDie: 8,
            savingThrows: ['Constitution', 'Charisma'],
            skillChoices: 2,
            features: ['Void Magic ⭐', 'Shadow Stride', 'Abyssal Patron ⭐', 'Void Sight', 'Reality Rend'],
            description: 'Dark casters who draw power from the spaces between worlds ⭐'
        },
        soulbinder: {
            hitDie: 6,
            savingThrows: ['Intelligence', 'Charisma'],
            skillChoices: 2,
            features: ['Soul Binding ⭐', 'Spirit Sight', 'Ethereal Touch ⭐', 'Soul Harvest', 'Spectral Army'],
            description: 'Necromancers who bind souls and command the forces of death ⭐'
        },
        'mana-knight': {
            hitDie: 10,
            savingThrows: ['Strength', 'Constitution'],
            skillChoices: 2,
            features: ['Mana Infusion ⭐', 'Arcane Armor', 'Spell Strike', 'Mana Shield', 'Elemental Weapon'],
            description: 'Warriors who blend martial prowess with raw magical energy ⭐'
        },
        doomkeeper: {
            hitDie: 12,
            savingThrows: ['Strength', 'Wisdom'],
            skillChoices: 2,
            features: ['Harbinger of Doom ⭐', 'Apocalypse Magic', 'Death Resistance', 'Cursed Weapon', 'Final Stand'],
            description: 'Champions of entropy who herald the end of all things ⭐'
        },
        'crystal-sage': {
            hitDie: 6,
            savingThrows: ['Intelligence', 'Wisdom'],
            skillChoices: 3,
            features: ['Crystal Magic ⭐', 'Resonance Field', 'Shatter Spell', 'Crystal Armor', 'Prismatic Burst'],
            description: 'Mystics who channel power through crystalline focuses ⭐'
        },
        'shadow-dancer': {
            hitDie: 8,
            savingThrows: ['Dexterity', 'Charisma'],
            skillChoices: 4,
            features: ['Shadow Form ⭐', 'Umbral Step', 'Darkness Mastery', 'Shadow Clone', 'Void Strike'],
            description: 'Agile fighters who move through shadows like living darkness ⭐'
        }
    };

    // Point buy costs
    const pointBuyCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

    // Utility functions
    function getModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    function updateStatModifiers() {
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
            const baseScore = parseInt(document.getElementById(stat).value) || 10;
            const racialBonus = characterData.racialBonuses[stat] || 0;
            const finalScore = baseScore + racialBonus;
            const modifier = getModifier(finalScore);
            
            document.getElementById(`${stat}-mod`).textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            document.getElementById(`${stat}-final`).textContent = finalScore;
            
            characterData.stats[stat] = baseScore;
        });
        updateCharacterDetails();
    }

    function updateRacialBonuses() {
        const race = document.getElementById('char-race').value;
        const raceInfo = raceData[race];
        
        if (raceInfo) {
            // Reset bonuses
            characterData.racialBonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
            
            // Apply racial bonuses
            Object.keys(raceInfo.bonuses).forEach(stat => {
                characterData.racialBonuses[stat] = raceInfo.bonuses[stat];
            });
            
            // Update racial abilities display
            const abilitiesDiv = document.getElementById('racial-abilities');
            abilitiesDiv.innerHTML = `
                <div style="font-style: italic; margin-bottom: 8px; color: #666;">
                    ${raceInfo.description}
                </div>
                ${raceInfo.abilities.map(ability => 
                    `<div class="ability-item">
                        <div class="ability-name">${ability}</div>
                    </div>`
                ).join('')}
            `;
        }
        
        updateStatModifiers();
    }

    function updateClassFeatures() {
        const characterClass = document.getElementById('char-class').value;
        const level = parseInt(document.getElementById('char-level').value) || 1;
        const classInfo = classData[characterClass];
        
        if (classInfo) {
            const featuresDiv = document.getElementById('class-features');
            featuresDiv.innerHTML = `
                <div style="font-style: italic; margin-bottom: 8px; color: #666;">
                    ${classInfo.description}
                </div>
                ${classInfo.features.map(feature => 
                    `<div class="ability-item">
                        <div class="ability-name">${feature}</div>
                    </div>`
                ).join('')}
            `;
            
            // Update saving throws
            const savingThrowsDiv = document.getElementById('saving-throws');
            savingThrowsDiv.innerHTML = classInfo.savingThrows.map(save => 
                `<span style="color: #000080;">${save}</span>`
            ).join(', ');
        }
        
        updateCharacterDetails();
    }

    function updateCharacterDetails() {
        const characterClass = document.getElementById('char-class').value;
        const level = parseInt(document.getElementById('char-level').value) || 1;
        const classInfo = classData[characterClass];
        const race = document.getElementById('char-race').value;
        const raceInfo = raceData[race];
        
        if (classInfo && raceInfo) {
            // Calculate HP
            const conMod = getModifier(parseInt(document.getElementById('con-final').textContent));
            const hp = classInfo.hitDie + conMod + ((level - 1) * (Math.floor(classInfo.hitDie / 2) + 1 + conMod));
            document.getElementById('hp-display').textContent = Math.max(1, hp);
            
            // Calculate AC (base 10 + Dex mod)
            const dexMod = getModifier(parseInt(document.getElementById('dex-final').textContent));
            document.getElementById('ac-display').textContent = 10 + dexMod;
            
            // Proficiency bonus
            const profBonus = Math.ceil(level / 4) + 1;
            document.getElementById('prof-bonus').textContent = `+${profBonus}`;
            
            // Speed
            document.getElementById('speed-display').textContent = `${raceInfo.speed} ft`;
        }
    }

    function calculatePointBuyRemaining() {
        let totalCost = 0;
        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
            const score = parseInt(document.getElementById(stat).value) || 10;
            totalCost += pointBuyCosts[score] || 0;
        });
        const remaining = 27 - totalCost;
        document.getElementById('points-remaining').textContent = remaining;
        return remaining;
    }

    // Event listeners for character creator
    if (document.getElementById('char-race')) {
        document.getElementById('char-race').addEventListener('change', updateRacialBonuses);
        document.getElementById('char-class').addEventListener('change', updateClassFeatures);
        document.getElementById('char-level').addEventListener('change', updateCharacterDetails);
        
        // Stat input listeners
        document.querySelectorAll('.stat-input').forEach(input => {
            input.addEventListener('input', () => {
                updateStatModifiers();
                calculatePointBuyRemaining();
            });
        });
        
        // Stat generation buttons
        document.getElementById('roll-stats').addEventListener('click', () => {
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
                // Roll 4d6, drop lowest
                const rolls = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1);
                rolls.sort((a, b) => b - a);
                const total = rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
                document.getElementById(stat).value = total;
            });
            updateStatModifiers();
            calculatePointBuyRemaining();
        });
        
        document.getElementById('standard-array').addEventListener('click', () => {
            const standardScores = [15, 14, 13, 12, 10, 8];
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach((stat, index) => {
                document.getElementById(stat).value = standardScores[index];
            });
            updateStatModifiers();
            calculatePointBuyRemaining();
        });
        
        document.getElementById('point-buy').addEventListener('click', () => {
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
                document.getElementById(stat).value = 8;
                document.getElementById(stat).min = 8;
                document.getElementById(stat).max = 15;
            });
            updateStatModifiers();
            calculatePointBuyRemaining();
        });
        
        // Character actions
        document.getElementById('randomize-all').addEventListener('click', () => {
            // Random name
            const names = ['Aeliana', 'Thoren', 'Zara', 'Kael', 'Lyra', 'Daven', 'Mira', 'Rowan'];
            document.getElementById('char-name').value = names[Math.floor(Math.random() * names.length)];
            
            // Random race and class
            const races = Object.keys(raceData);
            const classes = Object.keys(classData);
            document.getElementById('char-race').value = races[Math.floor(Math.random() * races.length)];
            document.getElementById('char-class').value = classes[Math.floor(Math.random() * classes.length)];
            
            // Random stats
            document.getElementById('roll-stats').click();
            
            updateRacialBonuses();
            updateClassFeatures();
        });
        
        document.getElementById('save-character').addEventListener('click', () => {
            const character = {
                name: document.getElementById('char-name').value,
                race: document.getElementById('char-race').value,
                class: document.getElementById('char-class').value,
                level: document.getElementById('char-level').value,
                background: document.getElementById('char-background').value,
                alignment: document.getElementById('char-alignment').value,
                stats: {},
                finalStats: {}
            };
            
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
                character.stats[stat] = document.getElementById(stat).value;
                character.finalStats[stat] = document.getElementById(`${stat}-final`).textContent;
            });
            
            const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${character.name || 'character'}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('Character saved!');
        });
        
        document.getElementById('export-character').addEventListener('click', () => {
            const character = {
                name: document.getElementById('char-name').value || 'Unnamed Character',
                race: document.getElementById('char-race').value,
                class: document.getElementById('char-class').value,
                level: parseInt(document.getElementById('char-level').value),
                stats: {
                    str: parseInt(document.getElementById('str').value),
                    dex: parseInt(document.getElementById('dex').value),
                    con: parseInt(document.getElementById('con').value),
                    int: parseInt(document.getElementById('int').value),
                    wis: parseInt(document.getElementById('wis').value),
                    cha: parseInt(document.getElementById('cha').value)
                }
            };
            
            // Create Roll20-compatible format
            const roll20Format = `!setattr --characterid {{CHAR_ID}} --name|${character.name} --race|${character.race} --class|${character.class} --level|${character.level} --strength|${character.stats.str} --dexterity|${character.stats.dex} --constitution|${character.stats.con} --intelligence|${character.stats.int} --wisdom|${character.stats.wis} --charisma|${character.stats.cha}`;
            
            // Copy to clipboard and show instructions
            navigator.clipboard.writeText(roll20Format).then(() => {
                alert(`Roll20 command copied to clipboard!\n\nTo import:\n1. Create a new character in Roll20\n2. Get the character ID from the character sheet\n3. Replace {{CHAR_ID}} in the command\n4. Paste and run the command in Roll20 chat`);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = roll20Format;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Roll20 command selected! Press Ctrl+C to copy.');
            });
        });
        
        document.getElementById('print-sheet').addEventListener('click', () => {
            const character = {
                name: document.getElementById('char-name').value || 'Unnamed Character',
                race: document.getElementById('char-race').options[document.getElementById('char-race').selectedIndex].text,
                class: document.getElementById('char-class').options[document.getElementById('char-class').selectedIndex].text,
                level: document.getElementById('char-level').value,
                hp: document.getElementById('hp-display').textContent,
                ac: document.getElementById('ac-display').textContent
            };
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html><head><title>${character.name} - Character Sheet</title>
                <style>body { font-family: Arial; padding: 20px; }</style>
                </head><body>
                <h1>${character.name}</h1>
                <p><strong>Race:</strong> ${character.race} | <strong>Class:</strong> ${character.class} | <strong>Level:</strong> ${character.level}</p>
                <p><strong>HP:</strong> ${character.hp} | <strong>AC:</strong> ${character.ac}</p>
                <h3>Ability Scores</h3>
                ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => 
                    `<p><strong>${stat.toUpperCase()}:</strong> ${document.getElementById(`${stat}-final`).textContent} (${document.getElementById(`${stat}-mod`).textContent})</p>`
                ).join('')}
                </body></html>
            `);
            printWindow.document.close();
            printWindow.print();
        });
        
        // Initialize
        updateRacialBonuses();
        updateClassFeatures();
        calculatePointBuyRemaining();
    }

    // Menu bar functionality
    function initializeMenus() {
        // Close any open menus when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-item')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Add menu functionality to all windows
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Close other open menus
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    if (menu.parentElement !== menuItem) {
                        menu.classList.remove('show');
                    }
                });

                // Toggle current menu
                let dropdown = menuItem.querySelector('.dropdown-menu');
                if (!dropdown) {
                    dropdown = createDropdownMenu(menuItem);
                }
                dropdown.classList.toggle('show');
            });
        });
    }

    function createDropdownMenu(menuItem) {
        const menuText = menuItem.textContent.trim();
        const windowEl = menuItem.closest('.window');
        const windowId = windowEl ? windowEl.id : '';
        
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';
        
        let menuItems = [];
        
        // Define menu items based on menu type and window
        switch(menuText) {
            case 'File':
                if (windowId === 'window-characters') {
                    menuItems = [
                        { text: 'New Character', action: () => newCharacter() },
                        { text: 'Load Character...', action: () => loadCharacter() },
                        { separator: true },
                        { text: 'Save Character', action: () => document.getElementById('save-character').click() },
                        { text: 'Export to Roll20', action: () => document.getElementById('export-character').click() },
                        { text: 'Print Sheet', action: () => document.getElementById('print-sheet').click() },
                        { separator: true },
                        { text: 'Close', action: () => closeWindow(windowEl) }
                    ];
                } else if (windowId === 'window-dungeonmapper') {
                    menuItems = [
                        { text: 'New Map', action: () => document.getElementById('new-map').click() },
                        { text: 'Save Map', action: () => document.getElementById('save-map').click() },
                        { text: 'Export Map', action: () => document.getElementById('export-map').click() },
                        { separator: true },
                        { text: 'Close', action: () => closeWindow(windowEl) }
                    ];
                } else {
                    menuItems = [
                        { text: 'Close', action: () => closeWindow(windowEl) }
                    ];
                }
                break;
                
            case 'Edit':
                if (windowId === 'window-characters') {
                    menuItems = [
                        { text: 'Random Character', action: () => document.getElementById('randomize-all').click() },
                        { text: 'Roll Stats', action: () => document.getElementById('roll-stats').click() },
                        { text: 'Standard Array', action: () => document.getElementById('standard-array').click() },
                        { text: 'Point Buy', action: () => document.getElementById('point-buy').click() }
                    ];
                } else {
                    menuItems = [
                        { text: 'Copy', action: () => copyToClipboard(), disabled: true },
                        { text: 'Paste', action: () => pasteFromClipboard(), disabled: true }
                    ];
                }
                break;
                
            case 'View':
                menuItems = [
                    { text: 'Refresh', action: () => location.reload() },
                    { text: 'Zoom In', action: () => zoomWindow(windowEl, 1.1), disabled: true },
                    { text: 'Zoom Out', action: () => zoomWindow(windowEl, 0.9), disabled: true }
                ];
                break;
                
            case 'Character':
                if (windowId === 'window-characters') {
                    menuItems = [
                        { text: 'Generate Random', action: () => document.getElementById('randomize-all').click() },
                        { separator: true },
                        { text: 'Ability Scores...', action: () => showAbilityScoreDialog() },
                        { text: 'Background...', action: () => focusElement('char-background') },
                        { text: 'Race...', action: () => focusElement('char-race') },
                        { text: 'Class...', action: () => focusElement('char-class') }
                    ];
                }
                break;
                
            case 'Tools':
                if (windowId === 'window-dungeonmapper') {
                    menuItems = [
                        { text: 'Wall Tool', action: () => selectTool('wall') },
                        { text: 'Floor Tool', action: () => selectTool('floor') },
                        { text: 'Door Tool', action: () => selectTool('door') },
                        { text: 'Trap Tool', action: () => selectTool('trap') },
                        { text: 'Monster Tool', action: () => selectTool('monster') },
                        { text: 'Treasure Tool', action: () => selectTool('treasure') },
                        { text: 'Erase Tool', action: () => selectTool('erase') }
                    ];
                } else {
                    menuItems = [
                        { text: 'Calculator', action: () => openCalculator(), disabled: true },
                        { text: 'Notepad', action: () => openNotepad(), disabled: true }
                    ];
                }
                break;
                
            case 'Help':
                menuItems = [
                    { text: 'About', action: () => showAbout() },
                    { text: 'User Guide', action: () => showUserGuide() },
                    { separator: true },
                    { text: 'Aetherial Wiki', action: () => window.open('https://aetherial.fandom.com/wiki/Aetherial_Wiki', '_blank') }
                ];
                break;
                
            default:
                menuItems = [
                    { text: 'Not implemented', action: () => {}, disabled: true }
                ];
        }
        
        // Build dropdown HTML
        dropdown.innerHTML = menuItems.map(item => {
            if (item.separator) {
                return '<div class="dropdown-separator"></div>';
            }
            const disabledClass = item.disabled ? ' disabled' : '';
            return `<div class="dropdown-item${disabledClass}" data-action="${menuItems.indexOf(item)}">${item.text}</div>`;
        }).join('');
        
        // Add click handlers
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const actionIndex = parseInt(e.target.dataset.action);
            if (!isNaN(actionIndex) && menuItems[actionIndex] && !menuItems[actionIndex].disabled) {
                menuItems[actionIndex].action();
                dropdown.classList.remove('show');
            }
        });
        
        menuItem.appendChild(dropdown);
        return dropdown;
    }

    // Menu action functions
    function newCharacter() {
        if (confirm('Create a new character? This will clear all current data.')) {
            // Reset form
            document.getElementById('char-name').value = '';
            document.getElementById('char-race').value = 'human';
            document.getElementById('char-class').value = 'fighter';
            document.getElementById('char-level').value = '1';
            document.getElementById('char-background').value = 'acolyte';
            document.getElementById('char-alignment').value = 'n';
            
            // Reset stats
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
                document.getElementById(stat).value = 10;
            });
            
            updateRacialBonuses();
            updateClassFeatures();
        }
    }

    function loadCharacter() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const character = JSON.parse(e.target.result);
                        
                        // Load character data
                        if (character.name) document.getElementById('char-name').value = character.name;
                        if (character.race) document.getElementById('char-race').value = character.race;
                        if (character.class) document.getElementById('char-class').value = character.class;
                        if (character.level) document.getElementById('char-level').value = character.level;
                        if (character.background) document.getElementById('char-background').value = character.background;
                        if (character.alignment) document.getElementById('char-alignment').value = character.alignment;
                        
                        // Load stats
                        if (character.stats) {
                            Object.keys(character.stats).forEach(stat => {
                                const elem = document.getElementById(stat);
                                if (elem) elem.value = character.stats[stat];
                            });
                        }
                        
                        updateRacialBonuses();
                        updateClassFeatures();
                        alert('Character loaded successfully!');
                    } catch (error) {
                        alert('Error loading character file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function selectTool(toolName) {
        const toolButton = document.querySelector(`[data-tool="${toolName}"]`);
        if (toolButton) toolButton.click();
    }

    function focusElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function showAbout() {
        alert('Aetherial Character Creator 95\n\nA comprehensive D&D character creation tool for the Aetherial campaign setting.\n\nCreated with Windows 95 nostalgia in mind.');
    }

    function showUserGuide() {
        const guide = `
Aetherial Character Creator - User Guide

CHARACTER CREATION:
• Select race from 4 categories: Mortals, Immortals, Demons, Tierfolk
• Choose from 12 core D&D classes or 7 unique Aetherial classes
• Use ability score methods: Roll 4d6, Standard Array, or Point Buy

MENU OPTIONS:
• File → Save/Load characters, Export to Roll20
• Edit → Generate random characters, modify stats
• Character → Focus on specific character aspects

TIPS:
• ⭐ marks unique Aetherial content
• Racial bonuses are applied automatically
• Character details update in real-time
        `;
        alert(guide.trim());
    }

    function showAbilityScoreDialog() {
        const method = prompt('Choose ability score method:\n1. Roll 4d6 (drop lowest)\n2. Standard Array (15,14,13,12,10,8)\n3. Point Buy (27 points)\n\nEnter 1, 2, or 3:');
        
        switch(method) {
            case '1':
                document.getElementById('roll-stats').click();
                break;
            case '2':
                document.getElementById('standard-array').click();
                break;
            case '3':
                document.getElementById('point-buy').click();
                break;
            default:
                alert('Invalid selection.');
        }
    }

    // Contact form functionality
    const sendButton = document.getElementById('send-email');
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const subject = document.getElementById('contact-subject');
            const message = document.getElementById('contact-message');
            
            if (!subject || !message) return;
            
            const subjectText = subject.value.trim();
            const messageText = message.value.trim();
            
            if (!subjectText || !messageText) {
                alert('Please fill in both subject and message fields.');
                return;
            }
            
            // Create mailto link
            const email = 'info@catto.at';
            const encodedSubject = encodeURIComponent(subjectText);
            const encodedMessage = encodeURIComponent(messageText);
            const mailtoLink = `mailto:${email}?subject=${encodedSubject}&body=${encodedMessage}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show confirmation
            setTimeout(() => {
                alert('Email client opened! If it didn\'t open automatically, please copy the email info manually.');
            }, 100);
        });
    }

    // Optional: fade-in
    function openWindowWithFade(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (!win) return;
        win.style.display = 'flex';
        win.style.opacity = '0';
        win.style.transition = 'opacity 0.2s ease-in';
        makeWindowActive(win);
        requestAnimationFrame(() => {
            win.style.opacity = '1';
        });
        setTimeout(() => {
            win.style.transition = '';
            win.style.opacity = '';
        }, 250);
    }

    // Initialize menu functionality
    initializeMenus();

    // Draft saving function
    function saveDraft() {
        const subject = document.getElementById('contact-subject')?.value || '';
        const message = document.getElementById('contact-message')?.value || '';
        
        if (!subject && !message) {
            alert('Nothing to save - both fields are empty.');
            return;
        }
        
        const draft = {
            subject: subject,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('emailDraft', JSON.stringify(draft));
        alert('Draft saved! It will be restored next time you open the mail client.');
        
        // Load draft on window open
        setTimeout(() => {
            const savedDraft = localStorage.getItem('emailDraft');
            if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                const subjectField = document.getElementById('contact-subject');
                const messageField = document.getElementById('contact-message');
                
                if (subjectField && !subjectField.value) subjectField.value = draft.subject;
                if (messageField && !messageField.value) messageField.value = draft.message;
            }
        }, 100);
    }

    // Platform Submenu Function
    function showPlatformSubmenu() {
        const platforms = [
            { name: 'Tapas', url: 'https://tapas.io/series/unyielding_', icon: 'image_file' },
            { name: 'Wattpad', url: 'https://www.wattpad.com/story/390996157-unyielding', icon: 'text_file' },
            { name: 'Royal Road', url: 'https://www.royalroad.com/fiction/110754/unyielding', icon: 'text_editor' },
            { name: 'AO3', url: 'https://archiveofourown.org/works/64068811', icon: 'text_file_2' },
            { name: 'GetInkspired', url: 'https://getinkspired.com/de/story/558599/unyielding', icon: 'notepad' },
            { name: 'ScribbleHub', url: 'https://www.scribblehub.com/series/1514528/unyielding/', icon: 'script_file' }
        ];

        // Create temporary window
        const submenuWindow = document.createElement('div');
        submenuWindow.className = 'window';
        submenuWindow.id = 'platform-submenu-window';
        submenuWindow.style.cssText = `
            top: 200px; left: 300px; width: 400px; z-index: 10001;
            display: flex; flex-direction: column; background: #c0c0c0;
            border: 2px outset #c0c0c0; box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;

        submenuWindow.innerHTML = `
            <div class="window-header">
                <span class="window-title">📚 Reading Platforms - Unyielding</span>
                <div class="window-controls">
                    <button class="window-button close">✕</button>
                </div>
            </div>
            <div class="window-content" style="padding: 15px;">
                <h3 style="margin-top: 0; text-align: center;">Choose Your Platform</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                    ${platforms.map(platform => `
                        <button class="button platform-link-btn" data-url="${platform.url}" style="padding: 10px; text-align: left; display: flex; align-items: center; gap: 8px;">
                            <img src="icons/${platform.icon}.ico" style="width: 16px; height: 16px;">
                            ${platform.name}
                        </button>
                    `).join('')}
                </div>
                <p style="text-align: center; margin-top: 15px; font-size: 10px; color: #666;">
                    Click any platform to read "Unyielding" there!
                </p>
            </div>
        `;

        document.body.appendChild(submenuWindow);
        makeWindowActive(submenuWindow);

        // Add event listeners
        submenuWindow.querySelector('.close').addEventListener('click', () => {
            submenuWindow.remove();
        });

        submenuWindow.querySelectorAll('.platform-link-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.open(btn.dataset.url, '_blank');
                submenuWindow.remove();
            });
        });
    }

    // Manuscript functions
    function saveManuscript() {
        const content = document.querySelector('#window-manuscript .window-content').innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'unyielding_manuscript.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Manuscript saved as HTML file!');
    }

    function printManuscript() {
        const printWindow = window.open('', '_blank');
        const content = document.querySelector('#window-manuscript .window-content').innerHTML;
        printWindow.document.write(`
            <html>
                <head><title>Unyielding Manuscript - K.M.T</title></head>
                <body style="font-family: Times New Roman, serif; padding: 20px;">
                    ${content}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }

    // Secret folder functionality
    let hiddenFilesVisible = false;

    // Add right-click context menu for asdfasd folder
    function initializeSecretFolder() {
        const asdfasdContent = document.getElementById('asdfasd-content');
        if (asdfasdContent) {
            asdfasdContent.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showSecretContextMenu(e.pageX, e.pageY);
            });
        }

        // Add event delegation for dynamic content
        document.body.addEventListener('dblclick', (e) => {
            console.log('Double click detected:', e.target);
            
            // Check for secret folder
            const secretFolder = e.target.closest('[data-folder="secret"]');
            if (secretFolder) {
                console.log('Secret folder clicked!');
                e.preventDefault();
                e.stopPropagation();
                openWindow('secret-doc');
                return;
            }
            
            // Check for unyielding2 document
            const unyielding2Doc = e.target.closest('[data-document="unyielding2"]');
            if (unyielding2Doc) {
                console.log('Unyielding2 document clicked!');
                e.preventDefault();
                e.stopPropagation();
                openWindow('unyielding2');
                return;
            }
        });
    }

    function showSecretContextMenu(x, y) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: #c0c0c0;
            border: 2px outset #c0c0c0;
            padding: 2px;
            z-index: 10000;
            font-size: 11px;
            min-width: 150px;
        `;

        const showHiddenOption = document.createElement('div');
        showHiddenOption.style.cssText = `
            padding: 4px 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        if (hiddenFilesVisible) {
            showHiddenOption.innerHTML = '☑️ Show hidden files';
            showHiddenOption.addEventListener('click', () => {
                hideSecretFiles();
                menu.remove();
            });
        } else {
            showHiddenOption.innerHTML = '☐ Show hidden files';
            showHiddenOption.addEventListener('click', () => {
                showSecretFiles();
                menu.remove();
            });
        }

        showHiddenOption.addEventListener('mouseenter', () => {
            showHiddenOption.style.background = '#000080';
            showHiddenOption.style.color = 'white';
        });
        showHiddenOption.addEventListener('mouseleave', () => {
            showHiddenOption.style.background = '';
            showHiddenOption.style.color = '';
        });

        menu.appendChild(showHiddenOption);
        document.body.appendChild(menu);

        // Close menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 100);
    }

    function showSecretFiles() {
        hiddenFilesVisible = true;
        document.getElementById('empty-folder-message').style.display = 'none';
        document.getElementById('hidden-files-container').style.display = 'block';
        
        // Direkt das Unyielding 2 Dokument öffnen
        setTimeout(() => {
            openWindow('unyielding2');
        }, 500);
    }

    function hideSecretFiles() {
        hiddenFilesVisible = false;
        document.getElementById('empty-folder-message').style.display = 'block';
        document.getElementById('hidden-files-container').style.display = 'none';
    }

    // Initialize secret folder
    initializeSecretFolder();

    // Make functions global for onclick handlers
    window.saveDraft = saveDraft;
    window.saveManuscript = saveManuscript;
    window.printManuscript = printManuscript;
    window.closeWindow = closeWindow;

    } catch (error) {
        // Fallback: basic functionality without advanced features
        document.getElementById('clock').textContent = new Date().toLocaleTimeString();
    }
});

// Shutdown function removed - now opens PhotoEdit Pro 95 instead
