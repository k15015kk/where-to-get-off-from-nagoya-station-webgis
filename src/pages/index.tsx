import { LineLayer, GeoJsonLayer, ColumnLayer } from '@deck.gl/layers/typed';
import ComponentMap from '@/components/Map';
import { load } from '@loaders.gl/core';
import { JSONLoader } from '@loaders.gl/json';
import { useEffect, useState } from 'react';

// Viewport settings
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 136.881637,
  latitude: 35.170694,
  zoom: 9,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  { sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781] }
];

export default function Home() {

  const [lineData, setLineData] = useState();
  const [stationData, setStationData] = useState();

  useEffect(() => {
    const loadLineData = async () => {
      const line = await load(
        './geojson/tokai_lines.geojson',
        JSONLoader
      );

      setLineData(line);
    }

    const loadStationData = async () => {
      const station = await load(
        './geojson/tokai_station_counts.geojson',
        JSONLoader
      );

      setStationData(station.features);
    }

    loadLineData()
    loadStationData()
  }, []);


  const lineGeoJsonLayer = new GeoJsonLayer({
    id: "line-geojson-layer",
    data: lineData,
    stroked: true,
    fill: true,
    lineWidthScale: 100,
    lineWidthUnits: 'meters',
    lineWidthMinPixels: 2,
    getLineColor: [237, 109, 0],
    getLineWidth: 8,
  })

  const columnLayer = new ColumnLayer({
    id: 'column-layer',
    data: stationData,
    diskResolution: 12,
    radius: 1000,
    extruded: true,
    pickable: true,
    radiusUnits: 'meters',
    elevationScale: 5,
    getPosition: d => d.geometry.coordinates[0],
    getFillColor: [237, 109, 0],
    getElevation: d => d.properties.count
  })

  const layers = [
    columnLayer,
    lineGeoJsonLayer
  ]

  return (
    <>
      <div className='h-screen'>
        <ComponentMap viewState={INITIAL_VIEW_STATE} layers={layers} />
      </div>
    </>
  )
}
