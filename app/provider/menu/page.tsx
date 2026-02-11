'use client'

import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit, Plus, Salad, SlidersHorizontal, Trash2 } from 'lucide-react'

import Footer from '@/app/components/Footer'
import { Navigation } from '@/app/components/Navigation'
import { useAuth } from '@/app/context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

type VariantOptionForm = {
  id: string
  title: string
  priceDelta: string
  isDefault: boolean
}

type VariantForm = {
  id: string
  name: string
  isRequired: boolean
  options: VariantOptionForm[]
}

type MealFormState = {
  title: string
  slug: string
  description: string
  shortDesc: string
  price: string
  currency: string
  stock: string
  isActive: boolean
  isFeatured: boolean
  categories: string[]
  dietaryTags: string[]
  imageUrl: string
  imageAlt: string
  variants: VariantForm[]
}

type MealRecord = {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string
  price: number
  currency: string
  stock?: number
  isActive: boolean
  isFeatured: boolean
  categories: string[]
  dietaryTags: string[]
  image: { src: string; alt?: string; isPrimary: boolean }
  variants: {
    id: string
    name: string
    isRequired: boolean
    options: { id: string; title: string; priceDelta: number; isDefault: boolean }[]
  }[]
}

type Option = { id: string; label: string }

const categoryOptions: Option[] = [
  { id: 'italian', label: 'Italian' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'breakfast', label: 'Breakfast' },
]

const dietaryOptions: Option[] = [
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'keto', label: 'Keto Friendly' },
  { id: 'halal', label: 'Halal' },
  { id: 'dairy-free', label: 'Dairy Free' },
]

const makeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const createBlankMealForm = (): MealFormState => ({
  title: '',
  slug: '',
  description: '',
  shortDesc: '',
  price: '0.00',
  currency: 'USD',
  stock: '',
  isActive: true,
  isFeatured: false,
  categories: ['italian'],
  dietaryTags: [],
  imageUrl: 'https://images.unsplash.com/photo-1604908177453-74629501f9dc?w=600&auto=format&fit=crop',
  imageAlt: 'Meal cover',
  variants: [
    {
      id: makeId(),
      name: 'Size',
      isRequired: true,
      options: [
        { id: makeId(), title: 'Regular', priceDelta: '0', isDefault: true },
        { id: makeId(), title: 'Large', priceDelta: '3.50', isDefault: false },
      ],
    },
  ],
})

const seededMeals: MealRecord[] = [
  {
    id: makeId(),
    title: 'Charred Lemon Pasta',
    slug: 'charred-lemon-pasta',
    description: 'House-made tagliatelle tossed with charred lemon butter, basil, and shaved pecorino.',
    shortDesc: 'Bright, citrusy, and comforting.',
    price: 18.5,
    currency: 'USD',
    stock: 24,
    isActive: true,
    isFeatured: true,
    categories: ['italian', 'healthy'],
    dietaryTags: ['vegetarian'],
    image: {
      src: 'https://images.unsplash.com/photo-1612874472278-5c1f9a8a0b82?w=900&auto=format&fit=crop',
      alt: 'Charred lemon pasta bowl',
      isPrimary: true,
    },
    variants: [
      {
        id: makeId(),
        name: 'Size',
        isRequired: true,
        options: [
          { id: makeId(), title: 'Regular', priceDelta: 0, isDefault: true },
          { id: makeId(), title: 'Family Tray', priceDelta: 14, isDefault: false },
        ],
      },
    ],
  },
  {
    id: makeId(),
    title: 'Smoky Veggie Grain Bowl',
    slug: 'smoky-veggie-grain-bowl',
    description: 'Heirloom grains, roasted vegetables, tahini drizzle, and pickled shallots.',
    shortDesc: 'Plant-forward and satisfying.',
    price: 15,
    currency: 'USD',
    stock: 40,
    isActive: true,
    isFeatured: false,
    categories: ['healthy', 'vegan'],
    dietaryTags: ['gluten-free', 'vegan'],
    image: {
      src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop',
      alt: 'Vibrant grain bowl',
      isPrimary: true,
    },
    variants: [
      {
        id: makeId(),
        name: 'Protein',
        isRequired: false,
        options: [
          { id: makeId(), title: 'None', priceDelta: 0, isDefault: true },
          { id: makeId(), title: 'Smoked tofu', priceDelta: 2.5, isDefault: false },
          { id: makeId(), title: 'Chickpea fritters', priceDelta: 2, isDefault: false },
        ],
      },
    ],
  },
]

