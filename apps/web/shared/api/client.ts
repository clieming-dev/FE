import { getSession } from "next-auth/react";
import { UserEntity, UserInsertDto, AuthTokenResponse } from "./types";

export class ApiClient {
  private baseURL: string;

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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 사용자 관련 API
  async getUserById(id: number): Promise<UserEntity> {
    return this.request<UserEntity>(`/api/v1/user/${id}`);
  }

  async createUser(userData: UserInsertDto): Promise<number> {
    return this.request<number>("/api/v1/user/insert", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // 인증 관련 API
  async getAuthToken(sub: string = "guest"): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>(`/auth/token?sub=${sub}`);
  }
}

export const apiClient = new ApiClient();
