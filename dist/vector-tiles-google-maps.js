!function (t) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else { var i; i = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, i.Pbf = t() } }(function () { return function t(i, e, r) { function s(o, h) { if (!e[o]) { if (!i[o]) { var a = "function" == typeof require && require; if (!h && a) return a(o, !0); if (n) return n(o, !0); var u = new Error("Cannot find module '" + o + "'"); throw u.code = "MODULE_NOT_FOUND", u } var f = e[o] = { exports: {} }; i[o][0].call(f.exports, function (t) { var e = i[o][1][t]; return s(e ? e : t) }, f, f.exports, t, i, e, r) } return e[o].exports } for (var n = "function" == typeof require && require, o = 0; o < r.length; o++)s(r[o]); return s }({ 1: [function (t, i, e) { "use strict"; function r(t) { this.buf = ArrayBuffer.isView && ArrayBuffer.isView(t) ? t : new Uint8Array(t || 0), this.pos = 0, this.type = 0, this.length = this.buf.length } function s(t, i, e) { var r, s, n = e.buf; if (s = n[e.pos++], r = (112 & s) >> 4, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 3, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 10, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 17, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 24, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (1 & s) << 31, s < 128) return o(t, r, i); throw new Error("Expected varint not more than 10 bytes") } function n(t) { return t.type === r.Bytes ? t.readVarint() + t.pos : t.pos + 1 } function o(t, i, e) { return e ? 4294967296 * i + (t >>> 0) : 4294967296 * (i >>> 0) + (t >>> 0) } function h(t, i) { var e, r; if (t >= 0 ? (e = t % 4294967296 | 0, r = t / 4294967296 | 0) : (e = ~(-t % 4294967296), r = ~(-t / 4294967296), 4294967295 ^ e ? e = e + 1 | 0 : (e = 0, r = r + 1 | 0)), t >= 0x10000000000000000 || t < -0x10000000000000000) throw new Error("Given varint doesn't fit into 10 bytes"); i.realloc(10), a(e, r, i), u(r, i) } function a(t, i, e) { e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos] = 127 & t } function u(t, i) { var e = (7 & t) << 4; i.buf[i.pos++] |= e | ((t >>>= 3) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t))))) } function f(t, i, e) { var r = i <= 16383 ? 1 : i <= 2097151 ? 2 : i <= 268435455 ? 3 : Math.ceil(Math.log(i) / (7 * Math.LN2)); e.realloc(r); for (var s = e.pos - 1; s >= t; s--)e.buf[s + r] = e.buf[s] } function d(t, i) { for (var e = 0; e < t.length; e++)i.writeVarint(t[e]) } function p(t, i) { for (var e = 0; e < t.length; e++)i.writeSVarint(t[e]) } function c(t, i) { for (var e = 0; e < t.length; e++)i.writeFloat(t[e]) } function l(t, i) { for (var e = 0; e < t.length; e++)i.writeDouble(t[e]) } function w(t, i) { for (var e = 0; e < t.length; e++)i.writeBoolean(t[e]) } function F(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed32(t[e]) } function b(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed32(t[e]) } function v(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed64(t[e]) } function g(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed64(t[e]) } function x(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + 16777216 * t[i + 3] } function V(t, i, e) { t[e] = i, t[e + 1] = i >>> 8, t[e + 2] = i >>> 16, t[e + 3] = i >>> 24 } function y(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + (t[i + 3] << 24) } function M(t, i, e) { for (var r = "", s = i; s < e;) { var n = t[s], o = null, h = n > 239 ? 4 : n > 223 ? 3 : n > 191 ? 2 : 1; if (s + h > e) break; var a, u, f; 1 === h ? n < 128 && (o = n) : 2 === h ? (a = t[s + 1], 128 === (192 & a) && (o = (31 & n) << 6 | 63 & a, o <= 127 && (o = null))) : 3 === h ? (a = t[s + 1], u = t[s + 2], 128 === (192 & a) && 128 === (192 & u) && (o = (15 & n) << 12 | (63 & a) << 6 | 63 & u, (o <= 2047 || o >= 55296 && o <= 57343) && (o = null))) : 4 === h && (a = t[s + 1], u = t[s + 2], f = t[s + 3], 128 === (192 & a) && 128 === (192 & u) && 128 === (192 & f) && (o = (15 & n) << 18 | (63 & a) << 12 | (63 & u) << 6 | 63 & f, (o <= 65535 || o >= 1114112) && (o = null))), null === o ? (o = 65533, h = 1) : o > 65535 && (o -= 65536, r += String.fromCharCode(o >>> 10 & 1023 | 55296), o = 56320 | 1023 & o), r += String.fromCharCode(o), s += h } return r } function S(t, i, e) { for (var r, s, n = 0; n < i.length; n++) { if (r = i.charCodeAt(n), r > 55295 && r < 57344) { if (!s) { r > 56319 || n + 1 === i.length ? (t[e++] = 239, t[e++] = 191, t[e++] = 189) : s = r; continue } if (r < 56320) { t[e++] = 239, t[e++] = 191, t[e++] = 189, s = r; continue } r = s - 55296 << 10 | r - 56320 | 65536, s = null } else s && (t[e++] = 239, t[e++] = 191, t[e++] = 189, s = null); r < 128 ? t[e++] = r : (r < 2048 ? t[e++] = r >> 6 | 192 : (r < 65536 ? t[e++] = r >> 12 | 224 : (t[e++] = r >> 18 | 240, t[e++] = r >> 12 & 63 | 128), t[e++] = r >> 6 & 63 | 128), t[e++] = 63 & r | 128) } return e } i.exports = r; var B = t("ieee754"); r.Varint = 0, r.Fixed64 = 1, r.Bytes = 2, r.Fixed32 = 5; var k = 4294967296, P = 1 / k; r.prototype = { destroy: function () { this.buf = null }, readFields: function (t, i, e) { for (e = e || this.length; this.pos < e;) { var r = this.readVarint(), s = r >> 3, n = this.pos; this.type = 7 & r, t(s, i, this), this.pos === n && this.skip(r) } return i }, readMessage: function (t, i) { return this.readFields(t, i, this.readVarint() + this.pos) }, readFixed32: function () { var t = x(this.buf, this.pos); return this.pos += 4, t }, readSFixed32: function () { var t = y(this.buf, this.pos); return this.pos += 4, t }, readFixed64: function () { var t = x(this.buf, this.pos) + x(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readSFixed64: function () { var t = x(this.buf, this.pos) + y(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readFloat: function () { var t = B.read(this.buf, this.pos, !0, 23, 4); return this.pos += 4, t }, readDouble: function () { var t = B.read(this.buf, this.pos, !0, 52, 8); return this.pos += 8, t }, readVarint: function (t) { var i, e, r = this.buf; return e = r[this.pos++], i = 127 & e, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 7, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 14, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 21, e < 128 ? i : (e = r[this.pos], i |= (15 & e) << 28, s(i, t, this))))) }, readVarint64: function () { return this.readVarint(!0) }, readSVarint: function () { var t = this.readVarint(); return t % 2 === 1 ? (t + 1) / -2 : t / 2 }, readBoolean: function () { return Boolean(this.readVarint()) }, readString: function () { var t = this.readVarint() + this.pos, i = M(this.buf, this.pos, t); return this.pos = t, i }, readBytes: function () { var t = this.readVarint() + this.pos, i = this.buf.subarray(this.pos, t); return this.pos = t, i }, readPackedVarint: function (t, i) { var e = n(this); for (t = t || []; this.pos < e;)t.push(this.readVarint(i)); return t }, readPackedSVarint: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSVarint()); return t }, readPackedBoolean: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readBoolean()); return t }, readPackedFloat: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFloat()); return t }, readPackedDouble: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readDouble()); return t }, readPackedFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed32()); return t }, readPackedSFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed32()); return t }, readPackedFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed64()); return t }, readPackedSFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed64()); return t }, skip: function (t) { var i = 7 & t; if (i === r.Varint) for (; this.buf[this.pos++] > 127;); else if (i === r.Bytes) this.pos = this.readVarint() + this.pos; else if (i === r.Fixed32) this.pos += 4; else { if (i !== r.Fixed64) throw new Error("Unimplemented type: " + i); this.pos += 8 } }, writeTag: function (t, i) { this.writeVarint(t << 3 | i) }, realloc: function (t) { for (var i = this.length || 16; i < this.pos + t;)i *= 2; if (i !== this.length) { var e = new Uint8Array(i); e.set(this.buf), this.buf = e, this.length = i } }, finish: function () { return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length) }, writeFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeSFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeSFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeVarint: function (t) { return t = +t || 0, t > 268435455 || t < 0 ? void h(t, this) : (this.realloc(4), this.buf[this.pos++] = 127 & t | (t > 127 ? 128 : 0), void (t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = t >>> 7 & 127))))) }, writeSVarint: function (t) { this.writeVarint(t < 0 ? 2 * -t - 1 : 2 * t) }, writeBoolean: function (t) { this.writeVarint(Boolean(t)) }, writeString: function (t) { t = String(t), this.realloc(4 * t.length), this.pos++; var i = this.pos; this.pos = S(this.buf, t, this.pos); var e = this.pos - i; e >= 128 && f(i, e, this), this.pos = i - 1, this.writeVarint(e), this.pos += e }, writeFloat: function (t) { this.realloc(4), B.write(this.buf, t, this.pos, !0, 23, 4), this.pos += 4 }, writeDouble: function (t) { this.realloc(8), B.write(this.buf, t, this.pos, !0, 52, 8), this.pos += 8 }, writeBytes: function (t) { var i = t.length; this.writeVarint(i), this.realloc(i); for (var e = 0; e < i; e++)this.buf[this.pos++] = t[e] }, writeRawMessage: function (t, i) { this.pos++; var e = this.pos; t(i, this); var r = this.pos - e; r >= 128 && f(e, r, this), this.pos = e - 1, this.writeVarint(r), this.pos += r }, writeMessage: function (t, i, e) { this.writeTag(t, r.Bytes), this.writeRawMessage(i, e) }, writePackedVarint: function (t, i) { this.writeMessage(t, d, i) }, writePackedSVarint: function (t, i) { this.writeMessage(t, p, i) }, writePackedBoolean: function (t, i) { this.writeMessage(t, w, i) }, writePackedFloat: function (t, i) { this.writeMessage(t, c, i) }, writePackedDouble: function (t, i) { this.writeMessage(t, l, i) }, writePackedFixed32: function (t, i) { this.writeMessage(t, F, i) }, writePackedSFixed32: function (t, i) { this.writeMessage(t, b, i) }, writePackedFixed64: function (t, i) { this.writeMessage(t, v, i) }, writePackedSFixed64: function (t, i) { this.writeMessage(t, g, i) }, writeBytesField: function (t, i) { this.writeTag(t, r.Bytes), this.writeBytes(i) }, writeFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFixed32(i) }, writeSFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeSFixed32(i) }, writeFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeFixed64(i) }, writeSFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeSFixed64(i) }, writeVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeVarint(i) }, writeSVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeSVarint(i) }, writeStringField: function (t, i) { this.writeTag(t, r.Bytes), this.writeString(i) }, writeFloatField: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFloat(i) }, writeDoubleField: function (t, i) { this.writeTag(t, r.Fixed64), this.writeDouble(i) }, writeBooleanField: function (t, i) { this.writeVarintField(t, Boolean(i)) } } }, { ieee754: 2 }], 2: [function (t, i, e) { e.read = function (t, i, e, r, s) { var n, o, h = 8 * s - r - 1, a = (1 << h) - 1, u = a >> 1, f = -7, d = e ? s - 1 : 0, p = e ? -1 : 1, c = t[i + d]; for (d += p, n = c & (1 << -f) - 1, c >>= -f, f += h; f > 0; n = 256 * n + t[i + d], d += p, f -= 8); for (o = n & (1 << -f) - 1, n >>= -f, f += r; f > 0; o = 256 * o + t[i + d], d += p, f -= 8); if (0 === n) n = 1 - u; else { if (n === a) return o ? NaN : (c ? -1 : 1) * (1 / 0); o += Math.pow(2, r), n -= u } return (c ? -1 : 1) * o * Math.pow(2, n - r) }, e.write = function (t, i, e, r, s, n) { var o, h, a, u = 8 * n - s - 1, f = (1 << u) - 1, d = f >> 1, p = 23 === s ? Math.pow(2, -24) - Math.pow(2, -77) : 0, c = r ? 0 : n - 1, l = r ? 1 : -1, w = i < 0 || 0 === i && 1 / i < 0 ? 1 : 0; for (i = Math.abs(i), isNaN(i) || i === 1 / 0 ? (h = isNaN(i) ? 1 : 0, o = f) : (o = Math.floor(Math.log(i) / Math.LN2), i * (a = Math.pow(2, -o)) < 1 && (o--, a *= 2), i += o + d >= 1 ? p / a : p * Math.pow(2, 1 - d), i * a >= 2 && (o++, a /= 2), o + d >= f ? (h = 0, o = f) : o + d >= 1 ? (h = (i * a - 1) * Math.pow(2, s), o += d) : (h = i * Math.pow(2, d - 1) * Math.pow(2, s), o = 0)); s >= 8; t[e + c] = 255 & h, c += l, h /= 256, s -= 8); for (o = o << s | h, u += s; u > 0; t[e + c] = 255 & o, c += l, o /= 256, u -= 8); t[e + c - l] |= 128 * w } }, {}] }, {}, [1])(1) });
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

    end = end || buffer.length;

    // Cache buffer.pos to avoid repeated property lookups
    var pos, val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 15:
                this.version = buffer.readVarint();
                break;
            case 1:
                this.name = buffer.readString();
                break;
            case 5:
                this.extent = buffer.readVarint();
                break;
            case 2:
                this.length++;
                this._features.push(buffer.pos);
                buffer.skip(val);
                break;
            case 3:
                this._keys.push(buffer.readString());
                break;
            case 4:
                this._values.push(this.readFeatureValue());
                break;
            default:
                buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function () {
    var buffer = this._buffer,
        value = null,
        end = buffer.pos + buffer.readVarint(),
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 1:
                value = buffer.readString();
                break;
            case 2:
                value = buffer.readFloat();
                break;
            case 3:
                value = buffer.readDouble();
                break;
            case 4:
            case 5:
                value = buffer.readVarint();
                break;
            case 6:
                value = buffer.readSVarint();
                break;
            case 7:
                value = Boolean(buffer.readVarint());
                break;
            default:
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

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
};

