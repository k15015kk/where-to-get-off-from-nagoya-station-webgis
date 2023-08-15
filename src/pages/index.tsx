import { LineLayer } from '@deck.gl/layers/typed';
import ComponentMap from '@/components/Map';

// Viewport settings
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  { sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781] }
];

export default function Home() {
  const layers = [
    new LineLayer({ id: 'line-layer', data })
  ]

  return (
    <>
      <div className='h-screen'>
        <ComponentMap viewState={INITIAL_VIEW_STATE} layers={layers} />
      </div>
    </>
  )
}
