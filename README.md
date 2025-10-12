# MapLibre GL HTML Widget

A flexible plugin for [MapLibre GL JS](https://maplibre.org/) that allows you to add customizable HTML widgets to your map with optional show/hide toggle functionality.

## Features

- Add any HTML content to your map as a widget
- **Matplotlib-style colorbar widget** with support for colormaps, vmin/vmax, title, and more
- Position widgets in any corner of the map
- Optional collapsible/expandable functionality with a toggle button
- Customizable styling
- Programmatic control over widget visibility
- Dynamic content updates
- Lightweight and easy to use

## Installation

### Using npm

```bash
npm install maplibre-gl-html-widget
```

### Using a CDN

```html
<link rel="stylesheet" href="path/to/maplibre-gl-html-widget.css">
<script src="path/to/maplibre-gl-html-widget.js"></script>
```

## Usage

### Basic Example

```javascript
import maplibregl from 'maplibre-gl';
import HtmlWidget from 'maplibre-gl-html-widget';
import 'maplibre-gl-html-widget/src/maplibre-gl-html-widget.css';

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 0],
    zoom: 2
});

// Create a simple widget
const widget = new HtmlWidget({
    content: '<h3>My Widget</h3><p>This is a custom HTML widget!</p>',
    position: 'top-right'
});

map.addControl(widget);
```

### Collapsible Widget

```javascript
const collapsibleWidget = new HtmlWidget({
    content: `
        <h3>Legend</h3>
        <ul>
            <li>🔴 Category A</li>
            <li>🔵 Category B</li>
            <li>🟢 Category C</li>
        </ul>
    `,
    position: 'bottom-right',
    collapsible: true,
    collapsed: false,  // Start expanded
    toggleIcon: '≡'    // Custom toggle icon
});

map.addControl(collapsibleWidget);
```

### Using DOM Elements

```javascript
// Create a DOM element
const element = document.createElement('div');
element.innerHTML = `
    <h3>Interactive Widget</h3>
    <button id="my-button">Click me!</button>
`;

const widget = new HtmlWidget({
    content: element,
    position: 'top-left',
    maxWidth: 300,
    maxHeight: 200
});

map.addControl(widget);

// Add event listeners
document.getElementById('my-button').addEventListener('click', () => {
    alert('Button clicked!');
});
```

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `content` | `string\|HTMLElement` | **required** | HTML string or DOM element to display |
| `position` | `string` | `'top-right'` | Widget position: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` |
| `collapsible` | `boolean` | `false` | Whether the widget can be collapsed/expanded |
| `collapsed` | `boolean` | `false` | Initial collapsed state (only if `collapsible` is `true`) |
| `toggleIcon` | `string` | `'☰'` | Icon/text to show in the toggle button |
| `className` | `string` | `''` | Additional CSS class name(s) for the widget container |
| `maxWidth` | `number` | `null` | Maximum width in pixels |
| `maxHeight` | `number` | `null` | Maximum height in pixels |

### Methods

#### `toggle()`
Toggle the widget between collapsed and expanded states.

```javascript
widget.toggle();
```

#### `show()`
Show the widget content (expand if collapsed).

```javascript
widget.show();
```

#### `hide()`
Hide the widget content (collapse).

```javascript
widget.hide();
```

#### `isCollapsed()`
Check if the widget is currently collapsed.

```javascript
const collapsed = widget.isCollapsed();
```

#### `setContent(content)`
Update the widget content dynamically.

```javascript
widget.setContent('<h3>Updated!</h3><p>New content here.</p>');
```

#### `getContainer()`
Get the widget's container DOM element.

```javascript
const container = widget.getContainer();
```

#### `getContentElement()`
Get the widget's content DOM element.

```javascript
const contentEl = widget.getContentElement();
```

## Styling

The plugin comes with default styles, but you can customize them by targeting these CSS classes:

- `.maplibregl-ctrl-html-widget` - Main container
- `.maplibregl-ctrl-html-widget-toggle` - Toggle button
- `.maplibregl-ctrl-html-widget-content` - Content container
- `.maplibregl-ctrl-html-widget.collapsed` - Collapsed state

### Custom Styling Example

```css
.maplibregl-ctrl-html-widget {
    background: #f0f0f0;
    border: 2px solid #333;
}

.maplibregl-ctrl-html-widget-toggle {
    background: #0078d4;
    color: white;
}

.maplibregl-ctrl-html-widget-content {
    padding: 20px;
    font-size: 16px;
}
```

## Colorbar Widget

The package includes a specialized `ColorbarWidget` for creating matplotlib-style colorbars, perfect for visualizing data ranges on your map.

### Basic Colorbar Example

```javascript
import { ColorbarWidget } from 'maplibre-gl-html-widget';
import 'maplibre-gl-html-widget/src/colorbar-widget.css';

const colorbar = new ColorbarWidget({
    vmin: 0,
    vmax: 100,
    cmap: 'viridis',
    title: 'Temperature',
    label: '°C',
    orientation: 'vertical',
    position: 'bottom-right',
    collapsible: true
});

map.addControl(colorbar);
```

### Colorbar Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `vmin` | `number` | `0` | Minimum value |
| `vmax` | `number` | `100` | Maximum value |
| `cmap` | `string\|Array` | `'viridis'` | Colormap name or array of hex colors |
| `title` | `string` | `''` | Colorbar title |
| `label` | `string` | `''` | Label text (e.g., units) |
| `orientation` | `string` | `'vertical'` | `'vertical'` or `'horizontal'` |
| `width` | `number` | `30` | Width in pixels (vertical) or height (horizontal) |
| `height` | `number` | `200` | Height in pixels (vertical) or width (horizontal) |
| `tickCount` | `number` | `5` | Number of tick marks |
| `decimals` | `number` | `1` | Decimal places for tick labels |
| `position` | `string` | `'bottom-right'` | Widget position |
| `collapsible` | `boolean` | `false` | Enable collapse/expand |
| `collapsed` | `boolean` | `false` | Initial collapsed state |

### Built-in Colormaps

The ColorbarWidget includes these matplotlib-inspired colormaps:

- **Sequential**: `viridis`, `plasma`, `inferno`, `magma`, `turbo`, `greens`, `blues`, `reds`, `grays`
- **Diverging**: `coolwarm`, `rdbu`, `rdylgn`, `spectral`
- **Miscellaneous**: `jet`, `rainbow`

### Custom Colors

```javascript
const colorbar = new ColorbarWidget({
    vmin: 0,
    vmax: 50,
    cmap: ['#blue', '#cyan', '#yellow', '#red'],  // Custom color array
    title: 'Custom Scale'
});
```

### Colorbar Methods

```javascript
// Update colorbar properties dynamically
colorbar.update({
    vmin: -10,
    vmax: 40,
    cmap: 'plasma',
    title: 'Updated Temperature'
});

// Get available colormap names
const colormaps = colorbar.getColormapNames();

// Show/hide/toggle
colorbar.show();
colorbar.hide();
colorbar.toggle();
```

### Horizontal Colorbar

```javascript
const horizontalBar = new ColorbarWidget({
    vmin: 0,
    vmax: 500,
    cmap: 'blues',
    title: 'Precipitation',
    label: 'mm/year',
    orientation: 'horizontal',
    height: 200,  // width when horizontal
    width: 30,    // height when horizontal
    position: 'bottom-left'
});
```

## Examples

Check out the `examples/` directory for more complete examples:

- `index.html` - Basic widgets, collapsible legends, interactive controls
- `colorbar-example.html` - Colorbar demonstrations with interactive controls
- Dynamic content updates

## Browser Support

This plugin supports all modern browsers that support MapLibre GL JS.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
