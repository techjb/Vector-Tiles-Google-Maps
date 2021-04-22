function MVTFeature(mVTLayer, vectorTileFeature, tileContext, id, style) {
    if (!vectorTileFeature) return null;

    // Apply all of the properties of vtf to this object.
    for (var key in vectorTileFeature) {
        this[key] = vectorTileFeature[key];
    }

    this.mvtLayer = mVTLayer;
    this.mvtSource = mVTLayer.mvtSource;
    this.map = this.mvtSource.map;
    this.id = id;
    //this.layerLink = this.mvtSource.layerLink;
    this.toggleEnabled = true;
    this.selected = false;
    // how much we divide the coordinate from the vector tile
    this.divisor = vectorTileFeature.extent / tileContext.tileSize;
    this.extent = vectorTileFeature.extent;
    this.tileSize = tileContext.tileSize;
    //An object to store the paths and contexts for this feature
    this.tiles = {};
    this.style = style;
    //Add to the collection
    this.addTileFeature(vectorTileFeature, tileContext);

    //var self = this;
    //this.map.on('zoomend', function() {
    //  self.staticLabel = null;
    //});

    //this.map.addListener("zoom_changed", () => {
    //    self.staticLabel = null;
    //});

    if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
        this.dynamicLabel = this.mvtSource.dynamicLabel.createFeature(this);
    }

    //ajax(self);
}


//function ajax(self) {
//    var style = self.style;
//    if (style && style.ajaxSource && typeof style.ajaxSource === 'function') {
//        var ajaxEndpoint = style.ajaxSource(self);
//        if (ajaxEndpoint) {
//            Util.getJSON(ajaxEndpoint, function (error, response, body) {
//                if (error) {
//                    throw ['ajaxSource AJAX Error', error];
//                } else {
//                    ajaxCallback(self, response);
//                    return true;
//                }
//            });
//        }
//    }
//    return false;
//}

//function ajaxCallback(self, response) {
//    self.ajaxData = response;

//    /**
//     * You can attach a callback function to a feature in your app
//     * that will get called whenever new ajaxData comes in. This
//     * can be used to update UI that looks at data from within a feature.
//     *
//     * setStyle may possibly have a style with a different ajaxData source,
//     * and you would potentially get new contextual data for your feature.
//     *
//     * TODO: This needs to be documented.
//     */
//    if (typeof self.ajaxDataReceived === 'function') {
//        self.ajaxDataReceived(self, response);
//    }

//    self._setStyle(self.mvtLayer.style);
//    redrawTiles(self);
//}

MVTFeature.prototype._setStyle = function (styleFn) {
    this.style = styleFn(this, this.ajaxData);

    // The label gets removed, and the (re)draw,
    // that is initiated by the MVTLayer creates a new label.
    this.removeLabel();
};

MVTFeature.prototype.setStyle = function (styleFn) {
    //this.ajaxData = null;
    this.style = styleFn(this, null);
    this.removeLabel();
    //var hasAjaxSource = ajax(this);
    //if (!hasAjaxSource) {
    //    // The label gets removed, and the (re)draw,
    //    // that is initiated by the MVTLayer creates a new label.
    //    this.removeLabel();
    //}
};

MVTFeature.prototype.draw = function (id) {
    //Get the info from the tiles list
    var tileInfo = this.tiles[id];

    var vtf = tileInfo.vtf;
    var tileContext = tileInfo.ctx;

    //Get the actual canvas from the parent layer's _tiles object.
    //var xy = canvasID.split(":").slice(1, 3).join(":");
    //ctx.canvas = this.mvtLayer.getCanvas(xy);
    tileContext.canvas = this.mvtLayer.getCanvas(id);

    //  This could be used to directly compute the style function from the layer on every draw.
    //  This is much less efficient...
    //  this.style = this.mvtLayer.style(this);

    if (this.selected) {
        var style = this.style.selected || this.style;
    } else {
        var style = this.style;
    }
    switch (vtf.type) {
        case 1: //Point
            this._drawPoint(tileContext, vtf.coordinates, style);
            if (!this.staticLabel && typeof this.style.staticLabel === 'function') {
                if (this.style.ajaxSource && !this.ajaxData) {
                    break;
                }
                this._drawStaticLabel(tileContext, vtf.coordinates, style);
            }
            break;

        case 2: //LineString
            this._drawLineString(tileContext, vtf.coordinates, style);
            break;

        case 3: //Polygon
            this._drawPolygon(tileContext, vtf.coordinates, style);
            break;

        default:
            throw new Error('Unmanaged type: ' + vtf.type);
    }

};

