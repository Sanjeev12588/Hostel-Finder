
import AppLayout from '@/components/app-layout';
import HomeClient from '@/components/home/home-client';
import { cookies } from 'next/headers';
import { initAdmin } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export default async function HomePage() {
  // This is now a Server Component. We are not performing any user-specific
  // or admin checks here anymore, simplifying the component.

  return (
    <AppLayout>
      {/* HomeClient will contain all the 'use client' logic */}
      <HomeClient />
    </AppLayout>
  );
}
