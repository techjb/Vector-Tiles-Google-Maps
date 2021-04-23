class MVTSource {
    constructor(map, options) {
        var self = this;
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
        this.mVTLayers = {}; //Keep a list of the layers contained in the PBFs
        this.vectorTilesProcessed = {}; //Keep a list of tiles that have been processed already
        this.visibleTiles = {}; // tiles currently in the viewport 

        this.map.addListener("zoom_changed", () => {
            self.clearAtNonVisibleZoom();
        });
    }

    getTile(coord, zoom, ownerDocument) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this._tileSize;
        canvas.height = this._tileSize;
        this.drawTile(canvas, coord, zoom);        
        return canvas;
    }

    releaseTile(canvas) {
        delete this.visibleTiles[canvas.id];
        this.deleteTiles(canvas.id);
    }

    deleteTiles(id) {
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].deleteTile(id);
        }
    }

    clearAtNonVisibleZoom() {       
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].clearFeaturesAtNonVisibleZoom();
        }        
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
        var tileId = canvas.id = this._getTileId(zoom, coord.x, coord.y);
        var tileContext = {
            id: tileId,
            canvas: canvas,
            zoom: zoom,
            tileSize: this._tileSize
        };        

        var self = this;
        var vectorTile = this.vectorTilesProcessed[tileContext.id];
        if (vectorTile) {
            return this._drawVectorTile(vectorTile, tileContext);
        }

        var src = this.url
            .replace("{z}", zoom)
            .replace("{x}", coord.x)
            .replace("{y}", coord.y);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status == "200" && xhr.response) {
                self._xhrResponseOk(tileContext, xhr.response)
            }
        };
        xhr.open('GET', src, true);
        for (var header in this.xhrHeaders) {
            xhr.setRequestHeader(header, headers[header])
        }
        xhr.responseType = 'arraybuffer';
        xhr.send();
    }

    _getTileId (zoom, x, y) {
        return [zoom, x, y].join(":");
    }

    _getTile(id) {
        var values = id.split(":");
        return {
            zoom: values[0],
            x: values[1],
            y: values[2]
        }
    }

    _drawDebugInfo(tileContext) {
        if (!this.debug) {            
            return;
        };
        var tile = this._getTile(tileContext.id)
        var width = this._tileSize;
        var height = this._tileSize;
        var context2d = tileContext.canvas.getContext('2d');
        context2d.strokeStyle = '#000000';
        context2d.fillStyle = '#FFFF00';
        context2d.strokeRect(0, 0, width, height);
        context2d.font = "12px Arial";
        context2d.fillRect(0, 0, 5, 5);
        context2d.fillRect(0, height - 5, 5, 5);
        context2d.fillRect(width - 5, 0, 5, 5);
        context2d.fillRect(width - 5, height - 5, 5, 5);
        context2d.fillRect(width / 2 - 5, height / 2 - 5, 10, 10);
        context2d.strokeText(tileContext.zoom + ' ' + tile.x + ' ' + tile.y, width / 2 - 30, height / 2 - 10);
    }

    _xhrResponseOk = function (tileContext, response) {        
        if (this.map && this.map.getZoom() != tileContext.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);        
        if (this.cache) {            
            this.vectorTilesProcessed[tileContext.id] = vectorTile;
        }
        this._drawVectorTile(vectorTile, tileContext);                
    }

    _drawVectorTile(vectorTile, tileContext) {        
        if (this.visibleLayers && this.visibleLayers.length > 0) {
            for (var i = 0; i < this.visibleLayers.length; i++) {
                var key = this.visibleLayers[i];
                if (vectorTile.layers[key]) {
                    var vectorTileLayer = vectorTile.layers[key];
                    this._drawVectorTileLayer(vectorTileLayer, key, tileContext);
                }
            }
        } else {
            for (var key in vectorTile.layers) {                
                var vectorTileLayer = vectorTile.layers[key];
                this._drawVectorTileLayer(vectorTileLayer, key, tileContext);
            }
        }
        
        this._setTileAsVisible(vectorTile, tileContext);
        this._drawDebugInfo(tileContext);
    }

    _drawVectorTileLayer(vectorTileLayer, key, tileContext) {
        if (!this.mVTLayers[key]) {
            this.mVTLayers[key] = this._createMVTLayer(key);
        }                
        var mVTLayer = this.mVTLayers[key];        
        mVTLayer.parseVectorTileLayer(vectorTileLayer.parsedFeatures, tileContext);        
    }

    _createMVTLayer(key) {        
        var options = {
            getIDForLayerFeature: this.getIDForLayerFeature,
            filter: this.filter,
            layerOrdering: this.layerOrdering,
            style: this.style,
            name: key
        };
        return new MVTLayer(this, options);
    }

    _setTileAsVisible(vectorTile, tileContext) {
        tileContext.vectorTile = vectorTile;
        this.visibleTiles[tileContext.id] = tileContext;
    }

    getLayers() {
        return this.mVTLayers;
    }

    onClick(evt, callbackFunction) {        
        var zoom = this.map.getZoom();
        var tile = MERCATOR.getTileAtLatLng(evt.latLng, zoom);
        evt.tileID = this._getTileId(tile.z,  tile.x, tile.y);              
        evt.tilePoint = MERCATOR.fromLatLngToTilePoint(map, evt, zoom);

        var clickableLayers = this.clickableLayers;        
        if (!clickableLayers) {
            clickableLayers = Object.keys(this.mVTLayers);
        }
        if (clickableLayers && clickableLayers.length > 0) {
            for (var i = 0, len = clickableLayers.length; i < len; i++) {
                var key = clickableLayers[i];
                var layer = this.mVTLayers[key];
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

    setFilter(filterFunction) {
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setFilter(filterFunction);
        }
        this.redrawTiles();
    }

    setStyle(styleFn) {
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setStyle(styleFn);
        }
        this.redrawTiles();
    }

    redrawTiles() {
        for (var tile in this.visibleTiles) {            
            this.redrawTile(tile);
        }
    }

    redrawTile(id) {
        var tileContext = this.visibleTiles[id];        
        if (!tileContext) return;
        this.clearTile(tileContext);        
        this._drawVectorTile(tileContext.vectorTile, tileContext);
    }

    clearTile(tileContext) {
        var canvas = tileContext.canvas;
        var context = canvas.getContext('2d');        
        context.clearRect(0, 0, canvas.width, canvas.height);        
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
    }

    featureDeselected(mvtFeature) {
        if (this.mutexToggle && this._selectedFeature) {
            this._selectedFeature = null;
        }
    }
}