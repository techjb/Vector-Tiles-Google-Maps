import {MVTFeature} from '@/MVTFeature.js';
import {mockMVTSource, mockVectorTileFeatures, mockCanvas, mockContext} from './common-mocks';

const mockVectorTileFeature = mockVectorTileFeatures[0];

// This mocks Path2D of the Canvas API.
const mockAddPath = jest.fn();
const mockMoveTo = jest.fn();
const mockLineTo = jest.fn();
class Path2D {
  constructor() {
    this.addPath = mockAddPath;
    this.moveTo = mockMoveTo;
    this.lineTo = mockLineTo;
  }
}
global.Path2D = Path2D;

const mockTile = {
  divisor: 16,
  vectorTileFeature: mockVectorTileFeature,
  paths2d: {
    closePath: jest.fn(),
  },
};
const mockTileContext = {
  id: 0,
  tileSize: 4,
  canvas: mockCanvas,
};
const mockStyle = {
  selected: false,
  radius: 18,
  fillStyle: true,
  strokeStyle: true,
};

const mockDrawFn = jest.fn();

const mockOptions = () => ({
  mVTSource: mockMVTSource,
  selected: true,
  featureId: 'mock featureId',
  style: mockStyle,
  vectorTileFeature: mockVectorTileFeature,
  tileContext: mockTileContext,
  customDraw: mockDrawFn,
});

