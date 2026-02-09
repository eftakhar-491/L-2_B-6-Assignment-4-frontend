import { apiRequest } from "./http";

const PROFILE_ENDPOINT = "/api/user/profile";
const ADDRESS_ENDPOINT = "/api/user/addresses";
const AUTH_BASE_ENDPOINT = "/api/auth";

export interface UserProfileStats {
  totalOrders?: number;
  loyaltyPoints?: number;
  favoriteVendors?: number;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
  membershipTier?: string | null;
  defaultAddress?: string | null;
  stats?: UserProfileStats;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string | null;
}

export interface AddressCreatePayload {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  instructions?: string;
  isDefault?: boolean;
  contactPhone?: string;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface UserAddress {
  id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  instructions?: string;
  isDefault?: boolean;
  contactPhone?: string;
  fullAddress?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  createdAt?: string;
}

interface BackendAddress {
  id?: string;
  label?: string | null;
  fullAddress?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
  phone?: string | null;
  createdAt?: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  return toStringValue(value);
};

const extractList = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  const source = asRecord(payload);
  if (Array.isArray(source.data)) return source.data;
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.addresses)) return source.addresses;
  return [];
};

const unwrapData = <T>(payload: unknown): T => {
  const source = asRecord(payload);
  if ("data" in source && source.data !== undefined) {
    return source.data as T;
  }
  if ("result" in source && source.result !== undefined) {
    return source.result as T;
  }
  return payload as T;
};

const parseStateAndPostal = (raw: string) => {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { state: "", postalCode: "" };
  if (parts.length === 1) return { state: parts[0], postalCode: "" };
  return {
    state: parts.slice(0, -1).join(" "),
    postalCode: parts[parts.length - 1],
  };
};

const parseFullAddress = (fullAddress: string) => {
  const segments = fullAddress
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return { line1: "", line2: "", city: "", state: "", postalCode: "" };
  }

  if (segments.length === 1) {
    return {
      line1: segments[0],
      line2: "",
      city: "",
      state: "",
      postalCode: "",
    };
  }

  if (segments.length === 2) {
    const statePostal = parseStateAndPostal(segments[1]);
    return {
      line1: segments[0],
      line2: "",
      city: "",
      state: statePostal.state,
      postalCode: statePostal.postalCode,
    };
  }

  if (segments.length === 3) {
    const statePostal = parseStateAndPostal(segments[2]);
    return {
      line1: segments[0],
      line2: "",
      city: segments[1],
      state: statePostal.state,
      postalCode: statePostal.postalCode,
    };
  }

  const line1 = segments[0];
  const line2 = segments[1];
  const city = segments[2];
  const trailing = segments.slice(3).join(" ");
  const statePostal = parseStateAndPostal(trailing);

  return {
    line1,
    line2,
    city,
    state: statePostal.state,
    postalCode: statePostal.postalCode,
  };
};

const buildFullAddress = (payload: AddressCreatePayload) => {
  const statePostal = `${payload.state ?? ""} ${payload.postalCode ?? ""}`
    .trim()
    .replace(/\s+/g, " ");

  return [payload.line1, payload.line2, payload.city, statePostal]
    .map((chunk) => chunk?.trim())
    .filter(Boolean)
    .join(", ");
};

const normalizeProfile = (payload?: Partial<UserProfile>): UserProfile => {
  const source = asRecord(payload);

  return {
    id: toNullableString(payload?.id ?? source.id) ?? undefined,
    name: toStringValue(payload?.name ?? source.name, ""),
    email: toStringValue(payload?.email ?? source.email, ""),
    phone: toStringValue(payload?.phone ?? source.phone, ""),
    bio: toStringValue(payload?.bio ?? source.bio ?? source.about, ""),
    avatarUrl: toNullableString(payload?.avatarUrl ?? source.avatarUrl ?? source.image),
    membershipTier: toNullableString(
      payload?.membershipTier ?? source.membershipTier ?? source.tier,
    ),
    defaultAddress: toNullableString(
      payload?.defaultAddress ?? source.defaultAddress ?? source.address,
    ),
    stats: {
      totalOrders: Number(
        payload?.stats?.totalOrders ??
          source.totalOrders ??
          source.ordersCount ??
          0,
      ),
      loyaltyPoints: Number(
        payload?.stats?.loyaltyPoints ?? source.loyaltyPoints ?? source.loyalty ?? 0,
      ),
      favoriteVendors: Number(
        payload?.stats?.favoriteVendors ??
          source.favoriteVendors ??
          source.favorites ??
          0,
      ),
    },
  };
};

