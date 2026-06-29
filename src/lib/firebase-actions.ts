
'use server';

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initAdmin } from './firebase-admin';
import type { Hostel, Room, User, Complaint, Feedback, Review } from './definitions';
import * as admin from 'firebase-admin';

// This file contains the actual server-side logic using firebase-admin.
// It is only ever imported by actions.ts and never by a client component.

async function getDb() {
  const app = await initAdmin();
  return getFirestore(app);
}

async function getCoordinates(locationString: string): Promise<{ lat?: number; lng?: number }> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !locationString) {
        console.warn("Geocoding skipped: API key or location string is missing.");
        return {};
    }

    try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationString)}&key=${apiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } else {
            console.warn(`Geocoding failed for address: ${locationString}. Status: ${data.status}. Error: ${data.error_message}`);
            return {};
        }
    } catch (error) {
        console.error("Error during geocoding: ", error);
        return {};
    }
}


async function uploadImages(images: File[]): Promise<string[]> {
    if (!images || images.length === 0 || images.every(f => f.size === 0)) {
        return ["https://placehold.co/600x400.png"];
    }

    const app = await initAdmin();
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error("Firebase Storage bucket name is not configured in environment variables.");
        throw new Error('Firebase Storage bucket name is not configured.');
    }
    
    const bucket = app.storage().bucket(bucketName);
    const imageUrls: string[] = [];

    for (const image of images) {
        if (image.size === 0) continue;
        
        const fileId = admin.firestore().collection('images').doc().id;
        const fileName = `images/${fileId}-${image.name}`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
            metadata: {
                contentType: image.type,
                cacheControl: 'public, max-age=31536000',
            },
        });

        await new Promise(async (resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', resolve);
            stream.end(Buffer.from(await image.arrayBuffer()));
        });

        await file.makePublic();
        imageUrls.push(file.publicUrl());
    }
    
    return imageUrls.length > 0 ? imageUrls : ["https://placehold.co/600x400.png"];
}

export async function updateUser(user: User) {
  const db = await getDb();
  const { id, ...userData } = user;
  await db.collection('users').doc(id).set(userData, { merge: true });
  return user;
}

export async function updateUserAction(userId: string, formData: FormData) {
  const db = await getDb();
  
  const name = formData.get('fullName')?.toString();
  const email = formData.get('email')?.toString();
  const phone = formData.get('phone')?.toString() || '';
  
  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  const dataToUpdate: {name: string, email: string, phone: string, avatar?: string} = {
    name,
    email,
    phone,
  };

  const avatarFile = formData.get('avatarFile') as File;
  if (avatarFile && avatarFile.size > 0) {
    const imageUrls = await uploadImages([avatarFile]);
    if (imageUrls && imageUrls.length > 0) {
      dataToUpdate.avatar = imageUrls[0];
    }
  }

  await db.collection('users').doc(userId).update(dataToUpdate);
}

export async function getUser(id:string): Promise<User | null> {
  try {
    const db = await getDb();
    const docRef = db.collection('users').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }
    const userData = docSnap.data();
    if (!userData) {
      return null;
    }
    return {id: docSnap.id, ...userData} as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function deleteAd(id: string, type: 'Hostel' | 'Room') {
  const db = await getDb();
  if (type === 'Hostel') {
    await db.collection('hostels').doc(id).delete();
  } else {
    await db.collection('rooms').doc(id).delete();
  }
}

export async function addComplaint(complaint: Omit<Complaint, 'id'| 'createdAt'>) {
  const db = await getDb();
  const newComplaint = {
    ...complaint,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection('complaints').add(newComplaint);
}

export async function addFeedback(fb: Omit<Feedback, 'id' | 'createdAt'>) {
  const db = await getDb();
  const newFeedback = {
    ...fb,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection('feedbacks').add(newFeedback);
}

export async function addUserProfile(user: User) {
    const db = await getDb();
    const { id, ...userData } = user;
    await db.collection('users').doc(id).set(userData, { merge: true });
}

type AdForMyAds = {
  id: string;
  name: string;
  image: string;
  hint: string;
  adType: 'Hostel' | 'Room';
  createdAt: Timestamp;
}

export async function getMyAdsForClient(userId: string) {
    const db = await getDb();
    
    const hostelsQuery = db.collection('hostels').where('userId', '==', userId);
    const roomsQuery = db.collection('rooms').where('userId', '==', userId);

    const [hostelsSnapshot, roomsSnapshot] = await Promise.all([
        hostelsQuery.get(),
        roomsQuery.get()
    ]);

    const userHostels: AdForMyAds[] = hostelsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            name: data.name,
            image: data.image,
            hint: data.hint,
            adType: 'Hostel' as const, 
            createdAt: data.createdAt as Timestamp 
        };
    });
    const userRooms: AdForMyAds[] = roomsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            name: data.name,
            image: data.image,
            hint: data.hint,
            adType: 'Room' as const, 
            createdAt: data.createdAt as Timestamp
        };
    });

    const allAds = [...userHostels, ...userRooms];
    allAds.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    return allAds;
};

