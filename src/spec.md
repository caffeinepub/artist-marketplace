# Specification

## Summary
**Goal:** Require artists to complete Stripe setup before creating items, with clear guidance to the Settings page.

**Planned changes:**
- Add a query hook to fetch the current user's Stripe configuration status
- Update CreateItemForm to check Stripe configuration before showing the item creation form
- Display a guidance message with a link to Settings when Stripe is not configured
- Hide or disable item creation form fields until Stripe setup is complete

**User-visible outcome:** Artists attempting to create items without Stripe configuration will see a clear message directing them to complete their profile in Settings first, ensuring all sellers have payment processing set up before listing items.
