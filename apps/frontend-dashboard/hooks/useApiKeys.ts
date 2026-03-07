import {type CreateApiKeyResponse, type ApiKeyDTO, type CreateApiKeyRequest, type ListApiKeysResponse, type UpdateApiKeyRequest } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "lib/apiClient";

export function useApiKeys(){
    return useQuery({
        queryKey: ["apiKeys"],
        queryFn: async() => {
            const { data } = await apiClient.get<ListApiKeysResponse>("/keys");
            return data.apiKeys;
        }
    })
}

export function useCreateApiKey(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async(body: CreateApiKeyRequest) => {
            const { data } = await apiClient.get<CreateApiKeyResponse>("/keys", { params: body });
            return data.apiKey;
        },
        onSuccess: (newKey: ApiKeyDTO) => {
            queryClient.setQueryData<ApiKeyDTO[]>(["apiKeys"], (old = []) => [newKey, ...old]);
        }
    })
}

export function useUpdateApiKey(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async({id, updates}: { id: number; updates: UpdateApiKeyRequest}) => {
            const { data } = await apiClient.patch<{apiKey: ApiKeyDTO}>(`/keys/${id}`, updates);
            return data.apiKey;
        },
        onSuccess: (updatedKey: ApiKeyDTO) => {
            queryClient.setQueryData<ApiKeyDTO[]>(["apiKeys"], (old = []) => old.map(key => key.id === updatedKey.id ? updatedKey : key));
        }
    })
}

export function useDeleteApiKey(){
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async(id: number) => {
            await apiClient.delete(`/keys/${id}`)
            return id;
        },
        onSuccess: (id: number) => {
            queryClient.setQueryData<ApiKeyDTO[]>(["apiKeys"], (old = []) => old.filter(key => key.id !== id));
        }
    })
}