const convertFormToMeal = (form: MealFormState, id?: string): MealRecord => ({
  id: id ?? makeId(),
  title: form.title,
  slug: form.slug || slugify(form.title),
  description: form.description,
  shortDesc: form.shortDesc,
  price: Number.parseFloat(form.price) || 0,
  currency: form.currency,
  stock: form.stock ? Number.parseInt(form.stock, 10) : undefined,
  isActive: form.isActive,
  isFeatured: form.isFeatured,
  categories: form.categories,
  dietaryTags: form.dietaryTags,
  image: { src: form.imageUrl, alt: form.imageAlt, isPrimary: true },
  variants: form.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    isRequired: variant.isRequired,
    options: variant.options.map((option) => ({
      id: option.id,
      title: option.title,
      priceDelta: Number.parseFloat(option.priceDelta) || 0,
      isDefault: option.isDefault,
    })),
  })),
})

const convertMealToForm = (meal: MealRecord): MealFormState => ({
  title: meal.title,
  slug: meal.slug,
  description: meal.description,
  shortDesc: meal.shortDesc,
  price: meal.price.toFixed(2),
  currency: meal.currency,
  stock: meal.stock?.toString() ?? '',
  isActive: meal.isActive,
  isFeatured: meal.isFeatured,
  categories: meal.categories,
  dietaryTags: meal.dietaryTags,
  imageUrl: meal.image.src,
  imageAlt: meal.image.alt ?? '',
  variants: meal.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    isRequired: variant.isRequired,
    options: variant.options.map((option) => ({
      id: option.id,
      title: option.title,
      priceDelta: option.priceDelta.toString(),
      isDefault: option.isDefault,
    })),
  })),
})

