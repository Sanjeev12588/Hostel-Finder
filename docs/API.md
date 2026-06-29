# 🗺️ API & Services Integration Reference

This document outlines the API endpoints, Server Actions parameters, and external service contracts utilized by **Hostel Finder (Nomad Cribs)**.

---

## 🛠️ Internal Server Actions (`src/lib/actions.ts`)

Next.js Server Actions process incoming form submissions from client views:

### 1. `postHostelAction`
Creates a new hostel advertisement listing.
* **Input Parameters:** `FormData` containing listing attributes.
* **Returns:** `{ success: boolean; message: string; newAdId?: string }`

### 2. `postRoommateAction`
Creates a new roommate listing.
* **Input Parameters:** `FormData` containing roommate preferences and descriptions.
* **Returns:** `{ success: boolean; message: string; newAdId?: string }`

### 3. `toggleFavorite`
Saves or removes a bookmark reference.
* **Input Parameters:** `(userId: string, itemId: string, itemType: 'hostel' | 'room')`
* **Returns:** `Promise<void>` (triggers path revalidation)

### 4. `addReview`
Submits star rating feedback.
* **Input Parameters:** `(itemId: string, itemType: 'hostel' | 'room', rating: number, comment: string, userId: string)`
* **Returns:** `Promise<void>`

---

## 🔌 External Web APIs

### 1. Indian Postal Pincode Directory
Automatically matches district, city, and state parameters.
* **Endpoint:** `GET https://api.postalpincode.in/pincode/${code}`
* **Response Example:**
```json
[
  {
    "Message": "Number of pincodes found: 1",
    "Status": "Success",
    "PostOffice": [
      {
        "Name": "Vimanapura",
        "District": "Bengaluru",
        "State": "Karnataka",
        "Block": "Bengaluru East"
      }
    ]
  }
]
```

### 2. Google Maps Geocoding API
Retrieves coordinate locations of typed addresses.
* **Endpoint:** `GET https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`

### 3. Google Maps Reverse Geocoding API
Translates latitude/longitude values back into location strings.
* **Endpoint:** `GET https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
