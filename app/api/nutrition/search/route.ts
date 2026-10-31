import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { withAuth } from '@/lib/auth/api-helpers'

/**
 * POST /api/nutrition/search  { query: string }
 *
 * Returns an array of { name, calories, protein, carbs, fat, fiber, sugar, sodium }.
 * When NUTRITIONIX_APP_ID + NUTRITIONIX_API_KEY are set, calls the Nutritionix
 * natural-language endpoint; otherwise returns mock data.
 */
interface FoodResult {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export const POST = withAuth(async (req: Request) => {
  await requireAuth()
  const body = await req.json().catch(() => ({}))
  const query = String(body?.query ?? '').trim()

  const appId = process.env.NUTRITIONIX_APP_ID
  const apiKey = process.env.NUTRITIONIX_API_KEY

  if (appId && apiKey && query) {
    try {
      const res = await fetch(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': appId,
            'x-app-key': apiKey,
          },
          body: JSON.stringify({ query }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        const foods: FoodResult[] = (data.foods ?? []).map(
          (f: Record<string, number | string>) => ({
            name: String(f.food_name ?? query),
            calories: Math.round(Number(f.nf_calories ?? 0)),
            protein: Math.round(Number(f.nf_protein ?? 0)),
            carbs: Math.round(Number(f.nf_total_carbohydrate ?? 0)),
            fat: Math.round(Number(f.nf_total_fat ?? 0)),
            fiber: Math.round(Number(f.nf_dietary_fiber ?? 0)),
            sugar: Math.round(Number(f.nf_sugars ?? 0)),
            sodium: Math.round(Number(f.nf_sodium ?? 0)),
          })
        )
        return NextResponse.json({ foods, source: 'nutritionix' })
      }
    } catch (error) {
      console.error('[nutrition/search] Nutritionix call failed:', error)
    }
  }

  // TODO: Set NUTRITIONIX_APP_ID and NUTRITIONIX_API_KEY env vars to enable real food search
  const mock: FoodResult[] = [
    { name: query || 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, sugar: 0, sodium: 74 },
    { name: query ? `${query} (serving)` : 'Brown rice, 1 cup', calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4, sugar: 1, sodium: 10 },
    { name: query ? `${query} (large)` : 'Banana, medium', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sugar: 14, sodium: 1 },
  ]
  return NextResponse.json({ foods: mock, source: 'mock' })
})
