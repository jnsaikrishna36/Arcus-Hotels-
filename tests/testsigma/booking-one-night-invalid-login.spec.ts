/**
 * booking-one-night-invalid-login.spec.ts
 *
 * Negative scenario for the one-night hotel booking flow on Arcus Go: an
 * incorrect password blocks sign-in, so the booking flow never starts.
 *
 * Error copy comes straight from mocks/handlers/auth.ts, so the assertion is
 * deterministic across runs.
 */
import { expect, test } from "@testsigma/code";
import {
  loginEmail,
  loginError,
  loginPassword,
  loginSubmit,
} from "./elements/booking.js";

test("incorrect password blocks sign-in before a one-night booking can start", ({ page }) => {
  page.goto("http://localhost:3000/auth/login");
  loginEmail.fill("alex@demo.com");
  loginPassword.fill("WrongPassword1");
  loginSubmit.click();

  expect(loginError).toBeVisible();
  expect(loginError).toHaveText("Incorrect password. Please try again.");
  expect(page).toContainURL("/auth/login");
});
