import { Wifi, Tv, Wind, Utensils, ParkingCircle, Video, Shirt } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const facilityIconMap: { [key: string]: LucideIcon } = {
    'WiFi': Wifi,
    'AC': Wind,
    'Food Included': Utensils,
    'Common TV': Tv,
    'Laundry': Shirt,
    'Parking': ParkingCircle,
    'CCTV': Video,
};

export const getFacilityIcon = (name: string): LucideIcon => {
    return facilityIconMap[name] || Utensils; // Default icon
};
