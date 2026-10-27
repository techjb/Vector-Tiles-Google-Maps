/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this._url = options.url || ""; //Url TO Vector Tile Source,
        this._configuredMaxZoom = options.sourceMaxZoom === undefined ? false : options.sourceMaxZoom;
        this._sourceMaxZoom = this._configuredMaxZoom; // Source maxzoom to enable overzoom
        this._configuredSourceType = options.sourceType || 'auto';
        this._onTileError = options.onTileError || function (error) { console.error(error); };
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
        };
        this._customDraw = options.customDraw || false;

        this.mVTLayers = [];  //Keep a list of the layers contained in the PBFs        
        this._tilesDrawn = Object.create(null); //  List of tiles drawn  (when cache enabled)
        this._visibleTiles = Object.create(null); // tiles currently in the viewport        
        this._selectedFeatures = Object.create(null); // list of selected features
        this.loadedTilesLen = 0; // total number of loaded tiles
        this._sourceGeneration = 0;
        this._initializeSource();

        if (options.selectedFeatures) {
            this.setSelectedFeatures(options.selectedFeatures);
        }

        this.map.addListener("zoom_changed", () => {
            self._zoomChanged();
        });
    }

    getTile(coord, zoom, ownerDocument) {
        var tileContext = this.drawTile(coord, zoom, ownerDocument);
        this._setVisibleTile(tileContext);
        return tileContext.canvas;
    }

    releaseTile(canvas) {
        var tileContext = this._visibleTiles[canvas.id];
        if (tileContext && tileContext.canvas === canvas) {
            tileContext.released = true;
            this._deleteVisibleTile(canvas.id);
            this._updateLoadedTiles();
        }
    }

    _zoomChanged() {
        this._resetVisibleTiles();
        if (!this._cache) {
            this._resetMVTLayers();
        }
    }

    _resetMVTLayers() {
        this.mVTLayers = [];
    }

    _deleteVisibleTile(id) {
        delete this._visibleTiles[id];
    }

    _resetVisibleTiles() {
        this._visibleTiles = Object.create(null);
        this.loadedTilesLen = 0;
    }

    _setVisibleTile(tileContext) {
        tileContext.released = false;
        this._visibleTiles[tileContext.id] = tileContext;
        this._updateLoadedTiles();
    }

    drawTile(coord, zoom, ownerDocument) {
        var id = this.getTileId(zoom, coord.x, coord.y);
        var tileContext = this._tilesDrawn[id];
        if (tileContext) {
            return tileContext;
        }

        tileContext = this._createTileContext(coord, zoom, ownerDocument);
        this._loadTile(tileContext);
        return tileContext;
    }

    _createTileContext(coord, zoom, ownerDocument) {
        var id = this.getTileId(zoom, coord.x, coord.y);
        var canvas = this._createCanvas(ownerDocument, id);
        var parentId = this._getParentId(id);

        return {
            id: id,
            canvas: canvas,
            zoom: zoom,
            tileSize: this._tileSize,
            parentId: parentId
        };
    }

    _getParentId(id) {
        var parentId = false;
        if (this._sourceMaxZoom !== false) {
            var tile = this.getTileObject(id);
            if (tile.zoom > this._sourceMaxZoom) {
                var zoomDistance = tile.zoom - this._sourceMaxZoom;
                var zoom = tile.zoom - zoomDistance;
                var x = Math.floor(tile.x / Math.pow(2, zoomDistance));
                var y = Math.floor(tile.y / Math.pow(2, zoomDistance));
                parentId = this.getTileId(zoom, x, y);
            }
        }
        return parentId;
    }

    _createCanvas(ownerDocument, id) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this._tileSize;
        canvas.height = this._tileSize;
        canvas.id = id;
        return canvas;
    }

    getTileId(zoom, x, y) {
        return [zoom, x, y].join(":");
    }

    getTileObject(id) {
        var values = id.split(":");
        return {
            zoom: parseInt(values[0], 10),
            x: parseInt(values[1], 10),
            y: parseInt(values[2], 10)
        }
    }

    _initializeSource() {
        var generation = ++this._sourceGeneration;
        this._sourceType = this._configuredSourceType === 'auto'
            ? (/\.pmtiles(?:[?#]|$)/i.test(this._url) ? 'pmtiles' : 'pbf')
            : this._configuredSourceType;
        if (this._sourceType !== 'pbf' && this._sourceType !== 'pmtiles') {
            throw new Error('sourceType must be "auto", "pbf" or "pmtiles".');
        }
        this._sourceMaxZoom = this._configuredMaxZoom;
        this._pendingTiles = new Map();
        this._pmtiles = null;
        this._sourceReady = Promise.resolve();
        if (this._sourceType === 'pmtiles') {
            if (typeof pmtiles === 'undefined') {
                throw new Error('PMTiles reader is missing. Use the bundled distribution or load lib/pmtiles/pmtiles.js first.');
            }
            this._pmtiles = new pmtiles.PMTiles(new pmtiles.FetchSource(this._url, new Headers(this._xhrHeaders)));
            this._sourceReady = this._pmtiles.getHeader().then(header => {
                if (header.tileType !== pmtiles.TileType.Mvt) {
                    throw new Error('The PMTiles archive must contain MVT vector tiles.');
                }
                if (generation === this._sourceGeneration) {
                    this._sourceMaxZoom = this._configuredMaxZoom === false
                        ? header.maxZoom : Math.min(this._configuredMaxZoom, header.maxZoom);
                }
                return header;
            });
            // Requests report initialization failures through onTileError.
            this._sourceReady.catch(function () { });
        }
    }

    _loadTile(tileContext) {
        tileContext.loaded = false;
        tileContext.loading = true;
        tileContext.released = false;
        tileContext.generation = this._sourceGeneration;
        tileContext.requestId = (tileContext.requestId || 0) + 1;
        this._updateLoadedTiles();
        if (this._sourceType === 'pmtiles') {
            this._pmtilesRequest(tileContext);
        } else {
            this._xhrRequest(tileContext);
        }
    }

    _isCurrentTile(tileContext, requestId) {
        return tileContext.generation === this._sourceGeneration &&
            tileContext.requestId === requestId && !tileContext.released &&
            this.map.getZoom() === tileContext.zoom;
    }

    async _pmtilesRequest(tileContext) {
        var requestId = tileContext.requestId;
        var archive = this._pmtiles;
        var pending = this._pendingTiles;
        try {
            var header = await this._sourceReady;
            if (!this._isCurrentTile(tileContext, requestId)) return;
            // The header is asynchronous: calculate overzoom after it is available.
            tileContext.parentId = this._getParentId(tileContext.id);
            var tile = this.getTileObject(tileContext.parentId || tileContext.id);
            var width = Math.pow(2, tile.zoom);
            if (tile.y < 0 || tile.y >= width || tile.zoom < header.minZoom) {
                this._finishTile(tileContext);
                return;
            }
            var x = ((tile.x % width) + width) % width;
            var key = this.getTileId(tile.zoom, x, tile.y);
            var request = pending.get(key);
            if (!request) {
                request = archive.getZxy(tile.zoom, x, tile.y);
                pending.set(key, request);
                request.then(() => pending.delete(key), () => pending.delete(key));
            }
            var result = await request;
            if (!this._isCurrentTile(tileContext, requestId)) return;
            if (result) {
                this._xhrResponseOk(tileContext, result.data);
            }
            this._finishTile(tileContext);
        } catch (error) {
            if (this._isCurrentTile(tileContext, requestId)) {
                this._finishTile(tileContext, error);
            }
        }
    }

    _updateLoadedTiles() {
        this.loadedTilesLen = Object.keys(this._visibleTiles).filter(id => this._visibleTiles[id].loaded).length;
    }

    _finishTile(tileContext, error) {
        tileContext.loaded = true;
        tileContext.loading = false;
        this._drawDebugInfo(tileContext);
        if (!error) this._setTileDrawn(tileContext);
        this._updateLoadedTiles();
        if (error) this._onTileError(error, tileContext);
    }

    _xhrRequest(tileContext) {
        var self = this;
        var requestId = tileContext.requestId;

        var id = tileContext.parentId || tileContext.id;
        var tile = this.getTileObject(id);

        var src = this._url
            .replace("{z}", tile.zoom)
            .replace("{x}", tile.x)
            .replace("{y}", tile.y);

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onload = function () {
            if (!self._isCurrentTile(tileContext, requestId)) return;
            try {
                if (xmlHttpRequest.status === 200 && xmlHttpRequest.response) {
                    self._xhrResponseOk(tileContext, xmlHttpRequest.response);
                } else if (xmlHttpRequest.status !== 204 && xmlHttpRequest.status !== 404) {
                    throw new Error('Tile request failed: HTTP ' + xmlHttpRequest.status);
                }
                self._finishTile(tileContext);
            } catch (error) {
                self._finishTile(tileContext, error);
            }
        };
        xmlHttpRequest.onerror = function () {
            if (self._isCurrentTile(tileContext, requestId)) {
                self._finishTile(tileContext, new Error('Tile request failed: ' + src));
            }
        };
        xmlHttpRequest.open('GET', src, true);
        for (var header in this._xhrHeaders) {
            xmlHttpRequest.setRequestHeader(header, this._xhrHeaders[header]);
        }
        xmlHttpRequest.responseType = 'arraybuffer';
        xmlHttpRequest.send();
    }

    _xhrResponseOk(tileContext, response) {
        if (this.map.getZoom() != tileContext.zoom) {
            return;
        }
        var uint8Array = new Uint8Array(response);
        var pbf = new Pbf(uint8Array);
        var vectorTile = new VectorTile(pbf);
        this._drawVectorTile(vectorTile, tileContext);
    }
    
    tileLoaded() {
        return new Promise(resolve => {
            const check = () => {
                this._updateLoadedTiles();
                if (Object.keys(this._visibleTiles).every(id => this._visibleTiles[id].loaded)) {
                    resolve(true);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    _setTileDrawn(tileContext) {
        if (!this._cache) return;
        this._tilesDrawn[tileContext.id] = tileContext;
    }

    deleteTileDrawn(id) {
        delete this._tilesDrawn[id];
    }

    _resetTileDrawn() {
        this._tilesDrawn = Object.create(null);
    }

    _drawVectorTile(vectorTile, tileContext) {
        if (this._visibleLayers) {
            for (var i = 0, length = this._visibleLayers.length; i < length; i++) {
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
        this._drawDebugInfo(tileContext);
        this._setTileDrawn(tileContext);
    }

    _drawVectorTileLayer(vectorTileLayer, key, tileContext) {
        if (!this.mVTLayers[key]) {
            this.mVTLayers[key] = this._createMVTLayer(key);
        }
        var mVTLayer = this.mVTLayers[key];
        mVTLayer.parseVectorTileFeatures(this, vectorTileLayer.parsedFeatures, tileContext);
    }

    _createMVTLayer(key) {
        var options = {
            getIDForLayerFeature: this.getIDForLayerFeature,
            filter: this._filter,
            style: this.style,
            name: key,
            customDraw: this._customDraw
        };
        return new MVTLayer(options);
    }

    _drawDebugInfo(tileContext) {
        if (!this._debug) return;
        var tile = this.getTileObject(tileContext.id)
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

    onClick(event, callbackFunction, options) {
        this._multipleSelection = (options && options.multipleSelection) || false;
        options = this._getMouseOptions(options, false);
        this._mouseEvent(event, callbackFunction, options);
    }

    onMouseHover(event, callbackFunction, options) {
        this._multipleSelection = (options && options.multipleSelection) || false;
        options = this._getMouseOptions(options, true);
        this._mouseEvent(event, callbackFunction, options);
    }

    _getMouseOptions(options, mouseHover) {
        return {
            mouseHover: mouseHover,
            setSelected: options.setSelected || false,
            toggleSelection: (options.toggleSelection === undefined || options.toggleSelection),
            limitToFirstVisibleLayer: options.limitToFirstVisibleLayer || false,
            delay: options.delay || 0
        }
    }

    _mouseEvent(event, callbackFunction, options) {
        if (!event.pixel || !event.latLng) return;
        
        if (options.delay == 0) {
            return this._mouseEventContinue(event, callbackFunction, options);
        }

        this.event = event;
        var me = this;
        setTimeout(function () {
            if (event != me.event) return;            
            me._mouseEventContinue(me.event, callbackFunction, options);
        }, options.delay, event);
        
       
    }
    _mouseEventContinue(event, callbackFunction, options) {
        callbackFunction = callbackFunction || function () { };
        var limitToFirstVisibleLayer = options.limitToFirstVisibleLayer || false;
        var zoom = this.map.getZoom();
        var tile = MERCATOR.getTileAtLatLng(event.latLng, zoom);
        var id = this.getTileId(tile.z, tile.x, tile.y);
        var tileContext = this._visibleTiles[id];
        if (!tileContext) {
            return;
        }
        event.tileContext = tileContext;
        event.tilePoint = MERCATOR.fromLatLngToTilePoint(this.map, event);

        var clickableLayers = this._clickableLayers || Object.keys(this.mVTLayers) || [];
        for (var i = clickableLayers.length - 1; i >= 0; i--) {
            var key = clickableLayers[i];
            var layer = this.mVTLayers[key];
            if (layer) {
                var event = layer.handleClickEvent(event, this);
                this._mouseSelectedFeature(event, callbackFunction, options);
                if (limitToFirstVisibleLayer && event.feature) {
                    break;
                }
            }
        }
    }

    _mouseSelectedFeature(event, callbackFunction, options) {
        if (options.setSelected) {
            var feature = event.feature;
            if (feature) {
                if (options.mouseHover) {
                    if (!feature.selected) {
                        feature.select();
                    }
                }
                else {
                    if (options.toggleSelection) {
                        feature.toggle();
                    }
                    else {
                        if (!feature.selected) {
                            feature.select();
                        }
                    }                    
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
        var zoom = this.map.getZoom();
        var tilesToRedraw = [];        
        for (var featureId in this._selectedFeatures) {
            var mVTFeature = this._selectedFeatures[featureId];
            if (!mVTFeature) continue;
            mVTFeature.setSelected(false);
            var tiles = mVTFeature.getTiles();
            for (var id in tiles) {
                this.deleteTileDrawn(id);
                var idObject = this.getTileObject(id);
                if (idObject.zoom == zoom) {
                    tilesToRedraw[id] = true;
                }
            }
        }        
        this.redrawTiles(tilesToRedraw);
        this._selectedFeatures = Object.create(null);
    }

    featureSelected(mVTFeature) {
        if (!this._multipleSelection) {
            this.deselectAllFeatures();
        }
        this._selectedFeatures[mVTFeature.featureId] = mVTFeature;
    }

    featureDeselected(mvtFeature) {
        delete this._selectedFeatures[mvtFeature.featureId];
    }

    setSelectedFeatures(featuresIds) {
        if (featuresIds.length > 1) {
            this._multipleSelection = true;
        }
        this.deselectAllFeatures();
        for (var i = 0, length = featuresIds.length; i < length; i++) {
            var featureId = featuresIds[i];
            this._selectedFeatures[featureId] = false;
            for (var key in this.mVTLayers) {
                this.mVTLayers[key].setSelected(featureId);
            }
        }
    }

    isFeatureSelected(featureId) {
        return this._selectedFeatures[featureId] != undefined;
    }

    getSelectedFeatures() {
        var selectedFeatures = [];
        for (var featureId in this._selectedFeatures) {
            selectedFeatures.push(this._selectedFeatures[featureId]);
        }
        return selectedFeatures;
    }

    getSelectedFeaturesInTile(tileContextId) {
        var selectedFeatures = [];
        for (var featureId in this._selectedFeatures) {
            var selectedFeature = this._selectedFeatures[featureId];
            if (!selectedFeature) continue;
            for (var tile in selectedFeature.tiles) {
                if (tile == tileContextId) {
                    selectedFeatures.push(selectedFeature);
                }
            }
        }
        return selectedFeatures;
    }

    setFilter(filter, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._filter = filter;
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setFilter(filter);
        }
        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    setStyle(style, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this.style = style
        for (var key in this.mVTLayers) {
            this.mVTLayers[key].setStyle(style);
        }

        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    setVisibleLayers(visibleLayers, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._visibleLayers = visibleLayers;
        if (redrawTiles) {
            this.redrawAllTiles();
        }
    }

    getVisibleLayers() {
        return this._visibleLayers;
    }

    setClickableLayers(clickableLayers) {
        this._clickableLayers = clickableLayers;
    }

    redrawAllTiles() {
        this._resetTileDrawn();        
        this.redrawTiles(this._visibleTiles);
    }

    redrawTiles(tiles) {
        for (var id in tiles) {
            this.redrawTile(id);
        }
    }

    redrawTile(id) {
        this.deleteTileDrawn(id);        
        var tileContext = this._visibleTiles[id];
        if (!tileContext) return;
        if (!tileContext.vectorTile) {
            if (!tileContext.loading) this._loadTile(tileContext);
            return;
        }
        this.clearTile(tileContext.canvas);
        this._drawVectorTile(tileContext.vectorTile, tileContext);
    }

    clearTile(canvas) {
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setUrl(url, redrawTiles) {
        redrawTiles = (redrawTiles === undefined || redrawTiles);
        this._url = url;
        this._initializeSource();
        this._resetMVTLayers();
        this._resetTileDrawn();
        for (var id in this._visibleTiles) {
            var tileContext = this._visibleTiles[id];
            tileContext.vectorTile = null;
            tileContext.loaded = false;
            tileContext.loading = false;
            this.clearTile(tileContext.canvas);
            if (redrawTiles) this._loadTile(tileContext);
        }
        this._updateLoadedTiles();
    }
}
