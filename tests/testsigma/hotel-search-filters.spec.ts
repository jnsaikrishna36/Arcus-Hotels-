/**
 * hotel-search-filters.spec.ts
 *
 * Hotel search filtering on Arcus Go (app/hotels/search/page.tsx). Search is
 * public -- no login required -- so this spec goes straight to search
 * results.
 *
 * Seattle (mocks/data/hotels.ts) has exactly 6 hotels -- 1 budget, 2 luxury,
 * 2 standard, 1 deluxe -- which stays within a single results page (the
 * search API paginates at 6/hotel) and gives deterministic counts per
 * category filter. A search for a city with no listed hotels ("Denver")
 * exercises the empty state.
 */
import { expect, step, test } from "@testsigma/code";
import {
  categoryBudget,
  categoryLuxury,
  clearFilters,
  hotelCardEastlakeWaterfrontLodge,
  hotelCardPacificCoveLodge,
  hotelCardPikePlaceMarketInn,
  noResults,
  resultsCount,
} from "./elements/booking.js";

test("category filters narrow Seattle results, and an unlisted city shows no results", ({ page }) => {
  step("Search Seattle and see all 6 hotels", () => {
    page.goto("http://localhost:3000/hotels/search?city=Seattle&checkIn=2026-08-28&checkOut=2026-08-29&guests=2");
    expect(resultsCount).toHaveText("6 properties found");
  });

  step("Filter to Budget shows only Pike Place Market Inn", () => {
    categoryBudget.click();
    expect(resultsCount).toHaveText("1 property found");
    expect(hotelCardPikePlaceMarketInn).toBeVisible();
  });

  step("Filter to Luxury shows the two luxury Seattle hotels", () => {
    categoryLuxury.click();
    expect(resultsCount).toHaveText("2 properties found");
    expect(hotelCardPacificCoveLodge).toBeVisible();
    expect(hotelCardEastlakeWaterfrontLodge).toBeVisible();
  });

  step("Clear Filters restores all 6 Seattle hotels", () => {
    clearFilters.click();
    expect(resultsCount).toHaveText("6 properties found");
  });

  step("Searching a city with no listed hotels shows the empty state", () => {
    page.goto("http://localhost:3000/hotels/search?city=Denver&checkIn=2026-08-28&checkOut=2026-08-29&guests=2");
    expect(noResults).toBeVisible();
    expect(resultsCount).toHaveText("0 properties found");
  });
});
