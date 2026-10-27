
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
            <li><a href="#recommendations">Recommendations</a></li>
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

It supports individual MVT/PBF tiles and single-file PMTiles archives containing MVT tiles. PMTiles are read on demand with HTTP byte ranges; the whole archive is not downloaded.

The library provides funcionality to enable cache, filter features, apply styles, onclick event, mouse hover, and show/hide layers.

Further work would be to load [Mapxbox GL Styles](https://docs.mapbox.com/mapbox-gl-js/style-spec/) in Google Maps.

### Built With

* [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview?)
* [Mapbox vector tiles](https://github.com/mapbox/vector-tile-js)
* [Protocol Buffers](https://github.com/protocolbuffers/protobuf)
* [PMTiles](https://docs.protomaps.com/pmtiles/) (reader included in the distribution)
* JavaScript


<!-- DEMO EXAMPLES -->
## Examples

The census examples use [Spanish-Census.pmtiles](https://vector-tiles-google-maps.s3.eu-west-3.amazonaws.com/Spanish-Census.pmtiles) hosted on S3. No Mapbox token is required. Its CORS policy allows `https://techjb.github.io` and `https://localhost:44390`. Add your own origin to the bucket's CORS policy when hosting these examples elsewhere. The point/line/polygon and custom-draw examples retain their separate PBF dataset because they demonstrate different geometries.

* [Basic](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/basic.html) - Basic loading vector tiles with debug enabled.
* [Cache](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/cache.html) - Cache enabled.
* [Click](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/click.html) - Click to select one or multiple features.
* [Hover](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/hover.html) - On mouse hover event.
* [Preselected features](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/preselected-features.html) - Set features as selected before loading.
* [Filter](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/filter.html) - Filter features by it properties.
* [Layers](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/layers.html) - Add remove vector tiles layers.
* [Styles](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles.html) - Change style dynamically.
* [Styles feature](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/styles-feature.html) - Style based on feature properties.
* [Style filter and layer](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/style-filter-layer.html) - Update the style, filter and visible layers simultaneously.
* [Point, linestring and polygon](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/point-linestring-polygon.html) - Show all type of geometries.
* [Custom draw](https://techjb.github.io/Vector-Tiles-Google-Maps/examples/custom-draw.html) - Custom draw function for each feature.


<!-- INSTALATION -->
## Installation

1. Clone the repo
   ```sh
   git clone https://github.com/techjb/Vector-Tiles-Google-Maps.git
   ```
2. The `dist` files are ready to use and include the PMTiles reader. To rebuild them after editing sources:
   ```sh
   npm install
   npm run build
   ```
3. Get your own API Key for the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key) and replace it in all the provided examples
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY" defer></script>
   ```


<!-- USAGE EXAMPLES -->
## Usage

Create the `MVTSource` object and then insert it as a `overlayMapType`. 
Provide the vector tiles server url in the options object.


```js
var options = {
    url: "http://your_vector_tiles_url/{z}/{x}/{y}.pbf"
};

var mvtSource = new MVTSource(map, options);
map.overlayMapTypes.insertAt(0, mvtSource);
```

For a PMTiles archive, use the same API:

```js
var mvtSource = new MVTSource(map, {
    sourceType: "pmtiles",
    url: "https://vector-tiles-google-maps.s3.eu-west-3.amazonaws.com/Spanish-Census.pmtiles",
    cache: true
});
map.overlayMapTypes.insertAt(0, mvtSource);
```

Load `dist/vector-tiles-google-maps.js` or its `.min.js` variant before this code. URLs ending in `.pmtiles` (including query strings) are also detected automatically. For extensionless endpoints, set `sourceType: "pmtiles"` explicitly. The archive must contain MVT tiles; the bundled reader supports uncompressed and gzip data. PMTiles maximum zoom is read automatically from the header and used for overzoom. The server must support HTTP range requests and CORS if hosted on a different origin, exposing `ETag` to the browser. `xhrHeaders` also applies to PMTiles range requests.

To verify changes, run `npm test`. `npm run test:integration` checks both distributions against the public S3 archive, including decoding, drawing calls, selection, styling, CORS and overzoom using partial downloads. The integration test uses a simulated Google Maps/canvas environment; open the HTML examples for visual verification.

### Recommendations

* Insert the `MVTSource` after tiles have been loaded for the first time 
to avoid duplicate invocation to `GetTile()`. It is documented in [this issue tracker](https://issuetracker.google.com/issues/73335429).

```js
 google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
    map.overlayMapTypes.insertAt(0, mvtSource);
});
```

* If you need to set style based on feature property or trigger `onClick` or `onMouseHover` event, 
set the property `getIDForLayerFeature` option with the function that returns the unique id for each feature.

```js
var options = {    
    getIDForLayerFeature: function(feature) {
        return feature.properties.id;
    }
};
```

* Enable cache for better performance and smooth flow.
```js
var options = {    
    cache: true
};
```

* Set the `sourceMaxZoom` option to enable [overzoom](https://docs.mapbox.com/help/glossary/overzoom/).
```js
var options = {    
    sourceMaxZoom: 14
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
