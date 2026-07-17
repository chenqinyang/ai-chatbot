export type Cleanup = () => void;

export interface CopilotBridge {
  registerContext(input: {
    description: string;
    value: unknown;
    agentIds?: string[];
  }): Cleanup;

  registerTool(input: {
    name: string;
    description?: string;
    parameters?: unknown;
    agentId?: string;
    handler: (
      args: Record<string, unknown>,
      context?: {
        signal?: AbortSignal;
        agent?: unknown;
      },
    ) => Promise<unknown>;
  }): Cleanup;
}
