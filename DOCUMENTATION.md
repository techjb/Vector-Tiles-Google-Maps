#Documentation

This document shows information about the constructor options and methods provided by the library. 

## Options

The following are properties that define a config object for the `MVTSource` object:

* `url` - **{string}** The URL Endpoint that we fetch MVT Protocol Buffer tiles from. **Required**.

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

* `visibleLayers` - **[{string}, ...]** List of vector tile layers that will be loaded. **Default: `all layers`**.

```js
visibleLayers: ['municipalities'],
```


* `clickableLayers` - **[{string}, ...]** A list of vector tile layers that will capture mouse click events and be selectable on the map. **Default: `all layers`**.

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

## Methods

The following are methods that updates the `MVTSource` object:

* `onClick(event, callbackFunction, clickOptions)` - Trigger click event and returns the selected features.

```js
 var clickOptions = {
    multipleSelection: true // Allow multiple features selected
}

map.addListener("rightclick", function (event) {
    mvtSource.onClick(event, ShowSelectedFeatures, clickOptions);
});

function ShowSelectedFeatures(event) {
    if (event.feature) {
        console.log(event.feature);
    }                        
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


* `setStyle(styleFunction)` - Update the styles and redraw all tiles. The style object can provide all the canvas methods as for example `shadowColor`, `lineCap`, `lineJoin`, etc. 

```js
var sytle = function (feature) {
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

* `setFilter(filterFunction)` - Update the filter and redraw all tiles. 

```js
var filter = function (feature) {
    function (feature) {
        return value < parseInt(feature.properties.Value);
    }
};

mVTSource.setFilter(filter);
```


* `setVisibleLayers(visibleLayers)` - Update the visible layers and redraw all tiles. 

```js
var visibleLayers = ["provinces", "municipalities"];
};

mVTSource.setVisibleLayers(filter);
```