
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
    <li>
        <a href="#usage">Usage</a>
        <ul>
            <li><a href="#reccomendations">Reccomendations</a></li>
        </ul>
    </li>
    <li><a href="#documentation">Documentation</a></li>        
    <li><a href="#roadmap">Roadmap</a></li>   
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles-feature.html)


Vector Tiles Google Maps is a JavaScript library to render vector tiles in Google Maps.

The library provides funcionality to enable cache, filter features, apply styles, select features with onclick event, and show or hide layers.

Further work would be to load [Mapxbox GL Styles](https://docs.mapbox.com/mapbox-gl-js/style-spec/) in Google Maps.

### Built With

* [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview?)
* [Mapbox vector tiles](https://github.com/mapbox/vector-tile-js)
* [Protocol Buffers](https://github.com/protocolbuffers/protobuf)
* JavaScript


<!-- DEMO EXAMPLES -->
## Examples

* [Basic](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/basic.html) - Basic loading vector tiles with debug enabled.
* [Cache](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/cache.html) - Cache enabled.
* [Click](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/click.html) - Click to select one or multiple features.
* [Hover](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/hover.html) - On mouse hover event.
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

### Reccomendations

Insert the MVTSource after tiles have been loaded for the first time 
to avoid duplicate invocation to `GetTile()`. It has been documented in [this issue tracker](https://issuetracker.google.com/issues/73335429).

```js
 google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    map.overlayMapTypes.insertAt(0, mvtSource);
});
```

If you need to set style based on feature property or trigger onClick event, set the property `getIDForLayerFeature` in the constructor with the function that returns the unique id for each feature.

```js
var options = {    
    getIDForLayerFeature: function(feature) {
        return feature.properties.id;
    }
};
```

Despite the increase of the memory use, it is recommended to enable cache for better performance and smooth flow.
```js
var options = {    
    cache: true
};
```


<!-- DOCUMENTATION -->
## Documentation

See [documentation](https://github.com/techjb/Vector-Tiles-Google-Maps/blob/master/DOCUMENTATION.md) for the contructor options and public methods.

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/techjb/Vector-Tiles-Google-Maps/issues) for a list of proposed features (and known issues).


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

See [license](https://github.com/techjb/Vector-Tiles-Google-Maps/blob/master/LICENSE.txt) for more information.


<!-- CONTACT -->
## Contact

Jesús Barrio - [@techjb](https://twitter.com/techjb)

Project Link: [https://github.com/techjb/Vector-Tiles-Google-Maps](https://github.com/techjb/Vector-Tiles-Google-Maps)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* The authors of the library [Leaflet.MapboxVectorTile](https://github.com/SpatialServer/Leaflet.MapboxVectorTile) witch has been used as a start point for this development.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[product-screenshot]: images/screenshot.png