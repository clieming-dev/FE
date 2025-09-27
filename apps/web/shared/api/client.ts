import { getSession } from "next-auth/react";
import { UserEntity, UserInsertDto, AuthTokenResponse } from "./types";

export class ApiClient {
  private baseURL: string;
  private callCounts: Record<string, number> = {};

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const token = (session as { backendJWT?: string })?.backendJWT;

    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseURL}${endpoint}`;

    const method = options.method || "GET";
    const key = `${method} ${endpoint}`;
    this.callCounts[key] = (this.callCounts[key] || 0) + 1;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();

    if (data.status && data.status !== 200) {
      throw new Error(
        `❌ API 비즈니스 로직 실패: ${data.status} - ${data.error || "Unknown error"}`,
      );
    }

    return data;
  }

  async getUserById(id: number, token?: string): Promise<UserEntity> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request<UserEntity>(`/api/v1/user/${id}`, {
      headers,
    });
  }

  async getUserByUserId(userId: string, token?: string): Promise<UserEntity | null> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await this.request<any>(`/api/v1/user/name/${userId}`, {
        headers,
      });

      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: UserInsertDto): Promise<number> {
    const authResponse = await this.getAuthToken(userData.userId);

    const response = await this.request<any>("/api/v1/user/insert", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        Authorization: `Bearer ${authResponse.data.access_token}`,
      },
    });

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(`사용자 생성 실패: ${response.error || "Unknown error"}`);
    }
  }

  async getAuthToken(sub: string = "guest"): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>(`/auth/token?sub=${sub}`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();
