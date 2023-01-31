/*
 *  Created by Jes�s Barrio on 04/2021
 */

export class MVTSource {
  constructor(map, options) {
    const self = this;
    this.map = map;
    this._url = options.url || ''; // Url TO Vector Tile Source,
    this._sourceMaxZoom = options.sourceMaxZoom || false; // Source maxzoom to enable overzoom
    this._debug = options.debug || false; // Draw tiles lines and ids
    this.getIDForLayerFeature = options.getIDForLayerFeature || function(feature) {
      return feature.properties.id || feature.properties.Id || feature.properties.ID;
    };
    this._visibleLayers = options.visibleLayers || false; // List of visible layers
    this._xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
    this._clickableLayers = options.clickableLayers || false; // List of layers that are clickable
    this._filter = options.filter || false; // Filter features
    this._cache = options.cache || false; // Load tiles in cache to avoid duplicated requests
    this._tileSize = options.tileSize || 256; // Default tile size
    this.tileSize = new google.maps.Size(this._tileSize, this._tileSize);
    this.style = options.style || function(feature) {
      const style = {};
      switch (feature.type) {
        case 1: // 'Point'
          style.fillStyle = 'rgba(49,79,79,1)';
          style.radius = 5;
          style.selected = {
            fillStyle: 'rgba(255,255,0,0.5)',
            radius: 6,
          };
          break;
        case 2: // 'LineString'
          style.strokeStyle = 'rgba(136, 86, 167, 1)';
          style.lineWidth = 3;
          style.selected = {
            strokeStyle: 'rgba(255,25,0,0.5)',
            lineWidth: 4,
          };
          break;
        case 3: // 'Polygon'
          style.fillStyle = 'rgba(188, 189, 220, 0.5)';
          style.strokeStyle = 'rgba(136, 86, 167, 1)';
          style.lineWidth = 1;
          style.selected = {
            fillStyle: 'rgba(255,140,0,0.3)',
            strokeStyle: 'rgba(255,140,0,1)',
            lineWidth: 2,
          };
          break;
      }
      return style;
    };
    this._customDraw = options.customDraw || false;

    this.mVTLayers = []; // Keep a list of the layers contained in the PBFs
    this._tilesDrawn = []; //  List of tiles drawn  (when cache enabled)
    this._visibleTiles = []; // tiles currently in the viewport
    this._selectedFeatures = []; // list of selected features
    if (options.selectedFeatures) {
      this.setSelectedFeatures(options.selectedFeatures);
    }

    this.map.addListener('zoom_changed', () => {
      self._zoomChanged();
    });
  }

  getTile(coord, zoom, ownerDocument) {
    const tileContext = this.drawTile(coord, zoom, ownerDocument);
    this._setVisibleTile(tileContext);
    return tileContext.canvas;
  }

  releaseTile(canvas) {
    // this._deleteVisibleTile(canvas.id);
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
    this._visibleTiles = [];
  }

  _setVisibleTile(tileContext) {
    this._visibleTiles[tileContext.id] = tileContext;
  }

  drawTile(coord, zoom, ownerDocument) {
    const id = this.getTileId(zoom, coord.x, coord.y);
    let tileContext = this._tilesDrawn[id];
    if (tileContext) {
      return tileContext;
    }

    tileContext = this._createTileContext(coord, zoom, ownerDocument);
    this._xhrRequest(tileContext);
    return tileContext;
  }

  _createTileContext(coord, zoom, ownerDocument) {
    const id = this.getTileId(zoom, coord.x, coord.y);
    const canvas = this._createCanvas(ownerDocument, id);
    const parentId = this._getParentId(id);

    return {
      id: id,
      canvas: canvas,
      zoom: zoom,
      tileSize: this._tileSize,
      parentId: parentId,
    };
  }

