"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useState, useRef, useCallback } from "react";
import { ApiError } from "@/lib/api-error";

function useAuthErrorHandler() {
  const signingOut = useRef(false);

  return useCallback((error: unknown) => {
    if (signingOut.current) return;
    if (error instanceof ApiError && error.status === 401) {
      signingOut.current = true;
      signOut({ callbackUrl: "/login" });
    }
  }, []);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const handleAuthError = useAuthErrorHandler();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status === 401)
                return false;
              return failureCount < 3;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => handleAuthError(error),
        }),
        mutationCache: new MutationCache({
          onError: (error) => handleAuthError(error),
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
