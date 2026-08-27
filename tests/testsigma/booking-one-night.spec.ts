/**
 * booking-one-night.spec.ts
 *
 * End-to-end one-night hotel booking on Arcus Go:
 * log in -> search results -> hotel detail -> select a room -> guest
 * details -> payment -> confirmation.
 *
 * Fixed test data (hotel-1 "The Lexington Grand", room r1-1 "Deluxe City
 * View") comes straight from mocks/data/hotels.ts, so the booking is
 * deterministic across runs. Check-in/check-out are one calendar day apart
 * (2026-08-28 -> 2026-08-29) for a single-night stay.
 */
import { expect, step, test } from "@testsigma/code";
import {
  billingCity,
  billingStreet,
  billingZip,
  bookRoomButton,
  confirmationCheckIn,
  confirmationCheckOut,
  confirmationHotel,
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
  payNow,
  referenceNumber,
  reviewCheckIn,
  reviewCheckOut,
  testCardSuccess,
} from "./elements/booking.js";

test("book a one-night stay at The Lexington Grand", ({ page }) => {
  step("Log in with the demo account", () => {
    page.goto("http://localhost:3000/auth/login");
    loginEmail.fill("alex@demo.com");
    loginPassword.fill("Demo@1234");
    loginSubmit.click();
    expect(page).toContainURL("/dashboard");
  });

  step("Search New York for a one-night stay and open the hotel", () => {
    page.goto("http://localhost:3000/hotels/search?city=New%20York&checkIn=2026-08-28&checkOut=2026-08-29&guests=2");
    expect(hotelCard).toBeVisible();
    hotelCard.click();
    expect(page).toContainURL("/hotels/hotel-1");
  });

  step("Select the Deluxe City View room", () => {
    expect(bookRoomButton).toBeVisible();
    bookRoomButton.click();
    expect(page).toContainURL("/booking/review");
  });

  step("Confirm the stay is one night and fill guest details", () => {
    expect(reviewCheckIn).toHaveText("28 Aug 2026");
    expect(reviewCheckOut).toHaveText("29 Aug 2026");

    // These fields arrive pre-filled from the logged-in user's profile, so
    // clear them first -- fill() types into the existing value rather than
    // replacing it.
    guestFirstName.clear();
    guestFirstName.fill("Alex");
    guestLastName.clear();
    guestLastName.fill("Johnson");
    guestEmail.clear();
    guestEmail.fill("alex@demo.com");
    guestPhone.clear();
    guestPhone.fill("+1 (555) 867-5309");
    expect(guestFirstName).toHaveValue("Alex");
    expect(guestLastName).toHaveValue("Johnson");
    expect(guestEmail).toHaveValue("alex@demo.com");
    expect(guestPhone).toHaveValue("+1 (555) 867-5309");

    continueToPayment.click();
    expect(page).toContainURL("/booking/payment");
  });

  step("Pay with a test card", () => {
    testCardSuccess.click();
    billingStreet.fill("123 Main St");
    billingCity.fill("New York");
    billingZip.fill("10001");
    payNow.click();
  });

  step("Booking is confirmed", () => {
    // Payment processing + booking creation are mocked with ~3.2s of
    // simulated latency, so give this transition more room than the default.
    expect(page).toContainURL("/booking/confirmation", { timeout: 15000 });
    expect(confirmationTitle).toBeVisible();
    expect(referenceNumber).toBeVisible();
    expect(confirmationHotel).toContainText("The Lexington Grand");
    expect(confirmationCheckIn).toContainText("28 Aug 2026");
    expect(confirmationCheckOut).toContainText("29 Aug 2026");
  });
});
