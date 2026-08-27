/**
 * booking-one-night-payment-declined.spec.ts
 *
 * Negative scenario for the one-night hotel booking flow on Arcus Go: an
 * otherwise valid one-night booking (hotel-1 "The Lexington Grand", room
 * r1-1 "Deluxe City View", 2026-08-28 -> 2026-08-29) is blocked at payment
 * by a test card that always gets declined, so no confirmation/reference
 * number is issued.
 *
 * Card scenario and error copy come straight from mocks/handlers/payment.ts,
 * so the assertion is deterministic across runs.
 */
import { expect, step, test } from "@testsigma/code";
import {
  billingCity,
  billingStreet,
  billingZip,
  bookRoomButton,
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
  paymentError,
  testCardDeclined,
} from "./elements/booking.js";

test("declined test card blocks payment for a one-night stay", ({ page }) => {
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

  step("Fill guest details", () => {
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

  step("Pay with a card that always gets declined", () => {
    testCardDeclined.click();
    billingStreet.fill("123 Main St");
    billingCity.fill("New York");
    billingZip.fill("10001");
    payNow.click();

    expect(paymentError).toBeVisible({ timeout: 15000 });
    expect(paymentError).toHaveText("Your card was declined. Please try a different card.");
    expect(page).toContainURL("/booking/payment");
  });
});