const normalizeAddress = (address?: Partial<UserAddress> | BackendAddress): UserAddress => {
  const source = asRecord(address);
  const fullAddress = toStringValue(
    (address as BackendAddress | undefined)?.fullAddress ?? source.fullAddress,
    "",
  );
  const parsed = parseFullAddress(fullAddress);

  return {
    id: toNullableString((address as BackendAddress | undefined)?.id ?? source.id) ?? undefined,
    label: toStringValue((address as BackendAddress | undefined)?.label ?? source.label, "Home"),
    line1: toStringValue((address as UserAddress | undefined)?.line1 ?? source.line1, parsed.line1),
    line2: toStringValue((address as UserAddress | undefined)?.line2 ?? source.line2, parsed.line2),
    city: toStringValue((address as UserAddress | undefined)?.city ?? source.city, parsed.city),
    state: toStringValue((address as UserAddress | undefined)?.state ?? source.state, parsed.state),
    postalCode: toStringValue(
      (address as UserAddress | undefined)?.postalCode ?? source.postalCode,
      parsed.postalCode,
    ),
    country: toStringValue((address as UserAddress | undefined)?.country ?? source.country, ""),
    instructions: toStringValue(
      (address as UserAddress | undefined)?.instructions ?? source.instructions,
      "",
    ),
    isDefault: Boolean(
      (address as UserAddress | undefined)?.isDefault ?? source.isDefault ?? source.default,
    ),
    contactPhone: toNullableString(
      (address as UserAddress | undefined)?.contactPhone ??
        (address as BackendAddress | undefined)?.phone ??
        source.contactPhone ??
        source.phone,
    ) ?? undefined,
    fullAddress,
    lat:
      (address as BackendAddress | undefined)?.lat ??
      (source.lat as number | string | null | undefined) ??
      null,
    lng:
      (address as BackendAddress | undefined)?.lng ??
      (source.lng as number | string | null | undefined) ??
      null,
    createdAt: toNullableString(
      (address as BackendAddress | undefined)?.createdAt ?? source.createdAt,
    ) ?? undefined,
  };
};

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await apiRequest<unknown>(PROFILE_ENDPOINT, {
    method: "GET",
  });

  return normalizeProfile(unwrapData<UserProfile>(response));
}

export async function updateUserProfile(
  payload: ProfileUpdatePayload,
): Promise<UserProfile> {
  const backendPayload: Record<string, unknown> = {};

  if (payload.name !== undefined) backendPayload.name = payload.name;
  if (payload.phone !== undefined) backendPayload.phone = payload.phone;
  if (payload.avatarUrl !== undefined) backendPayload.image = payload.avatarUrl;

  const response = await apiRequest<unknown>(PROFILE_ENDPOINT, {
    method: "PATCH",
    body: backendPayload,
  });

  return normalizeProfile(unwrapData<UserProfile>(response));
}

export async function fetchUserAddresses(): Promise<UserAddress[]> {
  const response = await apiRequest<unknown>(ADDRESS_ENDPOINT, {
    method: "GET",
  });

  return extractList(response).map((item) =>
    normalizeAddress(item as BackendAddress),
  );
}

export async function createUserAddress(
  payload: AddressCreatePayload,
): Promise<UserAddress> {
  const backendPayload = {
    label: payload.label,
    fullAddress: buildFullAddress(payload),
    phone: payload.contactPhone,
    lat: payload.lat,
    lng: payload.lng,
  };

  const response = await apiRequest<unknown>(ADDRESS_ENDPOINT, {
    method: "POST",
    body: backendPayload,
  });

  return normalizeAddress(unwrapData<BackendAddress>(response));
}

export interface AuthActionResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  token?: string | null;
  user?: unknown;
}

export interface RequestPasswordResetPayload {
  email: string;
  redirectTo?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export interface SendVerificationEmailPayload {
  email: string;
  callbackURL?: string;
}

export async function requestPasswordReset(
  payload: RequestPasswordResetPayload,
): Promise<AuthActionResponse> {
  return apiRequest<AuthActionResponse>(
    `${AUTH_BASE_ENDPOINT}/request-password-reset`,
    {
      method: "POST",
      skipAuth: true,
      body: payload,
    },
  );
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<AuthActionResponse> {
  return apiRequest<AuthActionResponse>(`${AUTH_BASE_ENDPOINT}/reset-password`, {
    method: "POST",
    skipAuth: true,
    body: payload,
  });
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<AuthActionResponse> {
  return apiRequest<AuthActionResponse>(`${AUTH_BASE_ENDPOINT}/change-password`, {
    method: "POST",
    body: payload,
  });
}

export async function sendVerificationEmail(
  payload: SendVerificationEmailPayload,
): Promise<AuthActionResponse> {
  return apiRequest<AuthActionResponse>(
    `${AUTH_BASE_ENDPOINT}/send-verification-email`,
    {
      method: "POST",
      body: payload,
    },
  );
}