  _getParentId(id) {
    let parentId = false;
    if (this._sourceMaxZoom) {
      const tile = this.getTileObject(id);
      if (tile.zoom > this._sourceMaxZoom) {
        const zoomDistance = tile.zoom - this._sourceMaxZoom;
        const zoom = tile.zoom - zoomDistance;
        const x = tile.x >> zoomDistance;
        const y = tile.y >> zoomDistance;
        parentId = this.getTileId(zoom, x, y);
      }
    }
    return parentId;
  }

  _createCanvas(ownerDocument, id) {
    const canvas = ownerDocument.createElement('canvas');
    canvas.width = this._tileSize;
    canvas.height = this._tileSize;
    canvas.id = id;
    return canvas;
  }

  getTileId(zoom, x, y) {
    return [zoom, x, y].join(':');
  }

  getTileObject(id) {
    const values = id.split(':');
    return {
      zoom: values[0],
      x: values[1],
      y: values[2],
    };
  }

  _xhrRequest(tileContext) {
    const self = this;

    const id = tileContext.parentId || tileContext.id;
    const tile = this.getTileObject(id);

    const src = this._url
        .replace('{z}', tile.zoom)
        .replace('{x}', tile.x)
        .replace('{y}', tile.y);

    const xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.onload = function() {
      if (xmlHttpRequest.status == '200' && xmlHttpRequest.response) {
        return self._xhrResponseOk(tileContext, xmlHttpRequest.response);
      }
      self._drawDebugInfo(tileContext);
    };
    xmlHttpRequest.open('GET', src, true);
    for (const header in this._xhrHeaders) {
      xmlHttpRequest.setRequestHeader(header, this._xhrHeaders[header]);
    }
    xmlHttpRequest.responseType = 'arraybuffer';
    xmlHttpRequest.send();
  }

  _xhrResponseOk(tileContext, response) {
    if (this.map.getZoom() != tileContext.zoom) {
      return;
    }
    const uint8Array = new Uint8Array(response);
    const pbf = new Pbf(uint8Array);
    const vectorTile = new VectorTile(pbf);
    this._drawVectorTile(vectorTile, tileContext);
  }

  _setTileDrawn(tileContext) {
    if (!this._cache) return;
    this._tilesDrawn[tileContext.id] = tileContext;
  }

  deleteTileDrawn(id) {
    delete this._tilesDrawn[id];
  }

  _resetTileDrawn() {
    this._tilesDrawn = [];
  }

