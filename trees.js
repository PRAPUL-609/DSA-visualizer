// Tree Traversal Visualizer
class TreeNode {
    constructor(value, x = 0, y = 0) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1; // Height for AVL balancing
        this.x = x;
        this.y = y;
        this.visited = false;
        this.visiting = false;
    }
}

class TreeVisualizer {
    constructor() {
        this.root = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentAlgorithm = 'inorder';
        this.speed = 50;
        this.traversalOrder = [];
        this.svg = null;
        this.width = this.getResponsiveWidth();
        this.height = this.getResponsiveHeight();
        this.treeType = 'bst'; // 'bst' or 'avl'
        
        // Initialize regardless of section visibility
        this.initialize();
    }

    initialize() {
        // Always set up event listeners
        this.initializeEventListeners();
        
        // Only set up SVG and generate initial tree if section is visible
        const treesSection = document.getElementById('trees-section');
        if (treesSection && !treesSection.classList.contains('hidden')) {
            this.initializeSVG();
            this.generateTree();
            this.addResizeHandler();
            this.updateTreeStatus();
        }
    }

    initializeEventListeners() {
        console.log('Setting up tree event listeners');
        // Algorithm selection
        document.querySelectorAll('[data-tree-algorithm]').forEach(card => {
            card.addEventListener('click', () => {
                if (this.isRunning) return;
                
                document.querySelectorAll('[data-tree-algorithm]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                this.currentAlgorithm = card.dataset.treeAlgorithm;
                this.resetTraversal();
                this.updateTreeStatus();
            });
        });

        // Tree type selection
        document.querySelectorAll('[data-tree-type]').forEach(card => {
            card.addEventListener('click', () => {
                console.log('Tree type clicked:', card.dataset.treeType);
                if (this.isRunning) return;
                
                document.querySelectorAll('[data-tree-type]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                this.treeType = card.dataset.treeType;
                this.generateTree();
                this.updateTreeStatus();
            });
        });

        // Control buttons
        document.getElementById('generate-tree').addEventListener('click', () => {
            console.log('Generate tree button clicked');
            if (!this.isRunning) this.generateTree();
        });

        document.getElementById('start-traversal').addEventListener('click', () => {
            if (!this.isRunning) this.startTraversal();
        });

        document.getElementById('pause-traversal').addEventListener('click', () => {
            this.pauseTraversal();
        });

        document.getElementById('reset-traversal').addEventListener('click', () => {
            this.resetTraversal();
        });

        // Build custom tree from input
        const buildBtn = document.getElementById('build-tree');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                const input = document.getElementById('tree-input');
                if (!input) return;
                const values = this.parseNumberInput(input.value);
                if (values.length === 0) {
                    alert('Please enter at least one valid number.');
                    return;
                }
                
                // Build tree based on type
                if (this.treeType === 'avl') {
                    this.root = this.buildAVL(values);
                } else {
                    this.root = this.buildBST(values);
                }
                
                this.calculatePositions();
                this.renderTree();
                this.resetTraversal();
            });
        }

        // Speed slider
        document.getElementById('tree-speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    initializeSVG() {
        const container = document.getElementById('tree-visualization');
        container.innerHTML = '';
        
        this.svg = d3.select('#tree-visualization')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', 'rgba(255, 255, 255, 0.1)')
            .style('border-radius', '8px');
    }

    generateTree() {
        // Remove redundant console.log
        if (!this.svg) {
            this.initializeSVG();
        }

        const values = [];
        const nodeCount = Math.floor(Math.random() * 10) + 7;
        
        while (values.length < nodeCount) {
            const value = Math.floor(Math.random() * 99) + 1;
            if (!values.includes(value)) {
                values.push(value);
            }
        }

        this.root = null;
        if (this.treeType === 'avl') {
            this.root = this.buildAVL([...new Set(values)]); // Remove duplicates for AVL
        } else {
            this.root = this.buildBST(values);
        }
        
        this.calculatePositions();
        this.renderTree();
        this.resetTraversal();
    }

