// Sorting Algorithms Visualizer
class SortingVisualizer {
    constructor(containerId = 'sorting-visualization') {
        this.array = [];
        this.isRunning = false;
        this.isPaused = false;
        this.currentAlgorithm = 'bubble';
        this.speed = 50;
        this.size = 50;
        this.animationId = null;
        this.containerId = containerId;
        this.metrics = {
            comparisons: 0,
            swaps: 0,
            startTime: 0,
            endTime: 0
        };
        this.animator = new AnimationManager(containerId);
        
        this.initializeEventListeners();
        this.generateArray();
    }
    
    // Static method to create comparison visualizers
    static initializeComparisonMode() {
        // Create two visualizer instances
        const visualizer1 = new SortingVisualizer('visualization1');
        const visualizer2 = new SortingVisualizer('visualization2');
        
        // Use the same array for both visualizers
        const sharedArray = visualizer1.array;
        visualizer2.array = [...sharedArray];
        
        // Set different algorithms
        visualizer1.currentAlgorithm = document.getElementById('algorithm1').value;
        visualizer2.currentAlgorithm = document.getElementById('algorithm2').value;
        
        // Update visualizations
        visualizer1.updateBars();
        visualizer2.updateBars();
        
        return [visualizer1, visualizer2];
    }
    
    updateBars() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '';

