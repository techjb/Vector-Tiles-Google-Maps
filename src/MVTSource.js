/*
 *  Created by Jes�s Barrio on 04/2021
 */

// eslint-disable-next-line spaced-comment
/// <reference types="google.maps" />

import Pbf from 'pbf';
import {VectorTile} from '@mapbox/vector-tile';
import {getTileAtLatLng, fromLatLngToTilePoint} from '../lib/mercator.js';
import {MVTLayer} from './MVTLayer.js';
import {getTileFromString, getTileString} from '../lib/geometry.js';

/**
 * @typedef {import('@mapbox/vector-tile').VectorTileLayer} VectorTileLayer
 * @typedef {import('@mapbox/vector-tile').VectorTileFeature} VectorTileFeature
 * @typedef {import('./MVTFeature').FeatureTile} FeatureTile
 * @typedef {import('./MVTFeature').MVTFeature} MVTFeature
 * @typedef {import('./MVTLayer').TileMapMouseEvent} TileMapMouseEvent
 */

/**
 * @callback urlFn - A function that generates a url
 * @param {number} zoom - the zoom level on the map
 * @param {number} x - the x position of the tile
 * @param {number} y - the y position of the tile
 * @return {string} - A url for fetching a tile
 *
 * @callback featureIdFn - A function that returns a unique id for a feature
 * @param {VectorTileFeature} feature
 * @return {string|number}
 *
 * @callback styleFn - A function that returns a style for a feature
 * @param {VectorTileFeature} feature
 * @param {string} name
 * @return {StyleOptions}
 *
 * @callback drawFn - A function that returns a style for a feature
 * @param {TileContext} tileContext
 * @param {FeatureTile} tile
 * @param {StyleOptions} style
 * @return {void}
 *
 * @callback filterFn - A function that returns a style for a feature
 * @param {VectorTileFeature} feature
 * @param {TileContext} context
 * @return {boolean}
 */

/**
 * @typedef {Object} MVTSourceOptions
 * @property {(string|urlFn)} [url] Url to Vector Tile Source
 * @property {number} [sourceMaxZoom] Source max zoom to enable over zoom
 * @property {boolean} [debug] Draw tiles lines and ids
 * @property {boolean} [cache=false] Load tiles in cache to avoid duplicated requests
 * @property {number} [tileSize=256] Tile size
 * @property {Array<String>} [visibleLayers] List of visible layers
 * @property {Array<String>} [clickableLayers] List of layers that are clickable
 * @property {Array<String>} [selectedFeatures] List of selected features
 * @property {featureIdFn} [getIDForLayerFeature] Function to get id for layer feature
 * @property {styleFn} [style] Styling function
 * @property {filterFn} [filter] Filter function
 * @property {drawFn} [customDraw] Custom draw function
*/

/**
 * @typedef {Object} TileContext
 * @property {string} id Tile id in format 'zoom:x:y'
 * @property {HTMLCanvasElement} canvas Canvas element for drawing tile
 * @property {number} zoom Zoom level this tile belongs to
 * @property {number} tileSize Tile size
 * @property {string} parentId Parent tile id in format 'zoom:x:y'
 * @property {VectorTile} [vectorTile]
 */

/**
 * @typedef {Object} StyleOptions
 * @property {string} fillStyle Fill color
 * @property {string} strokeStyle Stroke color
 * @property {number} lineWidth Stroke width
 * @property {number} radius Point radius
 * @property {StyleOptions} selected Selected style
 */

/**
 * @typedef {Object} ClickHandlerOptions
 * @property {boolean} [limitToFirstVisibleLayer=false] Trigger events only to the first visible layer
 * @property {boolean} [multipleSelection=false] Multiple feature selection
 * @property {boolean} [setSelected=false] Set feature selected style
 * @property {boolean} [toggleSelection=true] Toggle feature selected style
 * @property {number} [delay=0] If new event is triggered before delay, old event will be ignored. Used to avoid
 * overload on mousemove event
 */

