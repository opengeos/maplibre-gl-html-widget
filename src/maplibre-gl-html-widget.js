/**
 * MapLibre GL HTML Widget Plugin
 * Adds HTML widgets to a MapLibre GL map with optional show/hide toggle
 */

class HtmlWidget {
    /**
     * Create a new HTML widget
     * @param {Object} options - Widget configuration options
     * @param {string|HTMLElement} options.content - HTML content or DOM element
     * @param {string} [options.position='top-right'] - Widget position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
     * @param {boolean} [options.collapsible=false] - Whether the widget can be collapsed/hidden
     * @param {boolean} [options.collapsed=false] - Initial collapsed state
     * @param {string} [options.toggleIcon='☰'] - Icon to show for the toggle button
     * @param {string} [options.className=''] - Additional CSS class names
     * @param {number} [options.maxWidth] - Maximum width in pixels
     * @param {number} [options.maxHeight] - Maximum height in pixels
     */
    constructor(options = {}) {
        this._options = {
            position: 'top-right',
            collapsible: false,
            collapsed: false,
            toggleIcon: '☰',
            className: '',
            maxWidth: null,
            maxHeight: null,
            ...options
        };

        if (!this._options.content) {
            throw new Error('HtmlWidget requires content option');
        }

        this._map = null;
        this._container = null;
        this._contentElement = null;
        this._toggleButton = null;
        this._isCollapsed = this._options.collapsed;
    }

    /**
     * Called when the control is added to a map
     * @param {maplibregl.Map} map - The MapLibre GL map instance
     * @returns {HTMLElement} The control's DOM element
     */
    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl maplibregl-ctrl-html-widget';

        if (this._options.className) {
            this._container.className += ' ' + this._options.className;
        }

        // Create toggle button if collapsible
        if (this._options.collapsible) {
            this._toggleButton = document.createElement('button');
            this._toggleButton.className = 'maplibregl-ctrl-html-widget-toggle';
            this._toggleButton.type = 'button';
            this._toggleButton.setAttribute('aria-label', 'Toggle widget');
            this._toggleButton.textContent = this._options.toggleIcon;
            this._toggleButton.addEventListener('click', () => this.toggle());
            this._container.appendChild(this._toggleButton);
        }

        // Create content container
        this._contentElement = document.createElement('div');
        this._contentElement.className = 'maplibregl-ctrl-html-widget-content';

        // Set max dimensions if provided
        if (this._options.maxWidth) {
            this._contentElement.style.maxWidth = this._options.maxWidth + 'px';
        }
        if (this._options.maxHeight) {
            this._contentElement.style.maxHeight = this._options.maxHeight + 'px';
        }

        // Add content
        if (typeof this._options.content === 'string') {
            this._contentElement.innerHTML = this._options.content;
        } else if (this._options.content instanceof HTMLElement) {
            this._contentElement.appendChild(this._options.content);
        }

        // Set initial collapsed state
        if (this._isCollapsed) {
            this._contentElement.style.display = 'none';
            this._container.classList.add('collapsed');
        }

        this._container.appendChild(this._contentElement);

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
     * @returns {string} The position string
     */
    getDefaultPosition() {
        return this._options.position;
    }

    /**
     * Toggle the widget visibility
     */
    toggle() {
        if (this._isCollapsed) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Show the widget content
     */
    show() {
        if (this._contentElement) {
            this._contentElement.style.display = 'block';
            this._container.classList.remove('collapsed');
            this._isCollapsed = false;
        }
    }

    /**
     * Hide the widget content
     */
    hide() {
        if (this._contentElement) {
            this._contentElement.style.display = 'none';
            this._container.classList.add('collapsed');
            this._isCollapsed = true;
        }
    }

    /**
     * Check if the widget is currently collapsed
     * @returns {boolean} True if collapsed
     */
    isCollapsed() {
        return this._isCollapsed;
    }

    /**
     * Update the widget content
     * @param {string|HTMLElement} content - New content
     */
    setContent(content) {
        if (!this._contentElement) return;

        // Clear existing content
        this._contentElement.innerHTML = '';

        // Add new content
        if (typeof content === 'string') {
            this._contentElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this._contentElement.appendChild(content);
        }
    }

    /**
     * Get the container element
     * @returns {HTMLElement} The container element
     */
    getContainer() {
        return this._container;
    }

    /**
     * Get the content element
     * @returns {HTMLElement} The content element
     */
    getContentElement() {
        return this._contentElement;
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HtmlWidget;
}

if (typeof window !== 'undefined') {
    window.HtmlWidget = HtmlWidget;
}
