import {MVTSource} from '@/MVTSource';
import {mockMap, mockCanvas, mockContext} from './common-mocks';
import {initialize, Size} from '@googlemaps/jest-mocks';
import {getTileFromString, getTileString} from '../lib/geometry';

initialize();

const mockMVTFeature = {
  featureId: 8,
};

const mockDrawFn = jest.fn();

const mockOptions = () => {
  let nextId = 0;
  return {
    url: '',
    sourceMaxZoom: 16,
    debug: false,
    getIDForLayerFeature: jest.fn(() => nextId++),
    visibleLayers: undefined,
    xhrHeaders: {},
    clickableLayers: undefined,
    filter: jest.fn(),
    cache: undefined,
    tileSize: 128,
    style: {},
    customDraw: mockDrawFn,
    selectedFeatures: undefined,
  };
};

describe('MVTSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Constructor', () => {
    it('sets MVTSource\'s map property', () => {
      const map = mockMap();
      const mVTSource = new MVTSource(map, mockOptions());

      expect(mVTSource.map).toBe(map);
    });
    it('sets expected properties from options', () => {
      const options = mockOptions();
      const mVTSource = new MVTSource(mockMap(), options);

      expect(mVTSource.getIDForLayerFeature).toBe(options.getIDForLayerFeature);
      expect(mVTSource.tileSize).toStrictEqual(expect.any(Size));
      expect(mVTSource.tileSize.width).toBe(options.tileSize);
      expect(mVTSource.tileSize.height).toBe(options.tileSize);
    });
    // TODO something for setSelectedFeatures
    it('registers a zoom_changed listener on the map', () => {
      const map = mockMap();
      new MVTSource(map, mockOptions());

      expect(map.addListener).toHaveBeenCalledWith('zoom_changed', expect.any(Function));
    });
  });
  describe('getTileString', () => {
    it('returns expected id', () => {
      const zoom = 10;
      const x = 18;
      const y = 28;
      expect(getTileString(zoom, x, y)).toBe('10:18:28');
    });
  });
  describe('getTileFromString', () => {
    it('returns expected object', () => {
      const id = '8:55:143';
      expect(getTileFromString(id)).toStrictEqual({
        zoom: 8,
        x: 55,
        y: 143,
      });
    });
  });
  describe('featureSelected', () => {
    it('if multiple selection is disabled, calls MVTSource.deselectAllFeatures', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource._multipleSelection = false;
      mVTSource.deselectAllFeatures = jest.fn();

      mVTSource.featureSelected(mockMVTFeature);

      expect(mVTSource.deselectAllFeatures).toHaveBeenCalled();
    });
    it('if multiple selection is enabled, does not call MVTSource.deselectAllFeatures', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource._multipleSelection = true;
      mVTSource.deselectAllFeatures = jest.fn();

      mVTSource.featureSelected(mockMVTFeature);

      expect(mVTSource.deselectAllFeatures).not.toHaveBeenCalled();
    });
    it('adds the passed-in feature as a selected feature', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.featureSelected(mockMVTFeature);

      expect(mVTSource._selectedFeatures[mockMVTFeature.featureId]).toBe(mockMVTFeature);
    });
  });
  describe('featureDeselected', () => {
    it('removes the passed-in feature from selected features', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.featureSelected(mockMVTFeature);
      jest.clearAllMocks();

      mVTSource.featureDeselected(mockMVTFeature);

      expect(mVTSource._selectedFeatures[mockMVTFeature.featureId]).toBeUndefined();
    });
  });
  describe('setSelectedFeatures', () => {
    const mockFeatureIds = [3, 4, 8];
    it('calls MVTSource.deselectAllFeatures', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.deselectAllFeatures = jest.fn();

      mVTSource.setSelectedFeatures(mockFeatureIds);

      expect(mVTSource.deselectAllFeatures).toHaveBeenCalled();
    });
    it('enables multiple selection if more than one feature passed in', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());

      mVTSource.setSelectedFeatures(mockFeatureIds);

      expect(mVTSource._multipleSelection).toBe(true);
    });
    it('sets the passed-in features\' ids to false in selected features', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());

      mVTSource.setSelectedFeatures(mockFeatureIds);

      expect(mVTSource._selectedFeatures[3]).toBe(false);
      expect(mVTSource._selectedFeatures[4]).toBe(false);
      expect(mVTSource._selectedFeatures[8]).toBe(false);
    });
  });
  describe('getSelectedFeatures', () => {
    it('returns expected non-sparse selected features array', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.setSelectedFeatures([9, 27, 101]); // sets entries to `false`

      expect(mVTSource.getSelectedFeatures()).toStrictEqual([false, false, false]);
    });
  });
  describe('getSelectedFeaturesInTile', () => {
    it('returns expected selected features', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      // Features at indices 1 and 3 have tiles at index 1.
      mVTSource._selectedFeatures = [
        // eslint-disable-next-line no-sparse-arrays
        {tiles: [,, true]}, {tiles: [, true, true]}, {tiles: [true]}, {tiles: [, true,,, true]},
      ];

      const result = mVTSource.getSelectedFeaturesInTile(1);

      expect(result).toStrictEqual([mVTSource._selectedFeatures[1], mVTSource._selectedFeatures[3]]);
    });
  });
  describe('setFilter', () => {
    const mockNewFilter = jest.fn();
    it('sets the filter for all MVTLayers in MVTSource.mVTLayers', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.mVTLayers = [
        {setFilter: jest.fn()},
        {setFilter: jest.fn()},
      ];

      mVTSource.setFilter(mockNewFilter, false);

      mVTSource.mVTLayers.forEach(({setFilter}) => expect(setFilter).toHaveBeenCalledWith(mockNewFilter));
    });
    it.each([
      {name: 'undefined', value: undefined},
      {name: 'truthy', value: 100},
    ])('calls MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setFilter(mockNewFilter, value);

      expect(mVTSource.redrawAllTiles).toHaveBeenCalled();
    });
    it.each([
      {name: 'null', value: null},
      {name: 'zero', value: 0},
    ])('does not call MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setFilter(mockNewFilter, value);

      expect(mVTSource.redrawAllTiles).not.toHaveBeenCalled();
    });
  });
  describe('setStyle', () => {
    const mockNewStyle = jest.fn();
    it('sets the MVTSource\'s style property', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());

      mVTSource.setStyle(mockNewStyle, false);

      expect(mVTSource.style).toBe(mockNewStyle);
    });
    it('sets the style for all MVTLayers in MVTSource.mVTLayers', () => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.mVTLayers = [
        {setStyle: jest.fn()},
        {setStyle: jest.fn()},
      ];

      mVTSource.setStyle(mockNewStyle, false);

      mVTSource.mVTLayers.forEach(({setStyle}) => expect(setStyle).toHaveBeenCalledWith(mockNewStyle));
    });
    it.each([
      {name: 'undefined', value: undefined},
      {name: 'truthy', value: 100},
    ])('calls MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setStyle(mockNewStyle, value);

      expect(mVTSource.redrawAllTiles).toHaveBeenCalled();
    });
    it.each([
      {name: 'null', value: null},
      {name: 'zero', value: 0},
    ])('does not call MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setStyle(mockNewStyle, value);

      expect(mVTSource.redrawAllTiles).not.toHaveBeenCalled();
    });
  });
  describe('setVisibleLayers', () => {
    it.each([
      {name: 'undefined', value: undefined},
      {name: 'truthy', value: 100},
    ])('calls MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setVisibleLayers('foo', value);

      expect(mVTSource.redrawAllTiles).toHaveBeenCalled();
    });
    it.each([
      {name: 'null', value: null},
      {name: 'zero', value: 0},
    ])('does not call MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setVisibleLayers('foo', value);

      expect(mVTSource.redrawAllTiles).not.toHaveBeenCalled();
    });
  });
  describe('clearTile', () => {
    it('retrieves the 2d canvas context', () => {
      new MVTSource(mockMap(), mockOptions()).clearTile(mockCanvas);

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });
    it('calls 2d context\'s clearRect with expected arguments', () => {
      new MVTSource(mockMap(), mockOptions()).clearTile(mockCanvas);

      expect(mockContext().clearRect).toHaveBeenCalledWith(0, 0, 512, 128);
    });
  });
  describe('setUrl', () => {
    it.each([
      {name: 'undefined', value: undefined},
      {name: 'truthy', value: 100},
    ])('calls MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setUrl('foo', value);

      expect(mVTSource.redrawAllTiles).toHaveBeenCalled();
    });
    it.each([
      {name: 'null', value: null},
      {name: 'zero', value: 0},
    ])('does not call MVTSource.redrawAllTiles if redraw tiles is $name', ({value}) => {
      const mVTSource = new MVTSource(mockMap(), mockOptions());
      mVTSource.redrawAllTiles = jest.fn();

      mVTSource.setUrl('foo', value);

      expect(mVTSource.redrawAllTiles).not.toHaveBeenCalled();
    });
  });
});
