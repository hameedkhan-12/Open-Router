import { type MetricsResponse } from "@repo/shared";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "lib/apiClient";

export function useMetrics(apiKeyId: number, days = 30){
    return useQuery({
        queryKey: ["metrics", apiKeyId, days],
        queryFn: async() => {
            const { data } = await apiClient.get<MetricsResponse>(`/keys/${apiKeyId}/metrics?days=${days}`);
            return data.metrics;
        },
        enabled: !!apiKeyId
    })
}

export function useAggregateMetrics(days = 30){
    return useQuery({
        queryKey: ["metrics", "aggregate", days],
        queryFn: async() => {
            const { data } =  await apiClient.get<MetricsResponse>(`/keys/metrics/aggregate?days=${days}`);
            return data.metrics;
        }
    })
}