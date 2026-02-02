function VectorTileFeature(buffer, end, extent, keys, values) {
    this.properties = {};
    this.extent = extent;
    this.type = 0;
    this._buffer = buffer;
    this._geometry = -1;

    end = end || buffer.length;
    var pos = buffer.pos;

    while (pos < end) {
        buffer.pos = pos;
        var val = buffer.readVarint(),
            tag = val >> 3;
        pos = buffer.pos;

        switch (tag) {
            case 1:
                this._id = buffer.readVarint();
                pos = buffer.pos;
                break;
            case 2:
                var tagEnd = pos + buffer.readVarint();
                pos = buffer.pos;
                while (pos < tagEnd) {
                    buffer.pos = pos;
                    var keyIdx = buffer.readVarint();
                    var valueIdx = buffer.readVarint();
                    this.properties[keys[keyIdx]] = values[valueIdx];
                    pos = buffer.pos;
                }
                break;
            case 3:
                this.type = buffer.readVarint();
                pos = buffer.pos;
                break;
            case 4:
                this._geometry = pos;
                buffer.skip(val);
                pos = buffer.pos;
                break;
            default:
                buffer.skip(val);
                pos = buffer.pos;
                break;
        }
    }
    buffer.pos = pos;
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var end = buffer.pos + buffer.readVarint(),
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line = null,
        pos = buffer.pos;

    while (pos < end) {
        if (length === 0) {
            buffer.pos = pos;
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
            pos = buffer.pos;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            buffer.pos = pos;
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            pos = buffer.pos;

            if (cmd === 1) {
                // moveTo
                if (line !== null) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            if (line !== null && line.length > 0) {
                line.push(line[0].clone());
            }
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line !== null) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var end = buffer.pos + buffer.readVarint(),
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity,
        pos = buffer.pos;

    while (pos < end) {
        if (length === 0) {
            buffer.pos = pos;
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
            pos = buffer.pos;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            buffer.pos = pos;
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            pos = buffer.pos;

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