export async function addReview(itemId: string, itemType: 'hostel' | 'room', rating: number, comment: string, userId: string) {
    const db = await getDb();
    const user = await getUser(userId);

    if (!user) {
        throw new Error('User performing review not found.');
    }

    const newReview = {
        itemId,
        itemType,
        rating,
        comment,
        userId,
        user: {
            name: user.name,
            avatar: user.avatar,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('reviews').add(newReview);

    const reviewsSnapshot = await db.collection('reviews').where('itemId', '==', itemId).get();
    const ratings = reviewsSnapshot.docs.map(doc => doc.data().rating as number);
    const averageRating = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;
    
    const collectionName = itemType === 'hostel' ? 'hostels' : 'rooms';
    await db.collection(collectionName).doc(itemId).update({
        rating: Math.round(averageRating * 10) / 10
    });
}

export async function toggleFavorite(userId: string, itemId: string, itemType: 'hostel' | 'room') {
  const db = await getDb();
  const favoritesCol = db.collection('favorites');
  const query = favoritesCol
    .where('userId', '==', userId)
    .where('itemId', '==', itemId);

  const snapshot = await query.get();

  if (snapshot.empty) {
    await favoritesCol.add({
      userId,
      itemId,
      itemType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    const docId = snapshot.docs[0].id;
    await favoritesCol.doc(docId).delete();
  }
}

export async function getFavoritesForClient(userId: string) {
    const db = await getDb();
    const favoritesSnapshot = await db.collection('favorites').where('userId', '==', userId).get();

    if (favoritesSnapshot.empty) {
        return [];
    }

    const sortedDocs = favoritesSnapshot.docs.sort((a, b) => {
        const dateA = (a.data().createdAt as Timestamp).toMillis();
        const dateB = (b.data().createdAt as Timestamp).toMillis();
        return dateB - dateA;
    });

    const favoriteItems = sortedDocs.map(doc => {
        const data = doc.data();
        return { 
            itemId: data.itemId as string, 
            itemType: data.itemType as 'hostel' | 'room', 
            createdAt: (data.createdAt || admin.firestore.Timestamp.now()) as Timestamp 
        };
    });


    const hostelIds = favoriteItems.filter(f => f.itemType === 'hostel').map(f => f.itemId);
    const roomIds = favoriteItems.filter(f => f.itemType === 'room').map(f => f.itemId);

    const hostels: (Hostel & { adType: 'Hostel', createdAt: Timestamp })[] = [];
    const rooms: (Room & { adType: 'Room', createdAt: Timestamp })[] = [];

    if (hostelIds.length > 0) {
        const hostelSnapshot = await db.collection('hostels').where(admin.firestore.FieldPath.documentId(), 'in', hostelIds).get();
        hostelSnapshot.docs.forEach(doc => {
            const data = doc.data();
            hostels.push({
                ...data,
                id: doc.id,
                createdAt: (data.createdAt || admin.firestore.Timestamp.now()) as Timestamp,
                adType: 'Hostel'
            } as Hostel & { adType: 'Hostel', createdAt: Timestamp });
        });
    }

    if (roomIds.length > 0) {
        const roomSnapshot = await db.collection('rooms').where(admin.firestore.FieldPath.documentId(), 'in', roomIds).get();
        roomSnapshot.docs.forEach(doc => {
            const data = doc.data();
            rooms.push({
                ...data,
                id: doc.id,
                createdAt: (data.createdAt || admin.firestore.Timestamp.now()) as Timestamp,
                adType: 'Room'
            } as Room & { adType: 'Room', createdAt: Timestamp });
        });
    }
    
    const combined = [...hostels, ...rooms];
    const ordered = favoriteItems.map(fav => {
        return combined.find(item => item.id === fav.itemId);
    }).filter((item): item is (Hostel & { adType: 'Hostel', createdAt: Timestamp }) | (Room & { adType: 'Room', createdAt: Timestamp }) => item !== undefined);

    return ordered;
}

export async function getFavoriteIdsForClient(userId: string): Promise<string[]> {
    const db = await getDb();
    const snapshot = await db.collection('favorites').where('userId', '==', userId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => doc.data().itemId as string);
}

export async function postHostelAction(formData: FormData): Promise<{ success: boolean; message: string; newAdId?: string }> {
  const db = await getDb();
  const images = formData.getAll('images') as File[];
  const validImages = images.filter(file => file && file.size > 0);

  const name = formData.get('hostel-name')?.toString();
  const forTypes = formData.getAll('for').map(v => v.toString().trim()).filter(Boolean);
  const rent = formData.get('rent')?.toString();
  const contact = formData.get('contact')?.toString();
  const ownerName = formData.get('owner-name')?.toString() || "Unknown Owner";
  const state = formData.get('state')?.toString();
  const district = formData.get('district')?.toString();
  const city = formData.get('city')?.toString();
  const pincode = formData.get('pincode')?.toString();
  const areaLandmark = formData.get('areaLandmark')?.toString();
  const facilityNames = formData.getAll('amenities').map(v => v.toString().trim()).filter(Boolean);
  const sharingTypeOptions = formData.getAll('sharingType').map(v => v.toString().trim()).filter(Boolean);
  const roomTypeOptions = formData.getAll('roomType').map(v => v.toString().trim()).filter(Boolean);
  const userId = formData.get('userId')?.toString();

  const customAmenity = formData.get('custom-amenity')?.toString();
  if (customAmenity) facilityNames.push(customAmenity);

  const customSharingType = formData.get('custom-sharing-type')?.toString();
  if (customSharingType) sharingTypeOptions.push(customSharingType);

  // validate minimum required fields
  if (!userId || !name || forTypes.length === 0 || !rent || !contact || !state || !district || !city || !pincode || !areaLandmark) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  if (validImages.length === 0) {
    return { success: false, message: 'Please upload at least one image.' };
  }

  try {
    const location = `${areaLandmark}, ${city}, ${district}, ${state} - ${pincode}`;
    const user = await getUser(userId);

    const imageUrls = await uploadImages(validImages);
    const coords = await getCoordinates(location);

    const newHostelData: any = {
      name,
      location,
      address: location,
      city,
      areaLandmark,
      price: rent,
      owner: { name: ownerName, avatar: user?.avatar || 'https://placehold.co/100x100.png' },
      description: formData.get('description')?.toString() || '',
      type: forTypes.join(','),
      hint: 'hostel interior',
      image: imageUrls[0],
      images: imageUrls,
      imageHints: ['hostel room'],
      facilities: facilityNames,
      sharingType: sharingTypeOptions,
      roomType: roomTypeOptions,
      userId,
      contact,
      rating: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // only add lat/lng if available
    if (coords.lat && coords.lng) {
      newHostelData.lat = coords.lat;
      newHostelData.lng = coords.lng;
    }

    const docRef = await db.collection('hostels').add(newHostelData);
    return { success: true, message: 'Hostel ad posted successfully!', newAdId: docRef.id };

  } catch (error: any) {
    console.error("Error posting ad: ", error);
    return { success: false, message: error.message || 'There was an error posting your ad. Please try again.' };
  }
}

export async function postRoommateAction(formData: FormData): Promise<{ success: boolean; message: string; newAdId?: string }> {
    const db = await getDb();
    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file && file.size > 0);

    const name = formData.get('your-name')?.toString();
    const userId = formData.get('userId')?.toString();
    const forTypes = formData.getAll('for').map(v => v.toString().trim()).filter(Boolean);
    const rent = formData.get('rent-range')?.toString();
    const contact = formData.get('contact')?.toString();
    const state = formData.get('state')?.toString();
    const district = formData.get('district')?.toString();
    const city = formData.get('city')?.toString();
    const pincode = formData.get('pincode')?.toString();
    const areaLandmark = formData.get('areaLandmark')?.toString();
    const sharerPrefs = formData.getAll('sharers').map(v => v.toString().trim()).filter(Boolean);
    const roomType = formData.getAll('room-type').map(v => v.toString().trim()).filter(Boolean);
    const description = formData.get('description')?.toString() || '';

    const customSharer = formData.get('custom-sharer')?.toString();
    if (customSharer) sharerPrefs.push(customSharer);

    if (!userId || !name || forTypes.length === 0 || !rent || !contact || !state || !district || !city || !pincode || !areaLandmark || roomType.length === 0) {
        return { success: false, message: 'Please fill in all required fields.' };
    }
    
    if (validImages.length === 0) {
        return { success: false, message: 'Please upload at least one image.' };
    }

    try {
        const location = `${areaLandmark}, ${city}, ${district}, ${state} - ${pincode}`;
        const imageUrls = await uploadImages(validImages);
        const coords = await getCoordinates(location);
        const user = await getUser(userId);
        
        const newRoomData: any = {
            name,
            age: 25, // Default value
            occupation: 'Student/Professional', // Default value
            rent,
            location,
            city,
            areaLandmark,
            about: description,
            shortBio: description.substring(0,100) + (description.length > 100 ? "..." : ""),
            type: forTypes.join(','),
            hint: 'person portrait',
            image: imageUrls[0],
            images: imageUrls,
            postedBy: { name: user?.name || name, avatar: user?.avatar || "https://placehold.co/100x100.png" },
            userId,
            contact,
            preferences: sharerPrefs,
            rating: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (coords.lat && coords.lng) {
          newRoomData.lat = coords.lat;
          newRoomData.lng = coords.lng;
        }

        const docRef = await db.collection('rooms').add(newRoomData);

        return { success: true, message: 'Room ad posted successfully!', newAdId: docRef.id };

    } catch (error: any) {
        console.error("Error posting ad: ", error);
        return { success: false, message: error.message || 'There was an error posting your ad. Please try again.' };
    }
}

export async function getHostelsByIds(ids: string[]): Promise<(Hostel & { createdAt: Timestamp })[]> {
    if (ids.length === 0) {
        return [];
    }
    const db = await getDb();
    const snapshot = await db.collection('hostels').where(admin.firestore.FieldPath.documentId(), 'in', ids).get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt as Timestamp
        } as Hostel & { createdAt: Timestamp };
    });
}

    