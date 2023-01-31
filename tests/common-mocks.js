// Google Maps API map mock
const mockAddListener = jest.fn();
export const mockMap = () => ({
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
  addListener: mockAddListener,
});

// Mock of MVTSource for use in testing other classes
export const mockMVTSource = {
  isFeatureSelected: jest.fn(() => false),
  featureSelected: jest.fn(),
  featureDeselected: jest.fn(),
  deleteTileDrawn: jest.fn(),
  getTileObject: jest.fn((id) => [
    {zoom: 3},
    {zoom: 5, x: 1, y: 3},
    {zoom: 7, x: 5, y: 10},
    {zoom: 13},
    {zoom: 15},
    {zoom: 13},
    {zoom: 7},
  ][id]),
  redrawTile: jest.fn(),
  map: mockMap(),
};

export const mockVectorTileFeatures = [
  {
    extent: 64,
    type: 1,
    properties: 'mock vector tile props',
    // I don't fully understand what the shape of `coordinates` is supposed to be,
    // but this satisfies the functions that use it.
    coordinates: [
      [
        {x: 1, y: 2}, {x: 2, y: 1},
      ],
      [
        {x: -2, y: 3}, {x: 0, y: 3}, {x: 3, y: 3},
      ],
    ],
  },
  {
    extent: 32,
    type: 2,
    properties: 'mock props',
    coordinates: [
      [{x: 0, y: 0}, {x: 3, y: 1}, {x: 5, y: -2}],
    ],
  },
];

// These need to be the same across calls to mockContext.
const mockBeginPath = jest.fn();
const mockClosePath = jest.fn();
const mockArc = jest.fn();
const mockFill = jest.fn();
const mockStroke = jest.fn();
const mockClearRect = jest.fn();

export const mockContext = () => ({
  beginPath: mockBeginPath,
  closePath: mockClosePath,
  arc: mockArc,
  fill: mockFill,
  stroke: mockStroke,
  clearRect: mockClearRect,
});

export const mockCanvas = {
  width: 512,
  height: 128,
  getContext: jest.fn(() => mockContext()),
};

export const mockTileContext = {
  id: 0,
  tileSize: 4,
  canvas: mockCanvas,
};
