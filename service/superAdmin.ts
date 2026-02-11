import { apiRequest, unwrap } from "./http";

export type SuperAdminUserRole =
  | "customer"
  | "provider"
  | "admin"
  | "super_admin";
export type SuperAdminUserStatus = "active" | "blocked" | "pending" | "deleted";

export interface SuperAdminOverview {
  users: {
    total: number;
    byRole: {
      customer: number;
      provider: number;
      admin: number;
      super_admin: number;
    };
    byStatus: {
      active: number;
      pending: number;
      blocked: number;
      deleted: number;
    };
  };
  providers: {
    total: number;
    verified: number;
    unverified: number;
  };
}

export interface SuperAdminUser {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: SuperAdminUserRole;
  status: SuperAdminUserStatus;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface SuperAdminUsersResult {
  data: SuperAdminUser[];
  meta?: SuperAdminPaginationMeta;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseMeta = (value: unknown): SuperAdminPaginationMeta | undefined => {
  if (!isRecord(value)) return undefined;
  const page = Number(value.page);
  const limit = Number(value.limit);
  const total = Number(value.total);
  const totalPage = Number(value.totalPage);

  if (
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total) ||
    !Number.isFinite(totalPage)
  ) {
    return undefined;
  }

  return { page, limit, total, totalPage };
};

const toQuery = (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
};

export async function fetchSuperAdminOverview(): Promise<SuperAdminOverview> {
  const response = await apiRequest<unknown>("/api/super-admin/overview", {
    method: "GET",
  });

  return unwrap(response as { data: SuperAdminOverview } | SuperAdminOverview);
}

export async function fetchSuperAdminUsers(params?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: SuperAdminUserRole;
  status?: SuperAdminUserStatus;
}): Promise<SuperAdminUsersResult> {
  const query = toQuery({
    page: params?.page,
    limit: params?.limit,
    searchTerm: params?.searchTerm,
    role: params?.role,
    status: params?.status,
  });

  const response = await apiRequest<unknown>(
    `/api/super-admin/users${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );

  if (Array.isArray(response)) {
    return { data: response as SuperAdminUser[] };
  }

  if (isRecord(response)) {
    return {
      data: Array.isArray(response.data) ? (response.data as SuperAdminUser[]) : [],
      meta: parseMeta(response.meta),
    };
  }

  return { data: [] };
}

export async function updateSuperAdminUserRole(
  userId: string,
  role: SuperAdminUserRole,
): Promise<SuperAdminUser> {
  const response = await apiRequest<unknown>(
    `/api/super-admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: { role },
    },
  );

  return unwrap(response as { data: SuperAdminUser } | SuperAdminUser);
}

export async function updateSuperAdminUserStatus(
  userId: string,
  payload: { status?: SuperAdminUserStatus; isActive?: boolean },
): Promise<SuperAdminUser> {
  const response = await apiRequest<unknown>(
    `/api/super-admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  return unwrap(response as { data: SuperAdminUser } | SuperAdminUser);
}