/**
 * Returns a fully populated ClickHandlerOptions object, merging the default values with the provided options
 * @param {ClickHandlerOptions} [options]
 * @return {ClickHandlerOptions}
 * @private
 */
const getMouseOptions = (options={}) => {
  return {
    setSelected: options.setSelected || false,
    toggleSelection: (options.toggleSelection === undefined || options.toggleSelection),
    limitToFirstVisibleLayer: options.limitToFirstVisibleLayer || false,
    delay: options.delay || 0,
    multipleSelection: options.multipleSelection || false,
  };
};

/**
 * Returns the default styling function
 * @param {VectorTileFeature} feature
 * @return {StyleOptions}
 * @private
 */
const defaultStyleFn = function(feature) {
  return {
    1: { // Point
      fillStyle: 'rgba(49,79,79,1)',
      radius: 5,
      selected: {
        fillStyle: 'rgba(255,255,0,0.5)',
        radius: 6,
      },
    },
    2: { // LineString
      strokeStyle: 'rgba(136, 86, 167, 1)',
      lineWidth: 3,
      selected: {
        strokeStyle: 'rgba(255,25,0,0.5)',
        lineWidth: 4,
      },
    },
    3: { // Polygon
      fillStyle: 'rgba(188, 189, 220, 0.5)',
      strokeStyle: 'rgba(136, 86, 167, 1)',
      lineWidth: 1,
      selected: {
        fillStyle: 'rgba(255,140,0,0.3)',
        strokeStyle: 'rgba(255,140,0,1)',
        lineWidth: 2,
      },
    },
  }[feature.type] || {};
};

/**
 * @param {VectorTileFeature} feature
 * @return {string|number}
 * @private
 */
const defaultFeatureIdFn = function(feature) {
  return feature?.properties?.id || feature?.properties?.Id || feature?.properties?.ID;
};

/**
 * @param {string} tileId
 * @param {number} maxZoom
 * @return {string} Parent tile id
 * @private
 */
const getParentId = (tileId, maxZoom) => {
  if (!maxZoom) return '';
  const tile = getTileFromString(tileId);
  if (!(tile.zoom > maxZoom)) return '';
  const zoomDistance = tile.zoom - maxZoom;
  const zoom = tile.zoom - zoomDistance;
  const x = tile.x >> zoomDistance;
  const y = tile.y >> zoomDistance;
  return getTileString(zoom, x, y);
};

/**
 * @param {Document} ownerDocument
 * @param {string} tileId
 * @param {number} tileSize
 * @return {HTMLCanvasElement}
 * @private
 */
const createCanvas = (ownerDocument, tileId, tileSize) => {
  const canvas = ownerDocument.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  canvas.id = tileId;
  return canvas;
};

/**
 * MVTSource is a class to load and draw Vector Tiles from a source.
 * @class
 * @implements {google.maps.MapType}
 */
