import AppLayout from '@/components/app-layout';
import { getRoom, getReviews } from '@/lib/data';
import RoommateDetailClient from '@/components/roommates/roommate-detail-view';

export default async function RoommateDetailPage({ params: { id } }: { params: { id: string } }) {
  const roommate = await getRoom(id);
  const reviews = await getReviews(id);

  if (!roommate) {
    return <AppLayout><div>Room not found</div></AppLayout>;
  }

  return (
    <AppLayout>
      <RoommateDetailClient roommate={roommate} reviews={reviews} />
    </AppLayout>
  );
}