MVTFeature.prototype.getPathsForTile = function (canvasID) {
    //Get the info from the parts list
    return this.tiles[canvasID].paths;
};

MVTFeature.prototype.addTileFeature = function (vectorTileFeature, tileContext) {
    //Store the important items in the tiles list

    //We only want to store info for tiles for the current map zoom.  If it is tile info for another zoom level, ignore it
    //Also, if there are existing tiles in the list for other zoom levels, expunge them.
    var zoom = this.map.getZoom();
    if (tileContext.zoom != zoom) {
        return;
    }
    this.clearTileFeatures(zoom); //TODO: This iterates thru all tiles every time a new tile is added.  Figure out a better way to do this.

    this.tiles[tileContext.id] = {
        ctx: tileContext,
        vtf: vectorTileFeature,
        paths: []
    };

};


/**
 * Clear the inner list of tile features if they don't match the given zoom.
 *
 * @param zoom
 */
MVTFeature.prototype.clearTileFeatures = function (zoom) {
    //If stored tiles exist for other zoom levels, expunge them from the list.
    for (var key in this.tiles) {
        if (key.split(":")[0] != zoom) {
            delete this.tiles[key];
        }
    }
};

/**
 * Redraws all of the tiles associated with a feature. Useful for
 * style change and toggling.
 *
 * @param self
 */
MVTFeature.prototype.redrawTiles = function () {    
    //Redraw the whole tile, not just this vtf
    var mapZoom = this.map.getZoom();
    for (var id in this.tiles) {
        var tileZoom = parseInt(id.split(':')[0]);
        if (tileZoom === mapZoom) {
            this.mvtSource.redrawTile(id);
        }
    }
}

//function redrawFeatureInAllTiles(self) {
//    //Redraw the whole tile, not just this vtf
//    var tiles = self.tiles;
//    var mvtLayer = self.mvtLayer;
//    var mapZoom = self.map.getZoom();
//    for (var id in tiles) {
//        var tileZoom = parseInt(id.split(':')[0]);
//        if (tileZoom != mapZoom) {
//            continue;
//        }
//        mvtLayer.redrawFeature(id, self);
//    }
//}

MVTFeature.prototype.toggle = function () {
    if (this.selected) {
        this.deselect();
    } else {
        this.select();
    }
};

MVTFeature.prototype.select = function () {
    this.selected = true;
    this.mvtSource.featureSelected(this);
    this.redrawTiles();
    //redrawFeatureInAllTiles(this);
    //var linkedFeature = this.linkedFeature();
    //if (linkedFeature && linkedFeature.staticLabel && !linkedFeature.staticLabel.selected) {
    //    linkedFeature.staticLabel.select();
    //}
};

MVTFeature.prototype.deselect = function () {
    this.selected = false;
    this.mvtSource.featureDeselected(this);
    this.redrawTiles();
    //redrawFeatureInAllTiles(this);
    //var linkedFeature = this.linkedFeature();
    //if (linkedFeature && linkedFeature.staticLabel && linkedFeature.staticLabel.selected) {
    //    linkedFeature.staticLabel.deselect();
    //}
};

MVTFeature.prototype.on = function (eventType, callback) {
    this._eventHandlers[eventType] = callback;
};

MVTFeature.prototype._drawPoint = function (tileContext, coordsArray, style) {
    if (!style || !tileContext || !tileContext.canvas) return;    

    var tile = this.tiles[tileContext.id];

    //Get radius
    var radius = 1;
    if (typeof style.radius === 'function') {
        radius = style.radius(tileContext.zoom); //Allows for scale dependent rednering
    }
    else {
        radius = style.radius;
    }

    var point = this._tilePoint(coordsArray[0][0]);    
    var context2d = tileContext.canvas.getContext('2d')    

    context2d.beginPath();
    context2d.fillStyle = style.color;
    context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context2d.closePath();
    context2d.fill();

    if (style.lineWidth && style.strokeStyle) {
        context2d.lineWidth = style.lineWidth;
        context2d.strokeStyle = style.strokeStyle;
        context2d.stroke();
    }

    context2d.restore();
    tile.paths.push([point]);
};

