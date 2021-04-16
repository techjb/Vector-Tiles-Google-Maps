/* Generated from Java with JSweet 3.0.0 - http://www.jsweet.org */



var GFG = /** @class */ (function () {
    function GFG() {
    }
    GFG.onSegment = function (p, q, r) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
            return true;
        }
        return false;
    };
    GFG.orientation = function (p, q, r) {
        var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) {
            return 0;
        }
        return (val > 0) ? 1 : 2;
    };
    GFG.doIntersect = function (p1, q1, p2, q2) {
        var o1 = GFG.orientation(p1, q1, p2);
        var o2 = GFG.orientation(p1, q1, q2);
        var o3 = GFG.orientation(p2, q2, p1);
        var o4 = GFG.orientation(p2, q2, q1);
        if (o1 !== o2 && o3 !== o4) {
            return true;
        }
        if (o1 === 0 && GFG.onSegment(p1, p2, q1)) {
            return true;
        }
        if (o2 === 0 && GFG.onSegment(p1, q2, q1)) {
            return true;
        }
        if (o3 === 0 && GFG.onSegment(p2, p1, q2)) {
            return true;
        }
        if (o4 === 0 && GFG.onSegment(p2, q1, q2)) {
            return true;
        }
        return false;
    };
    GFG.isInside = function (polygon, n, p) {
        if (n < 3) {
            return false;
        }
        var extreme = new GFG.Point(GFG.INF, p.y);
        var count = 0;
        var i = 0;
        do {
            {
                var next = (i + 1) % n;
                if (GFG.doIntersect(polygon[i], polygon[next], p, extreme)) {
                    if (GFG.orientation(polygon[i], p, polygon[next]) === 0) {
                        return GFG.onSegment(polygon[i], p, polygon[next]);
                    }
                    count++;
                }
                i = next;
            }
        } while ((i !== 0));
        return (count % 2 === 1);
    };
    GFG.main = function (args) {
        var polygon1 = [new GFG.Point(0, 0), new GFG.Point(10, 0), new GFG.Point(10, 10), new GFG.Point(0, 10)];
        var n = polygon1.length;
        var p = new GFG.Point(20, 20);
        if (GFG.isInside(polygon1, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
        p = new GFG.Point(5, 5);
        if (GFG.isInside(polygon1, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
        var polygon2 = [new GFG.Point(0, 0), new GFG.Point(5, 5), new GFG.Point(5, 0)];
        p = new GFG.Point(3, 3);
        n = polygon2.length;
        if (GFG.isInside(polygon2, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
        p = new GFG.Point(5, 1);
        if (GFG.isInside(polygon2, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
        p = new GFG.Point(8, 1);
        if (GFG.isInside(polygon2, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
        var polygon3 = [new GFG.Point(0, 0), new GFG.Point(10, 0), new GFG.Point(10, 10), new GFG.Point(0, 10)];
        p = new GFG.Point(-1, 10);
        n = polygon3.length;
        if (GFG.isInside(polygon3, n, p)) {
            console.info("Yes");
        }
        else {
            console.info("No");
        }
    };
    GFG.INF = 10000;
    return GFG;
}());
GFG["__class"] = "GFG";
(function (GFG) {
    var Point = /** @class */ (function () {
        function Point(x, y) {
            if (this.x === undefined) {
                this.x = 0;
            }
            if (this.y === undefined) {
                this.y = 0;
            }
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    GFG.Point = Point;
    Point["__class"] = "GFG.Point";
})(GFG || (GFG = {}));
//GFG.main(null);
