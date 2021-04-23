class MVTFeature {
    constructor(mVTLayer, vectorTileFeature, tileContext, style) {
        this.mVTLayer = mVTLayer;
        this.toggleEnabled = true;
        this.selected = false;
        this.divisor = vectorTileFeature.extent / tileContext.tileSize; // how much we divide the coordinate from the vector tile
        this.extent = vectorTileFeature.extent;
        this.tileSize = tileContext.tileSize;
        this.tileInfos = {};
        this.style = style;
        for (var key in vectorTileFeature) {
            this[key] = vectorTileFeature[key];
        }
        if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
            this.dynamicLabel = this.mVTLayer.mVTSource.dynamicLabel.createFeature(this);
        }
        this.addTileFeature(vectorTileFeature, tileContext);
    }


    addTileFeature(vectorTileFeature, tileContext) {
        this.tileInfos[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            paths: []
        };
    }

    setStyle(styleFn) {
        this.style = styleFn(this, null);
        this.removeLabel();
    }

    draw (tileContext) {
        var vectorTileFeature = this.tileInfos[tileContext.id].vectorTileFeature;

        //  This could be used to directly compute the style function from the layer on every draw.
        //  This is much less efficient...
        //  this.style = this.mvtLayer.style(this);

        var style = this.style;
        if (this.selected) {
            var style = this.style.selected || this.style;
        }
        switch (vectorTileFeature.type) {
            case 1: //Point
                this._drawPoint(tileContext, vectorTileFeature.coordinates, style);
                if (!this.staticLabel && typeof this.style.staticLabel === 'function') {
                    if (this.style.ajaxSource && !this.ajaxData) {
                        break;
                    }
                    this._drawStaticLabel(tileContext, vectorTileFeature.coordinates, style);
                }
                break;

            case 2: //LineString
                this._drawLineString(tileContext, vectorTileFeature.coordinates, style);
                break;

            case 3: //Polygon
                this._drawPolygon(tileContext, vectorTileFeature.coordinates, style);
                break;

            default:
                throw new Error('Unmanaged type: ' + vectorTileFeature.type);
        }

    }

    getPathsForTile(id) {
        return this.tileInfos[id].paths;
    }


    clearTiles(zoom) {
        for (var key in this.tileInfos) {
            if (key.split(":")[0] != zoom) {
                delete this.tileInfos[key];
            }
        }
    }

    redrawTiles() {
        for (var id in this.tileInfos) {
            this.mVTLayer.mVTSource.redrawTile(id);
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
        this.mVTLayer.mVTSource.featureSelected(this);
        this.redrawTiles();
        //redrawFeatureInAllTiles(this);
        //var linkedFeature = this.linkedFeature();
        //if (linkedFeature && linkedFeature.staticLabel && !linkedFeature.staticLabel.selected) {
        //    linkedFeature.staticLabel.select();
        //}
    }

    deselect() {
        this.selected = false;
        this.mVTLayer.mVTSource.featureDeselected(this);
        this.redrawTiles();
        //redrawFeatureInAllTiles(this);
        //var linkedFeature = this.linkedFeature();
        //if (linkedFeature && linkedFeature.staticLabel && linkedFeature.staticLabel.selected) {
        //    linkedFeature.staticLabel.deselect();
        //}
    }

    //MVTFeature.prototype.on = function (eventType, callback) {
    //    this._eventHandlers[eventType] = callback;
    //};

    _drawPoint(tileContext, coordsArray, style) {
        if (!style) return;

        var tile = this.tileInfos[tileContext.id];

        //Get radius
        var radius = 1;
        if (typeof style.radius === 'function') {
            radius = style.radius(tileContext.zoom); //Allows for scale dependent rednering
        }
        else {
            radius = style.radius;
        }

        var point = this.getPoint(coordsArray[0][0]);
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
    }

    _drawLineString(tileContext, coordsArray, style) {
        if (!style) return;

        var context2d = tileContext.canvas.getContext('2d');
        context2d.strokeStyle = style.color;
        context2d.lineWidth = style.size;
        context2d.beginPath();

        var projCoords = [];
        var tile = this.tileInfos[tileContext.id];

        for (var gidx in coordsArray) {
            var coords = coordsArray[gidx];
            for (i = 0; i < coords.length; i++) {
                var method = (i === 0 ? 'move' : 'line') + 'To';
                var point = this.getPoint(coords[i]);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.stroke();
        context2d.restore();
        tile.paths.push(projCoords);
    }

    _drawPolygon(tileContext, coordsArray, style) {
        if (!style) return;

        var context2d = tileContext.canvas.getContext('2d');
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
        var tileInfo = this.tileInfos[tileContext.id];

        var featureLabel = this.dynamicLabel;
        if (featureLabel) {
            featureLabel.addTilePolys(tileContext, coordsArray);
        }

        for (var gidx = 0, len = coordsArray.length; gidx < len; gidx++) {
            var coords = coordsArray[gidx];
            for (var i = 0; i < coords.length; i++) {
                var coord = coords[i];
                var method = (i === 0 ? 'move' : 'line') + 'To';
                var point = this.getPoint(coord);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.closePath();
        context2d.fill();
        if (outline) {
            context2d.stroke();
        }
        tileInfo.paths.push(projCoords);
    }

    //_drawStaticLabel(tileContext, coordsArray, style) {
    //    if (!style) return;

    //    // If the corresponding layer is not on the map, 
    //    // we dont want to put on a label.
    //    if (!this.mVTLayer._map) return;

    //    var point = this.getPoint(coordsArray[0][0]);

    //    // We're making a standard Leaflet Marker for this label.
    //    var p = this._project(point, tileContext.tile.x, tileContext.tile.y, this.extent, this.tileSize); //vectile pt to merc pt
    //    var mercPt = L.point(p.x, p.y); // make into leaflet obj
    //    var latLng = this.map.unproject(mercPt); // merc pt to latlng

    //    this.staticLabel = new StaticLabel(this, tileContext, latLng, style);
    //    this.mVTLayer.featureWithLabelAdded(this);
    //}

    //removeLabel() {
    //    if (!this.staticLabel) return;
    //    this.staticLabel.remove();
    //    this.staticLabel = null;
    //}

   
    //_project(vecPt, tileX, tileY, extent, tileSize) {
    //    var xOffset = tileX * tileSize;
    //    var yOffset = tileY * tileSize;
    //    return {
    //        x: Math.floor(vecPt.x + xOffset),
    //        y: Math.floor(vecPt.y + yOffset)
    //    };
    //}

    getPoint(coords) {
        return {
            x: coords.x / this.divisor,
            y: coords.y / this.divisor
        };
    }
}