/**
 * MapLibre GL Colorbar Widget
 * A matplotlib-style colorbar widget for MapLibre GL maps
 */

class ColorbarWidget {
    /**
     * Create a new Colorbar widget
     * @param {Object} options - Colorbar configuration options
     * @param {number} [options.vmin=0] - Minimum value
     * @param {number} [options.vmax=100] - Maximum value
     * @param {string|Array} [options.cmap='viridis'] - Colormap name or array of colors
     * @param {string} [options.title=''] - Colorbar title
     * @param {string} [options.label=''] - Label for the colorbar
     * @param {string} [options.orientation='vertical'] - 'vertical' or 'horizontal'
     * @param {number} [options.width=30] - Width in pixels (for vertical) or height (for horizontal)
     * @param {number} [options.height=200] - Height in pixels (for vertical) or width (for horizontal)
     * @param {number} [options.tickCount=5] - Number of ticks to display
     * @param {number} [options.decimals=1] - Number of decimal places for tick labels
     * @param {string} [options.position='bottom-right'] - Widget position
     * @param {boolean} [options.collapsible=false] - Whether the widget can be collapsed
     * @param {boolean} [options.collapsed=false] - Initial collapsed state
     * @param {string} [options.toggleIcon='☰'] - Icon for toggle button
     * @param {string} [options.className=''] - Additional CSS class names
     */
    constructor(options = {}) {
        this._options = {
            vmin: 0,
            vmax: 100,
            cmap: 'viridis',
            title: '',
            label: '',
            orientation: 'vertical',
            width: 30,
            height: 200,
            tickCount: 5,
            decimals: 1,
            position: 'bottom-right',
            collapsible: false,
            collapsed: false,
            toggleIcon: '☰',
            className: '',
            ...options
        };

        this._map = null;
        this._container = null;
        this._canvas = null;
        this._isCollapsed = this._options.collapsed;

        // Built-in colormaps
        this._colormaps = {
            viridis: ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde724'],
            plasma: ['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
            inferno: ['#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60', '#cf4446', '#ed6925', '#fb9b06', '#f7d03c', '#fcffa4'],
            magma: ['#000004', '#180f3d', '#440f76', '#721f81', '#9e2f7f', '#cd4071', '#f1605d', '#fd9668', '#feca8d', '#fcfdbf'],
            turbo: ['#30123b', '#455eb9', '#4390c7', '#40bfb9', '#5ee9a9', '#a3f96f', '#e1e323', '#fb912a', '#df2935', '#b11226'],
            jet: ['#000080', '#0000ff', '#0080ff', '#00ffff', '#80ff80', '#ffff00', '#ff8000', '#ff0000', '#800000'],
            rainbow: ['#9400d3', '#4b0082', '#0000ff', '#00ff00', '#ffff00', '#ff7f00', '#ff0000'],
            coolwarm: ['#3b4cc0', '#6788ee', '#9abbff', '#c9d7f0', '#edd1c2', '#f7a889', '#e26952', '#b40426'],
            rdylgn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
            spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
            rdbu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
            greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
            blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
            reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
            grays: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000']
        };
    }

    /**
     * Get colors from colormap
     * @private
     */
    _getColors() {
        if (Array.isArray(this._options.cmap)) {
            return this._options.cmap;
        }
        return this._colormaps[this._options.cmap] || this._colormaps.viridis;
    }

    /**
     * Interpolate between colors
     * @private
     */
    _interpolateColor(color1, color2, factor) {
        const c1 = this._hexToRgb(color1);
        const c2 = this._hexToRgb(color2);
        const r = Math.round(c1.r + factor * (c2.r - c1.r));
        const g = Math.round(c1.g + factor * (c2.g - c1.g));
        const b = Math.round(c1.b + factor * (c2.b - c1.b));
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Convert hex color to RGB
     * @private
     */
    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Draw the colorbar on canvas
     * @private
     */
    _drawColorbar() {
        if (!this._canvas) return;

        const ctx = this._canvas.getContext('2d');
        const colors = this._getColors();
        const isVertical = this._options.orientation === 'vertical';

        // Use canvas dimensions directly
        const canvasWidth = this._canvas.width;
        const canvasHeight = this._canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw gradient
        if (isVertical) {
            // Vertical gradient (bottom to top)
            // Canvas is: width (thin) x height (long)
            for (let i = 0; i < canvasHeight; i++) {
                const position = i / canvasHeight;
                const colorIndex = position * (colors.length - 1);
                const lowerIndex = Math.floor(colorIndex);
                const upperIndex = Math.ceil(colorIndex);
                const factor = colorIndex - lowerIndex;

                const color = lowerIndex === upperIndex
                    ? colors[lowerIndex]
                    : this._interpolateColor(colors[lowerIndex], colors[upperIndex], factor);

                ctx.fillStyle = color;
                // Draw from bottom to top (reverse the colors)
                ctx.fillRect(0, canvasHeight - i - 1, canvasWidth, 1);
            }
        } else {
            // Horizontal gradient (left to right)
            // Canvas is: width (long) x height (thin)
            for (let i = 0; i < canvasWidth; i++) {
                const position = i / canvasWidth;
                const colorIndex = position * (colors.length - 1);
                const lowerIndex = Math.floor(colorIndex);
                const upperIndex = Math.ceil(colorIndex);
                const factor = colorIndex - lowerIndex;

                const color = lowerIndex === upperIndex
                    ? colors[lowerIndex]
                    : this._interpolateColor(colors[lowerIndex], colors[upperIndex], factor);

                ctx.fillStyle = color;
                // Draw from left to right
                ctx.fillRect(i, 0, 1, canvasHeight);
            }
        }

        // Draw border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    }

    /**
     * Create tick labels
     * @private
     */
    _createTickLabels() {
        const tickContainer = document.createElement('div');
        tickContainer.className = 'colorbar-ticks';

        const isVertical = this._options.orientation === 'vertical';
        const range = this._options.vmax - this._options.vmin;
        const step = range / (this._options.tickCount - 1);

        for (let i = 0; i < this._options.tickCount; i++) {
            const value = this._options.vmax - (i * step);
            const tick = document.createElement('div');
            tick.className = 'colorbar-tick';
            tick.textContent = value.toFixed(this._options.decimals);

            if (isVertical) {
                tick.style.top = `${(i / (this._options.tickCount - 1)) * 100}%`;
            } else {
                tick.style.left = `${((this._options.tickCount - 1 - i) / (this._options.tickCount - 1)) * 100}%`;
            }

            tickContainer.appendChild(tick);
        }

        return tickContainer;
    }

    /**
     * Called when the control is added to a map
     */
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl colorbar-widget';

        if (this._options.className) {
            this._container.className += ' ' + this._options.className;
        }

        if (this._options.orientation === 'horizontal') {
            this._container.classList.add('colorbar-horizontal');
        } else {
            this._container.classList.add('colorbar-vertical');
        }

        // Create toggle button if collapsible
        if (this._options.collapsible) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'colorbar-toggle';
            toggleButton.type = 'button';
            toggleButton.setAttribute('aria-label', 'Toggle colorbar');
            toggleButton.textContent = this._options.toggleIcon;
            toggleButton.addEventListener('click', () => this.toggle());
            this._container.appendChild(toggleButton);
        }

        // Create content container
        const contentElement = document.createElement('div');
        contentElement.className = 'colorbar-content';

        // Add title if provided
        if (this._options.title) {
            const title = document.createElement('div');
            title.className = 'colorbar-title';
            title.textContent = this._options.title;
            contentElement.appendChild(title);
        }

        // Create colorbar container
        const colorbarContainer = document.createElement('div');
        colorbarContainer.className = 'colorbar-container';

        // Create canvas
        const isVertical = this._options.orientation === 'vertical';
        this._canvas = document.createElement('canvas');
        this._canvas.className = 'colorbar-canvas';
        // For vertical: width x height, for horizontal: height (becomes width) x width (becomes height)
        if (isVertical) {
            this._canvas.width = this._options.width;
            this._canvas.height = this._options.height;
        } else {
            this._canvas.width = this._options.height;
            this._canvas.height = this._options.width;
        }
        colorbarContainer.appendChild(this._canvas);

        // Add tick labels
        const tickLabels = this._createTickLabels();
        colorbarContainer.appendChild(tickLabels);

        contentElement.appendChild(colorbarContainer);

        // Add label if provided
        if (this._options.label) {
            const label = document.createElement('div');
            label.className = 'colorbar-label';
            label.textContent = this._options.label;
            contentElement.appendChild(label);
        }

        // Set initial collapsed state
        if (this._isCollapsed) {
            contentElement.style.display = 'none';
            this._container.classList.add('collapsed');
        }

        this._container.appendChild(contentElement);

        // Draw the colorbar
        this._drawColorbar();

        return this._container;
    }

    /**
     * Called when the control is removed from a map
     */
    onRemove() {
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
        this._map = null;
    }

    /**
     * Get the default position for the control
     */
    getDefaultPosition() {
        return this._options.position;
    }

    /**
     * Toggle the colorbar visibility
     */
    toggle() {
        if (this._isCollapsed) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Show the colorbar
     */
    show() {
        const content = this._container.querySelector('.colorbar-content');
        if (content) {
            content.style.display = 'block';
            this._container.classList.remove('collapsed');
            this._isCollapsed = false;
        }
    }

    /**
     * Hide the colorbar
     */
    hide() {
        const content = this._container.querySelector('.colorbar-content');
        if (content) {
            content.style.display = 'none';
            this._container.classList.add('collapsed');
            this._isCollapsed = true;
        }
    }

    /**
     * Update colorbar properties
     * @param {Object} options - Options to update
     */
    update(options = {}) {
        // Check if orientation is changing
        const orientationChanged = 'orientation' in options && options.orientation !== this._options.orientation;

        // Update options
        Object.assign(this._options, options);

        // If orientation changed, update canvas dimensions and container classes
        if (orientationChanged && this._canvas) {
            const isVertical = this._options.orientation === 'vertical';

            // Update canvas dimensions
            if (isVertical) {
                this._canvas.width = this._options.width;
                this._canvas.height = this._options.height;
            } else {
                this._canvas.width = this._options.height;
                this._canvas.height = this._options.width;
            }

            // Update container classes
            if (isVertical) {
                this._container.classList.remove('colorbar-horizontal');
                this._container.classList.add('colorbar-vertical');
            } else {
                this._container.classList.remove('colorbar-vertical');
                this._container.classList.add('colorbar-horizontal');
            }
        }

        // Redraw colorbar
        this._drawColorbar();

        // Update tick labels
        const oldTicks = this._container.querySelector('.colorbar-ticks');
        if (oldTicks) {
            const newTicks = this._createTickLabels();
            oldTicks.parentNode.replaceChild(newTicks, oldTicks);
        }

        // Update title
        if ('title' in options) {
            const titleElement = this._container.querySelector('.colorbar-title');
            if (this._options.title && !titleElement) {
                const title = document.createElement('div');
                title.className = 'colorbar-title';
                title.textContent = this._options.title;
                const content = this._container.querySelector('.colorbar-content');
                content.insertBefore(title, content.firstChild);
            } else if (titleElement) {
                if (this._options.title) {
                    titleElement.textContent = this._options.title;
                } else {
                    titleElement.remove();
                }
            }
        }

        // Update label
        if ('label' in options) {
            const labelElement = this._container.querySelector('.colorbar-label');
            if (this._options.label && !labelElement) {
                const label = document.createElement('div');
                label.className = 'colorbar-label';
                label.textContent = this._options.label;
                this._container.querySelector('.colorbar-content').appendChild(label);
            } else if (labelElement) {
                if (this._options.label) {
                    labelElement.textContent = this._options.label;
                } else {
                    labelElement.remove();
                }
            }
        }
    }

    /**
     * Get available colormap names
     * @returns {string[]} Array of colormap names
     */
    getColormapNames() {
        return Object.keys(this._colormaps);
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorbarWidget;
}

if (typeof window !== 'undefined') {
    window.ColorbarWidget = ColorbarWidget;
}
