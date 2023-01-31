import {MVTLayer} from '@/MVTLayer.js';
import {MVTFeature} from '@/MVTFeature.js';
import {mockMVTSource, mockTileContext, mockVectorTileFeatures} from './common-mocks.js';

// TODO jest.mock does not seem to work at all like it does in Beyond Maps and I have
// no idea why. The MVTFeature class does _not_ get mocked by this line.
jest.mock('@/MVTFeature.js');

const mockStyle = jest.fn(() => 'style return');
const mockDrawFn = jest.fn();

const mockOptions = () =>{
  let nextId = 123;
  return {
    getIDForLayerFeature: jest.fn(() => nextId++),
    style: mockStyle,
    name: 'Mock Name',
    filter: jest.fn(() => true),
    customDraw: mockDrawFn,
  };
};

describe('MVTLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Constructor', () => {
    it('Sets style and name properties from options', () => {
      const options = mockOptions();
      const mVTLayer = new MVTLayer(options);

      expect(mVTLayer.style).toBe(options.style);
      expect(mVTLayer.name).toBe(options.name);
    });
  });
  describe('parseVectorTileFeatures', () => {
    describe('Constructing MVTFeature', () => {
      it('calls the MVTFeature constructor with expected options', () => {
        const mVTLayer = new MVTLayer(mockOptions());
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures.slice(0, 1), mockTileContext);

        // TODO this expect won't work until jest.mock() works.
        //     expect(MVTFeature).toHaveBeenCalledWith(expect.objectContaining({
        //       mVTSource: mockMVTSource,
        //       vectorTileFeature: mockVectorTileFeatures[0],
        //       tileContext: mockTileContext,
        //       style: mockStyle,
        //       selected: false, // from MVTSource.isFeatureSelected
        //       featureId: 123,
        //       customDraw: mockDrawFn,
        //     }));

        expect(mVTLayer._mVTFeatures[123]).toStrictEqual(expect.any(MVTFeature));
      });
      it('creates one MVTFeature per VectorTileFeature supplied', () => {
        const mVTLayer = new MVTLayer(mockOptions());
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);

        expect(mVTLayer._mVTFeatures[123]).toStrictEqual(expect.any(MVTFeature));
        expect(mVTLayer._mVTFeatures[124]).toStrictEqual(expect.any(MVTFeature));
        expect(mVTLayer._mVTFeatures[125]).toBeUndefined();
      });
      it('if the getIDForLayerFeature function returns nothing, autoincrements MVTFeature IDs', () => {
        const mVTLayer = new MVTLayer({...mockOptions(), getIDForLayerFeature: jest.fn()});
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);

        expect(mVTLayer._mVTFeatures[0]).toStrictEqual(expect.any(MVTFeature));
        expect(mVTLayer._mVTFeatures[1]).toStrictEqual(expect.any(MVTFeature));
        expect(mVTLayer._mVTFeatures[2]).toBeUndefined();
      });
      it('does not add a MVTFeature if filter returns false', () => {
        const mVTLayer = new MVTLayer({...mockOptions(), filter: jest.fn(() => false)});
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);

        expect(mVTLayer._mVTFeatures).toHaveLength(0);
      });
      it('calls MVTFeature.drawTile with tileContext', () => {
        const mVTLayer = new MVTLayer(mockOptions());
        mVTLayer.drawTile = jest.fn();

        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);

        expect(mVTLayer.drawTile).toHaveBeenCalledWith(mockTileContext);
      });
    });
    describe('drawTile', () => {
      let mVTLayer;
      let features;
      beforeEach(() => {
        mVTLayer = new MVTLayer(mockOptions());
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);
        features = mVTLayer._mVTFeatures;
        features.forEach((f) => f.draw = jest.fn());
        jest.clearAllMocks();
      });
      it('calls draw on each MVTFeature passing the tile context', () => {
        mVTLayer.drawTile(mockTileContext);

        features.forEach(({draw}) => expect(draw).toHaveBeenCalledWith(mockTileContext));
      });
      it('when only first feature is selected, calls draw on it last', () => {
        const [first, second] = features.slice(123, 125);
        first.selected = true;
        second.selected = false;

        mVTLayer.drawTile(mockTileContext);

        expect(second.draw.mock.invocationCallOrder[0])
            .toBeLessThan(first.draw.mock.invocationCallOrder[0]);
      });
      it('when only second feature is selected, calls draw on it last', () => {
        const [first, second] = features.slice(123, 125);
        first.selected = false;
        second.selected = true;

        mVTLayer.drawTile(mockTileContext);

        expect(first.draw.mock.invocationCallOrder[0])
            .toBeLessThan(second.draw.mock.invocationCallOrder[0]);
      });
    });
    describe('getStyle', () => {
      it('if MVTLayer\'s style is a function, call it on the passed-in feature', () => {
        const mockFeature = {};
        const result = new MVTLayer(mockOptions()).getStyle(mockFeature);

        expect(mockStyle).toHaveBeenCalledWith(mockFeature);
        expect(result).toBe('style return');
      });
      it('if MVTLayer\'s style is not a function, return it', () => {
        const result = new MVTLayer({...mockOptions(), style: 'not a function'}).getStyle({});

        expect(mockStyle).not.toHaveBeenCalled();
        expect(result).toBe('not a function');
      });
    });
    describe('setStyle', () => {
      let mVTLayer;
      beforeEach(() => {
        mVTLayer = new MVTLayer(mockOptions());
        mVTLayer.parseVectorTileFeatures(mockMVTSource, mockVectorTileFeatures, mockTileContext);
      });
      it('sets the MVTLayer\'s style property', () => {
        mVTLayer.setStyle('new style');

        expect(mVTLayer.style).toBe('new style');
      });
      it('calls setStyle on each feature', () => {
        mVTLayer._mVTFeatures.forEach((f) => f.setStyle = jest.fn());

        mVTLayer.setStyle('new style');

        mVTLayer._mVTFeatures.forEach(({setStyle}) => expect(setStyle).toHaveBeenCalledWith('new style'));
      });
    });
  });
});
