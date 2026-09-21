import type { BookingDto, ListingDto } from '../../types/api.types';

export interface ConversationTarget {
  userId: number;
  fullName: string;
}

// The /chat/conversations endpoint only ever returns each listing's owner,
// never the actual counterpart of a given conversation. That's fine when the
// current user is the renter (the owner IS the other party), but when the
// current user is the listing's owner, "owner" just means themselves.
// The only other signal available is bookings: fall back to the renter from
// the most recent booking on that listing. This can't distinguish two
// separate renters who both messaged about the same listing (the backend
// response has no per-conversation identity), but it fixes the common case
// of a single active booking/conversation per listing.
export function resolveConversationTarget(
  listing: ListingDto,
  currentUserId: number | undefined,
  incomingBookings: BookingDto[],
): ConversationTarget | undefined {
  if (listing.owner.id !== currentUserId) {
    return { userId: listing.owner.id, fullName: listing.owner.fullName };
  }

  const bookingsForListing = incomingBookings.filter((b) => b.listing.id === listing.id);
  if (bookingsForListing.length === 0) return undefined;

  const mostRecent = bookingsForListing.reduce((latest, b) =>
    new Date(b.createdAt) > new Date(latest.createdAt) ? b : latest,
  );
  return { userId: mostRecent.renter.id, fullName: mostRecent.renter.fullName };
}
