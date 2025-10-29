// Main application controller
class DSAVisualizerApp {
    constructor() {
        this.currentTab = 'data-structures';
        this.initializeNavigation();
        this.initializeTheme();
        this.initializeCover();
    }

    initializeNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Remove active class from all tabs
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.add('hidden');
                });
                
                // Show target tab content
                const targetContent = document.getElementById(`${targetTab}-section`);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    targetContent.classList.add('fade-in');
                }
                
                this.currentTab = targetTab;
                
                // Initialize visualizers when switching tabs
                this.initializeCurrentTabVisualizer();
            });
        });
    }

    initializeCurrentTabVisualizer() {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            switch (this.currentTab) {
                case 'sorting':
                    if (typeof sortingVisualizer === 'undefined') {
                        window.sortingVisualizer = new SortingVisualizer();
                    }
                    break;
                case 'trees':
                    if (!window.treeVisualizer) {
                        window.treeVisualizer = new TreeVisualizer();
                    }
                    if (window.treeVisualizer && typeof window.treeVisualizer.onSectionVisible === 'function') {
                        window.treeVisualizer.onSectionVisible();
                    }
                    break;
                case 'graphs':
                    if (typeof graphVisualizer === 'undefined') {
                        window.graphVisualizer = new GraphVisualizer();
                    }
                    break;
                case 'data-structures':
                    if (!window.dataStructureVisualizer) {
                        window.dataStructureVisualizer = new DataStructureVisualizer();
                        window.dataStructureVisualizer.initialize();
                    }
                    break;
            }
        }, 100);
    }

    initializeTheme() {
        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(`${savedTheme}-mode`);
        
        // Update icons based on current theme
        this.updateThemeIcons(savedTheme);
        
        // Add theme toggle functionality
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '🌙';
        themeToggle.className = 'fixed top-4 right-4 w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 text-white text-xl hover:bg-opacity-30 transition-all duration-300 z-50';
        themeToggle.title = 'Toggle Dark Mode';
        themeToggle.id = 'theme-toggle';
        
        document.body.appendChild(themeToggle);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Remove current theme class and add new theme class
            document.body.classList.remove(`${currentTheme}-mode`);
            document.body.classList.add(`${newTheme}-mode`);
            
            // Save theme preference
            localStorage.setItem('theme', newTheme);
            
            // Update icons
            this.updateThemeIcons(newTheme);
        });
    }
    
    updateThemeIcons(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Cover overlay: show for 5 seconds then hide
    initializeCover() {
        const overlay = document.getElementById('cover-overlay');
        if (!overlay) return;
        this._coverHidden = false;
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideCover(overlay);
        }, 5000);
    }

    hideCover(overlay) {
        if (this._coverHidden || !overlay) return;
        this._coverHidden = true;
        overlay.classList.add('hide');
        const remove = () => overlay.remove();
        overlay.addEventListener('animationend', remove, { once: true });
        setTimeout(() => { if (document.body.contains(overlay)) remove(); }, 800);
    }

    // Utility methods for all visualizers
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 fade-in`;
        
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500');
                break;
            case 'error':
                notification.classList.add('bg-red-500');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500');
                break;
            default:
                notification.classList.add('bg-blue-500');
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static addLoadingState(element, text = 'Loading...') {
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.textContent = text;
        element.classList.add('pulse');
    }

    static removeLoadingState(element) {
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
        element.classList.remove('pulse');
    }
}

// Enhanced CSS for dark theme
const darkThemeStyles = `
    .dark-theme {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    }
    
    .dark-theme .glass-card {
        background: rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .dark-theme .array-bar {
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Improve contrast for trees in dark mode */
    .dark-theme #tree-visualization svg {
        background: rgba(255, 255, 255, 0.06) !important;
    }
    .dark-theme .tree-link {
        stroke: #9ca3af !important; /* gray-400 */
    }
    .dark-theme .tree-node {
        fill: #60a5fa !important;   /* blue-400 */
        stroke: #93c5fd !important; /* blue-300 */
    }
    .dark-theme .tree-node.visiting {
        fill: #fbbf24 !important;   /* amber-400 */
        stroke: #f59e0b !important; /* amber-500 */
        stroke-width: 3 !important;
    }
    .dark-theme .tree-node.visited {
        fill: #34d399 !important;   /* emerald-400 */
        stroke: #10b981 !important; /* emerald-500 */
    }
    
    /* Improve contrast for graph as well */
    .dark-theme .graph-node {
        fill: #60a5fa !important;
        stroke: #93c5fd !important;
    }
    .dark-theme .graph-node.visiting {
        fill: #fbbf24 !important;
        stroke: #f59e0b !important;
        stroke-width: 3 !important;
    }
    .dark-theme .graph-node.visited {
        fill: #34d399 !important;
        stroke: #10b981 !important;
    }
    .dark-theme .graph-edge {
        stroke: #9ca3af !important;
    }
    
    @keyframes fadeOut {
        to { opacity: 0; transform: translateY(-20px); }
    }
`;

// Add dark theme styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = darkThemeStyles;
document.head.appendChild(styleSheet);

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            sortingOperations: 0,
            treeTraversals: 0,
            graphOperations: 0,
            totalAnimations: 0
        };
        
        this.startTime = performance.now();
    }

    recordOperation(type) {
        this.metrics[type]++;
        this.metrics.totalAnimations++;
    }

    getStats() {
        const runtime = performance.now() - this.startTime;
        return {
            ...this.metrics,
            runtime: Math.round(runtime),
            averageOperationTime: this.metrics.totalAnimations > 0 ? 
                Math.round(runtime / this.metrics.totalAnimations) : 0
        };
    }

    displayStats() {
        const stats = this.getStats();
        console.table(stats);
        
        DSAVisualizerApp.showNotification(
            `Performance: ${stats.totalAnimations} operations in ${stats.runtime}ms`,
            'info'
        );
    }
}

// Keyboard shortcuts
class KeyboardShortcuts {
    constructor() {
        this.initializeShortcuts();
    }

    initializeShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case '1':
                    this.switchTab('sorting');
                    break;
                case '2':
                    this.switchTab('trees');
                    break;
                case '3':
                    this.switchTab('graphs');
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'r':
                    this.resetCurrent();
                    break;
                case 'g':
                    this.generateNew();
                    break;
                case 't':
                    document.querySelector('.fixed.top-4.right-4').click();
                    break;
            }
        });
        
        // Show shortcuts help
        this.showShortcutsHelp();
    }

    switchTab(tabName) {
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        if (tab) tab.click();
    }

    togglePlayPause() {
        const currentTab = document.querySelector('.nav-tab.active').dataset.tab;
        let pauseBtn;
        
        switch (currentTab) {
            case 'sorting':
                pauseBtn = document.getElementById('pause-sort');
                break;
            case 'trees':
                pauseBtn = document.getElementById('pause-traversal');
                break;
            case 'graphs':
                pauseBtn = document.getElementById('pause-graph');
                break;
        }
        
        if (pauseBtn && !pauseBtn.disabled) {
            pauseBtn.click();
        }
    }

    resetCurrent() {
        const currentTab = document.querySelector('.nav-tab.active').dataset.tab;
        let resetBtn;
        
        switch (currentTab) {
            case 'sorting':
                resetBtn = document.getElementById('reset-sort');
                break;
            case 'trees':
                resetBtn = document.getElementById('reset-traversal');
                break;
            case 'graphs':
                resetBtn = document.getElementById('reset-graph');
                break;
        }
        
        if (resetBtn) resetBtn.click();
    }

    generateNew() {
        const currentTab = document.querySelector('.nav-tab.active').dataset.tab;
        let generateBtn;
        
        switch (currentTab) {
            case 'sorting':
                generateBtn = document.getElementById('generate-array');
                break;
            case 'trees':
                generateBtn = document.getElementById('generate-tree');
                break;
            case 'graphs':
                generateBtn = document.getElementById('generate-graph');
                break;
        }
        
        if (generateBtn) generateBtn.click();
    }

    showShortcutsHelp() {
        const helpButton = document.createElement('button');
        helpButton.innerHTML = '❓';
        helpButton.className = 'fixed bottom-4 right-4 w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 text-white text-xl hover:bg-opacity-30 transition-all duration-300 z-50';
        helpButton.title = 'Keyboard Shortcuts';
        
        document.body.appendChild(helpButton);
        
        helpButton.addEventListener('click', () => {
            const shortcuts = `
                Keyboard Shortcuts:
                1, 2, 3 - Switch tabs
                Space - Play/Pause
                R - Reset
                G - Generate new
                T - Toggle theme
            `;
            
            alert(shortcuts);
        });
    }
}

// Initialize application
let app, performanceMonitor, keyboardShortcuts;

document.addEventListener('DOMContentLoaded', () => {
    // Ensure scripts are loaded before initializing
    const requiredScripts = ['sorting.js', 'trees.js', 'graphs.js'];
    const loadedScripts = Array.from(document.scripts).map(script => script.src);
    
    const initializeApp = () => {
        app = new DSAVisualizerApp();
        performanceMonitor = new PerformanceMonitor();
        keyboardShortcuts = new KeyboardShortcuts();
        
            // Initialize first tab visualizer and data structures visualizer
            setTimeout(() => {
                window.dataStructureVisualizer = new DataStructureVisualizer();
                window.dataStructureVisualizer.initialize();
                
                // Initialize Circular Queue controls
                const circularEnqueueBtn = document.getElementById('circular-enqueue-btn');
                const circularDequeueBtn = document.getElementById('circular-dequeue-btn');
                const circularQueueInput = document.getElementById('circular-queue-value');
                const randomCircularQueueBtn = document.getElementById('random-circular-queue-btn');
                const resetCircularQueueBtn = document.getElementById('reset-circular-queue');
                const setCircularQueueSizeBtn = document.getElementById('set-circular-queue-size');
                const circularQueueSizeInput = document.getElementById('circular-queue-size');

                if (circularEnqueueBtn) {
                    circularEnqueueBtn.addEventListener('click', () => {
                        const value = circularQueueInput.value.trim();
                        if (value) {
                            window.dataStructureVisualizer.circularEnqueue(Number(value));
                            circularQueueInput.value = '';
                        }
                    });
                }

                if (circularDequeueBtn) {
                    circularDequeueBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.circularDequeue();
                    });
                }

                if (randomCircularQueueBtn) {
                    randomCircularQueueBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.generateRandomCircularQueue();
                    });
                }

                if (resetCircularQueueBtn) {
                    resetCircularQueueBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.resetCircularQueue();
                    });
                }

                if (setCircularQueueSizeBtn) {
                    setCircularQueueSizeBtn.addEventListener('click', () => {
                        const size = Number(circularQueueSizeInput.value);
                        if (size >= 3 && size <= 10) {
                            window.dataStructureVisualizer.setCircularQueueSize(size);
                        } else {
                            DSAVisualizerApp.showNotification('Size must be between 3 and 10', 'error');
                        }
                    });
                }

                // Initialize Deque controls
                const insertFrontBtn = document.getElementById('insert-front-btn');
                const insertRearBtn = document.getElementById('insert-rear-btn');
                const deleteFrontBtn = document.getElementById('delete-front-btn');
                const deleteRearBtn = document.getElementById('delete-rear-btn');
                const dequeInput = document.getElementById('deque-value');
                const randomDequeBtn = document.getElementById('random-deque-btn');
                const resetDequeBtn = document.getElementById('reset-deque');

                if (insertFrontBtn) {
                    insertFrontBtn.addEventListener('click', () => {
                        const value = dequeInput.value.trim();
                        if (value) {
                            window.dataStructureVisualizer.insertFront(Number(value));
                            dequeInput.value = '';
                        }
                    });
                }

                if (insertRearBtn) {
                    insertRearBtn.addEventListener('click', () => {
                        const value = dequeInput.value.trim();
                        if (value) {
                            window.dataStructureVisualizer.insertRear(Number(value));
                            dequeInput.value = '';
                        }
                    });
                }

                if (deleteFrontBtn) {
                    deleteFrontBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.deleteFront();
                    });
                }

                if (deleteRearBtn) {
                    deleteRearBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.deleteRear();
                    });
                }

                if (randomDequeBtn) {
                    randomDequeBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.generateRandomDeque();
                    });
                }

                if (resetDequeBtn) {
                    resetDequeBtn.addEventListener('click', () => {
                        window.dataStructureVisualizer.resetDeque();
                    });
                }
                app.initializeCurrentTabVisualizer();            // Set up step-by-step controls for sorting visualizer
             const prevStepBtn = document.getElementById('prev-step');
             const nextStepBtn = document.getElementById('next-step');
             const customArrayBtn = document.getElementById('custom-array-btn');
             const compareBtn = document.getElementById('compare-btn');
             const submitCustomArrayBtn = document.getElementById('submit-custom-array');
             const cancelCustomArrayBtn = document.getElementById('cancel-custom-array');
             
             // Algorithm comparison mode
             let isComparisonMode = false;
             let comparisonVisualizers = [];
             
             if (compareBtn) {
                 compareBtn.addEventListener('click', () => {
                     const mainVisualization = document.getElementById('sorting-visualization');
                     const comparisonContainer = document.getElementById('comparison-container');
                     
                     if (!isComparisonMode) {
                         // Switch to comparison mode
                         isComparisonMode = true;
                         compareBtn.textContent = 'Exit Comparison';
                         mainVisualization.classList.add('hidden');
                         comparisonContainer.classList.remove('hidden');
                         
                         // Initialize comparison visualizers
                         comparisonVisualizers = SortingVisualizer.initializeComparisonMode();
                         
                         // Update algorithm selectors
                         document.getElementById('algorithm1').addEventListener('change', (e) => {
                             comparisonVisualizers[0].currentAlgorithm = e.target.value;
                         });
                         
                         document.getElementById('algorithm2').addEventListener('change', (e) => {
                             comparisonVisualizers[1].currentAlgorithm = e.target.value;
                         });
                         
                         // Start comparison button
                         const startComparisonBtn = document.createElement('button');
                         startComparisonBtn.id = 'start-comparison';
                         startComparisonBtn.className = 'control-btn mt-4 mx-auto block';
                         startComparisonBtn.textContent = 'Start Comparison';
                         comparisonContainer.appendChild(startComparisonBtn);
                         
                         startComparisonBtn.addEventListener('click', () => {
                             SortingVisualizer.runComparison(...comparisonVisualizers);
                         });
                     } else {
                         // Switch back to normal mode
                         isComparisonMode = false;
                         compareBtn.textContent = 'Compare Algorithms';
                         mainVisualization.classList.remove('hidden');
                         comparisonContainer.classList.add('hidden');
                         
                         // Remove start comparison button if it exists
                         const startComparisonBtn = document.getElementById('start-comparison');
                         if (startComparisonBtn) {
                             startComparisonBtn.remove();
                         }
                     }
                 });
             }
            
            if (prevStepBtn) prevStepBtn.addEventListener('click', () => {
                if (window.sortingVisualizer) window.sortingVisualizer.prevStep();
            });
            
            if (nextStepBtn) nextStepBtn.addEventListener('click', () => {
                if (window.sortingVisualizer) window.sortingVisualizer.nextStep();
            });
            
            if (customArrayBtn) customArrayBtn.addEventListener('click', () => {
                if (window.sortingVisualizer) window.sortingVisualizer.showCustomArrayInput();
            });
            
            if (submitCustomArrayBtn) submitCustomArrayBtn.addEventListener('click', () => {
                if (window.sortingVisualizer) window.sortingVisualizer.processCustomArray();
            });
            
            if (cancelCustomArrayBtn) cancelCustomArrayBtn.addEventListener('click', () => {
                document.getElementById('custom-array-modal')?.classList.add('hidden');
            });
            
            // Welcome message
            DSAVisualizerApp.showNotification('Welcome to DSA Visualizer! Use keyboard shortcuts for faster navigation.', 'success');
        }, 500);
        
        // Add performance stats button (for development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const statsButton = document.createElement('button');
            statsButton.innerHTML = '📊';
            statsButton.className = 'fixed bottom-4 left-4 w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 text-white text-xl hover:bg-opacity-30 transition-all duration-300 z-50';
            statsButton.title = 'Performance Stats';
            statsButton.addEventListener('click', () => performanceMonitor.displayStats());
            document.body.appendChild(statsButton);
        }
    };

    // Check if all required scripts are loaded
    const allScriptsLoaded = requiredScripts.every(script => 
        loadedScripts.some(loadedScript => loadedScript.includes(script))
    );

    if (allScriptsLoaded) {
        initializeApp();
    } else {
        console.warn('Waiting for scripts to load...');
        window.addEventListener('load', initializeApp);
    }
});

// Export for global access
window.DSAVisualizerApp = DSAVisualizerApp;
window.performanceMonitor = performanceMonitor;
