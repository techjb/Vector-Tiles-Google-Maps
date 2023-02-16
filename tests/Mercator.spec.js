import {initialize} from '@googlemaps/jest-mocks';
import {
  fromLatLngToPixels,
  fromLatLngToPoint,
  fromLatLngToTilePoint,
  fromPointToLatLng,
  getDistanceFromLine,
  getTileAtLatLng,
  getTileBounds,
  inCircle,
  isPointInPolygon,
  normalizeTile,
  projectPointOnLineSegment,
} from '../lib/mercator.js';

initialize();

// TODO maybe use actual Google Maps API objects instead of mocks for more precise testing.
const mockLatLng = (lat = 0, lng = 0) => ({
  lat: () => lat,
  lng: () => lng,
});

// TODO get rid of this class wrapper once this no longer needs to be class.
class MockLatLng {
  constructor({lat, lng}) {
    return mockLatLng(lat, lng);
  }
}
// TODO fromLatLngToTilePoint accesses "google" as a global. This should be passed in or imported.
global.google = {
  maps: {
    LatLng: MockLatLng,
  },
};

const mockMap = () => ({
  getBounds: () => ({
    getNorthEast: () => ({lat: -15, lng: 30}),
    getSouthWest: () => ({lat: 45, lng: -60}),
  }),
  getProjection: () => ({
    // Like the actual API function, this must work for both LatLng and LatLngLiteral arguments.
    fromLatLngToPoint: ({lat, lng}) => {
      if (lat instanceof Function) {
        return {x: lat(), y: lng()};
      } else {
        return {x: lat, y: lng};
      }
    },
  }),
  getZoom: () => 13,
});

const testLocations = [
  {
    name: 'Kansas City',
    latLng: mockLatLng(39.1, -94.58),
    point: {x: 60.74311, y: 97.74630},
    pixel: {x: -48332.79999, y: -1020559.36},
    tiles: [
      {
        tile: {x: 1, y: 3, z: 3},
        bounds: {
          ne: {lat: 40.9799, lng: -90},
          sw: {lat: 0, lng: -135},
        },
      },
      {
        tile: {x: 30, y: 48, z: 7},
        bounds: {
          ne: {lat: 40.9799, lng: -92.8125},
          sw: {lat: 38.8226, lng: -95.625},
        },
      },
      {
        tile: {x: 1943, y: 3127, z: 13},
        bounds: {
          ne: {lat: 39.13006, lng: -94.57031},
          sw: {lat: 39.09596, lng: -94.61425},
        },
      },
    ],
  },
  {
    name: 'Sydney',
    latLng: mockLatLng(-33.87, 151.21),
    point: {x: 235.52711, y: 153.62464},
    pixel: {x: -646103.04, y: 992952.32000},
    tiles: [
      {
        tile: {x: 7, y: 4, z: 3},
        bounds: {
          ne: {lat: 0, lng: 180},
          sw: {lat: -40.9799, lng: 135},
        },
      },
      {
        tile: {x: 117, y: 76, z: 7},
        bounds: {
          ne: {lat: -31.95216, lng: 151.875},
          sw: {lat: -34.30714, lng: 149.0625},
        },
      },
      {
        tile: {x: 7536, y: 4915, z: 13},
        bounds: {
          ne: {lat: -33.83392, lng: 151.21582},
          sw: {lat: -33.87041, lng: 151.17188},
        },
      },
    ],
  },
  {
    name: 'Amsterdam',
    latLng: mockLatLng(52.37, 4.89),
    point: {x: 131.47733, y: 84.13152},
    pixel: {x: 60375.03999, y: -205701.12},
    tiles: [
      {
        tile: {x: 4, y: 2, z: 3},
        bounds: {
          ne: {lat: 66.51326, lng: 45},
          sw: {lat: 40.9799, lng: 0},
        },
      },
      {
        tile: {x: 65, y: 42, z: 7},
        bounds: {
          ne: {lat: 52.48278, lng: 5.625},
          sw: {lat: 50.73646, lng: 2.8125},
        },
      },
      {
        tile: {x: 4207, y: 2692, z: 13},
        bounds: {
          ne: {lat: 52.3756, lng: 4.92188},
          sw: {lat: 52.34876, lng: 4.87792},
        },
      },
    ],
  },
  {
    name: 'Quito',
    latLng: mockLatLng(-0.22, -78.51),
    point: {x: 72.17066, y: 128.15644},
    pixel: {x: -370442.24, y: -888913.92},
    tiles: [
      {
        tile: {x: 2, y: 4, z: 3},
        bounds: {
          ne: {lat: 0, lng: -45},
          sw: {lat: -40.9799, lng: -90},
        },
      },
      {
        tile: {x: 36, y: 64, z: 7},
        bounds: {
          ne: {lat: 0, lng: -75.9375},
          sw: {lat: -2.81137, lng: -78.75},
        },
      },
      {
        tile: {x: 2309, y: 4101, z: 13},
        bounds: {
          ne: {lat: -0.21973, lng: -78.48633},
          sw: {lat: -0.26367, lng: -78.53027},
        },
      },
    ],
  },
];

