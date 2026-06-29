
'use client';

import { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Hostel } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

export default function MapView({ hostels }: { hostels: Hostel[] }) {
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Handle error or user denial. Default to Bengaluru.
          setCenter(BENGALURU_CENTER);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      setCenter(BENGALURU_CENTER);
    }
  }, []);

  if (!center) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Getting your location...</span>
        </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Map
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        center={center}
        zoom={13}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        className="h-full w-full"
      >
        {hostels.map((hostel) => (
          hostel.lat && hostel.lng && (
            <AdvancedMarker
              key={hostel.id}
              position={{ lat: hostel.lat, lng: hostel.lng }}
              onClick={() => setSelectedHostel(hostel)}
            >
              <Pin />
            </AdvancedMarker>
          )
        ))}

        {selectedHostel && (
          <InfoWindow
            position={{ lat: selectedHostel.lat!, lng: selectedHostel.lng! }}
            onCloseClick={() => setSelectedHostel(null)}
            pixelOffset={[0,-40]}
          >
            <div className="w-64 rounded-lg shadow-lg">
              <Image src={selectedHostel.image} alt={selectedHostel.name} width={256} height={128} className="w-full h-32 object-cover rounded-t-lg" data-ai-hint={selectedHostel.hint} />
              <div className="p-2 bg-card">
                  <h3 className="font-bold truncate text-card-foreground">{selectedHostel.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedHostel.location}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-md text-primary font-bold">₹{selectedHostel.price}<span className="text-xs font-normal text-muted-foreground">/month</span></p>
                    <Button asChild size="sm">
                      <Link href={`/hostels/${selectedHostel.id}`}>View</Link>
                    </Button>
                  </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
