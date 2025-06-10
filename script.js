
// Clock
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('clock').textContent = time;
}
updateClock();
setInterval(updateClock, 1000);

// Start Menu
const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

startButton.addEventListener('click', () => {
    startMenu.classList.toggle('open');
});

// Close start menu when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
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
        activeWindow.querySelector('.window-header').classList.add('inactive');
    }

    windowElement.classList.add('active');
    windowElement.querySelector('.window-header').classList.remove('inactive');
    windowElement.style.zIndex = ++zIndex;
    activeWindow = windowElement;
    updateTaskbar();
}

function openWindow(windowId) {
    const window = document.getElementById(`window-${windowId}`);
    if (window) {
        window.style.display = 'block';
        makeWindowActive(window);

        if (!openWindows.has(windowId)) {
            openWindows.set(windowId, {
                element: window,
                title: window.querySelector('.window-title').textContent.split(' - ')[0]
            });
        }
        updateTaskbar();
    }
}

function closeWindow(windowElement) {
    windowElement.style.display = 'none';
    const windowId = windowElement.id.replace('window-', '');
    openWindows.delete(windowId);
    updateTaskbar();

    if (windowElement === activeWindow) {
        activeWindow = null;
    }
}

function minimizeWindow(windowElement) {
    windowElement.style.display = 'none';
    updateTaskbar();
}

function updateTaskbar() {
    const taskbarWindows = document.getElementById('taskbar-windows');
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

// Desktop Icons
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const windowId = icon.dataset.window;
        const sampleId = icon.dataset.sample;

        if (windowId) {
            openWindow(windowId);
        } else if (sampleId) {
            openWindow(sampleId);
        }
    });

    icon.addEventListener('click', (e) => {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
        e.stopPropagation();
    });
});

// Start menu items
document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const windowId = item.dataset.window;
        if (windowId) {
            openWindow(windowId);
            startMenu.classList.remove('open');
        }
    });
});

// Deselect icons when clicking desktop
document.getElementById('desktop').addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
});

// Window Controls
document.querySelectorAll('.window').forEach(window => {
    const header = window.querySelector('.window-header');
    const closeBtn = window.querySelector('.close');
    const minimizeBtn = window.querySelector('.minimize');
    const maximizeBtn = window.querySelector('.maximize');

    // Make window active on click
    window.addEventListener('mousedown', () => {
        makeWindowActive(window);
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeWindow(window));
    }

    // Minimize button
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => minimizeWindow(window));
    }

    // Window dragging
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-button')) return;

        isDragging = true;
        dragOffsetX = e.clientX - window.offsetLeft;
        dragOffsetY = e.clientY - window.offsetTop;

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    });

    function handleDrag(e) {
        if (isDragging) {
            window.style.left = (e.clientX - dragOffsetX) + 'px';
            window.style.top = (e.clientY - dragOffsetY) + 'px';
        }
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }
});

// Dungeon Mapper Canvas
const dungeonCanvas = document.getElementById('dungeon-canvas');
if (dungeonCanvas) {
    const ctx = dungeonCanvas.getContext('2d');
    const gridSize = 20;

    // Draw grid
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

    // Simple drawing on click
    dungeonCanvas.addEventListener('click', (e) => {
        const rect = dungeonCanvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / gridSize) * gridSize;
        const y = Math.floor((e.clientY - rect.top) / gridSize) * gridSize;

        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, gridSize, gridSize);
    });
}