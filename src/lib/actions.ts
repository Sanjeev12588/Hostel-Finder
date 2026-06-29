
'use server';

import { revalidatePath } from 'next/cache';
import type { Hostel, Room, User, Complaint, Feedback, Review } from './definitions';
import { 
    addReview as addReviewFirebase,
    deleteAd as deleteAdFirebase,
    addComplaint as addComplaintFirebase,
    addFeedback as addFeedbackFirebase,
    addUserProfile as addUserProfileFirebase,
    getFavoritesForClient as getFavoritesForClientFirebase,
    getFavoriteIdsForClient,
    getMyAdsForClient as getMyAdsForClientFirebase,
    getUser as getUserFirebase,
    postHostelAction as postHostelActionFirebase,
    postRoommateAction as postRoommateActionFirebase,
    toggleFavorite as toggleFavoriteFirebase,
    updateUserAction as updateUserActionFirebase,
    updateUser as updateUserFirebase,
    getHostelsByIds as getHostelsByIdsFirebase,
} from './firebase-actions';

// This file acts as a pass-through for server actions.
// Client components import from this file, which is safe.
// This file then calls the actual implementation in firebase-actions.ts,
// which contains the server-only code and is never imported by the client.

export async function updateUser(user: User) {
    return updateUserFirebase(user);
}

export async function updateUserAction(userId: string, formData: FormData) {
    await updateUserActionFirebase(userId, formData);
    revalidatePath('/profile');
    revalidatePath('/profile/edit');
}

export async function getUser(id:string): Promise<User | null> {
    return getUserFirebase(id);
}

export async function deleteAd(id: string, type: 'Hostel' | 'Room') {
    await deleteAdFirebase(id, type);
    revalidatePath('/my-ads');
}

export async function addComplaint(complaint: Omit<Complaint, 'id'| 'createdAt'>) {
    await addComplaintFirebase(complaint);
}

export async function addFeedback(fb: Omit<Feedback, 'id' | 'createdAt'>) {
    await addFeedbackFirebase(fb);
}

export async function addUserProfile(user: User) {
    await addUserProfileFirebase(user);
}

export async function getMyAdsForClient(userId: string) {
    const ads = await getMyAdsForClientFirebase(userId);
    // Re-serialize the data after fetching
    return ads.map(ad => ({
        ...ad,
        createdAt: ad.createdAt.toDate().toISOString(),
    }));
}

export async function addReview(itemId: string, itemType: 'hostel' | 'room', rating: number, comment: string, userId: string) {
    await addReviewFirebase(itemId, itemType, rating, comment, userId);
    revalidatePath(`/hostels/${itemId}`);
    revalidatePath(`/roommates/${itemId}`);
    revalidatePath('/hostels');
    revalidatePath('/roommates');
}

export async function toggleFavorite(userId: string, itemId: string, itemType: 'hostel' | 'room') {
    await toggleFavoriteFirebase(userId, itemId, itemType);
    revalidatePath('/favorites');
    revalidatePath('/hostels');
    revalidatePath('/roommates');
}

export async function getFavoritesForClient(userId: string) {
    const favorites = await getFavoritesForClientFirebase(userId);
    // Re-serialize the data after fetching
    return favorites.map(fav => ({
      ...fav,
      createdAt: fav.createdAt.toDate().toISOString(),
    }));
}

export { getFavoriteIdsForClient };

export async function postHostelAction(formData: FormData): Promise<{ success: boolean; message: string; newAdId: string | undefined; }> {
    return postHostelActionFirebase(formData);
}

export async function postRoommateAction(formData: FormData): Promise<{ success: boolean; message: string; newAdId: string | undefined; }> {
    return postRoommateActionFirebase(formData);
}

export async function getHostelsByIds(ids: string[]): Promise<Hostel[]> {
    const hostels = await getHostelsByIdsFirebase(ids);
     return hostels.map(hostel => ({
        ...hostel,
        createdAt: hostel.createdAt.toDate().toISOString(),
    }));
}
