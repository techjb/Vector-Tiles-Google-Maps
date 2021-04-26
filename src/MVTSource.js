class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this._url = options.url || ""; //Url TO Vector Tile Source,
        this._debug = options.debug || false; // Draw tiles lines and ids
        this.getIDForLayerFeature = options.getIDForLayerFeature || function (feature) {
            return feature.properties.id;
        };
        this._visibleLayers = options.visibleLayers || [];  // List of visible layers
        this._xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
        this._clickableLayers = options.clickableLayers || false;   // List of layers that are clickable
        this._filter = options.filter || false; // Filter features
        this._cache = options.cache || false; // Load tiles in cache to avoid duplicated requests
        this._tileSize = options.tileSize || 256; // Default tile size
        this.tileSize = new google.maps.Size(this._tileSize, this._tileSize);
        if (typeof options.style === 'function') {            
            this.style = options.style;
        }
        if (typeof options.label === 'function') {
            this.label = options.label;
        }        
        this.mVTLayers = {};  //Keep a list of the layers contained in the PBFs
        this.vectorTilesProcessed = {}; //Keep a list of tiles that have been processed already
        this.visibleTiles = {}; // tiles currently in the viewport 
        this._selectedFeatures = []; // list of selected features        
        this._pendingUrls = [];

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
        this.deleteTile(canvas.id);
    }

    deleteTile(id) {
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
                style.fillStyle = 'rgba(49,79,79,1)';
                style.radio = 5;
                style.selected = {
                    fillStyle: 'rgba(255,255,0,0.5)',
                    radio: 6
                }
                break;
            case 2: //'LineString'
                style.strokeStyle = 'rgba(161,217,155,0.8)';
                style.lineWidth = 3;
                style.selected = {
                    strokeStyle: 'rgba(255,25,0,0.5)',
                    lineWidth: 4
                }
                break;
            case 3: //'Polygon'
                style.fillStyle = 'rgba(49,79,79, 0.4)';
                style.strokeStyle = 'rgba(161,217,155,0.8)';
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

    label(feature) {

    }

    drawTile(canvas, coord, zoom) {
        var self = this;
        var id = canvas.id = this._getTileId(zoom, coord.x, coord.y);
        var tileContext = {
            id: id,
            canvas: canvas,
            zoom: zoom,
            tileSize: this._tileSize
        };

        var vectorTile = this.vectorTilesProcessed[tileContext.id];
        if (vectorTile) {
            return this._drawVectorTile(vectorTile, tileContext);
        }

        var src = this._url
            .replace("{z}", zoom)
            .replace("{x}", coord.x)
            .replace("{y}", coord.y);

        this._pendingUrls.push(src);
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onload = function () {
            if (xmlHttpRequest.status == "200" && xmlHttpRequest.response) {
                self._xhrResponseOk(tileContext, xmlHttpRequest.response)
            }
            var index = self._pendingUrls.indexOf(src);
            self._pendingUrls.splice(index, 1);
            if (self._pendingUrls.length === 0) {
                self._allTilesLoaded();
            }
        };
        xmlHttpRequest.open('GET', src, true);
        for (var header in this._xhrHeaders) {
            xmlHttpRequest.setRequestHeader(header, headers[header])
        }
        xmlHttpRequest.responseType = 'arraybuffer';
        xmlHttpRequest.send();
    }

    _allTilesLoaded() {
        console.log("all loaded");
    }

    _getTileId(zoom, x, y) {
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

    _xhrResponseOk = function (tileContext, response) {
        if (this.map && this.map.getZoom() != tileContext.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);
        if (this._cache) {
            this.vectorTilesProcessed[tileContext.id] = vectorTile;
        }
        this._drawVectorTile(vectorTile, tileContext);
    }

    _drawVectorTile(vectorTile, tileContext) {
        if (this._visibleLayers && this._visibleLayers.length > 0) {
            for (var i = 0; i < this._visibleLayers.length; i++) {
                var key = this._visibleLayers[i];
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
            filter: this._filter,
            layerOrdering: this.layerOrdering,
            style: this.style,
            label: this.label,
            name: key
        };        
        return new MVTLayer(this, options);
    }

    _drawDebugInfo(tileContext) {
        if (!this._debug) {
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

    _setTileAsVisible(vectorTile, tileContext) {
        tileContext.vectorTile = vectorTile;
        this.visibleTiles[tileContext.id] = tileContext;
    }

    getLayers() {
        return this.mVTLayers;
    }

    onClick(event, callbackFunction, clickOptions) {
        this._multipleSelection = (clickOptions && clickOptions.multipleSelection) || false;
        callbackFunction = callbackFunction || function () { };
        var zoom = this.map.getZoom();
        var tile = MERCATOR.getTileAtLatLng(event.latLng, zoom);
        event.id = this._getTileId(tile.z, tile.x, tile.y);
        event.tilePoint = MERCATOR.fromLatLngToTilePoint(map, event, zoom);

        var clickableLayers = this._clickableLayers || Object.keys(this.mVTLayers);
        if (clickableLayers) {
            for (var i = 0; i < clickableLayers.length; i++) {
                var key = clickableLayers[i];
                var layer = this.mVTLayers[key];
                if (layer) {
                    layer.handleClickEvent(event, function (event) {
                        callbackFunction(event);
                    });
                }
            }
        }
        else {
            callbackFunction(event);
        }
    }

    deselectAllFeatures() {
        for (var i = this._selectedFeatures.length - 1; i >= 0; i--) {
            this._selectedFeatures[i].deselect();
        }
        this._selectedFeatures = [];
    }

    featureSelected(mvtFeature) {
        if (!this._multipleSelection) {
            this.deselectAllFeatures();
        }
        this._selectedFeatures.push(mvtFeature);
    }

    featureDeselected(mvtFeature) {
        const index = this._selectedFeatures.indexOf(mvtFeature);
        if (index > -1) {
            this._selectedFeatures.splice(index, 1);
        }
    }

    getSelectedFeatures() {
        return this._selectedFeatures;
    }

    setFilter(filterFunction) {
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setFilter(filterFunction);
        }
        this.redrawAllTiles();
    }

    setStyle(styleFunction) {
        this.style = styleFunction
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setStyle(styleFunction);
        }
        this.redrawAllTiles();
    }

    setLabel(labelFunction) {
        this.label = labelFunction
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setLabel(labelFunction);
        }
        this.redrawAllTiles();
    }

    setVisibleLayers(visibleLayers) {
        this._visibleLayers = visibleLayers;
        this.redrawAllTiles();
    }

    redrawAllTiles() {
        this.redrawTiles(this.visibleTiles);
    }

    redrawTiles(tiles) {
        for (var tile in tiles) {
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
}