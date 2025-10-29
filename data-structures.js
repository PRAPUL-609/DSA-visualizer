// Data Structures Visualizer (Stack, Queue, and Array)
class DataStructureVisualizer {
    constructor() {
        this.currentDS = 'stack'; // 'stack', 'queue', 'circular-queue', 'deque', or 'array'
        this.stackItems = [];
        this.queueItems = [];
        this.arrayItems = [];
        this.circularQueueItems = [];
        this.circularQueueSize = 5;
        this.circularQueueFront = -1;
        this.circularQueueRear = -1;
        this.dequeItems = [];
        this.animationSpeed = 50;
        this.isAnimating = false;
        this.lastHighlightedItem = null;
        this.lastHighlightedArrayItems = [];
    }

    initialize() {
        this.initializeContainers();
        // Initialize event listeners
            this.initializeEventListeners();
            
            // Initialize circular queue event listeners
            this.initializeCircularQueueListeners();
        this.updateStatus('Select an operation to begin visualization.');
    }

    initializeContainers() {
        const containers = document.querySelectorAll('.ds-container');
        const controls = document.querySelectorAll('.controls-container');
        
        // Hide all containers and controls
        containers.forEach(container => {
            container.classList.add('hidden');
            container.style.display = 'none';
        });
        controls.forEach(control => {
            control.classList.add('hidden');
            control.style.display = 'none';
        });
        
        // Show current data structure
        const currentContainer = document.getElementById(`${this.currentDS}-container`);
        const currentControls = document.getElementById(`${this.currentDS}-controls`);
        
        if (currentContainer) {
            currentContainer.classList.remove('hidden');
            currentContainer.classList.add('active');
            currentContainer.style.display = 'flex';
        }
        if (currentControls) {
            currentControls.classList.remove('hidden');
            currentControls.style.display = 'block';
        }
        
        // Initialize visualization for current data structure
        switch (this.currentDS) {
            case 'circular-queue':
                this.renderCircularQueue();
                break;
            case 'deque':
                this.renderDeque();
                break;
        }

    }