Point.prototype.add = function (p) {
    return new Point(this.x + p.x, this.y + p.y);
};

Point.prototype.sub = function (p) {
    return new Point(this.x - p.x, this.y - p.y);
};

Point.prototype.mult = function (k) {
    return new Point(this.x * k, this.y * k);
};

Point.prototype.div = function (k) {
    return new Point(this.x / k, this.y / k);
};

Point.prototype.rotate = function (a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Point(cos * this.x - sin * this.y, sin * this.x + cos * this.y);
};

Point.prototype.matMult = function (m) {
    return new Point(m[0] * this.x + m[1] * this.y, m[2] * this.x + m[3] * this.y);
};

Point.prototype.unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Point(this.x / mag, this.y / mag);
};

Point.prototype.perp = function () {
    return new Point(-this.y, this.x);
};

Point.prototype.round = function () {
    return new Point(Math.round(this.x), Math.round(this.y));
};

Point.prototype.mag = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.equals = function (p) {
    return this.x === p.x && this.y === p.y;
};

Point.prototype.dist = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Point.prototype.distSqr = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return dx * dx + dy * dy;
};

Point.prototype.angle = function () {
    return Math.atan2(this.y, this.x);
};

Point.prototype.angleTo = function (b) {
    return Math.atan2(this.y - b.y, this.x - b.x);
};

