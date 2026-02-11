"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategory,
  type AdminCategoryStatus,
} from "@/service/admin";

type CategoryStatusFilter = "all" | AdminCategoryStatus;

const statusFilters: CategoryStatusFilter[] = [
  "all",
  "active",
  "pending",
  "rejected",
];

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function AdminCategoriesPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const hasAdminAccess =
    user?.role === "admin" || user?.role === "super_admin";
  const { toast } = useToast();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<CategoryStatusFilter>("all");
  const [error, setError] = useState<string | null>(null);

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<AdminCategoryStatus>("active");

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminCategories({
        page: 1,
        limit: 500,
        searchTerm: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setCategories(response.data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load categories.";
      setError(message);
      toast({
        title: "Unable to load categories",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, toast]);

  useEffect(() => {
    if (!isAuthenticated || !hasAdminAccess) return;
    void loadCategories();
  }, [isAuthenticated, hasAdminAccess, loadCategories]);

  const resetCreateForm = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateDescription("");
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!createName.trim()) {
      toast({
        title: "Category name required",
        description: "Please provide a category name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAdminCategory({
        name: createName.trim(),
        slug: createSlug.trim() ? slugify(createSlug) : undefined,
        description: createDescription.trim() || undefined,
      });
      setCategories((prev) => [created, ...prev]);
      resetCreateForm();
      toast({
        title: "Category created",
        description: `${created.name} is now available.`,
      });
    } catch (err) {
      toast({
        title: "Create failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (category: AdminCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
    setEditStatus(category.status);
  };

  const handleEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;
    if (!editName.trim()) {
      toast({
        title: "Category name required",
        description: "Please provide a category name.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await updateAdminCategory(editingCategory.id, {
        name: editName.trim(),
        slug: editSlug.trim() ? slugify(editSlug) : undefined,
        description: editDescription.trim() || null,
        status: editStatus,
      });

      setCategories((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setEditingCategory(null);
      toast({
        title: "Category updated",
        description: `${updated.name} has been updated.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    const confirmed = window.confirm(
      "Delete this category? This action cannot be undone.",
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await deleteAdminCategory(categoryId);
      setCategories((prev) => prev.filter((item) => item.id !== categoryId));
      toast({
        title: "Category deleted",
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.slug} ${category.description ?? ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()),
      ),
    [categories, searchTerm],
  );

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex flex-1 items-center justify-center">
          <Card className="flex items-center gap-3 p-6">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading categories...
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Category Management</h1>
            <Button variant="outline" onClick={() => void loadCategories()}>
              Refresh
            </Button>
          </div>

          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-lg font-semibold">Create Category</h2>
            <form onSubmit={(event) => void handleCreate(event)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  required
                />
                <Input
                  placeholder="Slug (optional)"
                  value={createSlug}
                  onChange={(event) => setCreateSlug(event.target.value)}
                />
              </div>
              <Textarea
                placeholder="Description (optional)"
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </>
                )}
              </Button>
            </form>
          </Card>

          <Card className="mb-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {statusFilters.map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All" : formatStatus(status)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {error && (
            <Card className="mb-6 border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </Card>
          )}

          <Card className="p-6 overflow-x-auto">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No categories found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Slug</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-border hover:bg-secondary/20"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold">{category.name}</div>
                        {category.description && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {category.slug}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            category.status === "active"
                              ? "bg-green-100 text-green-800"
                              : category.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {formatStatus(category.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleDelete(category.id)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </main>

      <Dialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          <form onSubmit={(event) => void handleEdit(event)} className="space-y-4">
            <Input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Name"
              required
            />
            <Input
              value={editSlug}
              onChange={(event) => setEditSlug(event.target.value)}
              placeholder="Slug"
            />
            <Textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              placeholder="Description"
              rows={3}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={editStatus}
                onChange={(event) =>
                  setEditStatus(event.target.value as AdminCategoryStatus)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
