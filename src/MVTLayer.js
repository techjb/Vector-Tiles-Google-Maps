/*
 *  Created by Jes�s Barrio on 04/2021
 */
import {MVTFeature} from './MVTFeature.js';
import * as MERCATOR from '../lib/mercator/Mercator.js';

/**
 * @typedef {import('@mapbox/vector-tile').VectorTileLayer} VectorTileLayer
 * @typedef {import('@mapbox/vector-tile').VectorTileFeature} VectorTileFeature
 *
 * @typedef {import('./MVTSource').TileContext} TileContext
 * @typedef {import('./MVTSource').MVTSource} MVTSource
 * @typedef {import('./MVTSource').StyleOptions} StyleOptions
 * @typedef {import('./MVTSource').featureIdFn} featureIdFn
 * @typedef {import('./MVTSource').styleFn} styleFn
 * @typedef {import('./MVTSource').filterFn} filterFn
 * @typedef {import('./MVTSource').drawFn} drawFn
 * @typedef {import('./MVTFeature').MVTFeatureOptions} MVTFeatureOptions
 *
 * @typedef {object} MVTLayerOptions
 * @property {string} name
 * @property {styleFn|StyleOptions} style
 * @property {featureIdFn} getIDForLayerFeature
 * @property {filterFn} filter
 * @property {drawFn} customDraw
 *
 * @typedef {object} TileEvent
 * @property {TileContext} tileContext
 * @property {MVTFeature} feature
 * @property {google.maps.Point} tilePoint
 *
 * @typedef {google.maps.MapMouseEvent&TileEvent} TileMapMouseEvent
 */

class MVTLayer {
  /**
   * @param {MVTLayerOptions} options
   */
  constructor(options = {}) {
    /** @type {featureIdFn} */
    this._getIDForLayerFeature = options.getIDForLayerFeature;
    /** @type {styleFn|StyleOptions} */
    this.style = options.style;
    /** @type {string} */
    this.name = options.name;
    /** @type {filterFn} */
    this._filter = options.filter || false;
    /** @type {number} */
    this._lineClickTolerance = 2;
    /** @type {Record<String, {canvas: HTMLCanvasElement, features: Array<MVTFeature>}>} */
    this._canvasAndMVTFeatures = [];
    /** @type {Record<String, MVTFeature>} */
    this._mVTFeatures = [];
    /** @type {drawFn} */
    this._customDraw = options.customDraw || false;
  }

  /**
   * @param {MVTSource} mVTSource
   * @param {VectorTileLayer} vectorTileLayer
   * @param {TileContext} tileContext
   */
  parseVectorTileFeatures(mVTSource, vectorTileLayer, tileContext) {
    this._canvasAndMVTFeatures[tileContext.id] = {canvas: tileContext.canvas, features: []};
    for (let i = 0; i < vectorTileLayer.length; i++) {
      this._parseVectorTileFeature(mVTSource, vectorTileLayer.feature(i), tileContext, i);
    }
    this.drawTile(tileContext);
  }

