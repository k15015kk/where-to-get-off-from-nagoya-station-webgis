import { load } from '@loaders.gl/core';
import { JSONLoader } from '@loaders.gl/json';
import { useEffect, useState, useMemo } from 'react';
import { GridCellLayer, GeoJsonLayer } from '@deck.gl/layers/typed';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import Map, { NavigationControl, FullscreenControl, useControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// 地図の一番最初に表示する場所を設定
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 136.881637,
  latitude: 35.170694,
  zoom: 11,
  pitch: 60,
  bearing: 0
};

// 読み込みデータの定義
const files: FileData[] = [
  {
    id: 1,
    company: "JR東海",
    line_file: './geojson/jrtokai_aikan_line.geojson',
    station_file: './geojson/jrtokai_aikan_station_count.geojson',
  },
  {
    id: 2,
    company: "名古屋鉄道",
    line_file: './geojson/meitetsu_line.geojson',
    station_file: './geojson/meitetsu_station_count.geojson',
  },
  {
    id: 3,
    company: "近畿日本鉄道",
    line_file: './geojson/kintetsu_line.geojson',
    station_file: './geojson/kintetsu_station_count.geojson',
  },
  {
    id: 4,
    company: "名古屋市交通局",
    line_file: './geojson/nagoya_subway_line.geojson',
    station_file: './geojson/nagoya_subway_station_count.geojson',
  }
];

function DeckGLOverlay(props: MapboxOverlayProps & {
  interleaved?: boolean;
}) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

// RGBのRを決める関数
function calcRedColorNumber(ratio: number): number {
  if (ratio <= 0.25) {
    return 0;
  } else if (ratio <= 0.5) {
    const diff = ratio - 0.25;
    return Math.ceil(255 * diff * 4);
  } else {
    return 255;
  }
}

// RGBのGを決める関数
function calcGreenColorNumber(ratio: number): number {
  if (ratio <= 0.25) {
    return Math.ceil(255 * ratio * 4);
  } else if (ratio <= 0.5) {
    return 255;
  } else {
    const diff = 1.0 - ratio;
    return Math.ceil(255 * diff * 2);
  }
}

// RGBのBを決める関数
function calcBlueColorNumber(ratio: number): number {
  if (ratio <= 0.25) {
    return Math.ceil(255 - (255 * ratio * 4));
  } else {
    return 0
  }
}

export default function Home() {

  // 変更ハンドラー
  function dataChangeHandler(select_value: string) {
    setLineData({});
    setStationData([]);
    const file_data = files.find(element => element.company == select_value);
    setSelected(file_data ?? files[0]);
  }

  // Properties
  const maxCount = 5000;

  // State
  const [lineData, setLineData] = useState<object>();
  const [stationData, setStationData] = useState<any[]>([]);

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
    lineWidthScale: 40,
    lineWidthUnits: 'meters',
    lineWidthMinPixels: 2,
    getLineColor: [64, 64, 64, 255],
    getLineWidth: 8,
  });

  const customerGridCellLayer = new GridCellLayer({
    id: 'customer-count-grid-cell-layer',
    data: stationData,
    cellSize: 300,
    extruded: true,
    pickable: true,
    elevationScale: 4,
    getPosition: d => d.geometry.coordinates,
    getElevation: d => d.properties.count,
    getFillColor: (d => {
      return [
        calcRedColorNumber(d.properties.count / maxCount),
        calcGreenColorNumber(d.properties.count / maxCount),
        calcBlueColorNumber(d.properties.count / maxCount),
        255
      ]
    })
  });

  return (
    <>
      <div className='absolute w-full h-full'>
        <select
          className='relative px-4 py-2 mt-4 mb-1 mx-4 w-64 rounded shadow-md z-10'
          onChange={e => dataChangeHandler(e.target.value)}
        >
          {files.map((file) => <option key={file.id} value={file.company}>{file.company}</option>)}
        </select>
        <div className='relative z-10 mx-4 bg-white-opacity p-2 w-32 rounded'>
          <p className='relative text-black w-auto'>
            数値は人数
          </p>
          <div className='relative my-1 flex'>
            <div className='relative m-1 w-4 h-4 bg-graph-red border border-black'></div>
            <p className='relative m-1 leading-4'>5000以上</p>
          </div>
          <div className='relative my-1 flex'>
            <div className='relative m-1 w-4 h-4 bg-graph-orange border border-black'></div>
            <p className='relative m-1 leading-4'>3750</p>
          </div>
          <div className='relative my-1 flex'>
            <div className='relative m-1 w-4 h-4 bg-graph-yellow border border-black'></div>
            <p className='relative m-1 leading-4'>2500</p>
          </div>
          <div className='relative my-1 flex'>
            <div className='relative m-1 w-4 h-4 bg-graph-green border border-black'></div>
            <p className='relative m-1 leading-4'>1250</p>
          </div>
          <div className='relative my-1 flex'>
            <div className='relative m-1 w-4 h-4 bg-graph-blue border border-black'></div>
            <p className='relative m-1 leading-4'>0</p>
          </div>
        </div>
        <h1 className='absolute px-2 py-1 mx-4 bg-black text-white rounded opacity-40 right-0 bottom-8 w-auto z-10'>
          名古屋駅からどの駅で降りているのか？
        </h1>
      </div>
      <div className='absolute w-screen h-screen'>

        <Map
          mapStyle="https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json"
          initialViewState={INITIAL_VIEW_STATE}
          maplibreLogo
        >
          <DeckGLOverlay
            layers={[lineGeoJsonLayer, customerGridCellLayer]}
            getTooltip={({ object }) => object && `${object.properties.N05_011}\n${object.properties.count}`}
          />
          <NavigationControl />
          <FullscreenControl />
        </Map>
      </div>
    </>
  )
}
