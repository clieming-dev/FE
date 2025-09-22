import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { apiClient, UserEntity } from "@/shared/api";

interface ExtendedSession {
  userId?: string;
  backendJWT?: string;
}

export function useUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extendedSession = session as ExtendedSession;
  const userId = useMemo(() => extendedSession?.userId, [extendedSession?.userId]);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "loading" || !userId) return;

      setLoading(true);
      setError(null);

      try {
        const userIdNumber = parseInt(userId);
        const userData = await apiClient.getUserById(userIdNumber);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, status]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!session,
    session,
  };
}
