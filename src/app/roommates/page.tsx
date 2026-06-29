
import AppLayout from '@/components/app-layout';
import { getRooms } from '@/lib/data';
import RoommatesListClient from '@/components/roommates/roommates-list';

interface RoommatesPageProps {
  searchParams?: {
    for?: string;
    location?: string;
  };
}
export default async function RoommatesPage({ searchParams }: RoommatesPageProps) {
  const allRoommates = await getRooms();
  const forFilter = typeof searchParams?.for === 'string' ? searchParams.for.toLowerCase() : undefined;
  const locationFilter = typeof searchParams?.location === 'string' ? decodeURIComponent(searchParams.location).toLowerCase() : undefined;

  let filteredRoommates = allRoommates;
  
  if (locationFilter) {
      filteredRoommates = filteredRoommates.filter(room => 
          room.city?.toLowerCase().includes(locationFilter) ||
          room.location?.toLowerCase().includes(locationFilter)
      );
  }

  if (forFilter) {
    filteredRoommates = filteredRoommates.filter(room => {
        if (!room.type) return false;
        const roomTypes = room.type.toLowerCase().split(',').map(t => t.trim());
        return roomTypes.includes(forFilter);
      });
  }

  return (
    <AppLayout>
      <RoommatesListClient initialRoommates={filteredRoommates} />
    </AppLayout>
  );
}