class MVTSource {
  /**
   * @param {google.maps.Map} map
   * @param {MVTSourceOptions} options
   */
  constructor(map, options = {}) {
    // Private properties
    /** @type {(string|urlFn)} Url to Vector Tile Source */
    this._url = options.url || null;
    /** @type {number} Source max zoom to enable over zoom */
    this._sourceMaxZoom = options.sourceMaxZoom ?? null;
    /** @type {boolean} Draw tiles lines and ids */
    this._debug = options.debug || false;
    /** @type {Array<String>} List of visible layers */
    this._visibleLayers = options.visibleLayers || null;
    /** @type {Array<String>} List of layers that are clickable */
    this._clickableLayers = options.clickableLayers || null;
    /** @type {boolean} Load tiles in cache to avoid duplicated requests */
    this._cache = options.cache || false;
    /** @type {number} Default tile size */
    this._tileSize = options.tileSize || 256;
    /** @type {filterFn} filter function to allow/deny features */
    this._filter = options.filter || false; // Filter features
    /** @type {Record<string, string>} Additional headers to add when requesting tiles from the server */
    this._xhrHeaders = options.xhrHeaders || {}; // Headers added to every url request
    /** @type {drawFn} */
    this._customDraw = options.customDraw || null;
    /** @type {boolean} Allow multiple selection */
    this._multipleSelection = options.multipleSelection || false;

    /** @type {Record<string, TileContext>} List of tiles drawn. Only populated when cache enabled */
    this._tilesDrawn = {};
    /** @type {Record<string, TileContext>} List of tiles currently in the viewport */
    this._visibleTiles = {}; // tiles currently in the viewport. Reset on zoom_changed, populated on getTile
    /** @type {Record<string, MVTFeature>} List of selected features */
    this._selectedFeatures = {}; // list of selected features

    // Public properties
    /** @type {google.maps.Map} */
    this.map = map;
    /** @type {featureIdFn} Function to get id for layer feature */
    this.getIDForLayerFeature = options.getIDForLayerFeature || defaultFeatureIdFn;
    /** @type {google.maps.Size} */
    this.tileSize = new window.google.maps.Size(this._tileSize, this._tileSize);
    /** @type {styleFn|StyleOptions} */
    this.style = options.style || defaultStyleFn;
    /** @type {Record<string, MVTLayer>} Keep a list of the layers contained in the PBFs */
    this.mVTLayers = {};

    // Init
    if (options.selectedFeatures) {
      this.setSelectedFeatures(options.selectedFeatures);
    }
    this.map.addListener('zoom_changed', () => {
      this._visibleTiles = {};
      if (!this._cache) {
        this.mVTLayers = {};
      }
    });
  }

  /**
   * Invoked by the Google Maps API as part of the MapType interface.
   * Returns a tile for the given tile coordinate (x, y) and zoom level. This tile will be appended to the given
   * ownerDocument. Not available for base map types.
   * @param {google.maps.Point} tileCoord
   * @param {number} zoom
   * @param {Document} ownerDocument
   * @return {Element}
   */
  getTile(tileCoord, zoom, ownerDocument) {
    const tileContext = this.drawTile(tileCoord, zoom, ownerDocument);
    this._visibleTiles[tileContext.id] = tileContext;
    return tileContext.canvas;
  }

  /**
   * Invoked by the Google Maps API as part of the MapType interface.
   * Releases the given tile, performing any necessary cleanup. The provided tile will have already been removed from
   * the document. Optional.
   * @param {Element} tile
   */
  releaseTile(tile) {}

  /**
   * @param {google.maps.Point} coord
   * @param {number} zoom
   * @param {Document} ownerDocument
   * @return {TileContext}
   */
  drawTile(coord, zoom, ownerDocument) {
    const id = getTileString(zoom, coord.x, coord.y);
    if (this._tilesDrawn[id]) {
      return this._tilesDrawn[id];
    }
    const canvas = createCanvas(ownerDocument, id, this._tileSize);
    const parentId = getParentId(id, this._sourceMaxZoom);
    const tileContext = {
      id,
      canvas,
      zoom,
      tileSize: this._tileSize,
      parentId,
    };
    this._fetchTile(tileContext);
    return tileContext;
  }

