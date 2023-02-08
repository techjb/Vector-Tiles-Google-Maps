function VectorTile(buffer, end) {
    this.layers = {};
    this._buffer = buffer;
    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 3) {
            var layer = this._readLayer();
            if (layer.length) {
                this.layers[layer.name] = layer;
            }
        } else {
            buffer.skip(val);
        }
    }
    this.parseGeometries();
}

VectorTile.prototype._readLayer = function () {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;
    return layer;
};

VectorTile.prototype.parseGeometries = function () {
    for (var key in this.layers) {
        var layer = this.layers[key];
        layer.parsedFeatures = [];
        var featuresLength = layer._features.length;
        for (var i = 0, len = featuresLength; i < len; i++) {
            var feature = layer.feature(i);
            feature.coordinates = feature.loadGeometry();
            layer.parsedFeatures.push(feature);
        }
    }
}
function VectorTileFeature(buffer, end, extent, keys, values) {
    this.properties = {};

    // Public
    this.extent = extent;
    this.type = 0;

    // Private
    this._buffer = buffer;
    this._geometry = -1;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 1) {
            this._id = buffer.readVarint();
        } else if (tag == 2) {
            var tagLen = buffer.readVarint(),
                tagEnd = buffer.pos + tagLen;

            while (buffer.pos < tagEnd) {
                var key = keys[buffer.readVarint()];
                var value = values[buffer.readVarint()];
                this.properties[key] = value;
            }
        } else if (tag == 3) {
            this.type = buffer.readVarint();
        } else if (tag == 4) {
            this._geometry = buffer.pos;
            buffer.skip(val);
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();

            if (cmd === 1) {
                // moveTo
                if (line) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            line.push(line[0].clone());
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,

        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;
        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};
function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    var val, tag;

    end = end || buffer.length;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag === 15) {
            this.version = buffer.readVarint();
        } else if (tag === 1) {
            this.name = buffer.readString();
        } else if (tag === 5) {
            this.extent = buffer.readVarint();
        } else if (tag === 2) {
            this.length++;
            this._features.push(buffer.pos);
            buffer.skip(val);
        } else if (tag === 3) {
            this._keys.push(buffer.readString());
        } else if (tag === 4) {
            this._values.push(this.readFeatureValue());
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function () {
    var buffer = this._buffer,
        value = null,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            value = buffer.readString();
        } else if (tag == 2) {
            //throw new Error('read float');
            value = buffer.readFloat();
        } else if (tag == 3) {
            value = buffer.readDouble();
        } else if (tag == 4) {
            value = buffer.readVarint();
        } else if (tag == 5) {
            //throw new Error('read uint');
            value = buffer.readVarint();
        } else if (tag == 6) {
            value = buffer.readSVarint();
        } else if (tag == 7) {
            value = Boolean(buffer.readVarint());
        } else {
            buffer.skip(val);
        }
    }

    return value;
};

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function (i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;

    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};
