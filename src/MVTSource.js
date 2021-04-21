class MVTSource {
    constructor(map, options) {
        this.map = map;
        this.url = options.url || ""; //Url TO Vector Tile Source,
        this.debug = options.debug || false; // Draw tiles lines and ids
        this.getIDForLayerFeature = options.getIDForLayerFeature || function (feature) {
            return feature.properties.id;
        };        
        this.visibleLayers = options.visibleLayers || []; // List of visible layers
        this.xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
        this.clickableLayers = options.clickableLayers || false; // List of layers that are clickable
        this.filter = options.filter || false; // Filter features
        this.mutexToggle = options.mutexToggle || false;
        this.cache = options.cache || false; // Load tiles in cache to avoid duplicated requests
        this._tileSize = options.tileSize || 256; // Default tile size
        this.tileSize = new google.maps.Size(this._tileSize, this._tileSize);
        //this.layerLink = options.layerLink || false; // Layer link
        if (typeof options.style === 'function') {
            this.style = options.style;
        }
        this.layers = {}; //Keep a list of the layers contained in the PBFs
        this.processedTiles = {}; //Keep a list of tiles that have been processed already
        this.activeTiles = {}; // tiles currently in the viewport        
    }

    getTile(coord, zoom, ownerDocument) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this._tileSize;
        canvas.height = this._tileSize;
        this.drawTile(canvas, coord, zoom);        
        return canvas;
    }

    releaseTile(canvas) {
        var id = canvas.id;
        delete this.activeTiles[id];        
    }

    style(feature) {
        var style = {};
        var type = feature.type;
        switch (type) {
            case 1: //'Point'
                style.color = 'rgba(49,79,79,1)';
                style.radius = 5;
                style.selected = {
                    color: 'rgba(255,255,0,0.5)',
                    radius: 6
                };
                break;
            case 2: //'LineString'
                style.color = 'rgba(161,217,155,0.8)';
                style.size = 3;
                style.selected = {
                    color: 'rgba(255,25,0,0.5)',
                    size: 4
                };
                break;
            case 3: //'Polygon'
                style.color = 'rgba(49,79,79, 0.4)';
                style.outline = {
                    color: 'rgba(161,217,155,0.8)',
                    size: 1
                };
                style.selected = {
                    color: 'rgba(255,140,0,0.3)',
                    outline: {
                        color: 'rgba(255,140,0,1)',
                        size: 2
                    }
                };
                break;
        }
        return style;
    }

    drawTile(canvas, coord, zoom) {
        var tile = {
            x: coord.x,
            y: coord.y
        }        
        var id = canvas.id = this._getContextID(zoom, tile.x, tile.y);
        var ctx = {
            id: id,
            canvas: canvas,
            tile: tile,
            zoom: zoom,
            tileSize: this._tileSize
        };
        
        //this.activeTiles[id] = ctx;
        this._drawDebugInfo(ctx);
        this._draw(ctx);
    }

    _getContextID (zoom, x, y) {
        return [zoom, x, y].join(":");
    }

    _drawDebugInfo(ctx) {
        if (!this.debug) return;
        var width = this.tileSize.width;
        var height = this.tileSize.height;
        var g = ctx.canvas.getContext('2d');
        g.strokeStyle = '#000000';
        g.fillStyle = '#FFFF00';
        g.strokeRect(0, 0, width, height);
        g.font = "12px Arial";
        g.fillRect(0, 0, 5, 5);
        g.fillRect(0, height - 5, 5, 5);
        g.fillRect(width - 5, 0, 5, 5);
        g.fillRect(width - 5, height - 5, 5, 5);
        g.fillRect(width / 2 - 5, height / 2 - 5, 10, 10);
        g.strokeText(ctx.zoom + ' ' + ctx.tile.x + ' ' + ctx.tile.y, width / 2 - 30, height / 2 - 10);
    }

    _draw(ctx) {
        var self = this;
        //This works to skip fetching and processing tiles if they've already been processed (cache=true).
        var vectorTile = this.processedTiles[ctx.id];
        if (vectorTile) {
            return this.checkVectorTileLayers(vectorTile, ctx);            
        }

        if (!this.url) return;
        var src = this.url
            .replace("{z}", ctx.zoom)
            .replace("{x}", ctx.tile.x)
            .replace("{y}", ctx.tile.y);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status == "200" && xhr.response) {
                self._xhrResponseOk(ctx, xhr.response)
            }
        };

        xhr.onerror = function () {
        };

        xhr.open('GET', src, true); //async is true
        var headers = this.xhrHeaders;
        for (var header in headers) {
            xhr.setRequestHeader(header, headers[header])
        }
        xhr.responseType = 'arraybuffer';
        xhr.send();
    }

    _xhrResponseOk = function (ctx, response) {        
        //If fast zooming is occurring, then short circuit tiles that are for a different zoom level.
        if (this.map && this.map.getZoom() != ctx.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);        
        if (this.cache) {            
            this.processedTiles[ctx.id] = vectorTile;
        }
        this.checkVectorTileLayers(vectorTile, ctx);                
    }
    _setActiveTile(vectorTile, ctx) {
        ctx.vectorTile = vectorTile;
        this.activeTiles[ctx.id] = ctx;
    }

    checkVectorTileLayers(vectorTile, ctx) {
        if (this.visibleLayers && this.visibleLayers.length > 0) {
            //only let thru the layers listed in the visibleLayers array
            for (var i = 0; i < this.visibleLayers.length; i++) {
                var layerName = this.visibleLayers[i];
                if (vectorTile.layers[layerName]) {
                    this._prepareMVTLayers(vectorTile.layers[layerName], layerName, ctx);
                }
            }
        } else {
            for (var key in vectorTile.layers) {
                this._prepareMVTLayers(vectorTile.layers[key], key, ctx);
            }
        }
        this._setActiveTile(vectorTile, ctx);
    }

    _prepareMVTLayers(layer, key, ctx) {
        if (!this.layers[key]) {
            this.layers[key] = this._createMVTLayer(key);
        }
        this.layers[key].parseVectorTileLayer(layer, ctx);        
    }

    _createMVTLayer(key) {        
        var options = {
            getIDForLayerFeature: this.getIDForLayerFeature,
            filter: this.filter,
            layerOrdering: this.layerOrdering,
            style: this.style,
            name: key,
            asynch: true
        };
        return new MVTLayer(this, options);
    }

    getLayers() {
        return this.layers;
    }

    onClick(evt, callbackFunction) {
        var clickableLayers = this.clickableLayers;
        var layers = this.layers;
        var zoom = this.map.getZoom();

        evt.tileID = this._getTileID(evt.latLng, zoom);        
        evt.tilePoint = MERCATOR.fromLatLngToTilePoint(map, evt, zoom);

        // We must have an array of clickable layers, otherwise, we just pass
        // the event to the public onClick callback in options.
        if (!clickableLayers) {
            clickableLayers = Object.keys(this.layers);
        }
        if (clickableLayers && clickableLayers.length > 0) {
            for (var i = 0, len = clickableLayers.length; i < len; i++) {
                var key = clickableLayers[i];
                var layer = layers[key];
                if (layer) {
                    layer.handleClickEvent(evt, function (evt) {
                        if (typeof callbackFunction === 'function') {
                            callbackFunction(evt);
                        }
                    });
                }
            }
        }
        else {
            if (typeof callbackFunction === 'function') {
                callbackFunction(evt);
            }
        }
    }

    _getTileID(latLng, zoom) {
        const worldCoordinate = MERCATOR.project(latLng, this._tileSize);
        const scale = 1 << zoom;
        const tileCoordinate = new google.maps.Point(
            Math.floor((worldCoordinate.x * scale) / this._tileSize),
            Math.floor((worldCoordinate.y * scale) / this._tileSize)
        );
        return "" + zoom + ":" + tileCoordinate.x + ":" + tileCoordinate.y;
    }

    setFilter(filterFunction, layerName) {
        //take in a new filter function.
        //Propagate to child layers.

        //Add filter to all child layers if no layer is specified.
        for (var key in this.layers) {
            var layer = this.layers[key];
            if (layerName) {
                if (key.toLowerCase() == layerName.toLowerCase()) {
                    layer.filter = filterFunction; //Assign filter to child layer, only if name matches
                    //After filter is set, the old feature hashes are invalid.  Clear them for next draw.
                    //layer.clearLayerFeatureHash();
                    //layer.clearTileFeatureHash();
                }
            }
            else {
                layer.filter = filterFunction; //Assign filter to child layer                
                //After filter is set, the old feature hashes are invalid.  Clear them for next draw.
                //layer.clearLayerFeatureHash();
                //layer.clearTileFeatureHash();
            }
        }
        this.redrawTiles();
    }

    /**
     * Take in a new style function and propogate to child layers.
     * If you do not set a layer name, it resets the style for all of the layers.
     * @param styleFunction
     * @param layerName
     */
    setStyle(styleFn, layerName) {
        for (var key in this.layers) {
            var layer = this.layers[key];
            if (layerName) {
                if (key.toLowerCase() == layerName.toLowerCase()) {
                    layer.setStyle(styleFn);
                }
            } else {
                layer.setStyle(styleFn);
            }
        }
    }

    redrawTiles() {
        for (var tile in this.activeTiles) {
            var ctx = this.activeTiles[tile];            
            this.checkVectorTileLayers(ctx.vectorTile, ctx);
        }
    }

    deselectFeature() {
        if (this._selectedFeature) {
            this._selectedFeature.deselect();
            this._selectedFeature = false;
        }
    }

    featureSelected(mvtFeature) {
        if (this.mutexToggle) {
            if (this._selectedFeature) {
                this._selectedFeature.deselect();
            }
            this._selectedFeature = mvtFeature;
        }
        if (this.onSelect) {
            this.onSelect(mvtFeature);
        }
    }

    featureDeselected(mvtFeature) {
        if (this.mutexToggle && this._selectedFeature) {
            this._selectedFeature = null;
        }
        if (this.onDeselect) {
            this.onDeselect(mvtFeature);
        }
    }
}