  /**
   * @param {TileContext} tileContext
   */
  async _fetchTile(tileContext) {
    // Draw debug tile info before trying to get tile data so that if errors occur, the debug info still draws
    this._drawDebugInfo(tileContext);

    // Get the tile from the id
    const id = tileContext.parentId || tileContext.id;
    const tile = getTileFromString(id);

    /** @type {Response} */
    let response;
    /** @type {string} */
    let src;
    try {
      // If this._url is a function general the url with it, else replace {z} {y} and {x} in a string
      if (typeof this._url === 'function') {
        src = this._url(tile.zoom, tile.x, tile.y);
      } else {
        src = this._url.replace('{z}', tile.zoom).replace('{x}', tile.x).replace('{y}', tile.y);
      }
      // Fetch the response
      response = await fetch(src, {
        headers: this._xhrHeaders,
      });
    } catch (error) {
      console.error(`Error fetching tile at source '${src}': ${error}`);
      return;
    }
    if (response.ok) {
      // If the zoom has changed since the request was made, don't draw the tile
      if (this.map.getZoom() != tileContext.zoom) return;

      // Create a vector tile instance and draw it
      try {
        const arrayBuffer = await response.arrayBuffer();
        const vectorTile = new VectorTile(new Pbf(new Uint8Array(arrayBuffer)));
        this._drawVectorTile(vectorTile, tileContext);
      } catch (error) {
        console.error('Error occurred while creating/drawing vector tile:', error);
        return;
      }
    }
  }

  /**
   * @param {VectorTile} vectorTile
   * @param {TileContext} tileContext
   */
  _drawVectorTile(vectorTile, tileContext) {
    // If the user has specified a list of layers to draw, only draw those layers
    const layers = this._visibleLayers ? this._visibleLayers : Object.keys(vectorTile.layers);
    layers.forEach((key) => {
      if (!vectorTile.layers[key]) return; // If the user has specified a layer that doesn't exist, skip it
      this._drawVectorTileLayer(vectorTile.layers[key], key, tileContext);
    });

    tileContext.vectorTile = vectorTile;
    if (!this._cache) return;
    // If cache is enabled, store the TileContext in the cache
    this._tilesDrawn[tileContext.id] = tileContext;
  }

  /**
   * @param {VectorTileLayer} vectorTileLayer
   * @param {string} name
   * @param {TileContext} tileContext
   */
  _drawVectorTileLayer(vectorTileLayer, name, tileContext) {
    if (!this.mVTLayers[name]) {
      this.mVTLayers[name] = this._createMVTLayer(name);
    }
    const mVTLayer = this.mVTLayers[name];
    mVTLayer.parseVectorTileFeatures(this, vectorTileLayer, tileContext);
  }

  /**
   * Creates a new MVTLayer instance
   * @param {string} name name of the layer
   * @return {MVTLayer} MVTLayer instance
   */
  _createMVTLayer(name) {
    const options = {
      getIDForLayerFeature: this.getIDForLayerFeature,
      style: this.style,
      name,
      filter: this._filter,
      customDraw: this._customDraw,
    };
    return new MVTLayer(options);
  }

  /**
   * @param {TileContext} tileContext
   */
  _drawDebugInfo(tileContext) {
    if (!this._debug) return;
    const tile = getTileFromString(tileContext.id);
    const width = this._tileSize;
    const height = this._tileSize;
    const context2d = tileContext.canvas.getContext('2d');
    context2d.strokeStyle = '#000000';
    context2d.fillStyle = '#FFFF00';
    context2d.font = '12px Arial';
    context2d.strokeRect(0, 0, width, height); // outer border
    context2d.fillRect(0, 0, 5, 5); // top left corner marker
    context2d.fillRect(0, height - 5, 5, 5); // bottom left corner marker
    context2d.fillRect(width - 5, 0, 5, 5); // top right corner marker
    context2d.fillRect(width - 5, height - 5, 5, 5); // bottom right corner marker
    context2d.fillRect(width / 2 - 5, height / 2 - 5, 10, 10); // center marker
    context2d.strokeText(`Z: ${tileContext.zoom} X: ${tile.x} Y: ${tile.y}`, 10, 20);
    if (tileContext.vectorTile) {
      context2d.strokeText(`Layers: ${Object.keys(tileContext.vectorTile.layers).length}`, 10, 20 + 15);
      Object.entries(tileContext.vectorTile.layers).forEach(([key, layer], index) => {
        context2d.strokeText(`${key}: ${layer.length}`, 10, 20 + 15 + (index + 1) * 15);
      });
    }
  }

