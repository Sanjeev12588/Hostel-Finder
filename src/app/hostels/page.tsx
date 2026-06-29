
import AppLayout from '@/components/app-layout';
import { getHostels } from '@/lib/data';
import HostelsListClient from '@/components/hostels/hostels-list';

interface HostelsPageProps {
  searchParams?: {
    for?: string;
    location?: string;
  };
}
export default async function HostelsPage({ searchParams }: HostelsPageProps) {
  const allHostels = await getHostels();
  const forFilter = typeof searchParams?.for === 'string' ? searchParams.for.toLowerCase() : undefined;
  const locationFilter = typeof searchParams?.location === 'string' ? decodeURIComponent(searchParams.location).toLowerCase() : undefined;

  let filteredHostels = allHostels;
  
  if (locationFilter) {
    filteredHostels = filteredHostels.filter(hostel => 
        hostel.city?.toLowerCase().includes(locationFilter) || 
        hostel.location?.toLowerCase().includes(locationFilter)
    );
  }
  
  if (forFilter) {
    filteredHostels = filteredHostels.filter(hostel => hostel.type && hostel.type.toLowerCase().split(',').map(t=>t.trim()).includes(forFilter));
  }

  return (
    <AppLayout>
      <HostelsListClient initialHostels={filteredHostels} />
    </AppLayout>
  );
}
