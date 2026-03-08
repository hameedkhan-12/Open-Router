import { type CompletionResponse, type CompletionRequest } from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const BASE_URL = "http://localhost:3001";

export function useProxyRequests(apiKey: string) {
  return useMutation({
    mutationFn: async (body: CompletionRequest) => {
      const { data } = await axios.post<CompletionResponse>(
        `${BASE_URL}/completion`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
      return data;
    },
  });
}
