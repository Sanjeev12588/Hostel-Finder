'use client';

import { APIProvider } from '@vis.gl/react-google-maps';

export default function MapProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    // This will prevent the app from crashing in a cryptic way if the key is missing.
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p className="p-4 text-center text-red-500">
                Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
            </p>
        </div>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      {children}
    </APIProvider>
  );
}
