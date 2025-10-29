// Graph Algorithms Visualizer
class GraphNode {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.visited = false;
        this.visiting = false;
        this.distance = Infinity;
        this.previous = null;
    }
}

class GraphEdge {
    constructor(source, target, weight = 1) {
        this.source = source;
        this.target = target;
        this.weight = weight;
        this.active = false;
    }
}

class GraphVisualizer {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.isRunning = false;
        this.isPaused = false;
        this.currentAlgorithm = 'bfs';
        this.speed = 50;
        this.nodeCount = 10;
        this.svg = null;
        this.width = 800;
        this.height = 350;
        this.startNode = null;
        
        this.initializeEventListeners();
        this.initializeSVG();
        this.generateGraph();
    }

    initializeEventListeners() {
        // Algorithm selection
        document.querySelectorAll('[data-graph-algorithm]').forEach(card => {
            card.addEventListener('click', () => {
                if (this.isRunning) return;
                
                document.querySelectorAll('[data-graph-algorithm]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                this.currentAlgorithm = card.dataset.graphAlgorithm;
                this.resetGraph();
            });
        });

        // Control buttons
        document.getElementById('generate-graph').addEventListener('click', () => {
            if (!this.isRunning) this.generateGraph();
        });

        document.getElementById('start-graph-algorithm').addEventListener('click', () => {
            if (!this.isRunning) this.startAlgorithm();
        });

        document.getElementById('pause-graph').addEventListener('click', () => {
            this.pauseAlgorithm();
        });

        document.getElementById('reset-graph').addEventListener('click', () => {
            this.resetGraph();
        });

        // Sliders
        document.getElementById('graph-speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });

        document.getElementById('graph-size-slider').addEventListener('input', (e) => {
            if (!this.isRunning) {
                this.nodeCount = parseInt(e.target.value);
                this.generateGraph();
            }
        });

        // Build custom graph from inputs
        const buildBtn = document.getElementById('build-graph');
        if (buildBtn) {
            buildBtn.addEventListener('click', () => {
                if (this.isRunning) return;
                const nodesInput = document.getElementById('graph-node-input');
                const edgesInput = document.getElementById('graph-edge-input');
                if (!nodesInput) return;
                this.buildCustomGraph(nodesInput.value, edgesInput ? edgesInput.value : '');
            });
        }
    }

    initializeSVG() {
        const container = document.getElementById('graph-visualization');
        container.innerHTML = '';
        
        this.svg = d3.select('#graph-visualization')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('background', 'rgba(255, 255, 255, 0.1)')
            .style('border-radius', '8px');
    }

    generateGraph() {
        this.nodes = [];
        this.edges = [];
        
        // Generate nodes in a circular layout
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;
        
        for (let i = 0; i < this.nodeCount; i++) {
            const angle = (2 * Math.PI * i) / this.nodeCount;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.nodes.push(new GraphNode(i, x, y));
        }
        
        // Generate random edges
        const edgeCount = Math.floor(this.nodeCount * 1.5);
        const edgeSet = new Set();
        
        for (let i = 0; i < edgeCount; i++) {
            let source, target;
            let edgeKey;
            
            do {
                source = Math.floor(Math.random() * this.nodeCount);
                target = Math.floor(Math.random() * this.nodeCount);
                edgeKey = `${Math.min(source, target)}-${Math.max(source, target)}`;
            } while (source === target || edgeSet.has(edgeKey));
            
            edgeSet.add(edgeKey);
            const weight = Math.floor(Math.random() * 10) + 1;
            this.edges.push(new GraphEdge(this.nodes[source], this.nodes[target], weight));
        }
        
        // Ensure connectivity by adding edges to form a spanning tree
        for (let i = 1; i < this.nodeCount; i++) {
            const source = Math.floor(Math.random() * i);
            const edgeKey = `${Math.min(source, i)}-${Math.max(source, i)}`;
            
            if (!edgeSet.has(edgeKey)) {
                edgeSet.add(edgeKey);
                const weight = Math.floor(Math.random() * 10) + 1;
                this.edges.push(new GraphEdge(this.nodes[source], this.nodes[i], weight));
            }
        }
        
        this.startNode = this.nodes[0];
        this.renderGraph();
        this.resetGraph();
    }

    buildCustomGraph(nodesSpec, edgesSpec) {
        // Parse nodes
        const ids = this.parseNodeIds(nodesSpec);
        if (ids.length === 0) {
            alert('Please specify nodes as a count (e.g., 6) or explicit ids (e.g., 0,1,2,3)');
            return;
        }

        // Layout nodes in a circle
        this.nodes = [];
        this.edges = [];
        const N = ids.length;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;
        for (let i = 0; i < N; i++) {
            const angle = (2 * Math.PI * i) / N;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            this.nodes.push(new GraphNode(ids[i], x, y));
        }

        // Parse edges
        const edges = this.parseEdges(edgesSpec, new Set(ids));
        const edgeSet = new Set();
        const nodeById = new Map(this.nodes.map(n => [n.id, n]));
        for (const { a, b, w } of edges) {
            if (!nodeById.has(a) || !nodeById.has(b)) continue;
            if (a === b) continue;
            const key = this.edgeKey(a, b);
            if (edgeSet.has(key)) continue;
            edgeSet.add(key);
            this.edges.push(new GraphEdge(nodeById.get(a), nodeById.get(b), w));
        }

        if (this.nodes.length === 0) {
            alert('No nodes to build.');
            return;
        }
        this.startNode = this.nodes[0];
        this.renderGraph();
        this.resetGraph();
    }

    parseNodeIds(spec) {
        if (!spec) return [];
        const trimmed = spec.trim();
        // If it's a single integer, treat as count 0..n-1
        if (/^\d+$/.test(trimmed)) {
            const n = parseInt(trimmed, 10);
            return Array.from({ length: n }, (_, i) => i);
        }
        // Otherwise split by comma/space
        return trimmed
            .split(/[^\w-]+/)
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => (s.match(/^-?\d+$/) ? parseInt(s, 10) : s));
    }

    parseEdges(spec, idSet) {
        if (!spec) return [];
        const items = spec.split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
        const edges = [];
        for (const item of items) {
            // formats: a-b or a-b:w
            const m = item.match(/^([^:-]+)-([^:]+)(?::(.+))?$/);
            if (!m) continue;
            const aRaw = m[1].trim();
            const bRaw = m[2].trim();
            const wRaw = (m[3] || '').trim();
            const a = aRaw.match(/^-?\d+$/) ? parseInt(aRaw, 10) : aRaw;
            const b = bRaw.match(/^-?\d+$/) ? parseInt(bRaw, 10) : bRaw;
            const w = wRaw.length ? (isNaN(Number(wRaw)) ? 1 : Number(wRaw)) : 1;
            edges.push({ a, b, w });
        }
        return edges;
    }

    edgeKey(a, b) {
        const s = String(a);
        const t = String(b);
        return s < t ? `${s}-${t}` : `${t}-${s}`;
    }

    renderGraph() {
        this.svg.selectAll('*').remove();
        
        // Draw edges
        const edgeSelection = this.svg.selectAll('.graph-edge')
            .data(this.edges)
            .enter()
            .append('line')
            .attr('class', 'graph-edge')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Add edge weights for Dijkstra
        if (this.currentAlgorithm === 'dijkstra') {
            this.svg.selectAll('.edge-weight')
                .data(this.edges)
                .enter()
                .append('text')
                .attr('class', 'edge-weight')
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .style('background', 'rgba(0,0,0,0.5)')
                .text(d => d.weight);
        }
        
        // Draw nodes
        const nodeGroups = this.svg.selectAll('.node-group')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        nodeGroups.append('circle')
            .attr('class', 'graph-node')
            .attr('r', 20)
            .on('click', (event, d) => {
                if (!this.isRunning) {
                    this.startNode = d;
                    this.highlightStartNode();
                }
            });
        
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .attr('font-weight', 'bold')
            .text(d => d.id);
        
        this.highlightStartNode();
    }

    highlightStartNode() {
        this.svg.selectAll('.graph-node')
            .classed('start-node', false)
            .style('stroke', '#fff')
            .style('stroke-width', '2px');
        
        this.svg.selectAll('.graph-node')
            .filter(d => d.id === this.startNode.id)
            .classed('start-node', true)
            .style('stroke', '#ff6b6b')
            .style('stroke-width', '4px');
    }

    async startAlgorithm() {
        if (this.isRunning || this.nodes.length === 0) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        document.getElementById('start-graph-algorithm').disabled = true;
        document.getElementById('pause-graph').disabled = false;
        document.getElementById('generate-graph').disabled = true;
        
        // Reset visual state
        this.resetVisualState();
        
        try {
            switch (this.currentAlgorithm) {
                case 'bfs':
                    await this.breadthFirstSearch();
                    break;
                case 'dfs':
                    await this.depthFirstSearch();
                    break;
                case 'dijkstra':
                    await this.dijkstraAlgorithm();
                    break;
            }
        } catch (error) {
            console.error('Algorithm error:', error);
        }
        
        this.isRunning = false;
        document.getElementById('start-graph-algorithm').disabled = false;
        document.getElementById('pause-graph').disabled = true;
        document.getElementById('generate-graph').disabled = false;
    }

    pauseAlgorithm() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-graph').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    resetGraph() {
        this.isRunning = false;
        this.isPaused = false;
        
        document.getElementById('start-graph-algorithm').disabled = false;
        document.getElementById('pause-graph').disabled = true;
        document.getElementById('pause-graph').textContent = 'Pause';
        document.getElementById('generate-graph').disabled = false;
        
        this.resetVisualState();
        this.updateStatus('Select an algorithm and click start to begin visualization.');
    }

    resetVisualState() {
        // Reset node states
        this.nodes.forEach(node => {
            node.visited = false;
            node.visiting = false;
            node.distance = Infinity;
            node.previous = null;
        });
        
        // Reset edge states
        this.edges.forEach(edge => {
            edge.active = false;
        });
        
        if (this.svg) {
            this.svg.selectAll('.graph-node')
                .classed('visiting', false)
                .classed('visited', false);
            
            this.svg.selectAll('.graph-edge')
                .classed('active', false);
            
            this.highlightStartNode();
        }
    }

    async delay() {
        const delayTime = 101 - this.speed;
        return new Promise(resolve => {
            const wait = () => {
                if (this.isPaused) {
                    setTimeout(wait, 100);
                } else {
                    setTimeout(resolve, delayTime * 15);
                }
            };
            wait();
        });
    }

    async visitNode(node, status = 'visiting') {
        if (status === 'visiting') {
            this.svg.selectAll('.graph-node')
                .filter(d => d.id === node.id)
                .classed('visiting', true);
            
            this.updateStatus(`Visiting node ${node.id}`);
        } else if (status === 'visited') {
            this.svg.selectAll('.graph-node')
                .filter(d => d.id === node.id)
                .classed('visiting', false)
                .classed('visited', true);
        }
        
        await this.delay();
    }

    async highlightEdge(edge, active = true) {
        this.svg.selectAll('.graph-edge')
            .filter(d => (d.source.id === edge.source.id && d.target.id === edge.target.id) ||
                        (d.source.id === edge.target.id && d.target.id === edge.source.id))
            .classed('active', active);
        
        await this.delay();
    }

    updateStatus(message) {
        document.getElementById('graph-status').textContent = message;
    }

    // BFS Algorithm
    async breadthFirstSearch() {
        const queue = [this.startNode];
        const visited = new Set();
        const visitOrder = [];
        
        this.startNode.visited = true;
        visited.add(this.startNode.id);
        
        while (queue.length > 0) {
            const current = queue.shift();
            await this.visitNode(current, 'visiting');
            visitOrder.push(current.id);
            
            // Find neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    neighbor.visited = true;
                    queue.push(neighbor);
                    
                    // Highlight edge
                    const edge = this.edges.find(e => 
                        (e.source.id === current.id && e.target.id === neighbor.id) ||
                        (e.source.id === neighbor.id && e.target.id === current.id)
                    );
                    if (edge) {
                        await this.highlightEdge(edge);
                    }
                }
            }
            
            await this.visitNode(current, 'visited');
        }
        
        this.updateStatus(`BFS completed. Visit order: ${visitOrder.join(' → ')}`);
    }

    // DFS Algorithm
    async depthFirstSearch() {
        const visited = new Set();
        const visitOrder = [];
        
        await this.dfsRecursive(this.startNode, visited, visitOrder);
        
        this.updateStatus(`DFS completed. Visit order: ${visitOrder.join(' → ')}`);
    }

    async dfsRecursive(node, visited, visitOrder) {
        visited.add(node.id);
        await this.visitNode(node, 'visiting');
        visitOrder.push(node.id);
        
        const neighbors = this.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor.id)) {
                // Highlight edge
                const edge = this.edges.find(e => 
                    (e.source.id === node.id && e.target.id === neighbor.id) ||
                    (e.source.id === neighbor.id && e.target.id === node.id)
                );
                if (edge) {
                    await this.highlightEdge(edge);
                }
                
                await this.dfsRecursive(neighbor, visited, visitOrder);
            }
        }
        
        await this.visitNode(node, 'visited');
    }

    // Dijkstra's Algorithm
    async dijkstraAlgorithm() {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        
        // Initialize distances
        this.nodes.forEach(node => {
            distances.set(node.id, node.id === this.startNode.id ? 0 : Infinity);
            previous.set(node.id, null);
            unvisited.add(node.id);
        });
        
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const nodeId of unvisited) {
                if (distances.get(nodeId) < minDistance) {
                    minDistance = distances.get(nodeId);
                    current = this.nodes.find(n => n.id === nodeId);
                }
            }
            
            if (!current || minDistance === Infinity) break;
            
            unvisited.delete(current.id);
            await this.visitNode(current, 'visiting');
            
            // Update distances to neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor.id)) {
                    const edge = this.edges.find(e => 
                        (e.source.id === current.id && e.target.id === neighbor.id) ||
                        (e.source.id === neighbor.id && e.target.id === current.id)
                    );
                    
                    if (edge) {
                        await this.highlightEdge(edge);
                        
                        const alt = distances.get(current.id) + edge.weight;
                        if (alt < distances.get(neighbor.id)) {
                            distances.set(neighbor.id, alt);
                            previous.set(neighbor.id, current.id);
                            
                            this.updateStatus(`Updated distance to node ${neighbor.id}: ${alt}`);
                            await this.delay();
                        }
                        
                        await this.highlightEdge(edge, false);
                    }
                }
            }
            
            await this.visitNode(current, 'visited');
        }
        
        // Display final distances
        const distanceText = Array.from(distances.entries())
            .map(([nodeId, dist]) => `${nodeId}:${dist === Infinity ? '∞' : dist}`)
            .join(', ');
        
        this.updateStatus(`Dijkstra completed. Distances from node ${this.startNode.id}: ${distanceText}`);
    }

    getNeighbors(node) {
        const neighbors = [];
        
        this.edges.forEach(edge => {
            if (edge.source.id === node.id) {
                neighbors.push(edge.target);
            } else if (edge.target.id === node.id) {
                neighbors.push(edge.source);
            }
        });
        
        return neighbors;
    }
}

// Initialize graph visualizer with better error handling and D3.js check
window.graphVisualizer = null;

document.addEventListener('DOMContentLoaded', () => {
    const maxAttempts = 20;
    let attempts = 0;
    
    const initGraphVisualizer = () => {
        if (typeof d3 !== 'undefined') {
            try {
                const graphSection = document.getElementById('graphs-section');
                window.graphVisualizer = new GraphVisualizer();
                
                // Set initial algorithm
                const defaultAlgorithm = document.querySelector('[data-graph-algorithm="bfs"]');
                if (defaultAlgorithm) defaultAlgorithm.classList.add('active');
                
            } catch (error) {
                console.error('Graph visualizer initialization error:', error);
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(initGraphVisualizer, 100);
        } else {
            console.error('Failed to load D3.js after multiple attempts');
        }
    };
    
    initGraphVisualizer();
});
