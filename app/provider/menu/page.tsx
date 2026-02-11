'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit, Loader2, Plus, Salad, Trash2 } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  createProviderCategory,
  createProviderMeal,
  createProviderProfile,
  deleteProviderMeal,
  fetchProviderCategories,
  fetchProviderMealById,
  fetchProviderMeals,
  findMyProviderProfile,
  type CreateProviderCategoryPayload,
  type ProviderCategory,
  updateProviderMeal,
  type CreateProviderMealPayload,
  type ProviderMeal,
  type UpdateProviderMealPayload,
} from '@/service/provider'

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
  categoryIdsText: string
  dietaryNamesText: string
  imageUrl: string
  imageAlt: string
  variants: VariantForm[]
}

type CategoryFormState = {
  name: string
  slug: string
  description: string
}

const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Meal'

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

const parseCsv = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

const createBlankMealForm = (): MealFormState => ({
  title: '',
  slug: '',
  description: '',
  shortDesc: '',
  price: '',
  currency: 'USD',
  stock: '',
  isActive: true,
  isFeatured: false,
  categoryIdsText: '',
  dietaryNamesText: '',
  imageUrl: '',
  imageAlt: '',
  variants: [
    {
      id: makeId(),
      name: 'Size',
      isRequired: true,
      options: [
        { id: makeId(), title: 'Regular', priceDelta: '0', isDefault: true },
        { id: makeId(), title: 'Large', priceDelta: '2.50', isDefault: false },
      ],
    },
  ],
})

const createBlankCategoryForm = (): CategoryFormState => ({
  name: '',
  slug: '',
  description: '',
})

const appendCsvValue = (csv: string, value: string) => {
  const entries = parseCsv(csv)
  if (!entries.includes(value)) entries.push(value)
  return entries.join(', ')
}

const convertMealToForm = (meal: ProviderMeal): MealFormState => {
  const primaryImage = meal.images?.find((img) => img.isPrimary) ?? meal.images?.[0]
  const categories = meal.categories?.map((entry) => entry.categoryId).filter(Boolean) ?? []
  const dietaryNames =
    meal.dietaryTags
      ?.map((entry) => entry.dietaryPreference?.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? []

  const variants: VariantForm[] =
    meal.variants?.map((variant) => ({
      id: variant.id ?? makeId(),
      name: variant.name ?? '',
      isRequired: Boolean(variant.isRequired),
      options:
        variant.options?.map((option) => ({
          id: option.id ?? makeId(),
          title: option.title ?? '',
          priceDelta: String(toNumber(option.priceDelta, 0)),
          isDefault: Boolean(option.isDefault),
        })) ?? [],
    })) ?? []

  return {
    title: meal.title ?? '',
    slug: meal.slug ?? slugify(meal.title ?? ''),
    description: meal.description ?? '',
    shortDesc: meal.shortDesc ?? '',
    price: toNumber(meal.price, 0).toFixed(2),
    currency: meal.currency ?? 'USD',
    stock: meal.stock === null || meal.stock === undefined ? '' : String(meal.stock),
    isActive: meal.isActive ?? true,
    isFeatured: meal.isFeatured ?? false,
    categoryIdsText: categories.join(', '),
    dietaryNamesText: dietaryNames.join(', '),
    imageUrl: primaryImage?.src ?? '',
    imageAlt: primaryImage?.altText ?? '',
    variants:
      variants.length > 0
        ? variants
        : [
            {
              id: makeId(),
              name: 'Size',
              isRequired: true,
              options: [
                { id: makeId(), title: 'Regular', priceDelta: '0', isDefault: true },
              ],
            },
          ],
  }
}

const buildVariantsPayload = (variants: VariantForm[]) => {
  const prepared = variants
    .map((variant) => {
      const name = variant.name.trim()
      if (!name) return null

      const options = variant.options
        .map((option) => ({
          title: option.title.trim(),
          priceDelta: toNumber(option.priceDelta, 0),
          isDefault: option.isDefault,
        }))
        .filter((option) => option.title.length > 0)

      if (options.length === 0) {
        throw new Error(`Variant "${name}" must include at least one option.`)
      }

      const hasDefault = options.some((option) => option.isDefault)
      const normalizedOptions = hasDefault
        ? options.map((option, idx) => ({
            ...option,
            isDefault: idx === options.findIndex((item) => item.isDefault),
          }))
        : options.map((option, idx) => ({
            ...option,
            isDefault: idx === 0,
          }))

      return {
        name,
        isRequired: variant.isRequired,
        options: normalizedOptions,
      }
    })
    .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant))

  return prepared.length > 0 ? prepared : undefined
}

