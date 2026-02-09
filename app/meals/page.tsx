import { fetchMeals } from "@/app/lib/meals-api";
import { MealsBrowserClient } from "./MealsBrowserClient";

export default async function BrowseMealsPage() {
  const meals = await fetchMeals(60);
  return <MealsBrowserClient meals={meals} />;
}

