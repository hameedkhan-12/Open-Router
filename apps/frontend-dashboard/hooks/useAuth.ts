import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  type AuthResponse,
  type LoginRequest,
  type SignupRequest,
  type UserDTO,
} from "@repo/shared";
import { apiClient } from "lib/apiClient";

const getStoredUser = (): UserDTO | null => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};
export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserDTO | null>(getStoredUser);

  const { data: meData } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        user: UserDTO;
      }>("/auth/me");
      return data.user;
    },
    enabled: !!localStorage.getItem("token"),
    staleTime: 5 * 60_000,
  });

  const currentUser = meData ?? user;

  const handleAuthSuccess = useCallback(
    (data: AuthResponse) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["auth", "me"], data.user);
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
    },
    [queryClient],
  );

  const loginMutation = useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/login", body);
      return data;
    },
    onSuccess: handleAuthSuccess,
  });
  const signupMutation = useMutation({
    mutationFn: async (body: SignupRequest) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/signup", body);
      return data;
    },
    onSuccess: handleAuthSuccess,
  });

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    queryClient.clear()
    window.location.href = "/login";
  }, [queryClient]);

  return {
    user: currentUser,
    isAuthenticated: !!localStorage.getItem("token") && !!currentUser,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  }
}