function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function () { return new Point(this.x, this.y); },

    add: function (p) { return this.clone()._add(p); },
    sub: function (p) { return this.clone()._sub(p); },
    mult: function (k) { return this.clone()._mult(k); },
    div: function (k) { return this.clone()._div(k); },
    rotate: function (a) { return this.clone()._rotate(a); },
    matMult: function (m) { return this.clone()._matMult(m); },
    unit: function () { return this.clone()._unit(); },
    perp: function () { return this.clone()._perp(); },
    round: function () { return this.clone()._round(); },

    mag: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function (p) {
        return this.x === p.x &&
            this.y === p.y;
    },

    dist: function (p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function (p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function () {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function (b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function (b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function (x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function (m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function (p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function (p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function (k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function (k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function () {
        this._div(this.mag());
        return this;
    },

    _perp: function () {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function (angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};
MERCATOR = {
    fromLatLngToPoint: function (latLng) {
        var siny = Math.min(Math.max(Math.sin(latLng.lat() * (Math.PI / 180)),
            -.9999),
            .9999);
        return {
            x: 128 + latLng.lng() * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {
        return {
            lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
            lng: (point.x - 128) / (256 / 360)
        };
    },

    getTileAtLatLng: function (latLng, zoom) {
        var t = Math.pow(2, zoom),
            s = 256 / t,
            p = this.fromLatLngToPoint(latLng);
        return {
            x: Math.floor(p.x / s),
            y: Math.floor(p.y / s),
            z: zoom
        };
    },

    getTileBounds: function (tile) {
        tile = this.normalizeTile(tile);
        var t = Math.pow(2, tile.z),
            s = 256 / t,
            sw = {
                x: tile.x * s,
                y: (tile.y * s) + s
            },
            ne = {
                x: tile.x * s + s,
                y: (tile.y * s)
            };
        return {
            sw: this.fromPointToLatLng(sw),
            ne: this.fromPointToLatLng(ne)
        }
    },

    normalizeTile: function (tile) {
        var t = Math.pow(2, tile.z);
        tile.x = ((tile.x % t) + t) % t;
        tile.y = ((tile.y % t) + t) % t;
        return tile;
    },

    fromLatLngToPixels: function (map, latLng) {
        var bounds = map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var topRight = map.getProjection().fromLatLngToPoint(ne);
        var bottomLeft = map.getProjection().fromLatLngToPoint(sw);
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return {
            x: (worldPoint.x - bottomLeft.x) * scale,
            y: (worldPoint.y - topRight.y) * scale
        }
    },

    fromLatLngToTilePoint: function (map, evt) {
        var zoom = map.getZoom();
        var tile = this.getTileAtLatLng(evt.latLng, zoom);
        var tileBounds = this.getTileBounds(tile);
        var tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
        var tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
        var tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);
        var tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);
        return {
            x: evt.pixel.x - tileSwPixels.x,
            y: evt.pixel.y - tileNePixels.y
        }
    },

    // todo: sometimes it does not work properly
    isPointInPolygon: function (point, polygon) {
        if (polygon && polygon.length) {
            for (var c = false, i = -1, l = polygon.length, j = l - 1; ++i < l; j = i) {
                ((polygon[i].y <= point.y && point.y < polygon[j].y) || (polygon[j].y <= point.y && point.y < polygon[i].y))
                    && (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
                    && (c = !c);
            }
            return c;
        }
    },

    in_circle: function (center_x, center_y, radius, x, y) {
        var square_dist = Math.pow((center_x - x), 2) + Math.pow((center_y - y), 2);
        return square_dist <= Math.pow(radius, 2);
    },

    getDistanceFromLine: function (point, line) {
        var minDistance = Number.POSITIVE_INFINITY;
        if (line && line.length > 1) {
            for (var i = 0, l = line.length - 1; i < l; i++) {
                var distance = this.projectPointOnLineSegment(point, line[i], line[i + 1]);
                if (distance <= minDistance) {
                    minDistance = distance;
                }
            }
        }
        return minDistance;
    },

    projectPointOnLineSegment: function (point, r0, r1) {
        var x = point.x;
        var y = point.y;
        var x1 = r0.x;
        var y1 = r0.y;
        var x2 = r1.x;
        var y2 = r1.y;

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) //in case of 0 length line
            param = dot / len_sq;

        var xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
/*
 *  Created by Jes�s Barrio on 04/2021
 */

class MVTFeature {
    constructor(options) {
        this.mVTSource = options.mVTSource;
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = [];
        this.style = options.style;
        this.type = options.vectorTileFeature.type;
        this.properties = options.vectorTileFeature.properties;
        this.addTileFeature(options.vectorTileFeature, options.tileContext);
        this._draw = options.customDraw || this.defaultDraw;        

        if (this.selected) {
            this.select();
        }
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tiles[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            divisor: vectorTileFeature.extent / tileContext.tileSize,
            context2d: false,
            paths2d: false
        };
    }

    getTiles() {
        return this.tiles;
    }

    getTile(tileContext) {
        return this.tiles[tileContext.id];
    }

    setStyle(style) {
        this.style = style;
    }

    redrawTiles() {
        var zoom = this.mVTSource.map.getZoom();
        for (var id in this.tiles) {
            this.mVTSource.deleteTileDrawn(id);
            var idObject = this.mVTSource.getTileObject(id);
            if (idObject.zoom == zoom) {
                this.mVTSource.redrawTile(id);
            }
        }
    }

    toggle() {
        if (this.selected) {
            this.deselect();
        } else {
            this.select();
        }
    }

    select() {
        this.selected = true;
        this.mVTSource.featureSelected(this);
        this.redrawTiles();
    }

    deselect() {
        this.selected = false;
        this.mVTSource.featureDeselected(this);
        this.redrawTiles();
    }

    setSelected(selected) {
        this.selected = selected;
    }

    draw(tileContext) {
        var tile = this.tiles[tileContext.id];
        var style = this.style;
        if (this.selected && this.style.selected) {
            style = this.style.selected;
        }

        this._draw(tileContext, tile, style, this);
    }

    defaultDraw(tileContext, tile, style) {
        switch (this.type) {
            case 1: //Point
                this.drawPoint(tileContext, tile, style);
                break;

            case 2: //LineString
                this.drawLineString(tileContext, tile, style);
                break;

            case 3: //Polygon
                this.drawPolygon(tileContext, tile, style);
                break;
        }
    }

    drawPoint(tileContext, tile, style) {
        var coordinates = tile.vectorTileFeature.coordinates[0][0];
        var point = this.getPoint(coordinates, tileContext, tile.divisor);
        var radius = style.radius || 3;
        var context2d = this.getContext2d(tileContext.canvas, style);
        context2d.beginPath();
        context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
    }

    drawLineString(tileContext, tile, style) {
        tile.context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, tile);
        tile.context2d.stroke(tile.paths2d);
    }

    drawPolygon(tileContext, tile, style) {
        tile.context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, tile);
        tile.paths2d.closePath();

        if (style.fillStyle) {
            tile.context2d.fill(tile.paths2d);
        }
        if (style.strokeStyle) {
            tile.context2d.stroke(tile.paths2d);
        }
    }

    drawCoordinates(tileContext, tile) {
        var coordinates = tile.vectorTileFeature.coordinates;
        tile.paths2d = new Path2D();        
        for (var i = 0, length1 = coordinates.length; i < length1; i++) {
            var coordinate = coordinates[i];
            let path2 = new Path2D();
            for (var j = 0, length2 = coordinate.length; j < length2; j++) {
                var point = this.getPoint(coordinate[j], tileContext, tile.divisor);
                if (j == 0) {
                    path2.moveTo(point.x, point.y);
                }
                else {
                    path2.lineTo(point.x, point.y);
                }                
            }
            tile.paths2d.addPath(path2);
        }        
    }

    getPaths(tileContext) {
        var paths = [];
        var tile = this.tiles[tileContext.id];
        var coordinates = tile.vectorTileFeature.coordinates;
        for (var i = 0, length1 = coordinates.length; i < length1; i++) {
            var path = [];
            var coordinate = coordinates[i];
            for (var j = 0, length2 = coordinate.length; j < length2; j++) {
                var point = this.getPoint(coordinate[j], tileContext, tile.divisor);
                path.push(point);
            }
            if (path.length > 0) {
                paths.push(path);
            }
        }
        return paths;
    }

    getContext2d(canvas, style) {
        var context2d = canvas.getContext('2d');
        for (var key in style) {
            if (key === 'selected') {
                continue;
            }
            context2d[key] = style[key];
        }
        return context2d;
    }

    getPoint(coords, tileContext, divisor) {
        var point = {
            x: coords.x / divisor,
            y: coords.y / divisor
        };

        if (tileContext.parentId) {
            point = this._getOverzoomedPoint(point, tileContext);
        }
        return point;
    }

    _getOverzoomedPoint(point, tileContext) {
        var parentTile = this.mVTSource.getTileObject(tileContext.parentId);
        var currentTile = this.mVTSource.getTileObject(tileContext.id);
        var zoomDistance = currentTile.zoom - parentTile.zoom;

        const scale = Math.pow(2, zoomDistance);

        let xScale = point.x * scale;
        let yScale = point.y * scale;

        let xtileOffset = currentTile.x % scale;
        let ytileOffset = currentTile.y % scale;

        point.x = xScale - (xtileOffset * tileContext.tileSize);
        point.y = yScale - (ytileOffset * tileContext.tileSize);

        return point;
    }

    isPointInPath(point, tileContext) {
        var tile = this.getTile(tileContext);
        var context2d = tile.context2d;
        var paths2d = tile.paths2d;
        if (!context2d || !paths2d) {
            return false;
        }
        return context2d.isPointInPath(paths2d, point.x, point.y)       
    }
}
/*
 *  Created by Jes�s Barrio on 04/2021
 */

class MVTLayer {
    constructor(options) {
        this._lineClickTolerance = 2;
        this._getIDForLayerFeature = options.getIDForLayerFeature;
        this.style = options.style;
        this.name = options.name;
        this._filter = options.filter || false;
        this._customDraw = options.customDraw || false;
        this._canvasAndMVTFeatures = [];
        this._mVTFeatures = [];
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        this._canvasAndMVTFeatures[tileContext.id] = {
            canvas: tileContext.canvas,
            features: []
        }
        for (var i = 0, length = vectorTileFeatures.length; i < length; i++) {
            var vectorTileFeature = vectorTileFeatures[i];
            this._parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i) {
        if (this._filter && typeof this._filter === 'function') {
            if (this._filter(vectorTileFeature, tileContext) === false) {
                return;
            }
        }

        var style = this.getStyle(vectorTileFeature);
        var featureId = this._getIDForLayerFeature(vectorTileFeature) || i;
        var mVTFeature = this._mVTFeatures[featureId];
        if (!mVTFeature) {
            var selected = mVTSource.isFeatureSelected(featureId);
            var options = {
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: selected,
                featureId: featureId,
                customDraw: this._customDraw
            }
            mVTFeature = new MVTFeature(options);
            this._mVTFeatures[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }
        this._canvasAndMVTFeatures[tileContext.id].features.push(mVTFeature);
    }

    drawTile(tileContext) {
        var mVTFeatures = this._canvasAndMVTFeatures[tileContext.id].features;
        if (!mVTFeatures) return;
        var selectedFeatures = [];
        for (var i = 0, length = mVTFeatures.length; i < length; i++) {
            var mVTFeature = mVTFeatures[i];
            if (mVTFeature.selected) {
                selectedFeatures.push(mVTFeature);
            } else {
                mVTFeature.draw(tileContext);
            }
        }
        for (var i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        return this._canvasAndMVTFeatures[id].canvas;
    }

    getStyle(feature) {
        if (typeof this.style === 'function') {
            return this.style(feature);
        }
        return this.style;
    }

    setStyle(style) {
        this.style = style;
        for (var featureId in this._mVTFeatures) {
            this._mVTFeatures[featureId].setStyle(style);
        }
    }

    setSelected(featureId) {
        if (this._mVTFeatures[featureId] !== undefined) {
            this._mVTFeatures[featureId].select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event, mVTSource) {
        var canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;
        var canvas = canvasAndFeatures.canvas;
        var mVTFeatures = canvasAndFeatures.features;

        if (!canvas || !mVTFeatures) {
            return event;
        }
        event.feature = this._handleClickEvent(event, mVTFeatures, mVTSource);
        return event;
    }

    _handleClickEvent(event, mVTFeatures, mVTSource) {
        this.selectedFeature = null;

        var tileContextId = event.tileContext.id;
        var currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(tileContextId);
        this._handleClickFeatures(event, currentSelectedFeaturesInTile);

        if (this.selectedFeature != null) {
            return this.selectedFeature;
        }

        this._handleClickFeatures(event, mVTFeatures);
        if (this.selectedFeature != null) {
            return this.selectedFeature;
        }

        return this.selectedFeature;
    }

    _handleClickFeatures(event, mVTFeatures) {
        this.minDistance = Number.POSITIVE_INFINITY;

        for (var i = mVTFeatures.length - 1; i >= 0; i--) {
            var mVTFeature = mVTFeatures[i];
            this._handleClickFeature(event, mVTFeature);
            if (this.selectedFeature != null) {
                return this.selectedFeature;
            }
        }
    }

    _handleClickFeature(event, mVTFeature) {
        switch (mVTFeature.type) {
            case 3:// polygon
                this._handleClickFeaturePolygon(event, mVTFeature);
                break;
            default: {
                this._handleClickFeatureDefault(event, mVTFeature);
                break;
            }
        }        
    }

    _handleClickFeaturePolygon(event, mVTFeature) {
        if (mVTFeature.isPointInPath(event.tilePoint, event.tileContext)) {
            this.selectedFeature = mVTFeature;
            this.minDistance = 0;
        }
    }

    _handleClickFeatureDefault(event, mVTFeature) {
        var paths = mVTFeature.getPaths(event.tileContext);
        for (var j = paths.length - 1; j >= 0; j--) {
            var path = paths[j];
            switch (mVTFeature.type) {
                case 1: // Point
                    if (MERCATOR.in_circle(path[0].x, path[0].y, mVTFeature.style.radius, event.tilePoint.x, event.tilePoint.y)) {
                        this.selectedFeature = mVTFeature;
                        this.minDistance = 0;
                    }
                    break;
                case 2: // LineString
                    var distance = MERCATOR.getDistanceFromLine(event.tilePoint, path);
                    var thickness = (mVTFeature.selected && mVTFeature.style.selected ? mVTFeature.style.selected.lineWidth : mVTFeature.style.lineWidth);
                    if (distance < thickness / 2 + this._lineClickTolerance && distance < this.minDistance) {
                        this.selectedFeature = mVTFeature;
                        this.minDistance = distance;
                    }
                    break;
            }
            if (this.minDistance == 0) {
                return this.selectedFeature;
            }
        }
    }
};
/*
 *  Created by Jes�s Barrio on 04/2021
 */

class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this._url = options.url || ""; //Url TO Vector Tile Source,
        this._sourceMaxZoom = options.sourceMaxZoom || false; // Source maxzoom to enable overzoom
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
        this._tilesDrawn = []; //  List of tiles drawn  (when cache enabled)
        this._visibleTiles = []; // tiles currently in the viewport        
        this._selectedFeatures = []; // list of selected features
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
        //this._deleteVisibleTile(canvas.id);
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
        var id = this.getTileId(zoom, coord.x, coord.y);
        var tileContext = this._tilesDrawn[id];
        if (tileContext) {
            return tileContext;
        }

        tileContext = this._createTileContext(coord, zoom, ownerDocument);
        this._xhrRequest(tileContext);
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
        if (this._sourceMaxZoom) {
            var tile = this.getTileObject(id);
            if (tile.zoom > this._sourceMaxZoom) {
                var zoomDistance = tile.zoom - this._sourceMaxZoom;
                var zoom = tile.zoom - zoomDistance;
                var x = tile.x >> zoomDistance;
                var y = tile.y >> zoomDistance;
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
            zoom: values[0],
            x: values[1],
            y: values[2]
        }
    }

    _xhrRequest(tileContext) {
        var self = this;

        var id = tileContext.parentId || tileContext.id;
        var tile = this.getTileObject(id);

        var src = this._url
            .replace("{z}", tile.zoom)
            .replace("{x}", tile.x)
            .replace("{y}", tile.y);

        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.onload = function () {
            if (xmlHttpRequest.status == "200" && xmlHttpRequest.response) {
                return self._xhrResponseOk(tileContext, xmlHttpRequest.response)
            }
            self._drawDebugInfo(tileContext);
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
        if (!tileContext || !tileContext.vectorTile) return;
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
        this._resetMVTLayers();
        if (redrawTiles) {
            this.redrawAllTiles();
        }        
    }
}