  _drawVectorTile(vectorTile, tileContext) {
    if (this._visibleLayers) {
      for (let i = 0, length = this._visibleLayers.length; i < length; i++) {
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
    const mVTLayer = this.mVTLayers[key];
    mVTLayer.parseVectorTileFeatures(this, vectorTileLayer.parsedFeatures, tileContext);
  }

  _createMVTLayer(key) {
    const options = {
      getIDForLayerFeature: this.getIDForLayerFeature,
      filter: this._filter,
      style: this.style,
      name: key,
      customDraw: this._customDraw,
    };
    return new MVTLayer(options);
  }

  _drawDebugInfo(tileContext) {
    if (!this._debug) return;
    const tile = this.getTileObject(tileContext.id);
    const width = this._tileSize;
    const height = this._tileSize;
    const context2d = tileContext.canvas.getContext('2d');
    context2d.strokeStyle = '#000000';
    context2d.fillStyle = '#FFFF00';
    context2d.strokeRect(0, 0, width, height);
    context2d.font = '12px Arial';
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
    this._multipleSelection = false;
    options = this._getMouseOptions(options, true);
    this._mouseEvent(event, callbackFunction, options);
  }

  _getMouseOptions(options, mouseHover) {
    return {
      mouseHover: mouseHover,
      setSelected: options.setSelected || false,
      toggleSelection: (options.toggleSelection === undefined || options.toggleSelection),
      limitToFirstVisibleLayer: options.limitToFirstVisibleLayer || false,
      delay: options.delay || 0,
    };
  }

  _mouseEvent(event, callbackFunction, options) {
    if (!event.pixel || !event.latLng) return;

    if (options.delay == 0) {
      return this._mouseEventContinue(event, callbackFunction, options);
    }

    this.event = event;
    const me = this;
    setTimeout(function() {
      if (event != me.event) return;
      me._mouseEventContinue(me.event, callbackFunction, options);
    }, options.delay, event);
  }
  _mouseEventContinue(event, callbackFunction, options) {
    callbackFunction = callbackFunction || function() { };
    const limitToFirstVisibleLayer = options.limitToFirstVisibleLayer || false;
    const zoom = this.map.getZoom();
    const tile = MERCATOR.getTileAtLatLng(event.latLng, zoom);
    const id = this.getTileId(tile.z, tile.x, tile.y);
    const tileContext = this._visibleTiles[id];
    if (!tileContext) {
      return;
    }
    event.tileContext = tileContext;
    event.tilePoint = MERCATOR.fromLatLngToTilePoint(this.map, event);

    const clickableLayers = this._clickableLayers || Object.keys(this.mVTLayers) || [];
    for (let i = clickableLayers.length - 1; i >= 0; i--) {
      const key = clickableLayers[i];
      const layer = this.mVTLayers[key];
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
      const feature = event.feature;
      if (feature) {
        if (options.mouseHover) {
          if (!feature.selected) {
            feature.select();
          }
        } else {
          if (options.toggleSelection) {
            feature.toggle();
          } else {
            if (!feature.selected) {
              feature.select();
            }
          }
        }
      } else {
        if (options.mouseHover) {
          this.deselectAllFeatures();
        }
      }
    }
    callbackFunction(event);
  }

  deselectAllFeatures() {
    const zoom = this.map.getZoom();
    const tilesToRedraw = [];
    for (const featureId in this._selectedFeatures) {
      const mVTFeature = this._selectedFeatures[featureId];
      if (!mVTFeature) continue;
      mVTFeature.setSelected(false);
      const tiles = mVTFeature.getTiles();
      for (const id in tiles) {
        this.deleteTileDrawn(id);
        const idObject = this.getTileObject(id);
        if (idObject.zoom == zoom) {
          tilesToRedraw[id] = true;
        }
      }
    }
    this.redrawTiles(tilesToRedraw);
    this._selectedFeatures = [];
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
    for (let i = 0, length = featuresIds.length; i < length; i++) {
      const featureId = featuresIds[i];
      this._selectedFeatures[featureId] = false;
      for (const key in this.mVTLayers) {
        this.mVTLayers[key].setSelected(featureId);
      }
    }
  }

  isFeatureSelected(featureId) {
    return this._selectedFeatures[featureId] != undefined;
  }

  getSelectedFeatures() {
    const selectedFeatures = [];
    for (const featureId in this._selectedFeatures) {
      selectedFeatures.push(this._selectedFeatures[featureId]);
    }
    return selectedFeatures;
  }

  getSelectedFeaturesInTile(tileContextId) {
    const selectedFeatures = [];
    for (const featureId in this._selectedFeatures) {
      const selectedFeature = this._selectedFeatures[featureId];
      for (const tile in selectedFeature.tiles) {
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
    for (const key in this.mVTLayers) {
      this.mVTLayers[key].setFilter(filter);
    }
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }

  setStyle(style, redrawTiles) {
    redrawTiles = (redrawTiles === undefined || redrawTiles);
    this.style = style;
    for (const key in this.mVTLayers) {
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
    for (const id in tiles) {
      this.redrawTile(id);
    }
  }

  redrawTile(id) {
    this.deleteTileDrawn(id);
    const tileContext = this._visibleTiles[id];
    if (!tileContext || !tileContext.vectorTile) return;
    this.clearTile(tileContext.canvas);
    this._drawVectorTile(tileContext.vectorTile, tileContext);
  }

  clearTile(canvas) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  setUrl(url, redrawTiles) {
    redrawTiles = (redrawTiles === undefined || redrawTiles);
    this._url = url;
    this._resetMVTLayers();
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }
}