const buildMealPayload = (
  form: MealFormState,
  mode: 'create' | 'update',
): CreateProviderMealPayload | UpdateProviderMealPayload => {
  const title = form.title.trim()
  if (!title) throw new Error('Meal title is required.')

  const price = Number(form.price)
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Price must be a valid number greater than zero.')
  }

  let stock: number | null | undefined
  if (form.stock.trim()) {
    const parsedStock = Number(form.stock)
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      throw new Error('Stock must be a non-negative integer.')
    }
    stock = parsedStock
  } else {
    stock = mode === 'update' ? null : undefined
  }

  const categoryIds = parseCsv(form.categoryIdsText)
  const dietaryNames = parseCsv(form.dietaryNamesText)
  const imageUrl = form.imageUrl.trim()
  const imageAlt = form.imageAlt.trim()
  const variants = buildVariantsPayload(form.variants)

  return {
    title,
    slug: form.slug.trim() ? slugify(form.slug) : undefined,
    description: form.description.trim() || undefined,
    shortDesc: form.shortDesc.trim() || undefined,
    price,
    currency: form.currency.trim() || 'USD',
    stock,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    ...(categoryIds.length > 0 ? { categoryIds } : {}),
    ...(dietaryNames.length > 0
      ? { dietaryPreferences: dietaryNames.map((name) => ({ name })) }
      : {}),
    ...(imageUrl
      ? {
          images: [
            {
              src: imageUrl,
              altText: imageAlt || undefined,
              isPrimary: true,
            },
          ],
        }
      : {}),
    ...(variants ? { variants } : {}),
  }
}
const MealFields = ({
  form,
  setForm,
}: {
  form: MealFormState
  setForm: Dispatch<SetStateAction<MealFormState>>
}) => {
  const updateField = <K extends keyof MealFormState>(key: K, value: MealFormState[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: makeId(),
          name: '',
          isRequired: false,
          options: [{ id: makeId(), title: '', priceDelta: '0', isDefault: true }],
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
                { id: makeId(), title: '', priceDelta: '0', isDefault: false },
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

  const setDefaultOption = (variantId: string, optionId: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              options: variant.options.map((option) =>
                option.id === optionId
                  ? { ...option, isDefault: checked }
                  : checked
                    ? { ...option, isDefault: false }
                    : option,
              ),
            }
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
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Short blurb</label>
          <Textarea
            value={form.shortDesc}
            onChange={(event) => updateField('shortDesc', event.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Price</label>
          <Input type="number" step="0.01" min="0.01" value={form.price} onChange={(event) => updateField('price', event.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Currency</label>
          <Input value={form.currency} onChange={(event) => updateField('currency', event.target.value.toUpperCase())} placeholder="USD" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Stock</label>
          <Input type="number" min="0" step="1" value={form.stock} onChange={(event) => updateField('stock', event.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="Primary image URL" />
        <Input value={form.imageAlt} onChange={(event) => updateField('imageAlt', event.target.value)} placeholder="Image alt text" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input value={form.categoryIdsText} onChange={(event) => updateField('categoryIdsText', event.target.value)} placeholder="Category IDs CSV (from category management)" />
        <Input value={form.dietaryNamesText} onChange={(event) => updateField('dietaryNamesText', event.target.value)} placeholder="Dietary names CSV" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-slate-200">Active</span>
          <Switch checked={form.isActive} onCheckedChange={(checked) => updateField('isActive', checked)} />
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className="text-sm text-slate-200">Featured</span>
          <Switch checked={form.isFeatured} onCheckedChange={(checked) => updateField('isFeatured', checked)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Variants</p>
            <p className="text-sm text-slate-200">MealVariant and MealVariantOption</p>
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
                  <Input value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} placeholder="Variant name" />
                  <label className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-200">
                    <Switch checked={variant.isRequired} onCheckedChange={(checked) => updateVariant(variant.id, { isRequired: checked })} />
                    Required
                  </label>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={() => removeVariant(variant.id)}>
                  Remove
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {variant.options.map((option) => (
                  <div key={option.id} className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 md:grid-cols-[1.2fr_0.6fr_auto] md:items-center">
                    <Input value={option.title} onChange={(event) => updateVariantOption(variant.id, option.id, { title: event.target.value })} placeholder="Option title" />
                    <Input type="number" step="0.01" value={option.priceDelta} onChange={(event) => updateVariantOption(variant.id, option.id, { priceDelta: event.target.value })} placeholder="0.00" />
                    <div className="flex items-center justify-end gap-3">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                        <Checkbox checked={option.isDefault} onCheckedChange={(checked) => setDefaultOption(variant.id, option.id, Boolean(checked))} />
                        Default
                      </label>
                      <Button type="button" size="sm" variant="ghost" className="text-slate-300 hover:text-white" onClick={() => removeVariantOption(variant.id, option.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" size="sm" className="mt-3 border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => addVariantOption(variant.id)}>
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
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { toast } = useToast()

  const [providerProfileId, setProviderProfileId] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [meals, setMeals] = useState<ProviderMeal[]>([])
  const [providerCategories, setProviderCategories] = useState<ProviderCategory[]>([])
  const [createForm, setCreateForm] = useState<MealFormState>(() => createBlankMealForm())
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(() =>
    createBlankCategoryForm(),
  )
  const [showCreate, setShowCreate] = useState(true)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isMealsLoading, setIsMealsLoading] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MealFormState | null>(null)
  const [isEditLoading, setIsEditLoading] = useState(false)

  const setEditFormSafe: Dispatch<SetStateAction<MealFormState>> = (update) =>
    setEditForm((prev) => {
      if (!prev) return prev
      return typeof update === 'function'
        ? (update as (value: MealFormState) => MealFormState)(prev)
        : update
    })

  const loadMeals = useCallback(
    async (profileId: string) => {
      setIsMealsLoading(true)
      try {
        const data = await fetchProviderMeals(profileId)
        setMeals(data)
      } catch (error) {
        toast({
          title: 'Failed to load meals',
          description:
            error instanceof Error
              ? error.message
              : 'Could not load menu items from the server.',
          variant: 'destructive',
        })
      } finally {
        setIsMealsLoading(false)
      }
    },
    [toast],
  )

  const loadCategories = useCallback(async () => {
    setIsCategoriesLoading(true)
    try {
      const response = await fetchProviderCategories({ page: 1, limit: 100 })
      setProviderCategories(response.data)
    } catch (error) {
      toast({
        title: 'Failed to load categories',
        description:
          error instanceof Error
            ? error.message
            : 'Could not load category requests from the server.',
        variant: 'destructive',
      })
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'provider' || !user?.id) return

    let mounted = true
    const bootstrap = async () => {
      setIsBootstrapping(true)
      setProfileError(null)
      try {
        const profile = await findMyProviderProfile(user.id)
        if (!mounted) return

        if (!profile) {
          const fallbackName =
            user.name?.trim() ||
            user.email?.split('@')[0]?.trim() ||
            'Provider'
          const createdProfile = await createProviderProfile({ name: fallbackName })
          if (!mounted) return
          setProviderProfileId(createdProfile.id)
          await Promise.all([loadMeals(createdProfile.id), loadCategories()])
          toast({
            title: 'Provider profile initialized',
            description: 'A provider profile was created automatically for your account.',
          })
          return
        }

        setProviderProfileId(profile.id)
        await Promise.all([loadMeals(profile.id), loadCategories()])
      } catch (error) {
        if (!mounted) return
        setProviderProfileId(null)
        setMeals([])
        setProfileError(error instanceof Error ? error.message : 'Failed to initialize menu.')
      } finally {
        if (mounted) setIsBootstrapping(false)
      }
    }

    void bootstrap()
    return () => {
      mounted = false
    }
  }, [
    isAuthenticated,
    user?.id,
    user?.role,
    user?.name,
    user?.email,
    loadMeals,
    loadCategories,
    toast,
  ])

  const stats = useMemo(
    () => ({
      active: meals.filter((meal) => meal.isActive).length,
      featured: meals.filter((meal) => meal.isFeatured).length,
      total: meals.length,
      categoriesActive: providerCategories.filter((category) => category.status === 'active')
        .length,
      categoriesPending: providerCategories.filter((category) => category.status === 'pending')
        .length,
    }),
    [meals, providerCategories],
  )

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!providerProfileId) {
      toast({
        title: 'Provider profile missing',
        description: 'Create your provider profile before adding meals.',
        variant: 'destructive',
      })
      return
    }

    let payload: CreateProviderMealPayload
    try {
      payload = buildMealPayload(createForm, 'create') as CreateProviderMealPayload
    } catch (error) {
      toast({
        title: 'Invalid form data',
        description: error instanceof Error ? error.message : 'Please review your input.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createProviderMeal(payload)
      setCreateForm(createBlankMealForm())
      await loadMeals(providerProfileId)
      toast({ title: 'Meal created', description: 'Meal saved to your provider menu.' })
    } catch (error) {
      toast({
        title: 'Create failed',
        description:
          error instanceof Error ? error.message : 'Could not create the meal on the server.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload: CreateProviderCategoryPayload = {
      name: categoryForm.name.trim(),
      slug: categoryForm.slug.trim() ? slugify(categoryForm.slug) : undefined,
      description: categoryForm.description.trim() || undefined,
    }

    if (!payload.name) {
      toast({
        title: 'Category name required',
        description: 'Enter a category name before submitting request.',
        variant: 'destructive',
      })
      return
    }

    setIsCategorySubmitting(true)
    try {
      await createProviderCategory(payload)
      setCategoryForm(createBlankCategoryForm())
      await loadCategories()
      toast({
        title: 'Category request sent',
        description: 'Category is now pending admin approval.',
      })
    } catch (error) {
      toast({
        title: 'Category request failed',
        description:
          error instanceof Error ? error.message : 'Could not submit category request.',
        variant: 'destructive',
      })
    } finally {
      setIsCategorySubmitting(false)
    }
  }

  const attachCategoryToCreateForm = (categoryId: string) => {
    setCreateForm((prev) => ({
      ...prev,
      categoryIdsText: appendCsvValue(prev.categoryIdsText, categoryId),
    }))
    toast({
      title: 'Category ID added',
      description: 'Category ID appended to create meal form.',
    })
  }

  const openEdit = async (meal: ProviderMeal) => {
    setEditDialogOpen(true)
    setEditingMealId(meal.id)
    setEditForm(null)
    setIsEditLoading(true)

    try {
      const details = await fetchProviderMealById(meal.id)
      setEditForm(convertMealToForm(details))
    } catch {
      setEditForm(convertMealToForm(meal))
      toast({
        title: 'Limited edit data',
        description: 'Loaded basic meal info. Fill variants/options before saving if needed.',
        variant: 'destructive',
      })
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingMealId || !editForm) return

    let payload: UpdateProviderMealPayload
    try {
      payload = buildMealPayload(editForm, 'update') as UpdateProviderMealPayload
    } catch (error) {
      toast({
        title: 'Invalid form data',
        description: error instanceof Error ? error.message : 'Please review your input.',
        variant: 'destructive',
      })
      return
    }

    setIsUpdating(true)
    try {
      await updateProviderMeal(editingMealId, payload)
      if (providerProfileId) await loadMeals(providerProfileId)
      setEditDialogOpen(false)
      setEditingMealId(null)
      setEditForm(null)
      toast({ title: 'Meal updated', description: 'Changes saved successfully.' })
    } catch (error) {
      toast({
        title: 'Update failed',
        description:
          error instanceof Error ? error.message : 'Could not update meal on the server.',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (mealId: string) => {
    if (!confirm('Delete this meal?')) return
    try {
      await deleteProviderMeal(mealId)
      setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
      toast({ title: 'Deleted', description: 'Meal removed from your menu.' })
    } catch (error) {
      toast({
        title: 'Delete failed',
        description:
          error instanceof Error ? error.message : 'Could not delete meal from server.',
        variant: 'destructive',
      })
    }
  }
  if (isAuthLoading || isBootstrapping) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="flex items-center gap-3 border-white/10 bg-white/5 p-6 text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparing provider workspace...
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'provider') {
    return (
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <Navigation />
        <main className="flex flex-1 items-center justify-center px-4">
          <Card className="max-w-md space-y-6 border-white/10 bg-white/5 p-8 text-center">
            <Salad className="mx-auto h-12 w-12 text-cyan-300" />
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
                <p className="text-sm text-slate-300">Variant options restored with edit modal support.</p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-200 md:grid-cols-5">
                <div><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Total</p><p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p></div>
                <div><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Active</p><p className="mt-1 text-2xl font-semibold text-white">{stats.active}</p></div>
                <div><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured</p><p className="mt-1 text-2xl font-semibold text-white">{stats.featured}</p></div>
                <div><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories</p><p className="mt-1 text-2xl font-semibold text-white">{stats.categoriesActive}</p></div>
                <div><p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pending cat.</p><p className="mt-1 text-2xl font-semibold text-white">{stats.categoriesPending}</p></div>
              </div>
            </div>
          </Card>

          {profileError && <Card className="border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{profileError}</Card>}

          <Card className="border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Create meal</p>
                <h2 className="text-2xl font-semibold text-white">Schema-aligned fields</h2>
              </div>
              <Button type="button" variant="ghost" className="text-slate-200 hover:text-white" onClick={() => setShowCreate((prev) => !prev)}>
                {showCreate ? 'Hide form' : 'Show form'}
              </Button>
            </div>

            {showCreate && (
              <form onSubmit={handleCreate} className="mt-6 space-y-6">
                <MealFields form={createForm} setForm={setCreateForm} />
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => setCreateForm(createBlankMealForm())}>
                    Reset
                  </Button>
                  <Button type="submit" className="bg-cyan-500 text-white hover:bg-cyan-600" disabled={isSubmitting || !providerProfileId}>
                    {isSubmitting ? 'Creating...' : 'Create meal'}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card id="category-management" className="border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Category management</p>
                <h2 className="text-2xl font-semibold text-white">Request categories</h2>
                <p className="text-sm text-slate-300">Active categories can be attached to meals by ID.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
                onClick={() => void loadCategories()}
                disabled={isCategoriesLoading}
              >
                {isCategoriesLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing
                  </>
                ) : (
                  'Refresh categories'
                )}
              </Button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-6 grid gap-4 md:grid-cols-3">
              <Input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Category name"
                required
              />
              <Input
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))
                }
                placeholder="Slug (optional)"
              />
              <Input
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Description (optional)"
              />

              <div className="md:col-span-3 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-200 hover:text-white"
                  onClick={() => setCategoryForm(createBlankCategoryForm())}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="bg-cyan-500 text-white hover:bg-cyan-600"
                  disabled={isCategorySubmitting}
                >
                  {isCategorySubmitting ? 'Submitting...' : 'Create category request'}
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {providerCategories.length === 0 ? (
                <Card className="border-white/10 bg-slate-900/40 p-4 text-sm text-slate-300">
                  No category records yet.
                </Card>
              ) : (
                providerCategories.map((category) => (
                  <Card key={category.id} className="border-white/10 bg-slate-900/40 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white">{category.name}</p>
                          <Badge
                            className={
                              category.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-100'
                                : category.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-100'
                                  : 'bg-rose-500/20 text-rose-100'
                            }
                          >
                            {category.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">ID: {category.id}</p>
                        <p className="text-xs text-slate-400">Slug: {category.slug}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-white/20 bg-transparent text-white hover:bg-white/10"
                          onClick={() => attachCategoryToCreateForm(category.id)}
                          disabled={category.status !== 'active'}
                        >
                          Use in create form
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Salad className="h-5 w-5 text-cyan-300" />
                <h3 className="text-xl font-semibold text-white">Your meals</h3>
              </div>
              <Button type="button" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => providerProfileId && loadMeals(providerProfileId)} disabled={!providerProfileId || isMealsLoading}>
                {isMealsLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Refreshing</> : 'Refresh'}
              </Button>
            </div>

            {meals.length === 0 ? (
              <Card className="border-white/10 bg-white/5 p-6 text-sm text-slate-300">No meals found yet. Create your first meal above.</Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {meals.map((meal) => {
                  const imageSrc = meal.images?.find((img) => img.isPrimary)?.src ?? meal.images?.[0]?.src ?? FALLBACK_IMAGE
                  const categoryNames = meal.categories?.map((entry) => entry.category?.name ?? entry.categoryId).filter(Boolean) ?? []
                  const price = toNumber(meal.price, 0)

                  return (
                    <Card key={meal.id} className="border-white/10 bg-white/5 p-4">
                      <div className="flex gap-4">
                        <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                          <img src={imageSrc} alt={meal.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {meal.isActive ? <Badge className="bg-emerald-500/20 text-emerald-100">Active</Badge> : <Badge className="bg-slate-700 text-slate-100">Inactive</Badge>}
                            {meal.isFeatured && <Badge className="bg-cyan-500/20 text-cyan-100">Featured</Badge>}
                            <Badge variant="outline" className="border-white/20 text-slate-100">{formatMoney(price, meal.currency)}</Badge>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{meal.slug}</p>
                            <h4 className="text-lg font-semibold text-white">{meal.title}</h4>
                            <p className="text-sm text-slate-300">{meal.shortDesc || meal.description || 'No description'}</p>
                          </div>
                          {categoryNames.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                              {categoryNames.map((category) => <span key={`${meal.id}-${category}`} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{category}</span>)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        <Button size="sm" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => openEdit(meal)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => handleDelete(meal.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
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
            setIsEditLoading(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950/95 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit meal</DialogTitle>
            <DialogDescription className="text-slate-300">
              Update meal details, variant options, and flags using this modal.
            </DialogDescription>
          </DialogHeader>

          {isEditLoading ? (
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading meal details...
            </div>
          ) : editForm ? (
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
                <Button type="submit" className="bg-cyan-500 text-white hover:bg-cyan-600" disabled={isUpdating || !editingMealId}>
                  {isUpdating ? 'Saving...' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              Unable to load meal form.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