    buildRandomTree(values) {
        if (values.length === 0) return null;
        
        const rootValue = values[0];
        const root = new TreeNode(rootValue);
        
        // Randomly distribute remaining values
        const remaining = values.slice(1);
        const leftValues = [];
        const rightValues = [];
        
        remaining.forEach(value => {
            if (Math.random() < 0.5 && leftValues.length < remaining.length / 2) {
                leftValues.push(value);
            } else {
                rightValues.push(value);
            }
        });
        
        root.left = leftValues.length > 0 ? this.buildRandomTree(leftValues) : null;
        root.right = rightValues.length > 0 ? this.buildRandomTree(rightValues) : null;
        
        return root;
    }

    // Build a Binary Search Tree (BST) from an array of values
    buildBST(values) {
        let root = null;
        for (const v of values) {
            root = this.bstInsert(root, v);
        }
        return root;
    }

    // Build an AVL Tree from an array of values
    buildAVL(values) {
        let root = null;
        for (const v of values) {
            root = this.avlInsert(root, v);
        }
        return root;
    }

    // BST insert helper used by buildBST
    bstInsert(node, value) {
        if (!node) return new TreeNode(value);
        if (value === node.value) return node; // ignore duplicates
        if (value < node.value) node.left = this.bstInsert(node.left, value);
        else node.right = this.bstInsert(node.right, value);
        return node;
    }

    // --- AVL Tree specific methods ---
    getNodeHeight(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        if (!node) return 0;
        return this.getNodeHeight(node.left) - this.getNodeHeight(node.right);
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getNodeHeight(y.left), this.getNodeHeight(y.right)) + 1;
        x.height = Math.max(this.getNodeHeight(x.left), this.getNodeHeight(x.right)) + 1;

