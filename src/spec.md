# Specification

## Summary
**Goal:** Enable users to create artist profiles in settings, allowing them to post items and configure their own Stripe payment settings for receiving payments.

**Planned changes:**
- Add Settings navigation link in Header for authenticated users
- Create Settings page (/settings) with artist profile configuration
- Add isArtist field to User type in backend
- Create backend mutation to update user's artist status
- Move Stripe configuration from admin page to Settings page, scoped per artist
- Update backend to store Stripe configuration per user instead of platform-wide
- Update CreateItemForm to check artist status before allowing item creation
- Create React Query hooks for fetching and updating artist status

**User-visible outcome:** Users can enable artist mode in their profile settings, configure their own Stripe payment settings, and post items for sale. Non-artists see a prompt to enable artist mode when trying to create items.
