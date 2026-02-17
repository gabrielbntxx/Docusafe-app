# Plan: Onboarding Questionnaire + Subscription Gate

## Overview
After registration + email verification, new users (planType=FREE) go through a multi-step interactive questionnaire that recommends the best plan. Users without a subscription can browse the app but can't perform any actions (upload, create folders, modify settings, use chatbot). Help/Support/Subscription pages remain accessible.

## Flow
```
Register → Verify Email → Login → Dashboard Layout checks:
  - planType=FREE + !onboardingCompleted → redirect /onboarding
  - planType=FREE + onboardingCompleted → restricted dashboard mode
  - planType!=FREE → full access
```

## Questionnaire Steps (Apple-style, animated transitions)

**Step 1: Welcome** - Logo animation, "Trouvons l'offre idéale pour vous", progress bar
**Step 2: Profile** - "Vous êtes..." → Étudiant / Professionnel / Entreprise (3 cards)
**Step 3: Volume** - "Combien de documents par mois ?" → Moins de 50 / 50-200 / Plus de 200
**Step 4: Priority** - "Qu'est-ce qui compte le plus ?" → Simplicité & prix / Puissance IA / Collaboration équipe
**Step 5: Result** - Animated recommendation card + "S'abonner" + "Explorer d'abord"

**Recommendation logic:**
- Étudiant → STUDENT
- Professionnel + <200 docs + simplicité → STUDENT (si 18-25) ou PRO
- Professionnel + puissance IA → PRO
- Entreprise ou collaboration → BUSINESS
- Professionnel + >200 docs → PRO ou BUSINESS

## Files to Create

### 1. `src/app/(auth)/onboarding/page.tsx`
Server component. Same layout as register/login pages (background blobs, logo). Renders `<OnboardingFlow />`.

### 2. `src/components/onboarding/onboarding-flow.tsx`
Client component with 5 steps. Manages state (currentStep, answers). Animated transitions between steps (slide + fade). Progress bar at top. Each step is a section within the component. Calls `POST /api/onboarding/complete` at the end. Redirects to Stripe link or `/dashboard`.

### 3. `src/app/api/onboarding/complete/route.ts`
POST endpoint. Receives `{ answers: { profile, volume, priority } }`. Sets `onboardingCompleted = true` on the user. Returns `{ success: true, recommendedPlan }`.

## Files to Modify

### 4. `prisma/schema.prisma`
Add to User model:
```prisma
onboardingCompleted Boolean @default(false)
```

### 5. `src/app/(dashboard)/layout.tsx`
After email verification check, add:
- Fetch `onboardingCompleted` and `planType`
- If `planType === "FREE" && !onboardingCompleted` → `redirect("/onboarding")`
- If `planType === "FREE"` → pass `isRestricted={true}` via a context provider wrapping children

### 6. `src/components/providers/subscription-provider.tsx` (NEW)
Simple context: `{ isRestricted: boolean, planType: string }`. Used by dashboard components to check access.

### 7. `src/lib/auth.ts`
Add `onboardingCompleted` to the session query select.

### 8. `src/types/next-auth.d.ts`
Add `onboardingCompleted?: boolean` to Session user.

### 9. `src/components/dashboard/sidebar.tsx`
- Import `useSubscription` context
- Upload button: if restricted → show lock overlay, redirect to `/dashboard/subscription` on click
- DocuBot link: if restricted → show lock icon, redirect to subscription
- Settings link: if restricted → show lock icon, redirect to subscription

### 10. `src/components/dashboard/bottom-nav.tsx`
- Center "+" button: if restricted → redirect to subscription page instead of upload

### 11. `src/components/dashboard/mobile-nav.tsx`
- DocuBot, Settings: if restricted → redirect to subscription
- Keep Help, Support, Subscription, Profile accessible

### 12. `src/app/api/webhooks/stripe/route.ts`
Fix `handleCheckoutCompleted` to detect plan type from `session.client_reference_id` or `session.metadata.planType` instead of hardcoding "PRO". Also set `onboardingCompleted: true`.

### 13. `src/components/subscription/subscription-client.tsx`
Update Stripe links to include `client_reference_id` param with plan type: `?client_reference_id=STUDENT&prefilled_email=...`

### 14. API route guards (upload, folders, settings, docubot)
Add quick check at start: if `planType === "FREE"` return 403.
- `src/app/api/documents/upload/route.ts`
- `src/app/api/folders/route.ts` (POST only)
- `src/app/api/settings/route.ts` (POST/PATCH only)
- `src/app/api/docubot/route.ts`

### 15. Database migration
Run SQL on Railway:
```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN DEFAULT false;
UPDATE "User" SET "onboardingCompleted" = true WHERE "planType" != 'FREE';
```

## Restricted Mode UI
- Floating banner at top of dashboard: "Abonnez-vous pour débloquer DocuSafe" with CTA button
- Upload button shows lock icon + tooltip
- Disabled actions show brief toast/redirect to subscription
- Subscription page always accessible (so user can subscribe)
