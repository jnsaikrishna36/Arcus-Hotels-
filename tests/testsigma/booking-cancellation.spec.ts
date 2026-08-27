/**
 * booking-cancellation.spec.ts
 *
 * End-to-end booking cancellation on Arcus Go: create a fresh one-night
 * booking (hotel-1 "The Lexington Grand", room r1-1 "Deluxe City View",
 * 2026-08-28 -> 2026-08-29), confirm it appears under My Bookings, dismiss
 * the cancel confirmation once ("Keep Booking"), then cancel it for real and
 * verify the booking flips to "Cancelled" and its Cancel action disappears.
 *
 * The booking reference number is generated server-side (mocks/handlers/hotels.ts),
 * so it is captured at confirmation time and matched against the My Bookings
 * list rather than hardcoded. My Bookings is reached via the navbar link
 * (client-side route change) instead of page.goto, since a hard navigation
 * would reset the mock API's in-memory booking store -- see elements/booking.ts
 * for how the most-recent booking row is targeted alongside the 2 fixed
 * seed bookings that are always present for this user.
 */
import { expect, getElementProp, runtime, step, test } from "@testsigma/code";
import {
  billingCity,
  billingStreet,
  billingZip,
  bookingRef,
  bookingStatus,
  bookRoomButton,
  cancelBookingButton,
  cancelModal,
  cancelModalConfirm,
  cancelModalKeep,
  confirmationTitle,
  continueToPayment,
  guestEmail,
  guestFirstName,
  guestLastName,
  guestPhone,
  hotelCard,
  loginEmail,
  loginPassword,
  loginSubmit,
  myBookingsNavLink,
  payNow,
  referenceNumber,
  testCardSuccess,
} from "./elements/booking.js";

test("cancel a confirmed one-night booking and see it marked cancelled", ({ page }) => {
  step("Log in with the demo account", () => {
    page.goto("http://localhost:3000/auth/login");
    loginEmail.fill("alex@demo.com");
    loginPassword.fill("Demo@1234");
    loginSubmit.click();
    expect(page).toContainURL("/dashboard");
  });

  step("Book a one-night stay to have something to cancel", () => {
    page.goto("http://localhost:3000/hotels/search?city=New%20York&checkIn=2026-08-28&checkOut=2026-08-29&guests=2");
    expect(hotelCard).toBeVisible();
    hotelCard.click();
    expect(page).toContainURL("/hotels/hotel-1");

    bookRoomButton.click();
    expect(page).toContainURL("/booking/review");

    guestFirstName.clear();
    guestFirstName.fill("Alex");
    guestLastName.clear();
    guestLastName.fill("Johnson");
    guestEmail.clear();
    guestEmail.fill("alex@demo.com");
    guestPhone.clear();
    guestPhone.fill("+1 (555) 867-5309");
    continueToPayment.click();
    expect(page).toContainURL("/booking/payment");

    testCardSuccess.click();
    billingStreet.fill("123 Main St");
    billingCity.fill("New York");
    billingZip.fill("10001");
    payNow.click();

    expect(page).toContainURL("/booking/confirmation", { timeout: 15000 });
    expect(confirmationTitle).toBeVisible();
    runtime.bookingReference = getElementProp(referenceNumber, { prop: "text" });
  });

  step("Confirm the new booking is listed under My Bookings", () => {
    // Navigate via the in-app nav link (client-side route change) rather
    // than page.goto -- a hard navigation would reload the app's JS bundle
    // and reset the mock API's in-memory booking store, wiping the booking
    // this test just created.
    myBookingsNavLink.click();
    expect(page).toContainURL("/dashboard/bookings");
    expect(bookingRef).toHaveText(runtime.bookingReference);
    expect(bookingStatus).toHaveText("Confirmed");
  });

  step("Open the cancel dialog but back out with Keep Booking", () => {
    cancelBookingButton.click();
    expect(cancelModal).toBeVisible();
    cancelModalKeep.click();
    expect(bookingStatus).toHaveText("Confirmed");
  });

  step("Cancel the booking for real", () => {
    cancelBookingButton.click();
    expect(cancelModal).toBeVisible();
    cancelModalConfirm.click();

    expect(bookingStatus).toHaveText("Cancelled", { timeout: 10000 });
  });
});
