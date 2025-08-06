// D&D Stats Dice Roller with Animations
class DiceRoller {
    constructor() {
        this.stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        this.currentStats = {};
        this.rollLog = [];
        this.isRolling = false;
        
        this.init();
    }
    
    init() {
        // Add event listeners when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.addToLog('> D&D Stats Roller initialized');
            this.addToLog('> Ready to roll some dice! 🎲');
        });
    }
    
    setupEventListeners() {
        // Roll all stats button
        const rollAllBtn = document.getElementById('roll-all-stats');
        if (rollAllBtn) {
            rollAllBtn.addEventListener('click', () => this.rollAllStats());
        }
        
        // Re-roll all button
        const rerollBtn = document.getElementById('reroll-stats');
        if (rerollBtn) {
            rerollBtn.addEventListener('click', () => this.rerollAllStats());
        }
        
        // Individual stat re-rolling (using more compatible selector)
        this.stats.forEach(stat => {
            const statBlocks = document.querySelectorAll('.stat-block');
            statBlocks.forEach(block => {
                if (block.querySelector(`#${stat}-result`)) {
                    block.addEventListener('click', () => this.rollSingleStat(stat));
                }
            });
        });
        
        // Export button
        const exportBtn = document.getElementById('export-stats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStats());
        }
        
        // Save button
        const saveBtn = document.getElementById('save-stats');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveStats());
        }
        
        // Clear log button
        const clearBtn = document.getElementById('clear-log');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearLog());
        }
    }
    
    // Roll 4d6, drop lowest
    roll4d6DropLowest() {
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        
        rolls.sort((a, b) => b - a); // Sort descending
        const droppedDie = rolls.pop(); // Remove lowest
        const total = rolls.reduce((sum, roll) => sum + roll, 0);
        
        return {
            rolls: rolls,
            dropped: droppedDie,
            total: total,
            allRolls: [...rolls, droppedDie].sort((a, b) => b - a)
        };
    }
    
    async rollSingleStat(stat) {
        if (this.isRolling) return;
        
        this.isRolling = true;
        const resultElement = document.getElementById(`${stat}-result`);
        const diceElement = document.getElementById(`${stat}-dice`);
        
        // Find the correct stat block
        let statBlock = null;
        const statBlocks = document.querySelectorAll('.stat-block');
        statBlocks.forEach(block => {
            if (block.querySelector(`#${stat}-result`)) {
                statBlock = block;
            }
        });
        
        if (!statBlock || !resultElement || !diceElement) {
            console.error(`Could not find elements for stat: ${stat}`);
            this.isRolling = false;
            return;
        }
        
        // Start animation
        statBlock.classList.add('rolling');
        
        // Simple static dice display during rolling
        diceElement.textContent = '🎲 Rolling...';
        
        // Slot machine style animation - numbers counting down with decreasing speed
        let animationFrame = 0;
        const totalFrames = 30;
        let currentDelay = 50; // Start fast
        
        const runSlotMachine = () => {
            if (animationFrame >= totalFrames) return;
            
            // Show random number between 3-18 (possible 4d6 drop lowest results)
            const randomNum = Math.floor(Math.random() * 16) + 3;
            resultElement.textContent = randomNum;
            
            animationFrame++;
            
            // Increase delay to slow down (slot machine effect)
            currentDelay += Math.floor(animationFrame * 3);
            
            setTimeout(runSlotMachine, currentDelay);
        };
        
        runSlotMachine();
        
        // Wait for animation to complete (about 1.5 seconds)
        await this.sleep(1500);
        
        // Roll the dice
        const result = this.roll4d6DropLowest();
        this.currentStats[stat] = result.total;
        
        // Show result with animation
        resultElement.textContent = result.total;
        resultElement.classList.add('new-result');
        
        // Show dice breakdown
        const diceText = `[${result.allRolls.join(', ')}] drop ${result.dropped}`;
        diceElement.textContent = diceText;
        
        // Color coding based on result
        this.colorCodeStat(resultElement, result.total);
        
        // Log the roll
        this.addToLog(`> ${stat.toUpperCase()}: Rolled ${diceText} = ${result.total}`);
        
        // Clean up animations
        setTimeout(() => {
            statBlock.classList.remove('rolling');
            resultElement.classList.remove('new-result');
        }, 1000);
        
        // Update summary
        this.updateSummary();
        this.isRolling = false;
    }
    
    async rollAllStats() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.addToLog('> === Rolling all ability scores ===');
        
        // Start all animations simultaneously
        const animationPromises = [];
        
        this.stats.forEach((stat, index) => {
            const resultElement = document.getElementById(`${stat}-result`);
            const diceElement = document.getElementById(`${stat}-dice`);
            
            // Find the correct stat block
            let statBlock = null;
            const statBlocks = document.querySelectorAll('.stat-block');
            statBlocks.forEach(block => {
                if (block.querySelector(`#${stat}-result`)) {
                    statBlock = block;
                }
            });
            
            if (!statBlock || !resultElement || !diceElement) return;
            
            // Start animation
            statBlock.classList.add('rolling');
            diceElement.textContent = '🎲 Rolling...';
            
            // Create animation that we can stop
            let animationRunning = true;
            let animationFrame = 0;
            const totalFrames = 40;
            let currentDelay = 30;
            
            const runSlotMachine = () => {
                if (!animationRunning || animationFrame >= totalFrames) {
                    return;
                }
                
                const randomNum = Math.floor(Math.random() * 16) + 3;
                resultElement.textContent = randomNum;
                
                animationFrame++;
                currentDelay += Math.floor(animationFrame * 2);
                
                setTimeout(runSlotMachine, currentDelay);
            };
            
            runSlotMachine();
            
            // Stop animation at different times (0.5s, 1s, 1.5s, 2s, 2.5s, 3s)
            const stopTime = 500 + (index * 500);
            
            setTimeout(() => {
                // Stop the animation first
                animationRunning = false;
                
                // Roll final result immediately
                const result = this.roll4d6DropLowest();
                this.currentStats[stat] = result.total;
                
                // Show final result
                resultElement.textContent = result.total;
                resultElement.classList.add('new-result');
                
                // Show dice breakdown
                const diceText = `[${result.allRolls.join(', ')}] drop ${result.dropped}`;
                diceElement.textContent = diceText;
                
                // Color coding
                this.colorCodeStat(resultElement, result.total);
                
                // Log the roll
                this.addToLog(`> ${stat.toUpperCase()}: Rolled ${diceText} = ${result.total}`);
                
                // Clean up animations immediately
                statBlock.classList.remove('rolling');
                resultElement.classList.remove('new-result');
            }, stopTime);
        });
        
        // Wait for all animations to complete (last one stops at 3s)
        await this.sleep(3200);
        
        this.updateSummary();
        this.addToLog('> === Character generation complete! ===');
        this.showCharacterSummary();
        this.isRolling = false;
    }
    
    async rerollAllStats() {
        this.addToLog('> Re-rolling all stats...');
        this.clearStats();
        await this.sleep(300);
        this.rollAllStats();
    }
    
    clearStats() {
        this.stats.forEach(stat => {
            const resultElement = document.getElementById(`${stat}-result`);
            const diceElement = document.getElementById(`${stat}-dice`);
            
            if (resultElement) resultElement.textContent = '--';
            if (diceElement) diceElement.textContent = '';
        });
        
        this.currentStats = {};
        this.updateSummary();
    }
    
    colorCodeStat(element, value) {
        // Remove existing classes
        element.classList.remove('high-stat', 'low-stat', 'exceptional-stat');
        
        // Simple color coding: green > 10, red < 10, black = 10
        if (value > 10) {
            element.style.color = '#008000'; // Green
        } else if (value < 10) {
            element.style.color = '#cc0000'; // Red  
        } else {
            element.style.color = '#000000'; // Black for 10
        }
    }
    
    updateSummary() {
        const values = Object.values(this.currentStats);
        if (values.length === 0) {
            document.getElementById('stats-total').textContent = 'Total: --';
            document.getElementById('stats-average').textContent = 'Average: --';
            document.getElementById('stats-modifier-sum').textContent = 'Modifier Total: --';
            return;
        }
        
        const total = values.reduce((sum, val) => sum + val, 0);
        const average = (total / values.length).toFixed(1);
        
        // Calculate modifier sum (stat - 10) / 2, rounded down
        const modifierSum = values.reduce((sum, stat) => {
            return sum + Math.floor((stat - 10) / 2);
        }, 0);
        
        document.getElementById('stats-total').textContent = `Total: ${total}`;
        document.getElementById('stats-average').textContent = `Average: ${average}`;
        document.getElementById('stats-modifier-sum').textContent = `Modifier Total: ${modifierSum >= 0 ? '+' : ''}${modifierSum}`;
    }
    
    showCharacterSummary() {
        const values = Object.values(this.currentStats);
        const total = values.reduce((sum, val) => sum + val, 0);
        const highest = Math.max(...values);
        const lowest = Math.min(...values);
        
        let assessment = '';
        if (total >= 84) {
            assessment = 'Exceptional hero material! ⭐';
        } else if (total >= 72) {
            assessment = 'Above average character 👍';
        } else if (total >= 60) {
            assessment = 'Decent adventurer 👤';
        } else {
            assessment = 'Challenging character 😬';
        }
        
        this.addToLog(`> Character Assessment: ${assessment}`);
        this.addToLog(`> Highest stat: ${highest}, Lowest stat: ${lowest}`);
    }
    
    exportStats() {
        if (Object.keys(this.currentStats).length === 0) {
            this.addToLog('> Error: No stats to export!');
            return;
        }
        
        let exportText = '=== D&D CHARACTER STATS ===\n';
        exportText += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        this.stats.forEach(stat => {
            const value = this.currentStats[stat] || 0;
            const modifier = Math.floor((value - 10) / 2);
            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            exportText += `${stat.toUpperCase()}: ${value} (${modStr})\n`;
        });
        
        const total = Object.values(this.currentStats).reduce((sum, val) => sum + val, 0);
        exportText += `\nTotal: ${total}\n`;
        exportText += `Average: ${(total / 6).toFixed(1)}\n`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(exportText).then(() => {
            this.addToLog('> Stats exported to clipboard! 📋');
        }).catch(() => {
            // Fallback: show in alert
            alert(exportText);
            this.addToLog('> Stats displayed (clipboard not available)');
        });
    }
    
    saveStats() {
        if (Object.keys(this.currentStats).length === 0) {
            this.addToLog('> Error: No stats to save!');
            return;
        }
        
        const saveData = {
            stats: this.currentStats,
            timestamp: new Date().toISOString(),
            total: Object.values(this.currentStats).reduce((sum, val) => sum + val, 0)
        };
        
        localStorage.setItem('dnd-stats-save', JSON.stringify(saveData));
        this.addToLog('> Stats saved to browser storage! 💾');
        
        // Try to load saved stats on page refresh
        this.loadSavedStats();
    }
    
    loadSavedStats() {
        const saved = localStorage.getItem('dnd-stats-save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const saveDate = new Date(data.timestamp).toLocaleDateString();
                this.addToLog(`> Found saved stats from ${saveDate}`);
            } catch (e) {
                this.addToLog('> Error loading saved stats');
            }
        }
    }
    
    addToLog(message) {
        const logElement = document.getElementById('roll-log');
        if (!logElement) return;
        
        this.rollLog.push(message);
        logElement.textContent += '\n' + message;
        logElement.scrollTop = logElement.scrollHeight;
        
        // Limit log size
        if (this.rollLog.length > 50) {
            this.rollLog = this.rollLog.slice(-30);
            this.refreshLog();
        }
    }
    
    refreshLog() {
        const logElement = document.getElementById('roll-log');
        if (logElement) {
            logElement.textContent = this.rollLog.join('\n');
            logElement.scrollTop = logElement.scrollHeight;
        }
    }
    
    clearLog() {
        this.rollLog = [
            '> D&D Dice Roller Pro 95 v1.0 Ready',
            '> Type \'help\' for commands',
            '> Log cleared - ready for new rolls!'
        ];
        this.refreshLog();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the dice roller
const diceRoller = new DiceRoller();