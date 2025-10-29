/**
 * Animations.js - SVG-based animations for data structure visualizations
 */

class AnimationManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svgNamespace = "http://www.w3.org/2000/svg";
        this.svg = null;
        this.width = this.container.clientWidth;
        this.height = 300;
        this.initSVG();
    }

    initSVG() {
        // Create SVG element
        this.svg = document.createElementNS(this.svgNamespace, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", this.height);
        this.svg.setAttribute("class", "animation-svg");
        this.container.appendChild(this.svg);
    }

    // Clear the SVG canvas
    clear() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    // Create animated bar for array visualization
    createBar(index, value, maxValue, total) {
        const barWidth = (this.width / total) * 0.8;
        const barHeight = (value / maxValue) * (this.height - 40);
        const x = index * (this.width / total) + (this.width / total) * 0.1;
        const y = this.height - barHeight - 20;

        const rect = document.createElementNS(this.svgNamespace, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", "url(#gradient)");
        rect.setAttribute("class", "array-bar");
        rect.setAttribute("data-index", index);
        rect.setAttribute("data-value", value);

        const text = document.createElementNS(this.svgNamespace, "text");
        text.setAttribute("x", x + barWidth / 2);
        text.setAttribute("y", this.height - 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "12px");
        text.textContent = value;

        this.svg.appendChild(rect);
        this.svg.appendChild(text);

        return { rect, text };
    }

    // Highlight bars for comparison
    highlightComparison(index1, index2) {
        const bars = this.svg.querySelectorAll(".array-bar");
        bars.forEach(bar => {
            const barIndex = parseInt(bar.getAttribute("data-index"));
            if (barIndex === index1 || barIndex === index2) {
                bar.setAttribute("fill", "#FFD700"); // Gold color for comparison
            }
        });
    }

    // Highlight bars for swap
    highlightSwap(index1, index2) {
        const bars = this.svg.querySelectorAll(".array-bar");
        bars.forEach(bar => {
            const barIndex = parseInt(bar.getAttribute("data-index"));
            if (barIndex === index1 || barIndex === index2) {
                bar.setAttribute("fill", "#FF4500"); // OrangeRed for swap
            }
        });
    }

    // Reset highlights
    resetHighlights() {
        const bars = this.svg.querySelectorAll(".array-bar");
        bars.forEach(bar => {
            bar.setAttribute("fill", "url(#gradient)");
        });
    }

    // Animate array based on current step
    animateArrayStep(array, step) {
        this.clear();
        this.createGradient();
        
        const maxValue = Math.max(...array);
        
        // Create bars for current array state
        array.forEach((value, index) => {
            this.createBar(index, value, maxValue, array.length);
        });
        
        // Highlight comparisons and swaps
        if (step) {
            if (step.comparisons && step.comparisons.length > 0) {
                step.comparisons.forEach(index => {
                    if (index >= 0 && index < array.length) {
                        this.highlightComparison(index, index);
                    }
                });
            }
            
            if (step.swaps && step.swaps.length > 0) {
                step.swaps.forEach(index => {
                    if (index >= 0 && index < array.length) {
                        this.highlightSwap(index, index);
                    }
                });
            }
        }
    }

    // Create gradient for bars
    createGradient() {
        const defs = document.createElementNS(this.svgNamespace, "defs");
        const gradient = document.createElementNS(this.svgNamespace, "linearGradient");
        gradient.setAttribute("id", "gradient");
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "0%");
        gradient.setAttribute("y2", "100%");

        const stop1 = document.createElementNS(this.svgNamespace, "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "#4F46E5");

        const stop2 = document.createElementNS(this.svgNamespace, "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "#7C3AED");

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        this.svg.appendChild(defs);
    }
}

// Export the AnimationManager class
window.AnimationManager = AnimationManager;