    initializeEventListeners() {
                // Data structure selection
        const dsCards = document.querySelectorAll('[data-ds]');
            // Set initial state
            const initialDs = 'stack';
            document.getElementById(`${initialDs}-controls`)?.classList.remove('hidden');
            document.getElementById(`${initialDs}-container`)?.classList.remove('hidden');
            document.querySelector(`[data-ds="${initialDs}"]`)?.classList.add('active');
            
            dsCards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-ds');
                
                // Update card active states
                dsCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Hide all containers and controls first
                document.querySelectorAll('.controls-container').forEach(container => {
                    container.classList.remove('active');
                    container.classList.add('hidden');
                    container.style.display = 'none';
                });
                document.querySelectorAll('.ds-container').forEach(container => {
                    container.classList.remove('active');
                    container.classList.add('hidden');
                    container.style.display = 'none';
                });

                // Show selected controls and container
                const selectedControls = document.getElementById(`${type}-controls`);
                const selectedContainer = document.getElementById(`${type}-container`);
                
                if (selectedControls) {
                    selectedControls.classList.add('active');
                    selectedControls.classList.remove('hidden');
                    selectedControls.style.display = 'block';
                }
                
                if (selectedContainer) {
                    selectedContainer.classList.add('active');
                    selectedContainer.classList.remove('hidden');
                    selectedContainer.style.display = 'flex';
                }

                // Update current data structure and render
                this.currentDS = type;
                this.showDataStructureInstructions();
                
                // Initialize specific visualizations
                if (type === 'circular-queue') {
                    this.renderCircularQueue();
                } else if (type === 'deque') {
                    this.renderDeque();
                }
            });
        });

        // Queue operations
        document.getElementById('enqueue-btn')?.addEventListener('click', () => {
            const valueInput = document.getElementById('queue-value');
            const value = valueInput.value.trim();
            if (value) {
                this.enqueue(value);
                valueInput.value = '';
                valueInput.focus();
            } else {
                this.updateStatus('Please enter a value to enqueue.');
                valueInput.focus();
            }
        });

        // Add Enter key support for stack input
        document.getElementById('stack-value').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const valueInput = document.getElementById('stack-value');
                const value = valueInput.value.trim();
                if (value) {
                    this.push(value);
                    valueInput.value = '';
                } else {
                    this.updateStatus('Please enter a value to push.');
                }
                valueInput.focus();
                e.preventDefault(); // Prevent default to avoid double submission
            }
        });

        document.getElementById('push-btn')?.addEventListener('click', () => {
            const valueInput = document.getElementById('stack-value');
            const value = valueInput.value.trim();
            if (value) {
                this.push(value);
                valueInput.value = '';
                valueInput.focus();
            } else {
                this.updateStatus('Please enter a value to push.');
                valueInput.focus();
            }
        });
        // Stack search operation
        document.getElementById('search-stack-btn')?.addEventListener('click', () => {
            const searchInput = document.getElementById('stack-search');
            const value = searchInput.value.trim();
            if (value) {
                this.searchStack(value);
                searchInput.focus();
            } else {
                this.updateStatus('Please enter a value to search.');
                searchInput.focus();
            }
        });

        // Add Enter key support for stack search
        document.getElementById('stack-search')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                    this.searchStack(value);
                } else {
                    this.updateStatus('Please enter a value to search.');
                }
            }
        });

        // Queue operations
        document.getElementById('dequeue-btn')?.addEventListener('click', () => {
            this.dequeue();
        });

        document.getElementById('random-queue-btn')?.addEventListener('click', () => {
            this.generateRandomQueue();
        });

        document.getElementById('reset-queue')?.addEventListener('click', () => {
            this.resetQueue();
        });

        // Add Enter key support for queue input
        document.getElementById('queue-value')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                    this.enqueue(value);
                    e.target.value = '';
                } else {
                    this.updateStatus('Please enter a value to enqueue.');
                }
                e.target.focus();
            }
        });

        // Array operations
        const insertBtn = document.getElementById('insert-btn');
        if (insertBtn && !insertBtn.dataset.bound) {
            insertBtn.addEventListener('click', () => {
                if (this.currentDS !== 'array') return;
                
                const valueInput = document.getElementById('array-value');
                const indexInput = document.getElementById('array-index');
                const value = valueInput?.value.trim();
                const index = parseInt(indexInput?.value);
                
                if (value && !isNaN(index) && index >= 0 && index <= this.arrayItems.length) {
                    this.insertAt(value, index);
                    if (valueInput) valueInput.value = '';
                    if (indexInput) indexInput.value = '';
                    valueInput?.focus();
                } else {
                    this.updateStatus('Please enter a valid value and index.');
                    if (!value) valueInput?.focus();
                    else indexInput?.focus();
                }
            });
            insertBtn.dataset.bound = '1';
        }

        // Add Enter key support for array inputs
        document.getElementById('array-value').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                    document.getElementById('array-index').focus();
                } else {
                    this.updateStatus('Please enter a value first.');
                }
            }
        });

        document.getElementById('array-index').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const valueInput = document.getElementById('array-value');
                const value = valueInput.value.trim();
                const index = parseInt(e.target.value);
                
                if (value && !isNaN(index) && index >= 0 && index <= this.arrayItems.length) {
                    this.insertAt(value, index);
                    valueInput.value = '';
                    e.target.value = '';
                    valueInput.focus();
                } else {
                    this.updateStatus('Please enter a valid value and index.');
                }
            }
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            const indexInput = document.getElementById('array-index');
            const index = parseInt(indexInput.value);
            
            if (!isNaN(index) && index >= 0 && index < this.arrayItems.length) {
                this.deleteAt(index);
                indexInput.value = '';
                indexInput.focus();
            } else {
                this.updateStatus('Please enter a valid index to delete.');
                indexInput.focus();
            }
        });

        document.getElementById('reset-array')?.addEventListener('click', () => {
            this.resetArray();
        });

        // Array search operation
        document.getElementById('search-array-btn')?.addEventListener('click', () => {
            const searchInput = document.getElementById('array-search');
            const value = searchInput.value.trim();
            if (value) {
                this.searchArray(value);
                searchInput.focus();
            } else {
                this.updateStatus('Please enter a value to search.');
                searchInput.focus();
            }
        });

        // Add Enter key support for array search
        document.getElementById('array-search')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value) {
                    this.searchArray(value);
                } else {
                    this.updateStatus('Please enter a value to search.');
                }
            }
        });
            // Stack operations
            document.getElementById('pop-btn')?.addEventListener('click', () => {
                this.pop();
            });
            document.getElementById('random-stack-btn')?.addEventListener('click', () => {
                this.generateRandomStack();
            });
            document.getElementById('reset-stack')?.addEventListener('click', () => {
                this.resetStack();
            });
            // Array random
            document.getElementById('random-array-btn')?.addEventListener('click', () => {
                this.generateRandomArray();
            });
            // Ensure queue controls are also bound (safe fallback)
            const enqueueBtn = document.getElementById('enqueue-btn');
            const dequeueBtn = document.getElementById('dequeue-btn');
            const randomQueueBtn = document.getElementById('random-queue-btn');
            const resetQueueBtn = document.getElementById('reset-queue');
            const queueInput = document.getElementById('queue-value');

            if (enqueueBtn && !enqueueBtn.dataset.bound) {
                enqueueBtn.addEventListener('click', () => {
                    const value = (queueInput?.value || '').trim();
                    if (value) {
                        this.enqueue(value);
                        if (queueInput) { queueInput.value = ''; queueInput.focus(); }
                    } else {
                        this.updateStatus('Please enter a value to enqueue.');
                        queueInput?.focus();
                    }
                });
                enqueueBtn.dataset.bound = '1';
            }

            if (dequeueBtn && !dequeueBtn.dataset.bound) {
                dequeueBtn.addEventListener('click', () => this.dequeue());
                dequeueBtn.dataset.bound = '1';
            }

            if (randomQueueBtn && !randomQueueBtn.dataset.bound) {
                randomQueueBtn.addEventListener('click', () => {
                    console.log('Random queue button clicked');
                    this.generateRandomQueue();
                });
                randomQueueBtn.dataset.bound = '1';
                console.log('Random queue button listener added');
            }

            if (resetQueueBtn && !resetQueueBtn.dataset.bound) {
                resetQueueBtn.addEventListener('click', () => this.resetQueue());
                resetQueueBtn.dataset.bound = '1';
            }

            if (queueInput && !queueInput.dataset.bound) {
                queueInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        const value = (e.target.value || '').trim();
                        if (value) {
                            this.enqueue(value);
                            e.target.value = '';
                        } else {
                            this.updateStatus('Please enter a value to enqueue.');
                        }
                        e.target.focus();
                    }
                });
                queueInput.dataset.bound = '1';
            }
    }

    async pop() {
        if (this.isAnimating || this.stackItems.length === 0) {
            if (this.stackItems.length === 0) {
                this.updateStatus('Cannot pop from an empty stack.');
            }
            return;
        }
        
        this.isAnimating = true;
        const value = this.stackItems.pop();
        this.updateStatus(`Popping ${value} from the stack...`);
        
        const stackContainer = document.getElementById('stack-container');
        const itemElements = stackContainer.getElementsByClassName('stack-item');
        
        if (itemElements.length > 0) {
            const itemElement = itemElements[0]; // Get the top element
            
            // Animation for popping from top
            itemElement.style.transform = 'scale(0) translateY(-50px)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
            
            stackContainer.removeChild(itemElement);
        }
        
        // Update container classes based on remaining items
        stackContainer.classList.remove('many-items', 'very-many-items');
        if (this.stackItems.length > 15) {
            stackContainer.classList.add('many-items');
        }
        if (this.stackItems.length > 25) {
            stackContainer.classList.add('very-many-items');
        }
        
        this.updateStatus(`Popped ${value} from the stack. Stack size: ${this.stackItems.length}`);
        this.isAnimating = false;
    }

    resetStack() {
        if (this.isAnimating) return;
        
        this.stackItems = [];
        document.getElementById('stack-container').innerHTML = '';
        this.updateStatus('Stack has been reset.');
    }

    async push(value) {
        // Validate that input is a number
        if (isNaN(value)) {
            this.updateStatus('Please enter a valid number.');
            this.isAnimating = false;
            return;
        }
        
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        this.updateStatus(`Pushing ${value} onto the stack...`);
        this.stackItems.push(value);
        
        const stackContainer = document.getElementById('stack-container');
        
        // Add appropriate class based on number of items
        stackContainer.classList.remove('many-items', 'very-many-items');
        if (this.stackItems.length > 15) {
            stackContainer.classList.add('many-items');
        }
        if (this.stackItems.length > 25) {
            stackContainer.classList.add('very-many-items');
        }
        
        const itemElement = document.createElement('div');
        itemElement.className = 'stack-item';
        itemElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.justifyContent = 'center';
        itemElement.style.color = 'white';
        itemElement.style.fontWeight = 'bold';
        itemElement.style.transform = 'scale(0) translateY(-50px)';
        itemElement.style.transition = `all ${this.animationSpeed * 10}ms ease-out`;
        itemElement.textContent = value;
        
        stackContainer.insertBefore(itemElement, stackContainer.firstChild);
        
        // Animation
        await new Promise(resolve => setTimeout(() => {
            itemElement.style.transform = 'scale(1) translateY(0)';
            resolve();
        }, 10));
        
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        
        this.updateStatus(`Pushed ${value} onto the stack. Stack size: ${this.stackItems.length}`);
        this.isAnimating = false;
    }

    async searchStack(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Reset previous highlight if any
        if (this.lastHighlightedItem) {
            this.lastHighlightedItem.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            this.lastHighlightedItem = null;
        }

        const stackContainer = document.getElementById('stack-container');
        const items = stackContainer.getElementsByClassName('stack-item');
        const index = this.stackItems.findIndex(item => item.toString() === value);

        if (index !== -1) {
            // Calculate position from bottom (since array is in reverse order of visual stack)
            const visualIndex = items.length - 1 - index;
            const foundItem = items[visualIndex];
            
            // Highlight animation
            foundItem.style.transition = `all ${this.animationSpeed * 5}ms ease-out`;
            foundItem.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            foundItem.style.transform = 'scale(1.1) translateY(0)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
            
            foundItem.style.transform = 'scale(1) translateY(0)';
            this.lastHighlightedItem = foundItem;
            
            this.updateStatus(`Found ${value} at position ${index} from the top of the stack`);
        } else {
            // Not found animation - shake the stack
            stackContainer.style.transition = `transform ${this.animationSpeed * 2}ms ease-in-out`;
            stackContainer.style.transform = 'translateX(-10px)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 2));
            stackContainer.style.transform = 'translateX(10px)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 2));
            stackContainer.style.transform = 'translateX(0)';
            
            this.updateStatus(`Value ${value} not found in the stack`);
        }

        this.isAnimating = false;
    }

    // Queue Operations
    async enqueue(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        this.updateStatus(`Enqueueing ${value} into the queue...`);
        this.queueItems.push(value);
        
        const queueContainer = document.getElementById('queue-container');
        const itemElement = document.createElement('div');
        itemElement.className = 'queue-item';
        itemElement.style.height = '50px';
        itemElement.style.width = '80px';
        itemElement.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        itemElement.style.borderRadius = '8px';
        itemElement.style.margin = '4px';
        itemElement.style.display = 'flex';
        itemElement.style.alignItems = 'center';
        itemElement.style.justifyContent = 'center';
        itemElement.style.color = 'white';
        itemElement.style.fontWeight = 'bold';
        itemElement.style.transform = 'scale(0) translateX(-50px)';
        itemElement.style.transition = `all ${this.animationSpeed * 10}ms ease-out`;
        itemElement.textContent = value;
        
        queueContainer.appendChild(itemElement);
        
        // Animation
        await new Promise(resolve => setTimeout(() => {
            itemElement.style.transform = 'scale(1) translateX(0)';
            resolve();
        }, 10));
        
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        
        this.updateStatus(`Enqueued ${value} into the queue. Queue size: ${this.queueItems.length}`);
        this.isAnimating = false;
    }

    async dequeue() {
        if (this.isAnimating || this.queueItems.length === 0) {
            if (this.queueItems.length === 0) {
                this.updateStatus('Cannot dequeue from an empty queue.');
            }
            return;
        }
        
        this.isAnimating = true;
        const value = this.queueItems.shift();
        this.updateStatus(`Dequeuing ${value} from the queue...`);
        
        const queueContainer = document.getElementById('queue-container');
        const itemElement = queueContainer.firstChild;
        
        // Animation
        itemElement.style.transform = 'scale(0) translateX(50px)';
        
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        
        queueContainer.removeChild(itemElement);
        
        // Slide remaining items to the left
        const remainingItems = queueContainer.querySelectorAll('.queue-item');
        remainingItems.forEach(item => {
            item.style.transform = 'translateX(-84px)';
        });
        
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        
        this.updateStatus(`Dequeued ${value} from the queue. Queue size: ${this.queueItems.length}`);
        this.isAnimating = false;
    }

    async generateRandomQueue() {
        if (this.isAnimating) {
            this.updateStatus('Please wait for the current animation to finish.');
            return;
        }
        
        try {
            this.resetQueue();
            this.updateStatus('Generating random queue...');
            
            const size = Math.floor(Math.random() * 5) + 3; // 3-7 elements
            
            for (let i = 0; i < size; i++) {
                const value = Math.floor(Math.random() * 100);
                await this.enqueue(value);
                // Small delay between enqueues for visualization
                await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 5));
            }
            
            this.updateStatus(`Generated random queue with ${size} elements.`);
        } catch (error) {
            console.error('Error generating random queue:', error);
            this.updateStatus('Error generating random queue. Please try again.');
            this.resetQueue();
        }
    }

    resetQueue() {
        if (this.isAnimating) {
            this.updateStatus('Please wait for the current animation to finish.');
            return;
        }
        
        this.queueItems = [];
        const queueContainer = document.getElementById('queue-container');
        if (queueContainer) {
            queueContainer.innerHTML = '';
            this.updateStatus('Queue has been reset.');
        } else {
            console.error('Queue container not found');
            this.updateStatus('Error resetting queue.');
        }
    }

    // Array Operations
    async insertAt(value, index) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        this.updateStatus(`Inserting ${value} at index ${index}...`);
        
        // Insert into array
        this.arrayItems.splice(index, 0, value);
        
        // Render the array
        await this.renderArray(index);
        
        this.updateStatus(`Inserted ${value} at index ${index}. Array size: ${this.arrayItems.length}`);
        this.isAnimating = false;
    }

    async deleteAt(index) {
        if (this.isAnimating || this.arrayItems.length === 0) {
            if (this.arrayItems.length === 0) {
                this.updateStatus('Cannot delete from an empty array.');
            }
            return;
        }
        
        this.isAnimating = true;
        const value = this.arrayItems[index];
        this.updateStatus(`Deleting element at index ${index}...`);
        
        // Highlight the element to be deleted
        const arrayContainer = document.getElementById('array-container');
        const items = arrayContainer.querySelectorAll('.array-item');
        
        if (items[index]) {
            items[index].style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        }
        
        // Remove from array
        this.arrayItems.splice(index, 1);
        
        // Render the array
        await this.renderArray();
        
        this.updateStatus(`Deleted element at index ${index}. Array size: ${this.arrayItems.length}`);
        this.isAnimating = false;
    }

    async renderArray(highlightIndex = -1) {
        const arrayContainer = document.getElementById('array-container');
        arrayContainer.innerHTML = '';
        
        const arrayWrapper = document.createElement('div');
        arrayWrapper.className = 'array-wrapper';
        arrayWrapper.style.display = 'flex';
        arrayWrapper.style.alignItems = 'center';
        arrayWrapper.style.justifyContent = 'center';
        arrayWrapper.style.gap = '4px';
        
        for (let i = 0; i < this.arrayItems.length; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'array-item';
            itemElement.style.height = '60px';
            itemElement.style.width = '60px';
            itemElement.style.backgroundColor = i === highlightIndex ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)';
            itemElement.style.borderRadius = '8px';
            itemElement.style.display = 'flex';
            itemElement.style.flexDirection = 'column';
            itemElement.style.alignItems = 'center';
            itemElement.style.justifyContent = 'center';
            itemElement.style.color = 'white';
            itemElement.style.fontWeight = 'bold';
            itemElement.style.transform = i === highlightIndex ? 'scale(0)' : 'scale(1)';
            itemElement.style.transition = `transform ${this.animationSpeed * 10}ms ease-out, background-color ${this.animationSpeed * 5}ms ease`;
            
            // Value
            const valueDiv = document.createElement('div');
            valueDiv.textContent = this.arrayItems[i];
            itemElement.appendChild(valueDiv);
            
            // Index
            const indexDiv = document.createElement('div');
            indexDiv.textContent = i;
            indexDiv.style.fontSize = '10px';
            indexDiv.style.opacity = '0.7';
            itemElement.appendChild(indexDiv);
            
            arrayWrapper.appendChild(itemElement);
        }
        
        arrayContainer.appendChild(arrayWrapper);
        
        // Animation for the highlighted item
        if (highlightIndex >= 0 && highlightIndex < this.arrayItems.length) {
            const items = arrayContainer.querySelectorAll('.array-item');
            await new Promise(resolve => setTimeout(() => {
                items[highlightIndex].style.transform = 'scale(1)';
                resolve();
            }, 10));
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));
        }
    }

    resetArray() {
        if (this.isAnimating) return;
        
        this.arrayItems = [];
        document.getElementById('array-container').innerHTML = '';
        this.updateStatus('Array has been reset.');
    }

    async searchArray(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Reset previous highlights
        for (const item of this.lastHighlightedArrayItems) {
            item.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        }
        this.lastHighlightedArrayItems = [];

        const arrayContainer = document.getElementById('array-container');
        const items = arrayContainer.getElementsByClassName('array-item');
        const foundIndices = [];

        // Find all occurrences
        this.arrayItems.forEach((item, index) => {
            if (item.toString() === value) {
                foundIndices.push(index);
            }
        });

        if (foundIndices.length > 0) {
            // Highlight all found items
            for (const index of foundIndices) {
                const foundItem = items[index];
                foundItem.style.transition = `all ${this.animationSpeed * 5}ms ease-out`;
                foundItem.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                foundItem.style.transform = 'scale(1.1)';
                this.lastHighlightedArrayItems.push(foundItem);
            }

            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 10));

            // Reset scale but keep highlight
            for (const item of this.lastHighlightedArrayItems) {
                item.style.transform = 'scale(1)';
            }

            const positions = foundIndices.join(', ');
            this.updateStatus(`Found ${value} at position(s): ${positions}`);
        } else {
            // Not found animation - shake the array
            arrayContainer.style.transition = `transform ${this.animationSpeed * 2}ms ease-in-out`;
            arrayContainer.style.transform = 'translateX(-10px)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 2));
            arrayContainer.style.transform = 'translateX(10px)';
            
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 2));
            arrayContainer.style.transform = 'translateX(0)';
            
            this.updateStatus(`Value ${value} not found in the array`);
        }

        this.isAnimating = false;
    }

    // Random generation methods
    async generateRandomStack() {
        if (this.isAnimating) return;
        
        this.resetStack();
        this.updateStatus('Generating random stack...');
        
        const size = Math.floor(Math.random() * 5) + 3; // 3-7 elements
        
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 100);
            await this.push(value);
            // Small delay between pushes
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 5));
        }
        
        this.updateStatus(`Generated random stack with ${size} elements.`);
    }
    
    async generateRandomArray() {
        if (this.isAnimating) return;
        
        this.resetArray();
        this.updateStatus('Generating random array...');
        
        const size = Math.floor(Math.random() * 5) + 3; // 3-7 elements
        
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 100);
            await this.insertAt(value, i);
            // Small delay between insertions
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 5));
        }
        
        this.updateStatus(`Generated random array with ${size} elements.`);
    }

    // Circular Queue Operations
    async circularEnqueue(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        if ((this.circularQueueRear + 1) % this.circularQueueSize === this.circularQueueFront) {
            this.updateStatus('Queue is full! Cannot enqueue.');
            await this.showError('circular-queue-container');
            this.isAnimating = false;
            return;
        }

        if (this.circularQueueFront === -1) {
            this.circularQueueFront = 0;
        }
        this.circularQueueRear = (this.circularQueueRear + 1) % this.circularQueueSize;
        this.circularQueueItems[this.circularQueueRear] = value;

        await this.renderCircularQueue();
        this.updateStatus(`Enqueued ${value} into circular queue`);
        this.isAnimating = false;
    }

    async circularDequeue() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        if (this.circularQueueFront === -1) {
            this.updateStatus('Queue is empty! Cannot dequeue.');
            await this.showError('circular-queue-container');
            this.isAnimating = false;
            return;
        }

        const value = this.circularQueueItems[this.circularQueueFront];
        if (this.circularQueueFront === this.circularQueueRear) {
            this.circularQueueFront = -1;
            this.circularQueueRear = -1;
        } else {
            this.circularQueueFront = (this.circularQueueFront + 1) % this.circularQueueSize;
        }

        await this.renderCircularQueue();
        this.updateStatus(`Dequeued ${value} from circular queue`);
        this.isAnimating = false;
    }

    async renderCircularQueue() {
        const container = document.getElementById('circular-queue-container');
        const ring = container.querySelector('.circular-queue-ring');
        ring.innerHTML = '';

        const radius = 120;
        const centerX = 192;
        const centerY = 192;

        // Create the circular structure
        for (let i = 0; i < this.circularQueueSize; i++) {
            const angle = (i * 2 * Math.PI) / this.circularQueueSize - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const cell = document.createElement('div');
            cell.className = 'absolute w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-all duration-500';
            // Ensure text is visible on dark background
            cell.style.color = 'white';
            cell.style.fontWeight = '700';
            cell.style.fontSize = '18px';
            cell.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            cell.style.left = `${x}px`;
            cell.style.top = `${y}px`;

            if (this.circularQueueFront !== -1 && 
                ((this.circularQueueFront <= this.circularQueueRear && i >= this.circularQueueFront && i <= this.circularQueueRear) ||
                (this.circularQueueFront > this.circularQueueRear && (i >= this.circularQueueFront || i <= this.circularQueueRear)))) {
                cell.textContent = this.circularQueueItems[i];
                cell.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                cell.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
            }

            if (i === this.circularQueueFront) {
                cell.style.borderColor = '#22c55e';
                cell.style.borderWidth = '3px';
            }
            if (i === this.circularQueueRear) {
                cell.style.borderColor = '#ef4444';
                cell.style.borderWidth = '3px';
            }

            ring.appendChild(cell);
        }
    }

    async generateRandomCircularQueue() {
        if (this.isAnimating) {
            this.updateStatus('Please wait for current animation to finish.');
            return;
        }
        
        this.resetCircularQueue();
        this.updateStatus('Generating random circular queue...');
        
        const maxSize = this.circularQueueSize - 1; // Leave one space as per circular queue rule
        const size = Math.floor(Math.random() * maxSize) + 1; // At least 1 element
        
        try {
            for (let i = 0; i < size; i++) {
                const value = Math.floor(Math.random() * 99) + 1; // Random number between 1-99
                await this.circularEnqueue(value);
                await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 5));
            }
            
            this.updateStatus(`Generated random circular queue with ${size} elements.`);
        } catch (error) {
            console.error('Error generating random queue:', error);
            this.updateStatus('Error generating random queue. Please try again.');
        }
    }

    initializeCircularQueueListeners() {
        // Circular Queue value input enter key handler
        const circularQueueInput = document.getElementById('circular-queue-value');
        if (circularQueueInput && !circularQueueInput.dataset.bound) {
            circularQueueInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    const value = e.target.value.trim();
                    if (value) {
                        this.circularEnqueue(value);
                        e.target.value = '';
                    } else {
                        this.updateStatus('Please enter a value to enqueue.');
                    }
                }
            });
            circularQueueInput.dataset.bound = '1';
        }

        // Enqueue button handler
        const enqueueBtn = document.getElementById('circular-enqueue-btn');
        if (enqueueBtn && !enqueueBtn.dataset.bound) {
            enqueueBtn.addEventListener('click', () => {
                const valueInput = document.getElementById('circular-queue-value');
                const value = valueInput.value.trim();
                if (value) {
                    this.circularEnqueue(value);
                    valueInput.value = '';
                    valueInput.focus();
                } else {
                    this.updateStatus('Please enter a value to enqueue.');
                    valueInput.focus();
                }
            });
            enqueueBtn.dataset.bound = '1';
        }

        // Dequeue button handler
        const dequeueBtn = document.getElementById('circular-dequeue-btn');
        if (dequeueBtn && !dequeueBtn.dataset.bound) {
            dequeueBtn.addEventListener('click', () => this.circularDequeue());
            dequeueBtn.dataset.bound = '1';
        }

        // Random queue generation button handler
        const randomBtn = document.getElementById('random-circular-queue-btn');
        if (randomBtn && !randomBtn.dataset.bound) {
            randomBtn.addEventListener('click', () => this.generateRandomCircularQueue());
            randomBtn.dataset.bound = '1';
        }

        // Reset button handler
        const resetBtn = document.getElementById('reset-circular-queue');
        if (resetBtn && !resetBtn.dataset.bound) {
            resetBtn.addEventListener('click', () => this.resetCircularQueue());
            resetBtn.dataset.bound = '1';
        }

        // Size setting button handler
        const setSizeBtn = document.getElementById('set-circular-queue-size');
        if (setSizeBtn && !setSizeBtn.dataset.bound) {
            setSizeBtn.addEventListener('click', () => {
                const sizeInput = document.getElementById('circular-queue-size');
                const size = parseInt(sizeInput.value);
                if (!isNaN(size) && size >= 3 && size <= 10) {
                    this.setCircularQueueSize(size);
                } else {
                    this.updateStatus('Please enter a valid size between 3 and 10.');
                }
            });
            setSizeBtn.dataset.bound = '1';
        }
    }

    resetCircularQueue() {
        if (this.isAnimating) return;
        
        this.circularQueueItems = new Array(this.circularQueueSize).fill(null);
        this.circularQueueFront = -1;
        this.circularQueueRear = -1;
        this.renderCircularQueue();
        this.updateStatus('Circular queue has been reset.');
    }

    setCircularQueueSize(size) {
        if (this.isAnimating) return;
        
        this.circularQueueSize = size;
        this.resetCircularQueue();
        this.updateStatus(`Circular queue size set to ${size}`);
    }

    // Deque Operations
    async insertFront(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.dequeItems.unshift(value);
        await this.renderDeque('insertFront', value);
        this.updateStatus(`Inserted ${value} at front`);
        this.isAnimating = false;
    }

    async insertRear(value) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.dequeItems.push(value);
        await this.renderDeque('insertRear', value);
        this.updateStatus(`Inserted ${value} at rear`);
        this.isAnimating = false;
    }

    async deleteFront() {
        if (this.isAnimating || this.dequeItems.length === 0) {
            if (this.dequeItems.length === 0) {
                this.updateStatus('Deque is empty! Cannot delete from front.');
                await this.showError('deque-container');
            }
            return;
        }

        this.isAnimating = true;
        const value = this.dequeItems.shift();
        await this.renderDeque('deleteFront');
        this.updateStatus(`Deleted ${value} from front`);
        this.isAnimating = false;
    }

    async deleteRear() {
        if (this.isAnimating || this.dequeItems.length === 0) {
            if (this.dequeItems.length === 0) {
                this.updateStatus('Deque is empty! Cannot delete from rear.');
                await this.showError('deque-container');
            }
            return;
        }

        this.isAnimating = true;
        const value = this.dequeItems.pop();
        await this.renderDeque('deleteRear');
        this.updateStatus(`Deleted ${value} from rear`);
        this.isAnimating = false;
    }

    async renderDeque(operation, value) {
        const container = document.querySelector('.deque-visualization');
        container.innerHTML = '';

        // Create deque elements
        this.dequeItems.forEach((item, index) => {
            const element = document.createElement('div');
            element.className = 'deque-item inline-block mx-1 w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center transition-all duration-500';
            element.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.2)';
            element.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            // Make sure text is visible and prominent
            element.style.color = 'white';
            element.style.fontWeight = '700';
            element.style.fontSize = '18px';
            element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
            element.textContent = item;

            if (operation === 'insertFront' && index === 0 && item === value) {
                element.style.transform = 'scale(0)';
                setTimeout(() => element.style.transform = 'scale(1)', 50);
            } else if (operation === 'insertRear' && index === this.dequeItems.length - 1 && item === value) {
                element.style.transform = 'scale(0)';
                setTimeout(() => element.style.transform = 'scale(1)', 50);
            }

            container.appendChild(element);
        });

        // Update code visualization
        this.updateDequeCode(operation, value);
    }

    updateDequeCode(operation, value) {
        const codeElement = document.getElementById('deque-code');
        let code = '';
        
        switch (operation) {
            case 'insertFront':
                code = `deque.insertFront(${value}):\n  1. Create new node with value ${value}\n  2. Point new node's next to front\n  3. Update front pointer\n  4. If rear is null, update rear pointer`;
                break;
            case 'insertRear':
                code = `deque.insertRear(${value}):\n  1. Create new node with value ${value}\n  2. Point rear's next to new node\n  3. Update rear pointer\n  4. If front is null, update front pointer`;
                break;
            case 'deleteFront':
                code = `deque.deleteFront():\n  1. Store front value\n  2. Move front to next node\n  3. If front becomes null, update rear\n  4. Return stored value`;
                break;
            case 'deleteRear':
                code = `deque.deleteRear():\n  1. Store rear value\n  2. Find second last node\n  3. Update rear pointer\n  4. Return stored value`;
                break;
            default:
                code = `Deque Operations:\n- insertFront(x): Add at front\n- insertRear(x): Add at rear\n- deleteFront(): Remove from front\n- deleteRear(): Remove from rear`;
        }
        
        codeElement.textContent = code;
    }

    async generateRandomDeque() {
        if (this.isAnimating) return;
        
        this.resetDeque();
        this.updateStatus('Generating random deque...');
        
        const size = Math.floor(Math.random() * 5) + 3; // 3-7 elements
        
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 100);
            if (Math.random() < 0.5) {
                await this.insertFront(value);
            } else {
                await this.insertRear(value);
            }
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed * 5));
        }
        
        this.updateStatus(`Generated random deque with ${size} elements.`);
    }

    resetDeque() {
        if (this.isAnimating) return;
        
        this.dequeItems = [];
        this.renderDeque();
        this.updateStatus('Deque has been reset.');
    }

    async showError(containerId) {
        const container = document.getElementById(containerId);
        container.classList.add('shake');
        await new Promise(resolve => setTimeout(resolve, 500));
        container.classList.remove('shake');
    }

    async generateRandomArray() {
    }

    updateStatus(message) {
        document.getElementById('ds-status').textContent = message;
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dataStructureVisualizer = new DataStructureVisualizer();
    window.dataStructureVisualizer.initialize();
});