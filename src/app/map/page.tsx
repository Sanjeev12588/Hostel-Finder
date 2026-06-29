import AppLayout from '@/components/app-layout';
import MapView from '@/components/map/map-view';
import { getHostels } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

export default async function MapPage() {
  const hostels = await getHostels();

  return (
    <AppLayout>
      <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <MapView hostels={hostels} />
      </Suspense>
    </AppLayout>
  );
}
