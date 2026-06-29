# 🔒 Security and Form Validation Architecture

This document describes the security protocols, sanitization processes, and form verification models implemented inside **Hostel Finder (Nomad Cribs)**.

---

## 🛡️ Authentication & Authorization Rules
* **Authentication Constraints:** All critical screens (Add Ad, Post Roommate, Favorites, Profile, Raise Complaint) are protected routes. If a session is missing from `useAuth()`, the app redirects to the Login/Register module.
* **Credentials Isolation:** All server-side requests (writing listings, delete actions) authenticate using the Firebase Admin SDK private key (`FIREBASE_PRIVATE_KEY`), ensuring client-side requests cannot bypass database access lists.

---

## 📑 Client & Server Form Validations

Every input form is guarded by schemas constructed with **Zod** to prevent parameter injection and formatting errors:

### 1. Roommate Matcher Schema (`zod`)
* Enforces string constraints with a minimum characters requirement to avoid blank/low-effort prompt inject inputs:
```typescript
const matcherSchema = z.object({
  criteria: z.string().min(20, 'Please describe your criteria in more detail (min 20 characters).'),
  listingDescription: z.string().min(20, 'Please provide a more detailed listing description (min 20 characters).'),
});
```

### 2. Advertisement Post Validator
* **Pincode Format:** Validated with pattern `[0-9]{6}` for standard Indian pincodes.
* **Phone Numbers:** Validated to match exactly 10 digits `[0-9]{10}` before routing.
* **Image Upload Constraints:**
  * Checks file arrays to enforce a maximum limit of **4 images** per post.
  * Measures image files against a maximum file size limit of **5MB** to prevent denial-of-service storage attempts.

---

## 🧯 Tool & Flow Firewalls
* **Genkit Prompts Sanitization:** Criteria prompts are fed to Gemini 2.0 Flash as parameterized variables within predefined prompts rather than direct string interpolation, rendering user inputs unable to override prompt instructions (Prompt Injection Mitigation).
* **Missing Environment Variables Fallbacks:** To avoid code execution errors during startup, missing database variables default to detailed console alerts and fallback gracefully to placeholders without throwing uncaught execution runtime exceptions.
