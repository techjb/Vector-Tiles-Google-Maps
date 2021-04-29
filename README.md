
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
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#documentation">Documentation</a></li>        
    <li><a href="#roadmap">Roadmap</a></li>    
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles-feature.html)


A JavaScript library that render vector tiles in Google Maps.

It has been started to develop with the code from the library [Leaflet.MapboxVectorTile](https://github.com/SpatialServer/Leaflet.MapboxVectorTile). 
The library contains funcionality to provide cache, feature filters, feature styles, onclick event, and show/hide layers.

Further work would be to load [Mapxbox GL Styles](https://docs.mapbox.com/mapbox-gl-js/style-spec/) in Google Maps.

### Built With

* [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview?)
* [Mapbox vector tiles](https://github.com/mapbox/vector-tile-js)
* [Protocol Buffers](https://github.com/protocolbuffers/protobuf)
* JavaScript


<!-- DEMO EXAMPLES -->
## Examples

* [Basic](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/basic.html) - Basic loading vector tiles with debug enabled.
* [Cache](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/cache.html) - Cache enabled.
* [Click](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/click.html) - Click to select and get one or multiple features.
* [Filter](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/filter.html) - Filter features by it properties.
* [Layers](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/layers.html) - Add remove vector tiles layers.
* [Styles](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles.html) - Change style dynamically.
* [Styles feature](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles-feature.html) - Style based on feature properties.
* [Point, linestring and polygon](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/point-linestring-polygon.html) - Show all type of geometries.


<!-- INSTALATION -->
## Installation

1. Clone the repo
   ```sh
   git clone https://github.com/techjb/Vector-Tiles-Google-Maps.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Get your own API Key for the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key) and replace it in all the provided examples
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY" defer></script>
   ```


<!-- USAGE EXAMPLES -->
## Usage

Create the `MVTSource` object and then insert it as a `overlayMapType`. 
Provide the vector tiles server url in the options parámeter.


```js
var options = {
    url: "http://your_vector_tiles_url/{z}/{x}/{y}.pbf"
};

var mvtSource = new MVTSource(map, options);
map.overlayMapTypes.insertAt(0, mvtSource);
```

I reccomended to insert the MVTSource after tiles have been loaded for the first time 
to avoid duplicate invocation to `GetTile()`. It has been documented in [this issue tracker](https://issuetracker.google.com/issues/73335429).

```js
 google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    map.overlayMapTypes.insertAt(0, mvtSource);
});
```
<!-- DOCUMENTATION -->
## Documentation

See [documentation](https://github.com/techjb/Vector-Tiles-Google-Maps/blob/master/DOCUMENTATION.md) for the contructor options and public methods.

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/techjb/Vector-Tiles-Google-Maps/issues) for a list of proposed features (and known issues).


<!-- LICENSE -->
## License

See [license](https://github.com/techjb/Vector-Tiles-Google-Maps/blob/master/LICENSE.txt) for more information.


<!-- CONTACT -->
## Contact

Jesús Barrio - [@techjb](https://twitter.com/techjb)

Project Link: [https://github.com/techjb/Vector-Tiles-Google-Maps](https://github.com/techjb/Vector-Tiles-Google-Maps)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[product-screenshot]: images/screenshot.png