const MealFields = ({
  form,
  setForm,
}: {
  form: MealFormState
  setForm: Dispatch<SetStateAction<MealFormState>>
}) => {
  const updateField = (key: keyof MealFormState, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const toggleItem = (key: 'categories' | 'dietaryTags', id: string, checked: boolean) => {
    setForm((prev) => {
      const current = new Set(prev[key])
      if (checked) {
        current.add(id)
      } else {
        current.delete(id)
      }
      return { ...prev, [key]: Array.from(current) }
    })
  }

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: makeId(),
          name: 'New variant',
          isRequired: false,
          options: [{ id: makeId(), title: 'Option A', priceDelta: '0', isDefault: false }],
        },
      ],
    }))
  }

  const updateVariant = (variantId: string, changes: Partial<VariantForm>) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, ...changes } : variant,
      ),
    }))
  }

  const removeVariant = (variantId: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((variant) => variant.id !== variantId),
    }))
  }

  const addVariantOption = (variantId: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: [
                ...variant.options,
                { id: makeId(), title: 'New option', priceDelta: '0', isDefault: false },
              ],
            }
          : variant,
      ),
    }))
  }

  const updateVariantOption = (
    variantId: string,
    optionId: string,
    changes: Partial<VariantOptionForm>,
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: variant.options.map((option) =>
                option.id === optionId ? { ...option, ...changes } : option,
              ),
            }
          : variant,
      ),
    }))
  }

  const removeVariantOption = (variantId: string, optionId: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, options: variant.options.filter((option) => option.id !== optionId) }
          : variant,
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Meal title</label>
          <Input
            value={form.title}
            onChange={(event) => {
              const value = event.target.value
              setForm((prev) => ({
                ...prev,
                title: value,
                slug: prev.slug || slugify(value),
              }))
            }}
            placeholder="Smoky tomato rigatoni"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Slug</label>
          <Input
            value={form.slug}
            onChange={(event) => updateField('slug', slugify(event.target.value))}
            placeholder="smoky-tomato-rigatoni"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Description</label>
          <Textarea
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={4}
            placeholder="Tell diners what makes this dish special."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Short blurb</label>
          <Textarea
            value={form.shortDesc}
            onChange={(event) => updateField('shortDesc', event.target.value)}
            rows={4}
            placeholder="Appears in cards and list views."
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Price</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Currency</label>
          <Select
            value={form.currency}
            onValueChange={(value) => updateField('currency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Stock (optional)</label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => updateField('stock', event.target.value)}
            placeholder="e.g. 24"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Primary image URL</label>
          <Input
            value={form.imageUrl}
            onChange={(event) => updateField('imageUrl', event.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Alt text</label>
          <Input
            value={form.imageAlt}
            onChange={(event) => updateField('imageAlt', event.target.value)}
            placeholder="How the dish looks"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</p>
              <p className="text-sm text-slate-200">Map to your Category table</p>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-100">Required</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {categoryOptions.map((category) => (
              <label key={category.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100">
                <Checkbox
                  checked={form.categories.includes(category.id)}
                  onCheckedChange={(checked) => toggleItem('categories', category.id, Boolean(checked))}
                />
                {category.label}
              </label>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dietary tags</p>
              <p className="text-sm text-slate-200">Maps to MealDietaryPreference</p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-100">Optional</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {dietaryOptions.map((diet) => (
              <label key={diet.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100">
                <Checkbox
                  checked={form.dietaryTags.includes(diet.id)}
                  onCheckedChange={(checked) => toggleItem('dietaryTags', diet.id, Boolean(checked))}
                />
                {diet.label}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Active</p>
            <p className="text-sm text-slate-200">Controls `isActive`</p>
          </div>
          <Switch checked={form.isActive} onCheckedChange={(checked) => updateField('isActive', checked)} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured</p>
            <p className="text-sm text-slate-200">Surfaces in hero spots</p>
          </div>
          <Switch checked={form.isFeatured} onCheckedChange={(checked) => updateField('isFeatured', checked)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Variants</p>
            <p className="text-sm text-slate-200">Meals → MealVariant → MealVariantOption</p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={addVariant} className="gap-2 bg-white/10 text-white hover:bg-white/20">
            <Plus className="h-4 w-4" />
            Add variant
          </Button>
        </div>

        <div className="space-y-3">
          {form.variants.map((variant) => (
            <Card key={variant.id} className="border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="grid flex-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <Input
                    value={variant.name}
                    onChange={(event) => updateVariant(variant.id, { name: event.target.value })}
                    placeholder="Variant name (Size, Protein, Spice level)"
                  />
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200">
                    <Switch
                      checked={variant.isRequired}
                      onCheckedChange={(checked) => updateVariant(variant.id, { isRequired: checked })}
                    />
                    Required
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                  onClick={() => removeVariant(variant.id)}
                >
                  Remove
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {variant.options.map((option) => (
                  <div
                    key={option.id}
                    className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-center"
                  >
                    <Input
                      value={option.title}
                      onChange={(event) => updateVariantOption(variant.id, option.id, { title: event.target.value })}
                      placeholder="Option title"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={option.priceDelta}
                      onChange={(event) => updateVariantOption(variant.id, option.id, { priceDelta: event.target.value })}
                      placeholder="0.00"
                    />
                    <div className="flex items-center justify-end gap-3">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                        <Checkbox
                          checked={option.isDefault}
                          onCheckedChange={(checked) => updateVariantOption(variant.id, option.id, { isDefault: Boolean(checked) })}
                        />
                        Default
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-slate-300 hover:text-white"
                        onClick={() => removeVariantOption(variant.id, option.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => addVariantOption(variant.id)}
              >
                Add option
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProviderMenuPage() {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()

  const [meals, setMeals] = useState<MealRecord[]>(seededMeals)
  const [createForm, setCreateForm] = useState<MealFormState>(() => createBlankMealForm())
  const [showCreate, setShowCreate] = useState(true)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MealFormState | null>(null)

  const setEditFormSafe: Dispatch<SetStateAction<MealFormState>> = (update) =>
    setEditForm((prev) => {
      if (!prev) return prev
      return typeof update === 'function'
        ? (update as (value: MealFormState) => MealFormState)(prev)
        : update
    })

  const stats = useMemo(
    () => ({
      active: meals.filter((meal) => meal.isActive).length,
      featured: meals.filter((meal) => meal.isFeatured).length,
      totalVariants: meals.reduce((acc, meal) => acc + meal.variants.length, 0),
    }),
    [meals],
  )

  if (!isAuthenticated || user?.role !== 'provider') {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md space-y-6 border-white/10 bg-white/5 p-8 text-center">
            <SlidersHorizontal className="mx-auto h-12 w-12 text-cyan-300" />
            <div>
              <h1 className="text-2xl font-semibold">Provider access only</h1>
              <p className="mt-2 text-sm text-slate-300">Switch to your provider account to curate menu items.</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const resetCreateForm = () => setCreateForm(createBlankMealForm())

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const meal = convertFormToMeal(createForm)
    setMeals((prev) => [...prev, meal])
    resetCreateForm()
    toast({ title: 'Draft saved', description: 'Meal staged with schema-ready fields.' })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this meal?')) return
    setMeals((prev) => prev.filter((meal) => meal.id !== id))
    if (editingMealId === id) {
      setEditDialogOpen(false)
      setEditingMealId(null)
      setEditForm(null)
    }
    toast({ title: 'Deleted', description: 'Meal removed from your working list.' })
  }

  const openEdit = (meal: MealRecord) => {
    setEditingMealId(meal.id)
    setEditForm(convertMealToForm(meal))
    setEditDialogOpen(true)
  }

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingMealId || !editForm) return

    const updated = convertFormToMeal(editForm, editingMealId)
    setMeals((prev) => prev.map((meal) => (meal.id === editingMealId ? updated : meal)))
    setEditDialogOpen(false)
    setEditingMealId(null)
    setEditForm(null)
    toast({ title: 'Meal updated', description: 'Edits applied to the menu draft.' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-400/10 blur-[160px]" />
      </div>
      <Navigation />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-6xl space-y-8">
          <Card className="relative overflow-hidden border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Provider workspace</p>
                <h1 className="text-3xl font-semibold text-white">Menu builder</h1>
                <p className="text-sm text-slate-300">
                  Every input below maps to your Prisma schema: Meal, MealVariant, MealCategory, and MealDietaryPreference.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className="bg-cyan-500/20 text-cyan-100">{user?.name || 'Provider'}</Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-100">Live preview</Badge>
                </div>
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Active</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stats.active}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stats.featured}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Variants</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{stats.totalVariants}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create meal</p>
                <h2 className="text-2xl font-semibold text-white">Schema-aligned fields</h2>
                <p className="text-sm text-slate-300">Fill Meal, MealImage, categories, dietary preferences, and variants in one go.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-slate-200 hover:text-white"
                onClick={() => setShowCreate((prev) => !prev)}
              >
                {showCreate ? 'Hide form' : 'Show form'}
              </Button>
            </div>

            {showCreate && (
              <form onSubmit={handleCreate} className="mt-6 space-y-6">
                <MealFields form={createForm} setForm={setCreateForm} />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={resetCreateForm}
                  >
                    Reset
                  </Button>
                  <Button type="submit" className="bg-cyan-500 text-white hover:bg-cyan-600">
                    Save as draft
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Salad className="h-5 w-5 text-cyan-300" />
              <h3 className="text-xl font-semibold text-white">Your staged meals</h3>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {meals.map((meal) => (
                <Card key={meal.id} className="border-white/10 bg-white/5 p-4">
                  <div className="flex gap-4">
                    <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                      <img
                        src={meal.image.src}
                        alt={meal.image.alt || meal.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {meal.isActive ? (
                          <Badge className="bg-emerald-500/20 text-emerald-100">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-700 text-slate-100">Inactive</Badge>
                        )}
                        {meal.isFeatured && <Badge className="bg-cyan-500/20 text-cyan-100">Featured</Badge>}
                        <Badge variant="outline" className="border-white/20 text-slate-100">{meal.currency} {meal.price.toFixed(2)}</Badge>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{meal.slug}</p>
                        <h4 className="text-lg font-semibold text-white">{meal.title}</h4>
                        <p className="text-sm text-slate-300">{meal.shortDesc}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                        {meal.categories.map((category) => (
                          <span key={category} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                            {categoryOptions.find((item) => item.id === category)?.label || category}
                          </span>
                        ))}
                        {meal.dietaryTags.map((tag) => (
                          <span key={tag} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
                            {dietaryOptions.find((item) => item.id === tag)?.label || tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      {meal.variants.length} variant{meal.variants.length === 1 ? '' : 's'} · {meal.variants.reduce((acc, variant) => acc + variant.options.length, 0)} option total
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10"
                        onClick={() => openEdit(meal)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() => handleDelete(meal.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) {
            setEditingMealId(null)
            setEditForm(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950/95">
          <DialogHeader>
            <DialogTitle className="text-white">Edit meal</DialogTitle>
            <DialogDescription className="text-slate-300">
              Adjust schema-bound fields. Variants and categories remain linked to their respective tables.
            </DialogDescription>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-6">
              <MealFields form={editForm} setForm={setEditFormSafe} />
              <DialogFooter className="gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-200 hover:text-white"
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEditingMealId(null)
                    setEditForm(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-500 text-white hover:bg-cyan-600">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