  /**
   * @param {MVTSource} mVTSource
   * @param {VectorTileFeature} vectorTileFeature
   * @param {TileContext} tileContext
   * @param {number} index
   */
  _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, index) {
    // if the filter has been defined and returns false, skip the feature
    if (this._filter && typeof this._filter === 'function' && !this._filter(vectorTileFeature, tileContext)) return;

    const featureId = this._getIDForLayerFeature(vectorTileFeature) ?? index;
    const mVTFeature = this._mVTFeatures[featureId];

    // if the feature has already been seen, update the style and add the new geometry.
    if (mVTFeature) {
      mVTFeature.style = this.getStyle(vectorTileFeature);
      mVTFeature.addTileFeature(vectorTileFeature, tileContext);
      this._canvasAndMVTFeatures[tileContext.id].features.push(mVTFeature);
      return;
    }

    // if the feature has not been seen, create a new MVTFeature
    const newFeature = new MVTFeature({
      mVTSource,
      vectorTileFeature,
      tileContext,
      style: this.getStyle(vectorTileFeature),
      selected: mVTSource.isFeatureSelected(featureId),
      featureId,
      customDraw: this._customDraw,
    });
    this._mVTFeatures[featureId] = newFeature;
    this._canvasAndMVTFeatures[tileContext.id].features.push(newFeature);
  }

  /**
   * draws all the non-selected features first, then the selected features to ensure they appear on top.
   * @param {TileContext} tileContext
   */
  drawTile(tileContext) {
    const mVTFeatures = this._canvasAndMVTFeatures[tileContext.id].features;
    if (!mVTFeatures) return;
    mVTFeatures.filter((mVTFeature) => !mVTFeature.selected).forEach((mVTFeature) => mVTFeature.draw(tileContext));
    mVTFeatures.filter((mVTFeature) => mVTFeature.selected).forEach((mVTFeature) => mVTFeature.draw(tileContext));
  }

  /**
   * @param {VectorTileFeature} feature
   * @return {StyleOptions}
   */
  getStyle(feature) {
    return (typeof this.style === 'function') ? this.style(feature) : this.style;
  }

  /**
   * updates the style for all features in the layer
   * @param {styleFn|StyleOptions} style
   */
  setStyle(style) {
    this.style = style;
    Object.values(this._mVTFeatures).forEach((mVTFeature) => mVTFeature.style = style);
  }

  /**
   * Set the given feature as selected
   * @param {string} featureId
   */
  setSelected(featureId) {
    if (this._mVTFeatures[featureId] === undefined) return;
    this._mVTFeatures[featureId].setSelected(true);
  }

  /**
   * Set the filter function for the layer
   * @param {filterFn} filter
   */
  setFilter(filter) {
    this._filter = filter;
  }

  /**
   * Attaches the clicked feature to the event if it exists
   * @param {TileMapMouseEvent} event
   * @param {MVTSource} mVTSource
   * @return {TileMapMouseEvent}
   */
  handleClickEvent(event, mVTSource) {
    const canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
    // if the tile has not been parsed yet, pass the event through
    if (!canvasAndFeatures?.canvas || !canvasAndFeatures?.features) return event;
    // if the tile has been parsed, attach the feature to the event
    event.feature = this._handleClickEvent(event, canvasAndFeatures.features, mVTSource);
    return event;
  }

  /**
   * First searches for a clicked feature in the currently selected features in the tile, then searches for a clicked
   * feature in all features in the tile. Returns the first feature that is found to be clicked.
   * @param {TileMapMouseEvent} event
   * @param {Array<MVTFeature>} mVTFeatures
   * @param {MVTSource} mVTSource
   * @return {MVTFeature}
   */
  _handleClickEvent(event, mVTFeatures, mVTSource) {
    const currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(event?.tileContext?.id);
    const feature = this._handleClickFeatures(event, currentSelectedFeaturesInTile);
    return feature ? feature : this._handleClickFeatures(event, mVTFeatures);
  }

  /**
   * Returns the first feature that is found to be clicked
   * @param {TileMapMouseEvent} event
   * @param {Array<MVTFeature>} mVTFeatures
   * @return {MVTFeature}
   */
  _handleClickFeatures(event, mVTFeatures) {
    return mVTFeatures.find((mVTFeature) => this._handleClickFeature(event, mVTFeature));
  }

  /**
   * Dispatches to the appropriate handler based on the feature type and returns the result
   * @param {TileMapMouseEvent} event
   * @param {MVTFeature} mVTFeature
   * @return {boolean}
   */
  _handleClickFeature(event, mVTFeature) {
    return ({
      3: this._handleClickFeaturePolygon,
      2: this._handleClickFeatureLineString,
      1: this._handleClickFeaturePoint,
    })[mVTFeature.type]?.(event, mVTFeature);
  }

  /**
   * Returns true if the clicked point is within the polygon feature
   * @param {TileMapMouseEvent} event
   * @param {MVTFeature} mVTFeature
   * @return {boolean}
   */
  _handleClickFeaturePolygon(event, mVTFeature) {
    return mVTFeature.isPointInPath(event.tilePoint, event.tileContext);
  }

  /**
   * Returns true if the clicked point is within the radius of the Point feature
   * @param {TileMapMouseEvent} event
   * @param {MVTFeature} mVTFeature
   * @return {boolean}
   */
  _handleClickFeaturePoint(event, mVTFeature) {
    return mVTFeature.getPaths(event.tileContext).some((path) => {
      return MERCATOR.inCircle(path[0].x, path[0].y, mVTFeature.style.radius, event.tilePoint.x, event.tilePoint.y);
    });
  }

  /**
   * Returns true if the click event is within the line width and tolerance of any of the line segments
   * @param {TileMapMouseEvent} event
   * @param {MVTFeature} mVTFeature
   * @return {boolean}
   */
  _handleClickFeatureLineString(event, mVTFeature) {
    let minDistance = Number.POSITIVE_INFINITY;
    let lineWidth = mVTFeature.style.lineWidth;
    if (mVTFeature.selected && mVTFeature.style.selected) {
      lineWidth = mVTFeature.style.selected.lineWidth;
    }
    mVTFeature.getPaths(event.tileContext).forEach((path) => {
      const distance = MERCATOR.getDistanceFromLine(event.tilePoint, path);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });
    return minDistance < lineWidth / 2 + this._lineClickTolerance;
  }
}

export {MVTLayer};
