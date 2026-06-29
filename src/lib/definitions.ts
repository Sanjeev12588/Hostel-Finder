
// This file contains TypeScript type definitions for the app's data models.

export type Hostel = {
    id: string;
    name: string;
    image: string;
    hint: string;
    price: string;
    location: string;
    description: string;
    rating: number;
    images?: string[];
    imageHints?: string[];
    address?: string;
    facilities?: string[];
    sharingType?: string[];
    roomType?: string[];
    owner?: { name: string; avatar: string };
    type: string;
    userId: string;
    contact?: string;
    createdAt: string;
    city?: string;
    areaLandmark?: string;
    lat?: number;
    lng?: number;
    adType?: 'Hostel';
};

export type Room = {
    id: string;
    name: string;
    age: number;
    occupation: string;
    image: string;
    hint: string;
    rent: string;
    rating: number;
    location: string;
    shortBio: string;
    images?: string[];
    imageHints?: string[];
    about?: string;
    preferences?: string[];
    postedBy?: { name: string; avatar: string };
    type: string;
    userId: string;
    contact?: string;
    createdAt: string;
    city?: string;
    areaLandmark?: string;
    lat?: number;
    lng?: number;
    adType?: 'Room';
};

export type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
};

export type Complaint = {
    id: string;
    description: string;
    userId: string;
    createdAt: string;
};

export type Feedback = {
    id: string;
    hostelId?: string;
    rating: number;
    description:string;
    userId: string;
    createdAt: string;
};

export type Review = {
    id: string;
    itemId: string;
    itemType: 'hostel' | 'room';
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        avatar: string;
    };
};

export type Favorite = {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'hostel' | 'room';
  createdAt: string;
};
