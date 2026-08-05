export type PantrosWatchConnectivityNative = {
  activate: () => void;
  updateSnapshot: (payload: Record<string, unknown>) => void;
  sendToWatch: (payload: Record<string, unknown>) => void;
  resetAuthenticatedData: () => void;
  getPendingRequests: () => Record<string, unknown>[];
  clearPendingRequest: (requestId: string) => void;
};