        return x;
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getNodeHeight(x.left), this.getNodeHeight(x.right)) + 1;
        y.height = Math.max(this.getNodeHeight(y.left), this.getNodeHeight(y.right)) + 1;

        return y;
    }

    avlInsert(node, value) {
        // Normal BST insertion
        if (!node) {
            return new TreeNode(value);
        }

        if (value < node.value) {
            node.left = this.avlInsert(node.left, value);
        } else if (value > node.value) {
            node.right = this.avlInsert(node.right, value);
        } else {
            return node; // Duplicate values not allowed
        }

        // Update height of current node
        node.height = Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right)) + 1;

        // Get balance factor
        const balance = this.getBalance(node);

        // Left Left Case
        if (balance > 1 && value < node.left.value) {
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && value > node.right.value) {
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && value > node.left.value) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && value < node.right.value) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    // Parse comma/space separated numbers string into number array
    parseNumberInput(text) {
        if (!text) return [];
        return text
            .split(/[^-\d.]+/) // split on non-number separators
            .map(s => s.trim())
            .filter(s => s.length > 0 && !isNaN(Number(s)))
            .map(Number);
    }

    calculatePositions() {
        if (!this.root) return;
        
        const levels = this.getTreeHeight(this.root);
        const positions = new Map();
        const levelHeight = Math.max(40, Math.min(100, Math.floor(this.height / (levels + 1))));
        
        // Calculate positions using level-order traversal
        const queue = [{node: this.root, level: 0, position: 0}];
        const levelCounts = new Array(levels).fill(0);
        
        // Count nodes at each level
        const countQueue = [{node: this.root, level: 0}];
        while (countQueue.length > 0) {
            const {node, level} = countQueue.shift();
            levelCounts[level]++;
            
            if (node.left) countQueue.push({node: node.left, level: level + 1});
            if (node.right) countQueue.push({node: node.right, level: level + 1});
        }
        
        // Assign positions
        const levelPositions = new Array(levels).fill(0);
        
        while (queue.length > 0) {
            const {node, level, position} = queue.shift();
            
            const levelWidth = this.width / (levelCounts[level] + 1);
            node.x = levelWidth * (levelPositions[level] + 1);
            node.y = levelHeight * (level + 1);
            levelPositions[level]++;
            
            if (node.left) {
                queue.push({node: node.left, level: level + 1, position: position * 2});
            }
            if (node.right) {
                queue.push({node: node.right, level: level + 1, position: position * 2 + 1});
            }
        }
    }

    getTreeHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(this.getTreeHeight(node.left), this.getTreeHeight(node.right));
    }

    renderTree() {
        this.svg.selectAll('*').remove();
        
        if (!this.root) return;
        
        // Collect all nodes and edges
        const nodes = [];
        const edges = [];
        
        const collectNodes = (node) => {
            if (!node) return;
            nodes.push(node);
            
            if (node.left) {
                edges.push({source: node, target: node.left});
                collectNodes(node.left);
            }
            if (node.right) {
                edges.push({source: node, target: node.right});
                collectNodes(node.right);
            }
        };
        
        collectNodes(this.root);
        
        // Draw edges first (so they appear behind nodes)
        this.svg.selectAll('.tree-link')
            .data(edges)
            .enter()
            .append('line')
            .attr('class', 'tree-link')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Draw nodes
        const nodeGroups = this.svg.selectAll('.node-group')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        nodeGroups.append('circle')
            .attr('class', 'tree-node')
            .attr('r', 20)
            .on('click', (event, d) => {
                if (!this.isRunning) {
                    this.highlightPath(d);
                }
            });
        
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .text(d => d.value);
    }

    highlightPath(targetNode) {
        // Reset all nodes
        this.svg.selectAll('.tree-node')
            .classed('visiting', false)
            .classed('visited', false);
        
        // Highlight path from root to target
        const path = this.findPath(this.root, targetNode.value);
        path.forEach((node, index) => {
            setTimeout(() => {
                this.svg.selectAll('.tree-node')
                    .filter(d => d.value === node.value)
                    .classed('visiting', true);
            }, index * 200);
        });
    }

    findPath(node, target, path = []) {
        if (!node) return null;
        
        path.push(node);
        
        if (node.value === target) {
            return [...path];
        }
        
        const leftPath = this.findPath(node.left, target, path);
        if (leftPath) return leftPath;
        
        const rightPath = this.findPath(node.right, target, path);
        if (rightPath) return rightPath;
        
        path.pop();
        return null;
    }

    async startTraversal() {
        console.log(`Starting traversal: ${this.currentAlgorithm} on ${this.treeType} tree.`);
        if (this.isRunning || !this.root) {
            console.error('Traversal start blocked. isRunning:', this.isRunning, 'root:', this.root);
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.traversalOrder = [];
        
        document.getElementById('start-traversal').disabled = true;
        document.getElementById('pause-traversal').disabled = false;
        document.getElementById('generate-tree').disabled = true;
        
        // Reset visual state
        this.svg.selectAll('.tree-node')
            .classed('visiting', false)
            .classed('visited', false);
        
        try {
            switch (this.currentAlgorithm) {
                case 'inorder':
                    await this.inorderTraversal(this.root);
                    break;
                case 'preorder':
                    await this.preorderTraversal(this.root);
                    break;
                case 'postorder':
                    await this.postorderTraversal(this.root);
                    break;
                case 'levelorder':
                    await this.levelorderTraversal();
                    break;
            }
        } catch (error) {
            console.error('Traversal error:', error);
        }
        
        this.isRunning = false;
        document.getElementById('start-traversal').disabled = false;
        document.getElementById('pause-traversal').disabled = true;
        document.getElementById('generate-tree').disabled = false;
    }

    pauseTraversal() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-traversal').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    resetTraversal() {
        this.isRunning = false;
        this.isPaused = false;
        this.traversalOrder = [];
        
        document.getElementById('start-traversal').disabled = false;
        document.getElementById('pause-traversal').disabled = true;
        document.getElementById('pause-traversal').textContent = 'Pause';
        document.getElementById('generate-tree').disabled = false;
        
        if (this.svg) {
            this.svg.selectAll('.tree-node')
                .classed('visiting', false)
                .classed('visited', false);
        }
        
        document.getElementById('traversal-order').textContent = 'Start a traversal to see the order of visited nodes.';
    }

    async delay() {
        const delayTime = 101 - this.speed;
        return new Promise(resolve => {
            const wait = () => {
                if (this.isPaused) {
                    setTimeout(wait, 100);
                } else {
                    setTimeout(resolve, delayTime * 10); // Slower for better visibility
                }
            };
            wait();
        });
    }

    async visitNode(node) {
        if (!node) return;
        
        this.svg.selectAll('.tree-node')
            .filter(d => d.value === node.value)
            .classed('visiting', true);
        
        await this.delay();
        
        this.traversalOrder.push(node.value);
        this.updateTraversalDisplay();
        
        this.svg.selectAll('.tree-node')
            .filter(d => d.value === node.value)
            .classed('visiting', false)
            .classed('visited', true);
        
        await this.delay();
    }

    updateTraversalDisplay() {
        const orderText = this.traversalOrder.join(' → ');
        document.getElementById('traversal-order').textContent = orderText || 'Traversal in progress...';
    }

    // Traversal Algorithms
    async inorderTraversal(node) {
        if (!node) return;
        console.log(`In-order: Traversing left of ${node.value}`);
        await this.inorderTraversal(node.left);
        await this.visitNode(node);
        console.log(`In-order: Traversing right of ${node.value}`);
        await this.inorderTraversal(node.right);
    }

    async preorderTraversal(node) {
        if (!node) return;
        
        await this.visitNode(node);
        await this.preorderTraversal(node.left);
        await this.preorderTraversal(node.right);
    }

    async postorderTraversal(node) {
        if (!node) return;
        
        await this.postorderTraversal(node.left);
        await this.postorderTraversal(node.right);
        await this.visitNode(node);
    }

    async levelorderTraversal() {
        if (!this.root) return;
        
        const queue = [this.root];
        
        while (queue.length > 0) {
            const node = queue.shift();
            await this.visitNode(node);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }

    // --- Responsive helpers ---
    getResponsiveWidth() {
        const container = document.getElementById('tree-visualization');
        const w = (container ? container.clientWidth : (typeof window !== 'undefined' ? window.innerWidth : 800)) || 800;
        return Math.max(320, Math.min(1024, w));
    }

    getResponsiveHeight() {
        const container = document.getElementById('tree-visualization');
        const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
        if (container && container.clientHeight) {
            return Math.max(200, Math.min(500, container.clientHeight));
        }
        return isMobile ? 220 : 350;
    }

    addResizeHandler() {
        if (this._resizeAttached) return;
        this._onResizeDebounced = this.debounce(() => this.onResize(), 150);
        window.addEventListener('resize', this._onResizeDebounced);
        this._resizeAttached = true;
    }

    onResize() {
        const newW = this.getResponsiveWidth();
        const newH = this.getResponsiveHeight();
        if (newW === this.width && newH === this.height) return;
        this.width = newW;
        this.height = newH;
        if (this.svg) {
            this.svg.attr('width', this.width).attr('height', this.height);
        }
        this.calculatePositions();
        this.renderTree();
    }

    debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Method to handle when trees section becomes visible
    onSectionVisible() {
        if (!this.svg) {
            this.initializeSVG();
        }
        if (!this.root) {
            this.generateTree();
        }
        this.addResizeHandler();
        this.updateTreeStatus();
    }

    // --- UI helpers ---
    updateTreeStatus() {
        const el = document.getElementById('tree-status');
        if (!el) return;
        const names = {
            inorder: 'In-Order',
            preorder: 'Pre-Order',
            postorder: 'Post-Order',
            levelorder: 'Level-Order',
        };
        const traversalName = names[this.currentAlgorithm] || this.currentAlgorithm;
        const treeTypeName = this.treeType.toUpperCase();
        el.textContent = `Tree: ${treeTypeName} | Traversal: ${traversalName}`;
    }
}

// Initialize tree visualizer
window.treeVisualizer = null;

document.addEventListener('DOMContentLoaded', () => {
    const maxAttempts = 20;
    let attempts = 0;
    
    const initTreeVisualizer = () => {
        if (typeof d3 !== 'undefined') {
            try {
                const treesSection = document.getElementById('trees-section');
                window.treeVisualizer = new TreeVisualizer();
                
                // Set initial algorithm and tree type
                const defaultAlgorithm = document.querySelector('[data-tree-algorithm="inorder"]');
                const defaultTreeType = document.querySelector('[data-tree-type="bst"]');
                
                if (defaultAlgorithm) defaultAlgorithm.classList.add('active');
                if (defaultTreeType) defaultTreeType.classList.add('active');
                
                // Initialize if section is visible
                if (treesSection && !treesSection.classList.contains('hidden')) {
                    window.treeVisualizer.onSectionVisible();
                }
            } catch (error) {
                console.error('Tree visualizer initialization error:', error);
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(initTreeVisualizer, 100);
        } else {
            console.error('Failed to load D3.js after multiple attempts');
        }
    };
    
    initTreeVisualizer();
});
