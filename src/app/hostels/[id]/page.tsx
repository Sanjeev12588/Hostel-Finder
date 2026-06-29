import AppLayout from '@/components/app-layout';
import { getHostel, getReviews } from '@/lib/data';
import HostelDetailClient from '@/components/hostels/hostel-detail-view';

export default async function HostelDetailPage({ params: { id } }: { params: { id: string } }) {
  const hostel = await getHostel(id);
  const reviews = await getReviews(id);

  if (!hostel) {
    return <AppLayout><div>Hostel not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <HostelDetailClient hostel={hostel} reviews={reviews} />
    </AppLayout>
  );
}
