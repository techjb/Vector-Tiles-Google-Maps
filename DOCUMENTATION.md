## Documentation

This document shows information about the constructor options and methods provided by the library. 

### Constructor options

The following are properties that define a config object for the `MVTSource` object:

* `url` - **{string}** A template URL for individual MVT/PBF tiles, or a URL to a PMTiles archive containing MVT tiles. **Required**.

```js
url: "https://vector-tiles-google-maps.s3.eu-west-3.amazonaws.com/Spanish-Census.pmtiles",
```

* `sourceType` - **{string}** `"auto"` (default), `"pbf"`, or `"pmtiles"`. Automatic detection recognizes `.pmtiles` before an optional query string or fragment. Set `"pmtiles"` for URLs without that extension. The PMTiles reader is included in both `dist` files; when loading source files individually, load `lib/pmtiles/pmtiles.js` before `MVTSource.js`. Archives must contain MVT tiles with no compression or gzip compression.

* `xhrHeaders` - **{object}** Custom request headers for both PBF and PMTiles sources. **Default: `{}`**. For cross-origin archives the server must allow these headers as well as range requests, and expose `ETag`.

* `onTileError` - **{function}** Called as `onTileError(error, tileContext)` on a network, archive or decoding failure. By default errors are logged to the console. Failed and absent tiles finish loading, so `tileLoaded()` does not wait forever; missing tiles leave a blank canvas and do not trigger this callback. `tileLoaded()` indicates completion, not that every request succeeded.

* `debug` - **{boolean}** Flagging debug as true provides a grid that shows the edge of the tiles and the z,x,y coordinate address of the tiles. **Default: `false`**.

```js
debug: true,
```

* `cache` - **{boolean}** Flagging cache as true stores in memory the vector tiles already loaded to avoid duplicate request to the server. **Default: `false`**.

```js
cache: true,
```

* `sourceMaxZoom` - **{int}** Setting this option enables overzoom. For example, if the tileset contains tiles until zoom level 14 and the map requests a tile at zoom 15, it uses the parent tile at zoom 14. For PBF sources the default is `false` (disabled). For PMTiles, the default is the archive's `maxZoom`, read asynchronously before fetching tiles. An explicit value can lower this limit but cannot exceed the archive's maximum. Zoom 0 is supported. Below the archive's `minZoom`, canvases remain empty.

```js
sourceMaxZoom: 14,
```

* `visibleLayers` - **[{string}, ...]** List of vector tile layers that will be loaded. **Default: `false`** (all tiles are visible).

```js
visibleLayers: ['municipalities'],
```


* `clickableLayers` - **[{string}, ...]** A list of vector tile layers that will capture mouse click events and be selectable on the map. **Default: `all layers`**.

```js
clickableLayers: ['municipalities'],
```

* `getIDForLayerFeature` - **{function}** Each MVT Feature needs a unique ID. You can specify a specific function to create a unique ID that will be associated with a given feature. **Required when onclick and onMouseHover**.

```js
getIDForLayerFeature: function(feature) {
    return feature.properties.id;
},
```

* `selectedFeatures` - **[{string}, ...]** A list of feature IDs that will be marked as selected features. **Default: `none`**.

```js
selectedFeatures: ['29', '39', '38'],
```

* `filter` - **{function}** The filter function gets called when iterating though each vector tile feature (vtf). You have access to every property associated with a given feature (the feature, and the layer). You can also filter based of the context (each tile that the feature is drawn onto). Returning false skips over the feature and it is not drawn.   
  * *@param feature* *@returns {boolean}*

```js
filter: function(feature, tileContext) {
  return 100000 < parseInt(feature.properties.Value);
},
```

* `style` - **{function}** or **{object}** Sets properties that the HTML5 Canvas' context uses to draw on the map. If you do not specify this, default styling will be applied to your features. `style.selected` option specify how a feature looks when it is selected. **Optional**.
  
