/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this._url = options.url || ""; //Url TO Vector Tile Source,
        this._debug = options.debug || false; // Draw tiles lines and ids
        this.getIDForLayerFeature = options.getIDForLayerFeature || function (feature) {
            return feature.properties.id || feature.properties.Id || feature.properties.ID;
        };
        this._visibleLayers = options.visibleLayers || false;  // List of visible layers
        this._xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
        this._clickableLayers = options.clickableLayers || false;   // List of layers that are clickable
        this._filter = options.filter || false; // Filter features
        this._cache = options.cache || false; // Load tiles in cache to avoid duplicated requests
        this._tileSize = options.tileSize || 256; // Default tile size
        this.tileSize = new google.maps.Size(this._tileSize, this._tileSize);
        this.style = options.style || function (feature) {
            var style = {};
            switch (feature.type) {
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
        };

        this.mVTLayers = {};  //Keep a list of the layers contained in the PBFs
        this._tilesProcessed = {}; //List of tiles that have been processed (when cache enabled)
        this._tilesDrawn = []; //  List of tiles drawn  (when cache enabled)
        this._visibleTiles = {}; // tiles currently in the viewport
        this._selectedFeatures = []; // list of selected features

        this.map.addListener("zoom_changed", () => {
            self.clearAtNonVisibleZoom();
        });
    }

    getTile(coord, zoom, ownerDocument) {
        var tileContext = this.drawTile(coord, zoom, ownerDocument);
        return tileContext.canvas;
    }

    releaseTile(canvas) {
        delete this._visibleTiles[canvas.id];
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

    drawTile(coord, zoom, ownerDocument) {
        var id = this._getTileId(zoom, coord.x, coord.y);
        var tileContext = this._tilesDrawn[id];
        if (tileContext) {
            this._setTileVisible(tileContext);
            return tileContext;
        }
        var canvas = this._createCanvas(ownerDocument, id);
        tileContext = {
            id: id,
            canvas: canvas,
            zoom: zoom,
            tileSize: this._tileSize
        };

        var vectorTile = this._tilesProcessed[tileContext.id];
        if (vectorTile !== undefined) {
            if (vectorTile) {
                this._drawVectorTile(vectorTile, tileContext);
            }
        }
        else {
            this._xhrRequest(tileContext, coord, zoom);
        }
        return tileContext;
    }

    _createCanvas(ownerDocument, id) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this._tileSize;
        canvas.height = this._tileSize;
        canvas.id = id;
        return canvas;
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

    _xhrRequest = function (tileContext, coord, zoom) {
        var self = this;
        var src = this._url
            .replace("{z}", zoom)
            .replace("{x}", coord.x)
            .replace("{y}", coord.y);

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onload = function () {
            if (xmlHttpRequest.status == "200" && xmlHttpRequest.response) {
                return self._xhrResponseOk(tileContext, xmlHttpRequest.response)
            }
            self._drawDebugInfo(tileContext);
            self._tileProcessed(tileContext.id, false);
        };
        xmlHttpRequest.open('GET', src, true);
        for (var header in this._xhrHeaders) {
            xmlHttpRequest.setRequestHeader(header, headers[header])
        }
        xmlHttpRequest.responseType = 'arraybuffer';
        xmlHttpRequest.send();
    }

    _xhrResponseOk = function (tileContext, response) {
        if (this.map && this.map.getZoom() != tileContext.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);
        this._tileProcessed(tileContext.id, vectorTile);
        this._drawVectorTile(vectorTile, tileContext);
    }

    _tileProcessed = function (id, vectorTile) {
        if (!this._cache) return;
        this._tilesProcessed[id] = vectorTile;
    }

    _tileDrawn = function (tileContext) {
        if (!this._cache) return;
        this._tilesDrawn[tileContext.id] = tileContext;
    }

    _drawVectorTile(vectorTile, tileContext) {
        if (this._visibleLayers) {
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
        tileContext.vectorTile = vectorTile;
        this._setTileVisible(tileContext);
        this._drawDebugInfo(tileContext);
        this._tileDrawn(tileContext);
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
            style: this.style,
            name: key
        };
        return new MVTLayer(this, options);
    }

    _drawDebugInfo(tileContext) {
        if (!this._debug) return;
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

    _setTileVisible(tileContext) {
        this._visibleTiles[tileContext.id] = tileContext;
    }

    onClick(event, callbackFunction, options) {
        this._multipleSelection = (options && options.multipleSelection) || false;
        var options = {
            mouseHover: false,
            setSelected: options.setSelected || false
        }
        this._mouseEvent(event, callbackFunction, options);
    }

    onMouseHover(event, callbackFunction, options) {
        this._multipleSelection = false;
        var options = {
            mouseHover: true,
            setSelected: options.setSelected || false
        }
        this._mouseEvent(event, callbackFunction, options);
    }

    _mouseEvent(event, callbackFunction, options) {
        callbackFunction = callbackFunction || function () { };
        var zoom = this.map.getZoom();
        var tile = MERCATOR.getTileAtLatLng(event.latLng, zoom);
        event.id = this._getTileId(tile.z, tile.x, tile.y);
        event.tilePoint = MERCATOR.fromLatLngToTilePoint(this.map, event);

        var clickableLayers = this._clickableLayers || Object.keys(this.mVTLayers) || [];
        for (var i = 0; i < clickableLayers.length; i++) {
            var key = clickableLayers[i];
            var layer = this.mVTLayers[key];
            if (layer) {
                var event = layer.handleClickEvent(event);
                this._mouseSelectedFeature(event, callbackFunction, options);
            }
        }
    }

    _mouseSelectedFeature(event, callbackFunction, options) {
        if (options.setSelected) {
            if (event.feature) {
                if (options.mouseHover) {
                    if (!event.feature.selected) {
                        event.feature.select();
                    }
                }
                else {
                    event.feature.toggle();
                }
            }
            else {
                if (options.mouseHover) {
                    this.deselectAllFeatures();
                }
            }
        }
        callbackFunction(event);
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

    setFilter(filter, redrawTiles) {
        this._filter = filter;
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setFilter(filter);
        }
        if (redrawTiles === undefined || redrawTiles) {            
            this.redrawAllTiles();
        }        
    }

    setStyle(style, redrawTiles) {
        this.style = style
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setStyle(style);
        }
        if (redrawTiles === undefined || redrawTiles) {
            this.redrawAllTiles();
        }        
    }

    setVisibleLayers(visibleLayers, redrawTiles) {
        this._visibleLayers = visibleLayers;
        if (redrawTiles === undefined || redrawTiles) {
            this.redrawAllTiles();
        }
    }

    redrawAllTiles() {        
        this._tilesDrawn = [];
        this.redrawTiles(this._visibleTiles);
    }

    redrawTiles(tiles) {
        for (var id in tiles) {
            this.redrawTile(id);
        }
    }

    redrawTile(id) {
        delete this._tilesDrawn[id];
        var tileContext = this._visibleTiles[id];
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