function VectorTile(buffer, end) {
    this.layers = {};
    this._buffer = buffer;
    end = end || buffer.length;

    var pos = buffer.pos;
    while (pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag === 3) {
            var layer = this._readLayer();
            if (layer.length) {
                this.layers[layer.name] = layer;
            }
        } else {
            buffer.skip(val);
        }
        pos = buffer.pos;
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
    var layers = this.layers;
    for (var key in layers) {
        if (!layers.hasOwnProperty(key)) continue;

        var layer = layers[key];
        var features = layer._features;
        var len = features.length;
        var parsedFeatures = new Array(len);

        for (var i = 0; i < len; i++) {
            var feature = layer.feature(i);
            feature.coordinates = feature.loadGeometry();
            parsedFeatures[i] = feature;
        }
        layer.parsedFeatures = parsedFeatures;
    }
};