```js
style: function(feature) {
    var style = {};
    switch (feature.type) {
        case 1: //'Point'
            style.fillStyle = 'rgba(49,79,79,1)';
            style.radius = 5;
            style.selected = {
                fillStyle: 'rgba(255,255,0,0.5)',
                radius: 6
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

* `customDraw` - **{function}** Custom draw function. When passed it replace the default draw function.

```js
customDraw: function(tileContext, tile, style, mVTFeature){
    var coordinates = tile.vectorTileFeature.coordinates[0][0];
    var point = mVTFeature.getPoint(coordinates, tileContext, tile.divisor);
    var context2d = mVTFeature.getContext2d(tileContext.canvas, style);
    var radius = style.radius;                

    var angle = Math.atan2(-1, 0);                
    var point1 = Vertice(radius, angle, point);
    angle += (1 / 3) * (2 * Math.PI);
    var point2 = Vertice(radius, angle, point);
    angle += (1 / 3) * (2 * Math.PI);
    var point3 = Vertice(radius, angle, point);

    context2d.beginPath();
    context2d.moveTo(point1.x, point1.y);
    context2d.lineTo(point2.x, point2.y);
    context2d.lineTo(point3.x, point3.y);
    context2d.closePath();
    context2d.fill();
    context2d.stroke();
}
```

### Methods

The following are methods that updates the `MVTSource` object:

* `onClick(event, callbackFunction, options)` - Trigger click event and returns the selected features.

```js
 var options = {
    limitToFirstVisibleLayer: true // Trigger events only to the first visible layer (default: false)
    multipleSelection: true, // Multiple feature selection (default: false)
    setSelected: true, // Set feature selected style (default: false)
    toggleSelection: false // Toggle feature selected style (default: true)
    delay: 50 // If new event is triggered before delay, old event will be ignored. Used to avoid overload on mousemove event (default: 0)
}

map.addListener("rightclick", function (event) {
    mvtSource.onClick(event, ShowSelectedFeatures, options);
});

function ShowSelectedFeatures(event) {
    if (event.feature) {
        console.log(event.feature);
    }                        
}
```

* `onMouseHover(event, callbackFunction, options)` - Selected feature on hover mouse.

```js
var options = {
    setSelected: false // set feature as selected
}

map.addListener("mousemove", function (event) {
    mvtSource.onMouseHover(event, ShowFeature, options);
});


function ShowFeature(event) {
    console.log(event.feature);
}
```


* `getSelectedFeatures()` - Returns the features that has been selected.

```js
var selectedFeatures = mVTSource.getSelectedFeatures();
```


* `deselectAllFeatures()` - Deselect all features that has been selected.

```js
mVTSource.deselectAllFeatures();
```


* `setStyle(style, redrawTiles)` - Update the style and redraw all tiles. 
  * *@param style* *{object}* or *{function}* - The style object can provide all the canvas methods as for example `shadowColor`, `lineCap`, `lineJoin`, etc. 
  * *@param redrawTiles* *{boolean}* - Trigger the redrawTiles event. **Default: `true`**.

```js
var style = function (feature) {
    return {
        fillStyle: 'gba(188, 189, 220, 0.5)',
        strokeStyle: 'rgba(136, 86, 167, 1)',
        lineWidth: 1,
        selected: {
            fillStyle: 'rgba(255,140,0,0.3)',
            strokeStyle: 'rgba(255,140,0,1)',
            lineWidth: 2,
        }
    };
};

mVTSource.setStyle(style);
```

* `setFilter(filter, redrawTiles)` - Update the filter and redraw all tiles. 
  * *@param filter* *{function}* - Filter function for each feature. 
  * *@param redrawTiles* *{boolean}* - Trigger the redrawTiles event. **Default: `true`**.

```js
var filter = function (feature) {
    return value < parseInt(feature.properties.Value);
};

mVTSource.setFilter(filter);
```


* `setVisibleLayers(visibleLayers, redrawTiles)` - Update the visible layers and redraw all tiles. 
  * *@param visibleLayers* *[{string}, ...]* - List of visible layers. Set to `false` to draw al layers. 
  * *@param redrawTiles* *{boolean}* - Trigger the redrawTiles event. **Default: `true`**.

```js
var visibleLayers = ["provinces", "municipalities"];

mVTSource.setVisibleLayers(visibleLayers);
```

* `setClickableLayers(clickableLayers)` - Update the clickable layers. 
  * *@param clickableLayers* *[{string}, ...]* - List of clickable layers. Set to `false` to make all layers clickable.   

```js
var clickableLayers = ["provinces"];

mVTSource.setClickableLayers(clickableLayers);
```


* `setSelectedFeatures(featuresIds)` - Set a list of features IDs as selected.
  * *@param featuresIds* *[{string}, ...]* - List of features IDs.

```js
var featureIds = ['29', '39', '38'];

mVTSource.setSelectedFeatures(featureIds);
```


* `setUrl(url, redrawTiles)` - Change the source URL, discard the previous source's cached tiles, and reload visible canvases. Responses still pending from the old source are ignored. With `sourceType: "auto"`, the source type is detected again; an explicitly configured source type remains in effect.
  * *@param url* *{string}* - New url
  * *@param redrawTiles* *{boolean}* - Reload visible tiles immediately. If `false`, visible canvases are cleared and can be loaded later with `redrawAllTiles()`. **Default: `true`**.

```js
var url = 'https://vector-tiles-google-maps.s3.eu-west-3.amazonaws.com/Spanish-Census.pmtiles';

mVTSource.setUrl(url);
```