Point.prototype.angleWith = function (b) {
    return Math.atan2(this.x * b.y - this.y * b.x, this.x * b.x + this.y * b.y);
};

Point.prototype.angleWithSep = function (x, y) {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
};

Point.prototype._matMult = function (m) {
    const x = m[0] * this.x + m[1] * this.y;
    this.y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    return this;
};

Point.prototype._add = function (p) {
    this.x += p.x;
    this.y += p.y;
    return this;
};

Point.prototype._sub = function (p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
};

Point.prototype._mult = function (k) {
    this.x *= k;
    this.y *= k;
    return this;
};

Point.prototype._div = function (k) {
    this.x /= k;
    this.y /= k;
    return this;
};

Point.prototype._unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= mag;
    this.y /= mag;
    return this;
};

Point.prototype._perp = function () {
    const y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
};

Point.prototype._rotate = function (angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cos * this.x - sin * this.y;
    this.y = sin * this.x + cos * this.y;
    this.x = x;
    return this;
};

Point.prototype._round = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};
MERCATOR = (function () {
    // Pre-calculate constants
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    const LNG_SCALE = 256 / 360;
    const LAT_SCALE = 256 / (2 * Math.PI);
    const WORLD_SIZE = 256;
    const HALF_WORLD = 128;
    const SINY_CLAMP = 0.9999;

    return {
        fromLatLngToPoint: function (latLng) {
            const lat = latLng.lat() * DEG_TO_RAD;
            const siny = Math.min(Math.max(Math.sin(lat), -SINY_CLAMP), SINY_CLAMP);
            return {
                x: HALF_WORLD + latLng.lng() * LNG_SCALE,
                y: HALF_WORLD + 0.5 * Math.log((1 + siny) / (1 - siny)) * -LAT_SCALE
            };
        },

        fromPointToLatLng: function (point) {
            return {
                lat: (2 * Math.atan(Math.exp((point.y - HALF_WORLD) / -LAT_SCALE)) - Math.PI / 2) * RAD_TO_DEG,
                lng: (point.x - HALF_WORLD) / LNG_SCALE
            };
        },

        getTileAtLatLng: function (latLng, zoom) {
            const t = 1 << zoom; // Bit shift instead of Math.pow(2, zoom)
            const s = WORLD_SIZE / t;
            const p = this.fromLatLngToPoint(latLng);
            return {
                x: Math.floor(p.x / s),
                y: Math.floor(p.y / s),
                z: zoom
            };
        },

        getTileBounds: function (tile) {
            tile = this.normalizeTile(tile);
            const t = 1 << tile.z;
            const s = WORLD_SIZE / t;
            const x1 = tile.x * s;
            const y1 = tile.y * s;

            return {
                sw: this.fromPointToLatLng({ x: x1, y: y1 + s }),
                ne: this.fromPointToLatLng({ x: x1 + s, y: y1 })
            };
        },

        normalizeTile: function (tile) {
            const t = 1 << tile.z;
            tile.x = ((tile.x % t) + t) % t;
            tile.y = ((tile.y % t) + t) % t;
            return tile;
        },

        fromLatLngToPixels: function (map, latLng) {
            const bounds = map.getBounds();
            const projection = map.getProjection();
            const scale = 1 << map.getZoom(); // Bit shift for power of 2

            const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
            const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
            const worldPoint = projection.fromLatLngToPoint(latLng);

            return {
                x: (worldPoint.x - bottomLeft.x) * scale,
                y: (worldPoint.y - topRight.y) * scale
            };
        },

        fromLatLngToTilePoint: function (map, evt) {
            const zoom = map.getZoom();
            const tile = this.getTileAtLatLng(evt.latLng, zoom);
            const tileBounds = this.getTileBounds(tile);
            const tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
            const tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
            const tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);
            const tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);

            return {
                x: evt.pixel.x - tileSwPixels.x,
                y: evt.pixel.y - tileNePixels.y
            };
        },

        isPointInPolygon: function (point, polygon) {
            if (!polygon || !polygon.length) return false;

            let inside = false;
            const px = point.x;
            const py = point.y;

            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;

                const intersect = ((yi > py) !== (yj > py)) &&
                    (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        },

        in_circle: function (center_x, center_y, radius, x, y) {
            const dx = center_x - x;
            const dy = center_y - y;
            return (dx * dx + dy * dy) <= radius * radius;
        },

        getDistanceFromLine: function (point, line) {
            if (!line || line.length < 2) return Number.POSITIVE_INFINITY;

            let minDistance = Number.POSITIVE_INFINITY;
            const px = point.x;
            const py = point.y;

            for (let i = 0, l = line.length - 1; i < l; i++) {
                const distance = this.projectPointOnLineSegment(px, py, line[i], line[i + 1]);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            }
            return minDistance;
        },

        projectPointOnLineSegment: function (px, py, r0, r1) {
            const x1 = r0.x;
            const y1 = r0.y;
            const x2 = r1.x;
            const y2 = r1.y;

            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const len_sq = C * C + D * D;

            let xx, yy;

            if (len_sq === 0) { // Zero length line
                xx = x1;
                yy = y1;
            } else {
                const param = dot / len_sq;

                if (param < 0) {
                    xx = x1;
                    yy = y1;
                } else if (param > 1) {
                    xx = x2;
                    yy = y2;
                } else {
                    xx = x1 + param * C;
                    yy = y1 + param * D;
                }
            }

            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
    };
})();
/*
 *  Created by Jes�s Barrio on 04/2021
 */

