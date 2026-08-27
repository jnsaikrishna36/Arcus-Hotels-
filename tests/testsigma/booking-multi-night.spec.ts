/**
 * booking-multi-night.spec.ts
 *
 * End-to-end multi-night hotel booking on Arcus Go: log in -> search results
 * -> hotel detail -> select a room -> guest details -> payment ->
 * confirmation, for a 3-night stay.
 *
 * Complements booking-one-night.spec.ts by exercising the nights > 1 price
 * math (base price = rate x nights, 12% taxes, flat $25 service fee) which
 * a single-night stay can't distinguish from a per-stay flat fee.
 *
 * Fixed test data (hotel-3 "Oceanfront Palms Resort", room r3-1 "Ocean View
 * Room" at $259/night) comes straight from mocks/data/hotels.ts, so the
 * booking and its price summary are deterministic across runs. Check-in
 * 2026-08-28 -> check-out 2026-08-31 is a 3-night stay:
 *   base  = $259 x 3   = $777
 *   taxes = round(777 * 0.12) = $93
 *   fees  = $25 (flat)
 *   total = $895
 */
import { expect, step, test } from "@testsigma/code";
import {
  basePrice,
  billingCity,
  billingStreet,
  billingZip,
  bookOceanViewRoomButton,
  bookingHotelSummary,
  confirmationCheckIn,
  confirmationCheckOut,
  confirmationHotel,
  confirmationTitle,
  continueToPayment,
  grandTotal,
  guestEmail,
  guestFirstName,
  guestLastName,
  guestPhone,
  hotelCardOceanfront,
  loginEmail,
  loginPassword,
  loginSubmit,
  payNow,
  referenceNumber,
  reviewCheckIn,
  reviewCheckOut,
  serviceFee,
  taxAmount,
  testCardSuccess,
} from "./elements/booking.js";

test("book a 3-night stay at Oceanfront Palms Resort with correct price math", ({ page }) => {
  step("Log in with the demo account", () => {
    page.goto("http://localhost:3000/auth/login");
    loginEmail.fill("alex@demo.com");
    loginPassword.fill("Demo@1234");
    loginSubmit.click();
    expect(page).toContainURL("/dashboard");
  });

  step("Search Miami for a 3-night stay and open the hotel", () => {
    page.goto("http://localhost:3000/hotels/search?city=Miami&checkIn=2026-08-28&checkOut=2026-08-31&guests=2");
    expect(hotelCardOceanfront).toBeVisible();
    hotelCardOceanfront.click();
    expect(page).toContainURL("/hotels/hotel-3");
  });

  step("Select the Ocean View Room", () => {
    expect(bookOceanViewRoomButton).toBeVisible();
    bookOceanViewRoomButton.click();
    expect(page).toContainURL("/booking/review");
  });

  step("Review shows 3 nights and the correct price breakdown", () => {
    expect(reviewCheckIn).toHaveText("28 Aug 2026");
    expect(reviewCheckOut).toHaveText("31 Aug 2026");
    expect(bookingHotelSummary).toContainText("3 nights");

    expect(basePrice).toHaveText("$777");
    expect(taxAmount).toHaveText("$93");
    expect(serviceFee).toHaveText("$25");
    expect(grandTotal).toHaveText("$895");
  });

  step("Fill guest details and continue to payment", () => {
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

    continueToPayment.click();
    expect(page).toContainURL("/booking/payment");
  });

  step("Pay with a test card", () => {
    testCardSuccess.click();
    billingStreet.fill("123 Main St");
    billingCity.fill("Miami");
    billingZip.fill("33139");
    payNow.click();
  });

  step("Booking is confirmed for the full 3-night stay", () => {
    // Payment processing + booking creation are mocked with ~3.2s of
    // simulated latency, so give this transition more room than the default.
    expect(page).toContainURL("/booking/confirmation", { timeout: 15000 });
    expect(confirmationTitle).toBeVisible();
    expect(referenceNumber).toBeVisible();
    expect(confirmationHotel).toContainText("Oceanfront Palms Resort");
    expect(confirmationCheckIn).toContainText("28 Aug 2026");
    expect(confirmationCheckOut).toContainText("31 Aug 2026");
  });
});
