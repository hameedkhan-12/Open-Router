// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}

// ─── User ──────────────────────────────────────────────────────────────────────
export type UserRole = "ADMIN" | "USER";

export interface UserDTO {
  id: number;
  email: string;
  role: UserRole;
  credits: number;
  createdAt: string;
}

// ─── API Key ───────────────────────────────────────────────────────────────────
export interface ApiKeyDTO {
  id: number;
  name: string;
  key: string;
  disabled: boolean;
  deleted: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface CreateApiKeyResponse {
  apiKey: ApiKeyDTO;
}

export interface ListApiKeysResponse {
  apiKeys: ApiKeyDTO[];
}

export interface UpdateApiKeyRequest {
  disabled?: boolean;
  deleted?: boolean;
  name?: string;
}

// ─── Metrics ───────────────────────────────────────────────────────────────────
export interface DailyMetric {
  date: string;
  requests: number;
  tokensIn: number;
  tokensOut: number;
}

export interface MetricsSummary {
  totalRequests: number;
  totalTokensIn: number;
  totalTokensOut: number;
  daily: DailyMetric[];
}

export interface MetricsResponse {
  metrics: MetricsSummary;
}

// ─── Completion / Proxy ────────────────────────────────────────────────────────
export interface CompletionMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: CompletionMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: CompletionMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ─── Error ─────────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
  code?: string;
}
