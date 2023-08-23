import { GridCellLayer, GeoJsonLayer } from '@deck.gl/layers/typed';
import { load } from '@loaders.gl/core';
import { JSONLoader } from '@loaders.gl/json';
import { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react/typed';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// 地図の一番最初に表示する場所を設定
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 136.881637,
  latitude: 35.170694,
  zoom: 9,
  pitch: 0,
  bearing: 0
};

// 読み込みデータの定義
const files: FileData[] = [
  {
    id: 1,
    company: "JR東海",
    line_file: './geojson/jrtokai_aikan_line.geojson',
    station_file: './geojson/jrtokai_aikan_station_count.geojson',
    color: [246, 170, 0]
  },
  {
    id: 2,
    company: "名古屋鉄道",
    line_file: './geojson/meitetsu_line.geojson',
    station_file: './geojson/meitetsu_station_count.geojson',
    color: [255, 75, 0]
  },
  {
    id: 3,
    company: "近畿日本鉄道",
    line_file: './geojson/kintetsu_line.geojson',
    station_file: './geojson/kintetsu_station_count.geojson',
    color: [255, 241, 0]
  },
  {
    id: 4,
    company: "名古屋市交通局",
    line_file: './geojson/nagoya_subway_line.geojson',
    station_file: './geojson/nagoya_subway_station_count.geojson',
    color: [0, 90, 255]
  }
];

export default function Home() {

  // 変更ハンドラー
  function dataChangeHandler(select_value: string) {
    setLineData({});
    setStationData({});
    const file_data = files.find(element => element.company == select_value);
    setSelected(file_data ?? files[0]); 
  }

  // State
  const [lineData, setLineData] = useState<object>();
  const [stationData, setStationData] = useState<object>();

  const [selected, setSelected] = useState<FileData>(files[0]);

  // Effect
  useEffect(() => {
    // 線形データを取得
    async function loadLineData() {
      const line = await load(
        selected.line_file,
        JSONLoader
      );

      setLineData(line);
    }

    // 駅データを取得
    async function loadStationData() {
      const station = await load(
        selected.station_file,
        JSONLoader
      );

      setStationData(station.features);
    }

    loadLineData();
    loadStationData();
  }, [selected]);

  // Layer
  const lineGeoJsonLayer = new GeoJsonLayer({
    id: "line-geojson-layer",
    data: lineData,
    stroked: true,
    fill: true,
    lineWidthScale: 100,
    lineWidthUnits: 'meters',
    lineWidthMinPixels: 2,
    getLineColor: selected.color,
    getLineWidth: 8,
  })

  const customerGridCellLayer = new GridCellLayer({
    id: 'customer-count-grid-cell-layer',
    data: stationData,
    cellSize: 500,
    extruded: true,
    pickable: true,
    elevationScale: 5,
    getPosition: d => d.geometry.coordinates,
    getElevation: d => d.properties.count,
    getFillColor: selected.color
  })

  return (
    <>
      <div className='h-screen'>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          layers={[customerGridCellLayer, lineGeoJsonLayer]}
          controller={true}
          style={{ position: 'relative', left: 'auto', top: 'auto' }}
          getTooltip={({ object }) => object && `${object.properties.N05_011}\n${object.properties.count}`}
        >
          <Map
            mapStyle={process.env.NEXT_PUBLIC_MAP_URL}
          >
          </Map>
          <select
            className='px-4 py-2 m-4 w-64 rounded shadow-md'
            onChange={e => dataChangeHandler(e.target.value)}
          >
            {files.map((file) => <option key={file.id} value={file.company}>{file.company}</option>)}
          </select>
        </DeckGL>
      </div>
    </>
  )
}
