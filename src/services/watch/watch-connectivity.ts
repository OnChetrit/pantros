import {requireNativeModule} from 'expo-modules-core';
import {NativeEventEmitter, Platform} from 'react-native';

type NativeWatch = {
  activate: () => void;
  updateSnapshot: (payload: Record<string, unknown>) => void;
  sendToWatch: (payload: Record<string, unknown>) => void;
  resetAuthenticatedData: () => void;
  getPendingRequests: () => Record<string, unknown>[];
  clearPendingRequest: (requestId: string) => void;
};

export type WatchRequest = {
  kind: 'addItem' | 'removeItem' | 'completeItems' | 'refresh' | 'reachability';
  version: number;
  requestId?: string;
  pantryId?: string;
  itemId?: string;
  itemIds?: string[];
};

export type WatchResponse = {
  kind: 'acknowledgement' | 'error';
  requestId?: string;
  message?: string;
  code?: string;
  revision?: string;
  snapshot?: Record<string, unknown>;
  succeeded?: string[];
  failed?: {itemId: string; reason: string}[];
};

function nativeModule() {
  if (Platform.OS !== 'ios') return null;
  return requireNativeModule<NativeWatch>('PantrosWatchConnectivity');
}

export function activateWatchConnectivity() {
  nativeModule()?.activate();
}

export function updateWatchSnapshot(snapshot: Record<string, unknown>) {
  nativeModule()?.updateSnapshot(snapshot);
}

export function sendWatchResponse(response: WatchResponse) {
  nativeModule()?.sendToWatch(response as unknown as Record<string, unknown>);
}

export function clearWatchAuthenticatedData() {
  nativeModule()?.resetAuthenticatedData();
}

export function getPendingWatchRequests() {
  return nativeModule()?.getPendingRequests() ?? [];
}

export function clearPendingWatchRequest(requestId: string) {
  nativeModule()?.clearPendingRequest(requestId);
}

export function subscribeToWatchRequests(listener: (request: WatchRequest) => void) {
  const module = nativeModule();
  if (!module) return () => {};
  const emitter = new NativeEventEmitter(module as never);
  const subscription = emitter.addListener('onWatchRequest', (event: {message: WatchRequest}) => listener(event.message));
  return () => subscription.remove();
}