describe('MVTFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Constructor', () => {
    describe('Setting properties', () => {
      it('sets base MVTFeature properties from options', () => {
        const baseProperties = ['mVTSource', 'selected', 'featureId', 'style'];
        const options = mockOptions();
        const mVTFeature = new MVTFeature(options);

        baseProperties.forEach((key) => expect(mVTFeature[key]).toBe(options[key]));
      });
      it('starts with one tile', () => {
        const mVTFeature = new MVTFeature(mockOptions());

        expect(mVTFeature.tiles).toHaveLength(1);
      });
      it('if selected, calls mVTSource.featureSelected with this feature', () => {
        const mVTFeature = new MVTFeature(mockOptions());

        expect(mockMVTSource.featureSelected).toHaveBeenCalledWith(mVTFeature);
      });
      it('if not selected, does not call mVTSource.', () => {
        const options = {...mockOptions(), selected: false};
        new MVTFeature(options);

        expect(mockMVTSource.featureSelected).not.toHaveBeenCalled();
      });
    });
  });
  describe('addTileFeature', () => {
    it('adds the tile as expected', () => {
      const mVTFeature = new MVTFeature(mockOptions());
      mVTFeature.addTileFeature(mockVectorTileFeature, mockTileContext);

      expect(mVTFeature.tiles[0]).toStrictEqual({
        vectorTileFeature: mockVectorTileFeature,
        divisor: 16,
        context2d: false,
        paths2d: false,
      });
    });
    it('creates a sparse `tiles` array if indices are skipped', () => {
      const context = {id: 100, tileSize: 2};
      const mVTFeature = new MVTFeature(mockOptions());
      mVTFeature.addTileFeature(mockVectorTileFeature, context);

      expect(mVTFeature.tiles).toHaveLength(101);
      // There will be two tiles (one from constructor, one from this test's call)
      expect(Object.values(mVTFeature.tiles)).toHaveLength(2);
    });
  });
  describe('redrawTiles', () => {
    let mVTFeature;
    beforeEach(() => {
      mVTFeature = new MVTFeature(mockOptions());
      // Add six tiles for testing
      for (let i = 1; i < 7; i++) {
        mVTFeature.addTileFeature(mockVectorTileFeature, {...mockTileContext, id: i});
      }
    });
    it('calls MVTSource.deleteTileDrawn for all tiles', () => {
      mVTFeature.redrawTiles();

      for (let i = 0; i < 7; i++) {
        // It's called with the numbers as strings.
        expect(mockMVTSource.deleteTileDrawn).toHaveBeenCalledWith(i.toString());
      }
    });
    it('calls MVTSource.redrawTile only for tiles at current zoom', () => {
      const expectedRedrawn = ['3', '5'];
      const expectedNotRedrawn = ['0', '1', '2', '4', '6'];

      mVTFeature.redrawTiles();

      expectedRedrawn.forEach((id) =>
        expect(mockMVTSource.redrawTile).toHaveBeenCalledWith(id),
      );
      expectedNotRedrawn.forEach((id) =>
        expect(mockMVTSource.redrawTile).not.toHaveBeenCalledWith(id),
      );
    });
  });
  describe('toggle', () => {
    it('if feature is selected, calls MVTSource.featureDeselected with this feature', () => {
      const mVTFeature = new MVTFeature({...mockOptions(), selected: true});
      jest.clearAllMocks();

      mVTFeature.toggle();

      expect(mockMVTSource.featureDeselected).toHaveBeenCalledWith(mVTFeature);
      expect(mockMVTSource.featureSelected).not.toHaveBeenCalled();
    });
    it('if feature is not selected, calls MVTSource.featureSelected with this feature', () => {
      const mVTFeature = new MVTFeature({...mockOptions(), selected: false});
      jest.clearAllMocks();

      mVTFeature.toggle();

      expect(mockMVTSource.featureSelected).toHaveBeenCalledWith(mVTFeature);
      expect(mockMVTSource.featureDeselected).not.toHaveBeenCalled();
    });
  });
  describe('setSelected', () => {
    it('sets the selected property on the feature', () => {
      const mVTFeature = new MVTFeature(mockOptions());
      mVTFeature.setSelected(false);

      expect(mVTFeature.selected).toBe(false);
    });
    it.each([true, false])('when setting to %s, does not call MVTSource methods', (value) => {
      const mVTFeature = new MVTFeature({...mockOptions(), selected: !value});
      jest.clearAllMocks();

      mVTFeature.setSelected(value);

      expect(mockMVTSource.featureSelected).not.toHaveBeenCalled();
      expect(mockMVTSource.featureDeselected).not.toHaveBeenCalled();
    });
  });
  describe('draw', () => {
    it('calls the draw function with expected non-style arguments', () => {
      const mVTFeature = new MVTFeature(mockOptions());
      const tile = mVTFeature.tiles[0];

      mVTFeature.draw(mockTileContext);

      expect(mockDrawFn).toHaveBeenCalledWith(
          mockTileContext,
          tile,
          expect.anything(), // style
          mVTFeature,
      );
    });
    it.each([
      {name: 'only feature is selected', featureSelected: false, styleSelected: true},
      {name: 'only style is selected', featureSelected: true, styleSelected: false},
      {name: 'neither feature nor style is selected', featureSelected: false, styleSelected: false},
    ])('When $name, calls the draw function with feature\'s style', ({featureSelected, styleSelected}) => {
      const mVTFeature = new MVTFeature({
        ...mockOptions(),
        selected: featureSelected,
        style: {...mockStyle, selected: styleSelected},
      });
      const featureStyle = mVTFeature.style;

      mVTFeature.draw(mockTileContext);

      expect(mockDrawFn).toHaveBeenCalledWith(expect.anything(), expect.anything(), featureStyle, expect.anything());
    });
    it('When feature and style are selected, calls the draw function with style\'s selected', () => {
      new MVTFeature({
        ...mockOptions(),
        selected: true,
        style: {...mockStyle, selected: true},
      }).draw(mockTileContext);

      expect(mockDrawFn).toHaveBeenCalledWith(expect.anything(), expect.anything(), true, expect.anything());
    });
  });
  describe('defaultDraw', () => {
    it.each([
      {name: 'Point', type: 1, delegatee: 'drawPoint'},
      {name: 'LineString', type: 2, delegatee: 'drawLineString'},
      {name: 'Polygon', type: 3, delegatee: 'drawPolygon'},
    ])('when called with type $type ($name), delegates to $delegatee', ({type, delegatee}) => {
      const mVTFeature = new MVTFeature({
        ...mockOptions(),
        vectorTileFeature: {...mockVectorTileFeature, type},
      });
      mVTFeature.drawPoint = jest.fn();
      mVTFeature.drawLineString = jest.fn();
      mVTFeature.drawPolygon = jest.fn();
      const mockTile = 'foo';
      jest.clearAllMocks();

      mVTFeature.defaultDraw(mockTileContext, mockTile, mockStyle);

      expect(mVTFeature[delegatee]).toHaveBeenCalledWith(mockTileContext, mockTile, mockStyle);
    });
  });
  describe('drawPoint', () => {
    it('calls the 2D canvas context functions as expected', () => {
      new MVTFeature(mockOptions())
          .drawPoint(mockTileContext, mockTile, mockStyle);

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext().beginPath).toHaveBeenCalled();
      expect(mockContext().closePath).toHaveBeenCalled();
      expect(mockContext().fill).toHaveBeenCalled();
      expect(mockContext().stroke).toHaveBeenCalled();
      expect(mockContext().arc).toHaveBeenCalledWith(0.0625, 0.125, mockStyle.radius, 0, Math.PI * 2);
    });
    it('calls the 2D canvas context with a radius of 3 by default', () => {
      new MVTFeature(mockOptions())
          .drawPoint(mockTileContext, mockTile, {...mockStyle, radius: undefined});

      expect(mockContext().arc).toHaveBeenCalledWith(
          expect.anything(), expect.anything(), 3, expect.anything(), expect.anything(),
      );
    });
  });
  describe('drawLineString', () => {
    let mVTFeature;
    beforeEach(() => {
      mVTFeature = new MVTFeature(mockOptions());
      mVTFeature.drawCoordinates = jest.fn();
      jest.clearAllMocks();

      mVTFeature.drawLineString(mockTileContext, mockTile, mockStyle);
    });
    it('calls this.drawCoordinates with expected arguments', () => {
      expect(mVTFeature.drawCoordinates).toHaveBeenCalledWith(mockTileContext, mockTile);
    });
    it('calls the 2D canvas context functions as expected', () => {
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext().stroke).toHaveBeenCalledWith(mockTile.paths2d);
    });
  });
  describe('drawPolygon', () => {
    let mVTFeature;
    beforeEach(() => {
      mVTFeature = new MVTFeature(mockOptions());
      mVTFeature.drawCoordinates = jest.fn();
      jest.clearAllMocks();
    });
    it('calls this.drawCoordinates with expected arguments', () => {
      mVTFeature.drawPolygon(mockTileContext, mockTile, mockStyle);

      expect(mVTFeature.drawCoordinates).toHaveBeenCalledWith(mockTileContext, mockTile);
    });
    it('calls closePath on the tile\'s paths2d', () => {
      mVTFeature.drawPolygon(mockTileContext, mockTile, mockStyle);

      expect(mockTile.paths2d.closePath).toHaveBeenCalled();
    });
    const testConditions = [
      {fnName: 'fill', propName: 'fillStyle'},
      {fnName: 'stroke', propName: 'strokeStyle'},
    ];
    it.each(testConditions)('calls $fnName if style.$propName is true', ({fnName, propName}) => {
      mVTFeature.drawPolygon(mockTileContext, mockTile, {...mockStyle, [propName]: true});

      expect(mockContext()[fnName]).toHaveBeenCalledWith(mockTile.paths2d);
    });
    it.each(testConditions)('doesn\'t call $fnName if style.$propName is false', ({fnName, propName}) => {
      mVTFeature.drawPolygon(mockTileContext, mockTile, {...mockStyle, [propName]: false});

      expect(mockContext()[fnName]).not.toHaveBeenCalled();
    });
  });
  describe('drawCoordinates', () => {
    let tileCopy;
    beforeEach(() => {
      // Necessary because drawCoordinates mutates the tile.
      tileCopy = {...mockTile};
      const mVTFeature = new MVTFeature(mockOptions());
      jest.clearAllMocks();

      mVTFeature.drawCoordinates(mockTileContext, tileCopy);
    });
    it('calls Path2D.moveTo with the point from first coordinates of each set', () => {
      expect(mockMoveTo).toHaveBeenNthCalledWith(1, 0.0625, 0.125);
      expect(mockMoveTo).toHaveBeenNthCalledWith(2, -0.125, 0.1875);
    });
    it('calls Path2D.lineTo with points from other coordinates of each set', () => {
      // First coordinate set.
      expect(mockLineTo).toHaveBeenNthCalledWith(1, 0.125, 0.0625);
      // Second coordinate set.
      expect(mockLineTo).toHaveBeenNthCalledWith(2, 0, 0.1875);
      expect(mockLineTo).toHaveBeenNthCalledWith(3, 0.1875, 0.1875);
    });
    it('calls Path2D.addPath with the created Path2D', () => {
      expect(mockAddPath).toHaveBeenCalledWith(expect.any(Path2D));
    });
    it('replaces the tile\'s Path2D with a new one', () => {
      expect(mockTile.paths2d).not.toBe(tileCopy.paths2d);
    });
  });
  describe('getPaths', () => {
    it('returns expected array', () => {
      const result = new MVTFeature(mockOptions()).getPaths(mockTileContext);

      expect(result).toStrictEqual([
        [
          {x: 0.0625, y: 0.125}, {x: 0.125, y: 0.0625},
        ],
        [
          {x: -0.125, y: 0.1875}, {x: 0, y: 0.1875}, {x: 0.1875, y: 0.1875},
        ],
      ]);
    });
  });
  describe('getContext2d', () => {
    it('retrieves the 2D context from the canvas', () => {
      const mVTFeature = new MVTFeature(mockOptions());

      mVTFeature.getContext2d(mockCanvas, mockStyle);

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });
    it('returns an object with expected properties copied from style', () => {
      const mVTFeature = new MVTFeature(mockOptions());
      const testStyleProps = {fooProp: 'foo', barProp: 'bar'};

      const result = mVTFeature.getContext2d(mockCanvas, {...mockStyle, ...testStyleProps});

      expect(result).toStrictEqual(expect.objectContaining(testStyleProps));
    });
    it('does not copy `selected` from style to return value', () => {
      const mVTFeature = new MVTFeature(mockOptions());

      const result = mVTFeature.getContext2d(mockCanvas, {...mockStyle, selected: 'baz'});
      expect(result.selected).not.toBe('baz');
    });
  });
  describe('getPoint', () => {
    it('returns expected value', () => {
      const testCoords = {x: 97, y: 15};
      const result = new MVTFeature(mockOptions()).getPoint(
          testCoords,
          {...mockTileContext, id: 2, parentId: 1},
          4,
      );

      expect(result).toStrictEqual({x: 93, y: 7});
    });
  });
});