const TWO_PI = Math.PI * 2;

class MVTFeature {
    constructor(options) {
        this.mVTSource = options.mVTSource;
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = Object.create(null); // Use object without prototype overhead
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
        const zoom = this.mVTSource.map.getZoom();
        const mVTSource = this.mVTSource;
        const tiles = this.tiles;
        const tileKeys = Object.keys(tiles);

        for (let i = 0, len = tileKeys.length; i < len; i++) {
            const id = tileKeys[i];
            mVTSource.deleteTileDrawn(id);
            const idObject = mVTSource.getTileObject(id);
            if (idObject.zoom === zoom) { // Removed parseInt, assume zoom is already a number
                mVTSource.redrawTile(id);
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
        const tile = this.tiles[tileContext.id];
        const style = (this.selected && this.style.selected) ? this.style.selected : this.style;
        this._draw(tileContext, tile, style, this);
    }

    defaultDraw(tileContext, tile, style) {
        const type = this.type;

        if (type === 1) { // Point
            this.drawPoint(tileContext, tile, style);
        } else if (type === 2) { // LineString
            this.drawLineString(tileContext, tile, style);
        } else if (type === 3) { // Polygon
            this.drawPolygon(tileContext, tile, style);
        }
    }

    drawPoint(tileContext, tile, style) {
        const coordinates = tile.vectorTileFeature.coordinates[0][0];
        const point = this.getPoint(coordinates, tileContext, tile.divisor);
        const radius = style.radius || 3;
        const context2d = this.getContext2d(tileContext.canvas, style);
        context2d.beginPath();
        context2d.arc(point.x, point.y, radius, 0, TWO_PI);
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
        const context2d = this.getContext2d(tileContext.canvas, style);
        tile.context2d = context2d;
        this.drawCoordinates(tileContext, tile);

        const paths2d = tile.paths2d;
        paths2d.closePath();

        const hasFill = style.fillStyle;
        const hasStroke = style.strokeStyle;

        // Fixed logic bug: was checking hasStroke three times
        if (hasFill && hasStroke) {
            context2d.fill(paths2d);
            context2d.stroke(paths2d);
        } else if (hasFill) {
            context2d.fill(paths2d);
        } else if (hasStroke) {
            context2d.stroke(paths2d);
        }
    }

    drawCoordinates(tileContext, tile) {
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const paths2d = new Path2D();
        const coordsLength = coordinates.length;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;

            if (coordLength > 0) {
                const path2 = new Path2D();
                const firstPoint = this.getPoint(coordinate[0], tileContext, divisor);
                path2.moveTo(firstPoint.x, firstPoint.y);

                for (let j = 1; j < coordLength; j++) {
                    const point = this.getPoint(coordinate[j], tileContext, divisor);
                    path2.lineTo(point.x, point.y);
                }
                paths2d.addPath(path2);
            }
        }

        tile.paths2d = paths2d;
    }

    getPaths(tileContext) {
        const tile = this.tiles[tileContext.id];
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const coordsLength = coordinates.length;
        const paths = new Array(coordsLength);
        let pathCount = 0;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;
            const path = new Array(coordLength);

            for (let j = 0; j < coordLength; j++) {
                path[j] = this.getPoint(coordinate[j], tileContext, divisor);
            }

            if (coordLength > 0) {
                paths[pathCount++] = path;
            }
        }

        paths.length = pathCount; // Trim array to actual size
        return paths;
    }