        for (let i = 0; i < this.array.length; i++) {
            const value = this.array[i];
            const bar = document.createElement('div');
            bar.className = 'array-bar bg-blue-500';
            bar.style.height = `${value}px`;
            bar.style.width = `${Math.max(800 / this.array.length - 2, 4)}px`;
            bar.style.display = 'inline-block';
            bar.style.margin = '0 1px';
            bar.textContent = value < 50 ? '' : value;
            bar.style.color = 'white';
            bar.style.fontSize = '10px';
            bar.style.textAlign = 'center';
            bar.style.lineHeight = `${value}px`;
            
            container.appendChild(bar);
        }
    }
    
    // Run comparison between two algorithms
    static async runComparison(visualizer1, visualizer2) {
        // Reset metrics
        visualizer1.resetMetrics();
        visualizer2.resetMetrics();
        
        // Start timing
        visualizer1.metrics.startTime = performance.now();
        visualizer2.metrics.startTime = performance.now();
        
        // Run both algorithms simultaneously
        await Promise.all([
            visualizer1.startSorting(true),
            visualizer2.startSorting(true)
        ]);
        
        // Display final metrics
        visualizer1.displayMetrics('metrics1');
        visualizer2.displayMetrics('metrics2');
    }

    initializeEventListeners() {
        // Algorithm selection
        document.querySelectorAll('[data-algorithm]').forEach(card => {
            card.addEventListener('click', () => {
                if (this.isRunning) return;
                
                // Remove active class from all cards
                document.querySelectorAll('[data-algorithm]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                this.currentAlgorithm = card.dataset.algorithm;
                this.updateAlgorithmInfo();
            });
        });

        // Control buttons
        document.getElementById('generate-array').addEventListener('click', () => {
            if (!this.isRunning) this.generateArray();
        });

        document.getElementById('start-sort').addEventListener('click', () => {
            if (!this.isRunning) this.startSorting();
        });

        document.getElementById('pause-sort').addEventListener('click', () => {
            this.pauseSorting();
        });

        document.getElementById('reset-sort').addEventListener('click', () => {
            this.resetSorting();
        });
        
        // Step-by-step controls
        document.getElementById('prev-step').addEventListener('click', () => {
            this.prevStep();
        });
        
        document.getElementById('next-step').addEventListener('click', () => {
            this.nextStep();
        });
        
        // Custom array input
        document.getElementById('custom-array-btn').addEventListener('click', () => {
            this.showCustomArrayInput();
        });
        
        document.getElementById('submit-custom-array').addEventListener('click', () => {
            this.processCustomArray();
        });

        // Sliders
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });

        document.getElementById('size-slider').addEventListener('input', (e) => {
            if (!this.isRunning) {
                this.size = parseInt(e.target.value);
                this.generateArray();
            }
        });
    }

    generateArray() {
        this.array = [];
        const container = document.getElementById('sorting-visualization');
        container.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            const value = Math.floor(Math.random() * 300) + 10;
            this.array.push(value);

            const bar = document.createElement('div');
            bar.className = 'array-bar bg-blue-500';
            bar.style.height = `${value}px`;
            bar.style.width = `${Math.max(800 / this.size - 2, 4)}px`;
            bar.style.display = 'inline-block';
            bar.style.margin = '0 1px';
            bar.textContent = value < 50 ? '' : value;
            bar.style.color = 'white';
            bar.style.fontSize = '10px';
            bar.style.textAlign = 'center';
            bar.style.lineHeight = `${value}px`;
            
            container.appendChild(bar);
        }
    }

    async startSorting(isComparison = false) {
        if (this.isRunning && !isComparison) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        // Reset metrics
        this.resetMetrics();
        this.metrics.startTime = performance.now();
        
        // Update button states if not in comparison mode
        if (!isComparison) {
            document.getElementById('start-sort').disabled = true;
            document.getElementById('pause-sort').disabled = false;
            document.getElementById('generate-array').disabled = true;
        }

        try {
            switch (this.currentAlgorithm) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'quick':
                    await this.quickSort(0, this.array.length - 1);
                    break;
                case 'merge':
                    await this.mergeSort(0, this.array.length - 1);
                    break;
                case 'heap':
                    await this.heapSort();
                    break;
            }
            
            // Mark all as sorted
            this.markAllSorted();
        } catch (error) {
            console.error('Sorting error:', error);
        }

        // Record end time
        this.metrics.endTime = performance.now();
        
        this.isRunning = false;
        
        // Update button states if not in comparison mode
        if (!isComparison) {
            document.getElementById('start-sort').disabled = false;
            document.getElementById('pause-sort').disabled = true;
            document.getElementById('generate-array').disabled = false;
        }
        
        // Display metrics if in comparison mode
        if (isComparison) {
            const metricsId = this.containerId === 'visualization1' ? 'metrics1' : 'metrics2';
            this.displayMetrics(metricsId);
        }
    }

    pauseSorting() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-sort').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    resetSorting() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        document.getElementById('start-sort').disabled = false;
        document.getElementById('pause-sort').disabled = true;
        document.getElementById('pause-sort').textContent = 'Pause';
        document.getElementById('generate-array').disabled = false;
        document.getElementById('prev-step').disabled = true;
        document.getElementById('next-step').disabled = true;
        
        this.generateArray();
    }
    
    // Step-by-step execution methods
    async fetchSortingSteps() {
        try {
            const response = await fetch('http://localhost:8000/api/sort', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    array: this.array,
                    algorithm: this.currentAlgorithm
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch sorting steps');
            }
            
            this.sortingSteps = await response.json();
            this.currentStepIndex = -1;
            
            // Enable step controls
            document.getElementById('next-step').disabled = false;
            document.getElementById('prev-step').disabled = true;
            
            // Display algorithm info
            this.fetchAlgorithmComplexity();
            
            return this.sortingSteps;
        } catch (error) {
            console.error('Error fetching sorting steps:', error);
            // Fallback to client-side sorting if API fails
            this.startSorting();
        }
    }
    
    nextStep() {
        if (!this.sortingSteps || this.currentStepIndex >= this.sortingSteps.length - 1) return;
        
        this.currentStepIndex++;
        this.visualizeStep(this.sortingSteps[this.currentStepIndex]);
        
        // Update button states
        document.getElementById('prev-step').disabled = false;
        document.getElementById('next-step').disabled = this.currentStepIndex >= this.sortingSteps.length - 1;
        
        // Update step counter
        this.updateStepCounter();
    }
    
    prevStep() {
        if (!this.sortingSteps || this.currentStepIndex <= 0) return;
        
        this.currentStepIndex--;
        this.visualizeStep(this.sortingSteps[this.currentStepIndex]);
        
        // Update button states
        document.getElementById('prev-step').disabled = this.currentStepIndex <= 0;
        document.getElementById('next-step').disabled = false;
        
        // Update step counter
        this.updateStepCounter();
    }
    
    visualizeStep(step) {
        // Reset all bars to default state
        const bars = document.querySelectorAll(`#${this.containerId} .array-bar`);
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'swapping', 'sorted');
        });
        
        // Update array and bar heights
        this.array = [...step.array];
        this.updateBars();
        
        // Use animator to visualize the step
        this.animator.animateArrayStep(this.array, {
            comparisons: step.comparisons || [],
            swaps: step.swaps || []
        });
        
        // Display step description
        document.getElementById('step-description').textContent = step.description;
    }
    
    updateStepCounter() {
        const stepCounter = document.getElementById('step-counter');
        if (stepCounter && this.sortingSteps) {
            stepCounter.textContent = `Step ${this.currentStepIndex + 1} of ${this.sortingSteps.length}`;
        }
    }
    
    async fetchAlgorithmComplexity() {
        try {
            const response = await fetch('http://localhost:8000/api/algorithms/complexity');
            if (!response.ok) {
                throw new Error('Failed to fetch algorithm complexity');
            }
            
            const complexityData = await response.json();
            this.displayComplexityInfo(complexityData[this.currentAlgorithm]);
        } catch (error) {
            console.error('Error fetching algorithm complexity:', error);
        }
    }
    
    displayComplexityInfo(complexity) {
        if (!complexity) return;
        
        const complexityInfo = document.getElementById('complexity-info');
        if (complexityInfo) {
            complexityInfo.innerHTML = `
                <div class="mt-4 p-4 bg-white/10 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Time & Space Complexity</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>Best Case:</div>
                        <div>${complexity.time_best}</div>
                        <div>Average Case:</div>
                        <div>${complexity.time_average}</div>
                        <div>Worst Case:</div>
                        <div>${complexity.time_worst}</div>
                        <div>Space:</div>
                        <div>${complexity.space}</div>
                        <div>Stable:</div>
                        <div>${complexity.stable ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Custom array input methods
    showCustomArrayInput() {
        const modal = document.getElementById('custom-array-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    processCustomArray() {
        const input = document.getElementById('custom-array-input').value;
        try {
            // Parse input - accept comma-separated or space-separated values
            const parsedArray = input.split(/[\s,]+/).map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
            
            if (parsedArray.length < 2) {
                throw new Error('Please enter at least 2 valid numbers');
            }
            
            // Update array and visualize
            this.array = parsedArray;
            this.updateBars();
            
            // Close modal
            document.getElementById('custom-array-modal').classList.add('hidden');
            
            // Reset sorting state
            this.resetSorting();
        } catch (error) {
            alert(error.message || 'Invalid input. Please enter numbers separated by commas or spaces.');
        }
    }

    async delay() {
        const delayTime = 101 - this.speed;
        return new Promise(resolve => {
            const wait = () => {
                if (this.isPaused) {
                    setTimeout(wait, 100);
                } else {
                    setTimeout(resolve, delayTime);
                }
            };
            wait();
        });
    }

    async swap(i, j) {
        const bars = document.querySelectorAll('.array-bar');
        
        // Visual swap animation
        bars[i].classList.add('swapping');
        bars[j].classList.add('swapping');
        
        await this.delay();
        
        // Swap in array
        [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
        
        // Update visual heights
        bars[i].style.height = `${this.array[i]}px`;
        bars[j].style.height = `${this.array[j]}px`;
        bars[i].textContent = this.array[i] < 50 ? '' : this.array[i];
        bars[j].textContent = this.array[j] < 50 ? '' : this.array[j];
        bars[i].style.lineHeight = `${this.array[i]}px`;
        bars[j].style.lineHeight = `${this.array[j]}px`;
        
        bars[i].classList.remove('swapping');
        bars[j].classList.remove('swapping');
    }

    async compare(i, j) {
        const bars = document.querySelectorAll('.array-bar');
        bars[i].classList.add('comparing');
        bars[j].classList.add('comparing');
        
        await this.delay();
        
        bars[i].classList.remove('comparing');
        bars[j].classList.remove('comparing');
        
        return this.array[i] > this.array[j];
    }

    markSorted(index) {
        const bars = document.querySelectorAll('.array-bar');
        bars[index].classList.add('sorted');
    }

    markAllSorted() {
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(bar => bar.classList.add('sorted'));
    }

    // Bubble Sort
    async bubbleSort(isComparison = false) {
        const n = this.array.length;
        
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Track comparison
                this.metrics.comparisons++;
                
                if (await this.compare(j, j + 1)) {
                    // Track swap
                    this.metrics.swaps++;
                    await this.swap(j, j + 1);
                }
            }
            this.markSorted(n - 1 - i);
        }
        this.markSorted(0);
    }

    // Quick Sort
    async quickSort(low, high) {
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.array[high];
        let i = low - 1;

        for (let j = low; j < high; j++) {
            const bars = document.querySelectorAll('.array-bar');
            bars[j].classList.add('comparing');
            bars[high].classList.add('comparing');
            
            await this.delay();
            
            if (this.array[j] < pivot) {
                i++;
                await this.swap(i, j);
            }
            
            bars[j].classList.remove('comparing');
            bars[high].classList.remove('comparing');
        }
        
        await this.swap(i + 1, high);
        return i + 1;
    }

    // Merge Sort
    async mergeSort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            await this.mergeSort(left, mid);
            await this.mergeSort(mid + 1, right);
            await this.merge(left, mid, right);
        }
    }

    async merge(left, mid, right) {
        const leftArr = this.array.slice(left, mid + 1);
        const rightArr = this.array.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            const bars = document.querySelectorAll('.array-bar');
            bars[k].classList.add('comparing');
            
            await this.delay();
            
            if (leftArr[i] <= rightArr[j]) {
                this.array[k] = leftArr[i];
                i++;
            } else {
                this.array[k] = rightArr[j];
                j++;
            }
            
            bars[k].style.height = `${this.array[k]}px`;
            bars[k].textContent = this.array[k] < 50 ? '' : this.array[k];
            bars[k].style.lineHeight = `${this.array[k]}px`;
            bars[k].classList.remove('comparing');
            k++;
        }
        
        while (i < leftArr.length) {
            this.array[k] = leftArr[i];
            const bars = document.querySelectorAll('.array-bar');
            bars[k].style.height = `${this.array[k]}px`;
            bars[k].textContent = this.array[k] < 50 ? '' : this.array[k];
            bars[k].style.lineHeight = `${this.array[k]}px`;
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            this.array[k] = rightArr[j];
            const bars = document.querySelectorAll('.array-bar');
            bars[k].style.height = `${this.array[k]}px`;
            bars[k].textContent = this.array[k] < 50 ? '' : this.array[k];
            bars[k].style.lineHeight = `${this.array[k]}px`;
            j++;
            k++;
        }
    }

    // Heap Sort
    async heapSort() {
        const n = this.array.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0; i--) {
            await this.swap(0, i);
            this.markSorted(i);
            await this.heapify(i, 0);
        }
        this.markSorted(0);
    }

    async heapify(n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n && this.array[left] > this.array[largest]) {
            largest = left;
        }
        
        if (right < n && this.array[right] > this.array[largest]) {
            largest = right;
        }
        
        if (largest !== i) {
            await this.swap(i, largest);
            await this.heapify(n, largest);
        }
    }

    updateAlgorithmInfo() {
        const info = {
            bubble: {
                name: "Bubble Sort",
                description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
                timeComplexity: "O(n²)",
                spaceComplexity: "O(1)",
                stable: "Yes",
                inPlace: "Yes"
            },
            quick: {
                name: "Quick Sort",
                description: "Divides the array into partitions around a pivot element, then recursively sorts the partitions.",
                timeComplexity: "O(n log n) average, O(n²) worst",
                spaceComplexity: "O(log n)",
                stable: "No",
                inPlace: "Yes"
            },
            merge: {
                name: "Merge Sort",
                description: "Divides the array into halves, recursively sorts them, then merges the sorted halves.",
                timeComplexity: "O(n log n)",
                spaceComplexity: "O(n)",
                stable: "Yes",
                inPlace: "No"
            },
            heap: {
                name: "Heap Sort",
                description: "Builds a max heap from the array, then repeatedly extracts the maximum element.",
                timeComplexity: "O(n log n)",
                spaceComplexity: "O(1)",
                stable: "No",
                inPlace: "Yes"
            }
        };

        const current = info[this.currentAlgorithm];
        document.getElementById('algorithm-details').innerHTML = `
            <div class="space-y-2">
                <h4 class="font-bold text-lg">${current.name}</h4>
                <p class="mb-3">${current.description}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Time Complexity:</strong> ${current.timeComplexity}</div>
                    <div><strong>Space Complexity:</strong> ${current.spaceComplexity}</div>
                    <div><strong>Stable:</strong> ${current.stable}</div>
                    <div><strong>In-Place:</strong> ${current.inPlace}</div>
                </div>
            </div>
        `;
    }
}

// Initialize sorting visualizer when DOM is loaded
let sortingVisualizer;
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
        try {
            sortingVisualizer = new SortingVisualizer();
            // Set initial algorithm info
            sortingVisualizer.updateAlgorithmInfo();
            // Add active class to default algorithm
            const defaultAlgorithm = document.querySelector('[data-algorithm="bubble"]');
            if (defaultAlgorithm) {
                defaultAlgorithm.classList.add('active');
            }
        } catch (error) {
            console.error('Failed to initialize sorting visualizer:', error);
        }
    }, 100);
});

// Export for global access
window.sortingVisualizer = sortingVisualizer;
