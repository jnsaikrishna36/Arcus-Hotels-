/**
 * booking-guest-details-validation.spec.ts
 *
 * Negative scenario for the hotel booking flow on Arcus Go: the guest
 * details form on the review step (app/booking/review/page.tsx) blocks
 * "Continue to Payment" when required fields are missing, and separately
 * when the email fails its format check -- the booking never reaches
 * payment until the form is valid.
 *
 * Validation messages ("Required" / "Valid email required") are hardcoded
 * in the review page's client-side validate(), so the assertions are
 * deterministic across runs.
 */
import { expect, step, test } from "@testsigma/code";
import {
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
} from "./elements/booking.js";

test("empty guest details block continuing to payment until fixed", ({ page }) => {
  step("Log in and reach the booking review step", () => {
    page.goto("http://localhost:3000/auth/login");
    loginEmail.fill("alex@demo.com");
    loginPassword.fill("Demo@1234");
    loginSubmit.click();
    expect(page).toContainURL("/dashboard");

    page.goto("http://localhost:3000/hotels/search?city=New%20York&checkIn=2026-08-28&checkOut=2026-08-29&guests=2");
    expect(hotelCard).toBeVisible();
    hotelCard.click();
    expect(page).toContainURL("/hotels/hotel-1");

    bookRoomButton.click();
    expect(page).toContainURL("/booking/review");
  });

  step("Clear every guest field and try to continue", () => {
    // These fields arrive pre-filled from the logged-in user's profile, so
    // clear them first -- fill() types into the existing value rather than
    // replacing it.
    guestFirstName.clear();
    guestLastName.clear();
    guestEmail.clear();
    guestPhone.clear();

    continueToPayment.click();

    // Validation fails client-side, so the page never navigates away.
    expect(page).toContainURL("/booking/review");
    expect(page).toContainText("Required");
    expect(page).toContainText("Valid email required");
  });

  step("An improperly formatted email is rejected on its own", () => {
    guestFirstName.fill("Alex");
    guestLastName.fill("Johnson");
    guestEmail.fill("not-an-email");
    guestPhone.fill("+1 (555) 867-5309");

    continueToPayment.click();

    expect(page).toContainURL("/booking/review");
    expect(page).toContainText("Valid email required");
  });

  step("Filling every field with valid data unblocks payment", () => {
    guestEmail.clear();
    guestEmail.fill("alex@demo.com");

    continueToPayment.click();
    expect(page).toContainURL("/booking/payment");
  });
});
