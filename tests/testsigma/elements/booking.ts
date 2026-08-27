import { element } from "@testsigma/code";

// Login (app/auth/login/page.tsx)
export const loginEmail = element({
  name: "Login email",
  locator: { csspath: "[data-testid='login-email']" },
});
export const loginPassword = element({
  name: "Login password",
  locator: { csspath: "[data-testid='login-password']" },
});
export const loginSubmit = element({
  name: "Login submit",
  locator: { csspath: "[data-testid='login-submit']" },
});
export const loginError = element({
  name: "Login error message",
  locator: { csspath: "[data-testid='error-message']" },
});

// Search results (app/hotels/search/page.tsx)
export const hotelCard = element({
  name: "Lexington Grand hotel card",
  locator: { csspath: "[data-testid='hotel-card-hotel-1']" },
});

// Hotel detail (app/hotels/[id]/page.tsx)
export const bookRoomButton = element({
  name: "Select Deluxe City View room",
  locator: { csspath: "[data-testid='book-room-r1-1']" },
});

// Booking review (app/booking/review/page.tsx)
export const reviewCheckIn = element({
  name: "Review check-in date",
  locator: { csspath: "[data-testid='review-checkin']" },
});
export const reviewCheckOut = element({
  name: "Review check-out date",
  locator: { csspath: "[data-testid='review-checkout']" },
});
export const guestFirstName = element({
  name: "Guest first name",
  locator: { csspath: "[data-testid='guest-firstname']" },
});
export const guestLastName = element({
  name: "Guest last name",
  locator: { csspath: "[data-testid='guest-lastname']" },
});
export const guestEmail = element({
  name: "Guest email",
  locator: { csspath: "[data-testid='guest-email']" },
});
export const guestPhone = element({
  name: "Guest phone",
  locator: { csspath: "[data-testid='guest-phone']" },
});
export const continueToPayment = element({
  name: "Continue to payment",
  locator: { csspath: "[data-testid='continue-to-payment']" },
});

// Payment (app/booking/payment/page.tsx)
export const testCardSuccess = element({
  name: "Fill test card (Success)",
  locator: { csspath: "[data-testid='test-card-success']" },
});
export const testCardDeclined = element({
  name: "Fill test card (Declined)",
  locator: { csspath: "[data-testid='test-card-declined']" },
});
export const paymentError = element({
  name: "Payment error message",
  locator: { csspath: "[data-testid='payment-error']" },
});
export const billingStreet = element({
  name: "Billing street",
  locator: { csspath: "[data-testid='billing-street']" },
});
export const billingCity = element({
  name: "Billing city",
  locator: { csspath: "[data-testid='billing-city']" },
});
export const billingZip = element({
  name: "Billing ZIP",
  locator: { csspath: "[data-testid='billing-zip']" },
});
export const payNow = element({
  name: "Pay now",
  locator: { csspath: "[data-testid='pay-now']" },
});

// Confirmation (app/booking/confirmation/[id]/page.tsx)
export const confirmationTitle = element({
  name: "Confirmation title",
  locator: { csspath: "[data-testid='confirmation-title']" },
});
export const referenceNumber = element({
  name: "Booking reference number",
  locator: { csspath: "[data-testid='reference-number']" },
});
export const confirmationHotel = element({
  name: "Confirmation hotel name",
  locator: { csspath: "[data-testid='confirmation-hotel']" },
});
export const confirmationCheckIn = element({
  name: "Confirmation check-in date",
  locator: { csspath: "[data-testid='confirmation-checkin']" },
});
export const confirmationCheckOut = element({
  name: "Confirmation check-out date",
  locator: { csspath: "[data-testid='confirmation-checkout']" },
});
