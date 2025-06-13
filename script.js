console.log("script.js geladen");  // DEBUG

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: starte Initialisierung");

    // Clock
    function updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const clockElem = document.getElementById('clock');
        if (clockElem) {
            clockElem.textContent = time;
        } else {
            console.warn("Element mit id 'clock' nicht gefunden");
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Start Menu
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    if (!startButton || !startMenu) {
        console.warn("Start-Button oder Start-Menu nicht gefunden");
    } else {
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
    let zIndex = 10;
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
        windowElement.style.zIndex = ++zIndex;
        activeWindow = windowElement;
        updateTaskbar();
    }

    function openWindow(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (!win) {
            console.warn(`openWindow: Kein Element mit id 'window-${windowId}'`);
            return;
        }
        win.style.display = 'block';
        makeWindowActive(win);
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
        if (!taskbarWindows) {
            console.warn("Taskbar-Fenster-Container nicht gefunden");
            return;
        }
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
                    windowInfo.element.style.display = 'block';
                    makeWindowActive(windowInfo.element);
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
    if (!desktopElem) {
        console.warn("Element mit id 'desktop' nicht gefunden");
    }

    function clearIconSelection() {
        document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
            icon.classList.remove('selected');
        });
    }

    document.querySelectorAll('.desktop-icon').forEach(icon => {
        // Single-click: auswählen
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            clearIconSelection();
            icon.classList.add('selected');
        });
        // Double-click: öffnen
        icon.addEventListener('dblclick', (e) => {
            const windowId = icon.dataset.window;
            const sampleId = icon.dataset.sample;
            if (windowId) {
                openWindow(windowId);
            } else if (sampleId) {
                openWindow(sampleId);
            } else {
                console.log("Icon hat weder data-window noch data-sample:", icon);
            }
        });
    });

    if (desktopElem) {
        desktopElem.addEventListener('click', () => {
            clearIconSelection();
        });
    }

    // Start-Menu Items
    document.querySelectorAll('.start-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const windowId = item.dataset.window;
            if (windowId) {
                openWindow(windowId);
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
    });

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
        drawGrid();
        dungeonCanvas.addEventListener('click', (e) => {
            const rect = dungeonCanvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / gridSize) * gridSize;
            const y = Math.floor((e.clientY - rect.top) / gridSize) * gridSize;
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, gridSize, gridSize);
        });
    }

    // Optional: fade-in
    function openWindowWithFade(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (!win) return;
        win.style.display = 'block';
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
});
