
'use server';

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Hostel, Room, Review } from './definitions';
import { initAdmin } from './firebase-admin';
import * as admin from 'firebase-admin';

// This file is for server-side data fetching (for Server Components)

async function getDb() {
  const app = await initAdmin();
  return getFirestore(app);
}

const toISODate = (timestamp: Timestamp): string => timestamp.toDate().toISOString();

export const getHostels = async (): Promise<Hostel[]> => {
    const db = await getDb();
    const snapshot = await db.collection('hostels').get();
    if (snapshot.empty) {
        return [];
    }
    const hostels = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: toISODate(data.createdAt as Timestamp),
        } as Hostel;
    });
    // Sort by date descending
    hostels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return hostels;
};

export const getHostel = async (id: string): Promise<Hostel | null> => {
    const db = await getDb();
    const docRef = db.collection('hostels').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        return null;
    }
    
    const data = docSnap.data()!;
    return {
        ...data,
        id: docSnap.id,
        createdAt: toISODate(data.createdAt as Timestamp),
    } as Hostel;
};

export const getRooms = async (): Promise<Room[]> => {
    const db = await getDb();
    const snapshot = await db.collection('rooms').get();
     if (snapshot.empty) {
        return [];
    }
    const rooms = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: toISODate(data.createdAt as Timestamp),
        } as Room;
    });
    // Sort by date descending
    rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return rooms;
};

export const getRoom = async (id: string): Promise<Room | null> => {
    const db = await getDb();
    const docRef = db.collection('rooms').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        return null;
    }
    const data = docSnap.data()!;
    return {
        ...data,
        id: docSnap.id,
        createdAt: toISODate(data.createdAt as Timestamp),
    } as Room;
};

export const getReviews = async (itemId: string): Promise<Review[]> => {
    const db = await getDb();
    const snapshot = await db.collection('reviews')
        .where('itemId', '==', itemId)
        .get();

    if (snapshot.empty) {
        return [];
    }
    
    const reviews = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: toISODate(data.createdAt as Timestamp),
        } as Review;
    });

    // Sort reviews by date in descending order (newest first)
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return reviews;
};
