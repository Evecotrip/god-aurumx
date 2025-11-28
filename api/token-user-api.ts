import { User, UserStatus, Wallet, UserHierarchyStats, ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ============================================
// TYPE DEFINITIONS
// ============================================

interface UserProfile {
  id: string;
  clerkId: string;
  uniqueCode: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  status: UserStatus;
  kycStatus: string;
  referralCode: string;
  wallet: Wallet;
  hierarchyStats: UserHierarchyStats;
  createdAt: string;
  updatedAt?: string;
}


interface TokenResponse {
  token: string;
  user: UserProfile;
}

interface CheckUserExistsResponse {
  exists: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Check if user exists in database
 * @param clerkUserId - The Clerk user ID
 * @param token - Optional authentication token
 * @returns Promise with exists status
 */
export async function checkUserExists(
  clerkUserId: string,
  token?: string
): Promise<ApiResponse<CheckUserExistsResponse>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/auth/check-user?clerkUserId=${clerkUserId}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to check user existence",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking user existence:", error);
    return {
      success: false,
      message: "Network error while checking user existence",
    };
  }
}

/**
 * Generate authentication token by exchanging Clerk user ID
 * @param clerkUserId - The Clerk user ID
 * @returns Promise with token and user profile
 */
export async function generateToken(
  clerkUserId: string
): Promise<ApiResponse<TokenResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clerkUserId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to generate token",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating token:", error);
    return {
      success: false,
      message: "Network error while generating token",
    };
  }
}

/**
 * Get user profile using authentication token
 * @param token - The authentication token
 * @returns Promise with user profile
 */
export async function getUserProfile(
  token: string
): Promise<ApiResponse<UserProfile>> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to get user profile",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting user profile:", error);
    return {
      success: false,
      message: "Network error while getting user profile",
    };
  }
}

/**
 * Store authentication token in cookies
 * @param token - The authentication token to store
 */
export function storeTokenInCookies(token: string): void {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return;
  }
  
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; Secure`;
}

/**
 * Get authentication token from cookies
 * @returns The authentication token or null if not found
 */
export function getTokenFromCookies(): string | null {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("auth_token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

/**
 * Remove authentication token from cookies
 */
export function removeTokenFromCookies(): void {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return;
  }
  
  document.cookie = "auth_token=; path=/; max-age=0";
}

/**
 * Complete authentication flow: generate token and store in cookies
 * @param clerkUserId - The Clerk user ID
 * @returns Promise with token response
 */
export async function authenticateAndStoreToken(
  clerkUserId: string
): Promise<ApiResponse<TokenResponse>> {
  const tokenResponse = await generateToken(clerkUserId);
  
  if (tokenResponse.success && tokenResponse.data?.token) {
    storeTokenInCookies(tokenResponse.data.token);
  }
  
  return tokenResponse;
}