describe('Mercator.js', () => {
  describe('fromLatLngToPoint', () => {
    it.each(testLocations)('returns expected value for $name', ({latLng, point}) => {
      const {x, y} = fromLatLngToPoint(latLng);

      expect(x).toBeCloseTo(point.x, 4);
      expect(y).toBeCloseTo(point.y, 4);
    });
  });
  describe('fromPointToLatLng', () => {
    it.each(testLocations)('returns expected value for $name', ({latLng, point}) => {
      const {lat, lng} = fromPointToLatLng(point);

      expect(lat).toBeCloseTo(latLng.lat(), 4);
      expect(lng).toBeCloseTo(latLng.lng(), 4);
    });
  });
  describe('getTileAtLatLng', () => {
    describe.each([3, 7, 13])('At zoom level %s', (zoom) => {
      it.each(testLocations)('returns expected value for $name', ({latLng, tiles}) => {
        const tile = getTileAtLatLng(latLng, zoom);
        const expectedTile = tiles.find(({tile}) => tile.z === zoom).tile;

        expect(tile).toStrictEqual(expectedTile);
      });
    });
    it('returns a tile with `z` equal to the zoom level', () => {
      const latLng = mockLatLng(-15, 25);

      for (let zoom = 1; zoom < 16; zoom++) {
        expect(getTileAtLatLng(latLng, zoom).z).toBe(zoom);
      }
    });
  });
  describe('getTileBounds', () => {
    describe.each([3, 7, 13])('At zoom level %s', (zoom) => {
      it.each(testLocations)('returns expected value for $name', ({tiles}) => {
        const {tile, bounds: expectedBounds} = tiles.find(({tile}) => tile.z === zoom);
        const bounds = getTileBounds(tile);

        expect(bounds.ne.lat).toBeCloseTo(expectedBounds.ne.lat, 4);
        expect(bounds.ne.lng).toBeCloseTo(expectedBounds.ne.lng, 4);
        expect(bounds.sw.lat).toBeCloseTo(expectedBounds.sw.lat, 4);
        expect(bounds.sw.lng).toBeCloseTo(expectedBounds.sw.lng, 4);
      });
    });
  });
  describe('normalizeTile', () => {
    const trueMadridTile = {x: 4011, y: 3088, z: 13};
    const parallelUniverseMadrids = () => [
      {world: 'Earth 1', tile: {x: 12203, y: 3088, z: 13}},
      {world: 'Earth 4', tile: {x: 36779, y: 3088, z: 13}},
      {world: 'Earth -2', tile: {x: -12373, y: 3088, z: 13}},
    ];
    it.each(parallelUniverseMadrids())('normalizes Madrid in $world to correct value', ({tile}) => {
      const normalizedTile = normalizeTile(tile);

      expect(normalizedTile).toStrictEqual(trueMadridTile);
    });
    // TODO normalizeTile ought to be made a pure function. Once that's done, invert this test.
    it('returns the argument, mutated', () => {
      const earth1MadridTile = parallelUniverseMadrids()[0].tile;
      const normalizedTile = normalizeTile(earth1MadridTile);

      expect(normalizedTile).toBe(earth1MadridTile);
    });
  });
  describe('fromLatLngToPixels', () => {
    it.each(testLocations)('returns expected value for $name', ({latLng, pixel}) => {
      const {x, y} = fromLatLngToPixels(mockMap(), latLng);

      expect(x).toBeCloseTo(pixel.x, 4);
      expect(y).toBeCloseTo(pixel.y, 4);
    });
  });
  describe('fromLatLngToTilePoint', () => {
    const mockEvt = {
      pixel: {x: 55, y: -165},
      latLng: {lat: () => -90.8105, lng: () => 71.4541},
    };

    it('returns expected value', () => {
      const {x, y} = fromLatLngToTilePoint(mockMap(), mockEvt);

      expect(x).toBeCloseTo(-126215.27845, 4);
      expect(y).toBeCloseTo(-339765, 4);
    });
  });
  describe('isPointInPolygon', () => {
    const polygonTests = [
      {
        name: 'a 1x1 square about the origin',
        polygon: [
          {x: -1, y: 1},
          {x: 1, y: 1},
          {x: 1, y: -1},
          {x: -1, y: -1},
        ],
        inside: {x: 0, y: 0},
        outside: {x: 0, y: 2},
      },
      {
        name: 'a twisted 1x1 cross-quadrilateral about the origin',
        polygon: [
          {x: -1, y: 1},
          {x: 1, y: -1},
          {x: -1, y: -1},
          {x: 1, y: 1},
        ],
        inside: {x: .5, y: .75},
        outside: {x: .5, y: .25},
      },
      {
        name: 'a polygon with hole in the middle',
        polygon: [
          {x: -1, y: 1},
          {x: 1, y: 1},
          {x: 1, y: -1},
          {x: -2, y: -1},
          {x: -2, y: 2},
          {x: 2, y: 2},
          {x: 2, y: -2},
          {x: -3, y: -2},
        ],
        inside: {x: 1.5, y: 1.5},
        outside: {x: 0, y: 0},
      },
    ];
    describe.each(polygonTests)('For $name', ({polygon, inside, outside}) => {
      it('returns true for a point inside the polygon', () => {
        expect(isPointInPolygon(inside, polygon)).toBe(true);
      });
      it('returns false for a point outside the polygon', () => {
        expect(isPointInPolygon(outside, polygon)).toBe(false);
      });
    });
    it('returns undefined if polygon is not supplied', () => {
      expect(isPointInPolygon({x: 0, y: 0})).toBeUndefined();
    });
    it('returns undefined if polygon has no points', () => {
      expect(isPointInPolygon({x: 0, y: 0}, [])).toBeUndefined();
    });
  });
  describe('inCircle', () => {
    it('returns true for a point in the circle', () => {
      expect(inCircle(1, 1, 2, 2, 2)).toBe(true);
    });
    it('returns false for a point outside the circle', () => {
      expect(inCircle(-2, 3, 4, 2, 0)).toBe(false);
    });
    it('returns true for a point on the edge of the circle', () => {
      expect(inCircle(0, 1, 2, 0, 3)).toBe(true);
    });
    it('returns true for the center of the circle', () => {
      expect(inCircle(0, 0, 0, 0, 0)).toBe(true);
    });
  });
  const lineTests = [
    {
      name: 'a two-vertex line',
      line: [
        {x: -1, y: 0},
        {x: 1, y: 0},
      ],
      points: [
        {point: {x: 0, y: 1}, distance: 1},
        {point: {x: 2, y: 0}, distance: 1},
        {point: {x: 0, y: 0}, distance: 0},
      ],
    },
    {
      name: 'a triangle',
      line: [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 0, y: 1},
      ],
      points: [
        {point: {x: 1, y: 1}, distance: Math.sqrt(.5)},
        {point: {x: .5, y: 0}, distance: 0},
        {point: {x: 0, y: 10}, distance: 9},
      ],
    },
    {
      name: 'a line with duplicate vertices',
      line: [
        {x: 0, y: 0},
        {x: 0, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 0},
        {x: 2, y: 0},
      ],
      points: [
        {point: {x: 1, y: 0}, distance: 0},
        {point: {x: 2, y: -2}, distance: 2},
      ],
    },
  ];
  describe('getDistanceFromLine', () => {
    describe.each(lineTests)('For $name', ({line, points}) => {
      it.each(points)('returns $distance for point $point', ({distance, point}) => {
        expect(getDistanceFromLine(point, line)).toBe(distance);
      });
    });
  });
  describe('projectPointOnLineSegment', () => {
    const twoVertexTests = lineTests.filter((t) => t.line.length === 2);
    describe.each(twoVertexTests)('For $name', ({line, points}) => {
      it.each(points)('returns $distance for point $point', ({distance, point}) => {
        expect(projectPointOnLineSegment(point, line[0], line[1])).toBe(distance);
      });
    });
  });
});
