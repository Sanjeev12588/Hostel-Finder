
'use client';

import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface SingleLocationMapProps {
  center: { lat: number; lng: number };
}

export default function SingleLocationMap({ center }: SingleLocationMapProps) {
  if (!center?.lat || !center?.lng) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Map not available for this location
      </div>
    );
  }

  return (
    <div className="h-48 w-full overflow-hidden rounded-lg">
      <Map
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        center={center}
        zoom={14}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="h-full w-full"
      >
        <AdvancedMarker position={center}>
          <Pin />
        </AdvancedMarker>
      </Map>
    </div>
  );
}

    