    getContext2d(canvas, style) {
        const context2d = canvas.getContext('2d');
        const keys = Object.keys(style);

        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            if (key !== 'selected') {
                context2d[key] = style[key];
            }
        }
        return context2d;
    }

    getPoint(coords, tileContext, divisor) {
        let x = coords.x / divisor;
        let y = coords.y / divisor;

        const parentId = tileContext.parentId;
        if (parentId) {
            const mVTSource = this.mVTSource;
            const parentTile = mVTSource.getTileObject(parentId);
            const currentTile = mVTSource.getTileObject(tileContext.id);
            const zoomDistance = currentTile.zoom - parentTile.zoom;
            const scale = Math.pow(2, zoomDistance);
            const tileSize = tileContext.tileSize;

            x = x * scale - ((currentTile.x % scale) * tileSize);
            y = y * scale - ((currentTile.y % scale) * tileSize);
        }

        return { x, y };
    }

    _getOverzoomedPoint(point, tileContext) {
        const mVTSource = this.mVTSource;
        const parentTile = mVTSource.getTileObject(tileContext.parentId);
        const currentTile = mVTSource.getTileObject(tileContext.id);
        const zoomDistance = currentTile.zoom - parentTile.zoom;
        const scale = Math.pow(2, zoomDistance);
        const tileSize = tileContext.tileSize;

        point.x = point.x * scale - ((currentTile.x % scale) * tileSize);
        point.y = point.y * scale - ((currentTile.y % scale) * tileSize);

        return point;
    }

    isPointInPath(point, tileContext) {
        const tile = this.getTile(tileContext);
        const context2d = tile.context2d;
        const paths2d = tile.paths2d;

        if (!context2d || !paths2d) {
            return false;
        }
        return context2d.isPointInPath(paths2d, point.x, point.y);
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
        this._canvasAndMVTFeatures = Object.create(null);
        this._mVTFeatures = Object.create(null);
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        const tileId = tileContext.id;
        const features = [];
        this._canvasAndMVTFeatures[tileId] = {
            canvas: tileContext.canvas,
            features: features
        };

        for (let i = 0, length = vectorTileFeatures.length; i < length; i++) {
            const feature = this._parseVectorTileFeature(mVTSource, vectorTileFeatures[i], tileContext, i);
            if (feature) features.push(feature);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i) {
        if (this._filter && this._filter(vectorTileFeature, tileContext) === false) {
            return null;
        }

        const style = this.getStyle(vectorTileFeature);
        const featureId = this._getIDForLayerFeature(vectorTileFeature) || i;
        let mVTFeature = this._mVTFeatures[featureId];

        if (!mVTFeature) {
            mVTFeature = new MVTFeature({
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: mVTSource.isFeatureSelected(featureId),
                featureId: featureId,
                customDraw: this._customDraw
            });
            this._mVTFeatures[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }

        return mVTFeature;
    }

    drawTile(tileContext) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[tileContext.id];
        if (!canvasAndFeatures) return;

        const mVTFeatures = canvasAndFeatures.features;
        const selectedFeatures = [];

        for (let i = 0, length = mVTFeatures.length; i < length; i++) {
            const mVTFeature = mVTFeatures[i];
            if (mVTFeature.selected) {
                selectedFeatures.push(mVTFeature);
            } else {
                mVTFeature.draw(tileContext);
            }
        }

        for (let i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[id];
        return canvasAndFeatures ? canvasAndFeatures.canvas : null;
    }

    getStyle(feature) {
        return typeof this.style === 'function' ? this.style(feature) : this.style;
    }

    setStyle(style) {
        this.style = style;
        const features = this._mVTFeatures;
        for (const featureId in features) {
            features[featureId].setStyle(style);
        }
    }

    setSelected(featureId) {
        const feature = this._mVTFeatures[featureId];
        if (feature !== undefined) {
            feature.select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event, mVTSource) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;

        const mVTFeatures = canvasAndFeatures.features;
        if (!mVTFeatures) return event;

        event.feature = this._handleClickEvent(event, mVTFeatures, mVTSource);
        return event;
    }

    _handleClickEvent(event, mVTFeatures, mVTSource) {
        const tileContextId = event.tileContext.id;
        const currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(tileContextId);

        // Check selected features first
        let result = this._handleClickFeatures(event, currentSelectedFeaturesInTile);
        if (result) return result;

        // Check all features
        return this._handleClickFeatures(event, mVTFeatures);
    }

    _handleClickFeatures(event, mVTFeatures) {
        let selectedFeature = null;
        let minDistance = Number.POSITIVE_INFINITY;

        for (let i = mVTFeatures.length - 1; i >= 0; i--) {
            const result = this._handleClickFeature(event, mVTFeatures[i], minDistance);
            if (result && result.distance < minDistance) {
                selectedFeature = result.feature;
                minDistance = result.distance;
                if (minDistance === 0) return selectedFeature;
            }
        }

        return selectedFeature;
    }

    _handleClickFeature(event, mVTFeature, currentMinDistance) {
        // Polygon type
        if (mVTFeature.type === 3) {
            if (mVTFeature.isPointInPath(event.tilePoint, event.tileContext)) {
                return { feature: mVTFeature, distance: 0 };
            }
            return null;
        }

        // Point and LineString types
        const paths = mVTFeature.getPaths(event.tileContext);
        const tilePoint = event.tilePoint;
        const featureType = mVTFeature.type;
        let minDistance = currentMinDistance;
        let found = false;

        for (let j = paths.length - 1; j >= 0; j--) {
            const path = paths[j];

            if (featureType === 1) { // Point
                if (MERCATOR.in_circle(path[0].x, path[0].y, mVTFeature.style.radius, tilePoint.x, tilePoint.y)) {
                    return { feature: mVTFeature, distance: 0 };
                }
            } else if (featureType === 2) { // LineString
                const distance = MERCATOR.getDistanceFromLine(tilePoint, path);
                const style = mVTFeature.style;
                const thickness = (mVTFeature.selected && style.selected) ? style.selected.lineWidth : style.lineWidth;

                if (distance < thickness / 2 + this._lineClickTolerance && distance < minDistance) {
                    minDistance = distance;
                    found = true;
                }
            }
        }

        return found ? { feature: mVTFeature, distance: minDistance } : null;
    }
}
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
            zoom: parseInt(values[0]),
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