  /**
   * Wrap a mouse click event with a callback function
   * @param {google.maps.MapMouseEvent} event
   * @param {(event: TileMapMouseEvent)} callbackFunction
   * @param {ClickHandlerOptions} options
   */
  onClick(event, callbackFunction, options) {
    this._multipleSelection = (options && options.multipleSelection) || false;
    options = getMouseOptions(options);
    options.mouseHover = false;
    this._mouseEvent(event, callbackFunction, options);
  }

  /**
   * Wrap a mouse hover event with a callback function
   * @param {google.maps.MapMouseEvent} event
   * @param {(event: TileMapMouseEvent)} callbackFunction
   * @param {ClickHandlerOptions} options
   */
  onMouseHover(event, callbackFunction, options) {
    this._multipleSelection = false;
    options = getMouseOptions(options);
    options.mouseHover = true;
    this._mouseEvent(event, callbackFunction, options);
  }

  /**
   * @param {google.maps.MapMouseEvent} event
   * @param {(event: TileMapMouseEvent)} callbackFunction
   * @param {ClickHandlerOptions} options
   */
  _mouseEvent(event, callbackFunction, options) {
    // If the received event does not have a latLng, it is not a valid event
    if (!event.latLng) {
      console.warn('Invalid event received. Expected latLng to be defined.', event);
      return;
    }

    if (options.delay == 0) {
      this._mouseEventContinue(event, callbackFunction, options);
      return;
    }

    setTimeout(() => this._mouseEventContinue(event, callbackFunction, options), options.delay);
  }

  /**
   * @param {google.maps.MapMouseEvent} event
   * @param {(event: TileMapMouseEvent)} [callbackFunction=()=>{}]
   * @param {ClickHandlerOptions} options
   */
  _mouseEventContinue(event, callbackFunction = ()=>{}, options) {
    const tile = getTileAtLatLng(event.latLng, this.map.getZoom());
    const tileId = getTileString(tile.z, tile.x, tile.y);
    const tileContext = this._visibleTiles[tileId];
    if (!tileContext) return;

    const tilePoint = fromLatLngToTilePoint(this.map, event);
    /** @type {TileMapMouseEvent} */
    const newEvent = {
      ...event,
      tileContext,
      tilePoint: new window.google.maps.Point(tilePoint.x, tilePoint.y),
    };

    // if specific layers have been defined as clickable, only check those
    for (const layerName of (this._clickableLayers || Object.keys(this.mVTLayers))) {
      const layer = this.mVTLayers[layerName];
      if (!layer) continue;
      layer.handleClickEvent(newEvent, this);
      this._mouseSelectedFeature(newEvent, callbackFunction, options);
      if (options.limitToFirstVisibleLayer) break;
    }
  }