MVTFeature.prototype._drawLineString = function (ctx, coordsArray, style) {
    if (!style || !ctx || !ctx.canvas) return;    

    var context2d = ctx.canvas.getContext('2d');    
    context2d.strokeStyle = style.color;
    context2d.lineWidth = style.size;
    context2d.beginPath();

    var projCoords = [];
    var tile = this.tiles[ctx.id];

    for (var gidx in coordsArray) {
        var coords = coordsArray[gidx];
        for (i = 0; i < coords.length; i++) {
            var method = (i === 0 ? 'move' : 'line') + 'To';
            var proj = this._tilePoint(coords[i]);
            projCoords.push(proj);
            context2d[method](proj.x, proj.y);
        }
    }

    context2d.stroke();
    context2d.restore();
    tile.paths.push(projCoords);
};

MVTFeature.prototype._drawPolygon = function (ctx, coordsArray, style) {
    if (!style || !ctx || !ctx.canvas) return;    

    var context2d = ctx.canvas.getContext('2d');
    var outline = style.outline;

    // color may be defined via function to make choropleth work right
    if (typeof style.color === 'function') {
        context2d.fillStyle = style.color(context2d);
    } else {
        context2d.fillStyle = style.color;
    }

    if (outline) {
        context2d.strokeStyle = outline.color;
        context2d.lineWidth = outline.size;
    }
    context2d.beginPath();

    var projCoords = [];
    var tile = this.tiles[ctx.id];

    var featureLabel = this.dynamicLabel;
    if (featureLabel) {
        featureLabel.addTilePolys(ctx, coordsArray);
    }

    for (var gidx = 0, len = coordsArray.length; gidx < len; gidx++) {
        var coords = coordsArray[gidx];
        for (var i = 0; i < coords.length; i++) {
            var coord = coords[i];
            var method = (i === 0 ? 'move' : 'line') + 'To';
            var proj = this._tilePoint(coord);
            projCoords.push(proj);
            context2d[method](proj.x, proj.y);
        }
    }

    context2d.closePath();
    context2d.fill();
    if (outline) {
        context2d.stroke();
    }
    tile.paths.push(projCoords);
};

MVTFeature.prototype._drawStaticLabel = function (tileContext, coordsArray, style) {
    if (!style || !tileContext) return;    

    // If the corresponding layer is not on the map, 
    // we dont want to put on a label.
    if (!this.mvtLayer._map) return;

    var vecPt = this._tilePoint(coordsArray[0][0]);

    // We're making a standard Leaflet Marker for this label.
    var p = this._project(vecPt, tileContext.tile.x, tileContext.tile.y, this.extent, this.tileSize); //vectile pt to merc pt
    var mercPt = L.point(p.x, p.y); // make into leaflet obj
    var latLng = this.map.unproject(mercPt); // merc pt to latlng

    this.staticLabel = new StaticLabel(this, tileContext, latLng, style);
    this.mvtLayer.featureWithLabelAdded(this);
};

MVTFeature.prototype.removeLabel = function () {
    if (!this.staticLabel) return;
    this.staticLabel.remove();
    this.staticLabel = null;
};

/**
 * Projects a vector tile point to the Spherical Mercator pixel space for a given zoom level.
 *
 * @param vecPt
 * @param tileX
 * @param tileY
 * @param extent
 * @param tileSize
 */
MVTFeature.prototype._project = function (vecPt, tileX, tileY, extent, tileSize) {
    var xOffset = tileX * tileSize;
    var yOffset = tileY * tileSize;
    return {
        x: Math.floor(vecPt.x + xOffset),
        y: Math.floor(vecPt.y + yOffset)
    };
};

/**
 * Takes a coordinate from a vector tile and turns it into a Leaflet Point.
 *
 * @param ctx
 * @param coords
 * @returns {eGeomType.Point}
 * @private
 */
MVTFeature.prototype._tilePoint = function (coords) {
    //return new L.Point(coords.x / this.divisor, coords.y / this.divisor);
    return {
        x: coords.x / this.divisor,
        y: coords.y / this.divisor
    };
};

//MVTFeature.prototype.linkedFeature = function () {
//    var linkedLayer = this.mvtLayer.linkedLayer();
//    if (linkedLayer) {
//        var linkedFeature = linkedLayer.features[this.id];
//        return linkedFeature;
//    } else {
//        return null;
//    }
//};

