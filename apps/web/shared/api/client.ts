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
    const url = `${this.baseURL}${endpoint}`;

    console.log("API Request Debug:", {
      url,
      method: options.method || "GET",
      headers,
      baseURL: this.baseURL,
      endpoint,
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log("API Response Debug:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorBody: errorText,
      });
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json();
  }

  // 사용자 관련 API
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
    // userId로 사용자 조회 (1~100번 순차 조회 - 임시 구현)
    // TODO: 백엔드에 userId로 직접 조회하는 API 추가 요청 필요
    for (let i = 1; i <= 100; i++) {
      try {
        const user = await this.getUserById(i, token);
        if (user.userId === userId) {
          return user;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async createUser(userData: UserInsertDto): Promise<number> {
    const authResponse = await this.getAuthToken(userData.userId);

    return this.request<number>("/api/v1/user/insert", {
      method: "POST",
      body: JSON.stringify(userData),
      headers: {
        Authorization: `Bearer ${authResponse.access_token}`,
      },
    });
  }

  // 인증 관련 API
  async getAuthToken(sub: string = "guest"): Promise<AuthTokenResponse> {
    return this.request<AuthTokenResponse>(`/auth/token?sub=${sub}`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();
