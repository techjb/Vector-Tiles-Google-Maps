
<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>    
    <li><a href="#examples">Examples</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
        <ul>
            <li><a href="#options">Options</a></li>
            <li><a href="#methods">Methods</a></li>
        </ul>
    <li><a href="#roadmap">Roadmap</a></li>    
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/basic.html)


A JavaScript library that render Vector Tiles in Google Maps.

It has been started to develop with the code from the library [Leaflet.MapboxVectorTile](https://github.com/SpatialServer/Leaflet.MapboxVectorTile). 
The library contains funcionality to provide cache, feature filters, feature styles, onclick event, and show/hide layers.

Further work would be to load [Mapxbox GL Styles](https://docs.mapbox.com/mapbox-gl-js/style-spec/) in Google Maps.

### Built With

* [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview?)
* [Mapbox Vector Tiles](https://github.com/mapbox/vector-tile-js)
* [Protocol Buffers](https://github.com/protocolbuffers/protobuf)
* JavaScript


<!-- DEMO EXAMPLES -->
## Examples

* [Basic](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/basic.html)
* [Cache](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/cache.html)
* [Click](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/click.html)
* [Filter](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/filter.html)
* [Layers](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/layers.html)
* [Styles](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles.html)
* [Point, linestring and polygon](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/point-linestring-polygon.html)


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Get your own API Key for the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key) 
Replace it in the examples provided.

```html
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=InitGoogleMap&libraries=&v=weekly"
            defer></script>
```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/techjb/Vector-Tiles-Google-Maps.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```


<!-- USAGE EXAMPLES -->
## Usage

You create the `MVTSource` object and then insert it as a `overlayMapType`. 
Provide the vector tiles server url in the options parámeter.


```js
var options = {
    url: "http://your_vector_tiles_url/{z}/{x}/{y}.pbf"
};

var mvtSource = new MVTSource(map, options);
map.overlayMapTypes.insertAt(0, mvtSource);
```

I reccomended to insert the MVTSource after tiles have been loaded for the first time 
to avoid duplicate invocation to `GetTile()`. It is documented in the [Issuetracker](https://issuetracker.google.com/issues/73335429).

```js
 google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    map.overlayMapTypes.insertAt(0, mvtSource);
});
```

### Options

The following are properties that define a config object for the `MVTSource` object:


* `url` - **{string}** The URL Endpoint that we fetch MVT Protocal Buffer tiles from. **Required**.

```js
url: "https://api.mapbox.com/v4/techjb.bwtby589/{z}/{x}/{y}.vector.pbf?",
```

* `debug` - **{boolean}** Flagging debug as true provides a grid that shows the edge of the tiles and the z,x,y coordinate address of the tiles. **Default: `false`**.

```js
debug: true,
```

* `cache` - **{boolean}** Flagging cache as true stores in memory the vector tiles already loaded to avoid duplicate request to the server. **Default: `false`**.

```js
cache: true,
```

* `visibleLayers` - **[{string}, ...]** A list of vector tile layers that will be loaded. **Default: `all layers`**.

```js
visibleLayers: ['municipalities'],
```


* `clickableLayers` - **[{string}, ...]** A list of vector tile layers that will capture mouse click events and be selectable on the map. **Default: `null`**.

```js
clickableLayers: ['municipalities'],
```

* `getIDForLayerFeature` - **{function}** Each MVT Feature needs a unique ID. You can specify a specific function to create a unique ID that will be associated with a given feature. **Required for for onclick event**.

```js
getIDForLayerFeature: function(feature) {
    return feature.id;
},
```


* `filter` - **{function}** The filter function gets called when iterating though each vector tile feature (vtf). You have access to every property associated with a given feature (the feature, and the layer). You can also filter based of the context (each tile that the feature is drawn onto). Returning false skips over the feature and it is not drawn.   
  * *@param feature* *@returns {boolean}*

```js
filter: function(feature, tileContext) {
  return 100000 < parseInt(feature.properties.Value);
},
```


* `style` - **{function}** This function sets properties that the HTML5 Canvas' context uses to draw on the map. If you do not specify this, default styling will be applied to your features. `style.selected` parameters specify how a feature looks when it is selected. **Optional**.
  * *@returns {object}*

```js
style: function(feature) {
    var style = {};
    var type = feature.type;
    switch (type) {
        case 1: //'Point'
            style.fillStyle = 'rgba(49,79,79,1)';
            style.radio = 5;
            style.selected = {
                fillStyle: 'rgba(255,255,0,0.5)',
                radio: 6
            }
            break;
        case 2: //'LineString'
            style.strokeStyle = 'rgba(136, 86, 167, 1)';
            style.lineWidth = 3;
            style.selected = {
                strokeStyle: 'rgba(255,25,0,0.5)',
                lineWidth: 4
            }
            break;
        case 3: //'Polygon'
            style.fillStyle = 'rgba(188, 189, 220, 0.5)';
            style.strokeStyle = 'rgba(136, 86, 167, 1)';
            style.lineWidth = 1;
            style.selected = {
                fillStyle: 'rgba(255,140,0,0.3)',
                strokeStyle: 'rgba(255,140,0,1)',
                lineWidth: 2
            }
            break;
    }
    return style;
}
```

* 'xhrHeaders' - **{object}** The header and value to set on the XMLHttpRequest when fetching tiles.

```json
{
  "Authorization": "xxxxxxxxxxx"
}
```

### Methods


<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/techjb/Vector-Tiles-Google-Maps/issues) for a list of proposed features (and known issues).


<!-- LICENSE -->
## License

See [LICENSE](https://github.com/techjb/Vector-Tiles-Google-Maps/blob/master/LICENSE.txt) for more information.



<!-- CONTACT -->
## Contact

Jesús Barrio - [@techjb](https://twitter.com/techjb)

Project Link: [https://github.com/techjb/Vector-Tiles-Google-Maps](https://github.com/techjb/Vector-Tiles-Google-Maps)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[product-screenshot]: images/screenshot.png