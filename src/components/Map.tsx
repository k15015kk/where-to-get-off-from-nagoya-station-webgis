import DeckGL from '@deck.gl/react/typed';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  viewState: MapViewState,
  layers: Array<Layer>
}

export default function ComponentMap({ viewState, layers }: Props) {
  return (
    <DeckGL
      initialViewState={viewState}
      layers={layers}
      controller={true}
      style={{position: 'relative', left: 'auto', top: 'auto'}}
    >
      <Map
        mapStyle={process.env.NEXT_PUBLIC_MAP_URL}
      >
      </Map>
    </DeckGL>
  )
}