  /**
   * @param {TileMapMouseEvent} event
   * @param {(event: TileMapMouseEvent)} callbackFunction
   * @param {ClickHandlerOptions} options
   */
  _mouseSelectedFeature(event, callbackFunction, options) {
    if (options.setSelected) {
      const feature = event.feature;
      if (feature) {
        if (options.mouseHover) {
          if (!feature.selected) {
            feature.setSelected(true);
          }
        } else {
          if (options.toggleSelection) {
            feature.setSelected(!feature.selected);
          } else {
            if (!feature.selected) {
              feature.setSelected(true);
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
    /** @type {Array<string>} */
    const tilesToRedraw = [];
    Object.entries(this._selectedFeatures).forEach(([featureId, mVTFeature]) => {
      if (!mVTFeature) return;
      mVTFeature.setSelected(false);
      Object.entries(mVTFeature.tiles).forEach(([tileId, tile]) => {
        delete this._tilesDrawn[tileId];
        if (getTileFromString(tileId).zoom == zoom) {
          tilesToRedraw.push(tileId);
        }
      });
    });
    this.redrawTiles(tilesToRedraw);
    this._selectedFeatures = {};
  }

  /**
   * @param {MVTFeature} mVTFeature
   */
  featureSelected(mVTFeature) {
    if (!this._multipleSelection) {
      this.deselectAllFeatures();
    }
    this._selectedFeatures[mVTFeature.featureId] = mVTFeature;
  }

  /**
   * @param {MVTFeature} mvtFeature
   */
  featureDeselected(mvtFeature) {
    delete this._selectedFeatures[mvtFeature.featureId];
  }

  /**
   * @param {Array<String>} featuresIds
   */
  setSelectedFeatures(featuresIds) {
    if (featuresIds.length > 1) {
      this._multipleSelection = true;
    }
    this.deselectAllFeatures();
    featuresIds.forEach((featureId) => {
      // HACK: this may be called before layers are loaded, but we need to keep track of the selected features for
      // rendering when they are loaded
      this._selectedFeatures[featureId] = false;
      Object.values(this.mVTLayers).forEach((layer) => {
        layer.setSelected(featureId);
      });
    });
  }

  /**
   * @param {string} featureId
   * @return {boolean}
   */
  isFeatureSelected(featureId) {
    return this._selectedFeatures[featureId] != undefined;
  }

  /**
   * @return {Array<MVTFeature>}
   */
  getSelectedFeatures() {
    return Object.values(this._selectedFeatures);
  }

  /**
   * @param {string} tileContextId tile id in the format 'zoom:x:y'
   * @return {Array<MVTFeature>}
   */
  getSelectedFeaturesInTile(tileContextId) {
    /** @type {Array<MVTFeature>} */
    const selectedFeatures = [];
    Object.values(this._selectedFeatures).forEach((selectedFeature) => {
      if (selectedFeature.tiles[tileContextId]) {
        selectedFeatures.push(selectedFeature);
      }
    });
    return selectedFeatures;
  }

  /**
   * @param {filterFn} filter
   * @param {boolean} [redrawTiles=true]
   */
  setFilter(filter, redrawTiles = true) {
    this._filter = filter;
    Object.values(this.mVTLayers).forEach((layer) => layer.setFilter(filter));
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }

  /**
   * @param {styleFn|StyleOptions} style
   * @param {boolean} [redrawTiles=true]
   */
  setStyle(style, redrawTiles = true) {
    this.style = style;
    Object.values(this.mVTLayers).forEach((layer) => layer.setStyle(style));
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }

  /**
   * @param {Array<string>} visibleLayers
   * @param {boolean} [redrawTiles=true]
   */
  setVisibleLayers(visibleLayers, redrawTiles = true) {
    this._visibleLayers = visibleLayers || null;
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }

  /**
   * @return {Array<string>}
   */
  getVisibleLayers() {
    return this._visibleLayers;
  }

  /**
   * @param {Array<string>} clickableLayers
   */
  setClickableLayers(clickableLayers) {
    this._clickableLayers = clickableLayers || null;
  }

  /**
   * Redraw all visible tiles
   */
  redrawAllTiles() {
    this._tilesDrawn = {};
    this.redrawTiles(Object.keys(this._visibleTiles));
  }

  /**
   * Redraw the tiles specified by ab array of tile ids
   * @param {Array<string>} tiles
   */
  redrawTiles(tiles = []) {
    tiles.forEach((id) => this.redrawTile(id));
  }

  /**
   * Redraw the tile specified by the tile id
   * @param {string} id
   */
  redrawTile(id) {
    delete this._tilesDrawn[id];
    const tileContext = this._visibleTiles[id];
    if (!tileContext || !tileContext.vectorTile) return;
    this.clearTile(tileContext.canvas);
    this._drawVectorTile(tileContext.vectorTile, tileContext);
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  clearTile(canvas) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * @param {string} url url of the MVT source
   * @param {boolean} [redrawTiles=true]
   */
  setUrl(url, redrawTiles = true) {
    this._url = url;
    this.mVTLayers = {};
    if (redrawTiles) {
      this.redrawAllTiles();
    }
  }
}

export {
  MVTSource,
};
