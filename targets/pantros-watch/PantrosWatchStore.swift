import Foundation
import SwiftUI
import WatchConnectivity

enum PantrosWatchResultKind {
  case success
  case partial
  case pending
}

@MainActor
final class PantrosWatchStore: ObservableObject {
  @Published private(set) var snapshot: PantrosWatchSnapshot?
  @Published private(set) var selectedItemIds = Set<String>()
  @Published private(set) var pendingMutations = Set<String>()
  @Published private(set) var lastError: String?
  @Published private(set) var lastResult: String?
  @Published private(set) var resultKind: PantrosWatchResultKind?
  @Published private(set) var isReachable = false
  @Published private(set) var lastSync: Date?

  private let snapshotKey = "pantros.watch.snapshot"
  private let selectionKey = "pantros.watch.selection"
  private let pendingKey = "pantros.watch.mutations"
  private let defaults = UserDefaults.standard
  private let sessionDelegate = PantrosWatchSessionDelegate()
  private var mutations: [PantrosWatchMutation] = []

  init() {
    restore()
    sessionDelegate.store = self
    WCSession.default.delegate = sessionDelegate
    WCSession.default.activate()
    isReachable = WCSession.default.isReachable
  }

  var cartItems: [PantrosWatchSnapshotItem] {
    snapshot?.items ?? []
  }

  var availableItems: [PantrosWatchSnapshotItem] {
    cartItems.filter { !selectedItemIds.contains($0.id) }
  }

  var selectedItems: [PantrosWatchSnapshotItem] {
    cartItems.filter { selectedItemIds.contains($0.id) }
  }

  func updateReachability(_ value: Bool) { isReachable = value }

  func receiveSessionError(_ error: Error) { lastError = error.localizedDescription }

  func isItemPending(_ itemId: String) -> Bool {
    mutations.contains { mutation in
      mutation.itemId == itemId || mutation.itemIds?.contains(itemId) == true
    }
  }

  func toggle(_ item: PantrosWatchSnapshotItem) {
    guard let snapshot else { return }
    let isSelected = selectedItemIds.contains(item.id)
    if isSelected {
      selectedItemIds.remove(item.id)
    } else {
      selectedItemIds.insert(item.id)
    }
    persistSelection()

    let mutation = PantrosWatchMutation(
      kind: isSelected ? "removeItem" : "addItem",
      version: 1,
      requestId: UUID().uuidString,
      pantryId: snapshot.pantryId,
      itemId: item.id,
      itemIds: nil
    )
    enqueue(mutation)
  }

  func remove(_ item: PantrosWatchSnapshotItem) {
    guard selectedItemIds.remove(item.id) != nil else { return }
    persistSelection()
    guard let snapshot else { return }
    enqueue(PantrosWatchMutation(kind: "removeItem", version: 1, requestId: UUID().uuidString, pantryId: snapshot.pantryId, itemId: item.id, itemIds: nil))
  }

  func clearAll() {
    selectedItems.forEach(remove)
  }

  func completeSelected() {
    guard let snapshot, !selectedItemIds.isEmpty else { return }
    let ids = Array(selectedItemIds)
    enqueue(PantrosWatchMutation(kind: "completeItems", version: 1, requestId: UUID().uuidString, pantryId: snapshot.pantryId, itemId: nil, itemIds: ids))
    lastResult = "Completion queued for the iPhone."
    resultKind = .pending
  }

  func dismissResult() { resultKind = nil }

  func requestRefresh() {
    guard let snapshot else {
      send(["kind": "refresh", "version": 1, "requestId": UUID().uuidString])
      return
    }
    send(["kind": "refresh", "version": 1, "requestId": UUID().uuidString, "pantryId": snapshot.pantryId])
  }

  func receive(_ message: [String: Any]) {
    let kind = message["kind"] as? String ?? ""
    let payload = message["payload"] as? [String: Any] ?? message

    switch kind {
    case "snapshot": receiveSnapshot(payload)
    case "acknowledgement": receiveAcknowledgement(payload)
    case "error":
      lastError = payload["message"] as? String ?? "The iPhone could not complete that action."
      if payload["code"] as? String == "signed_out" { clearAuthenticatedData() }
      if let requestId = payload["requestId"] as? String,
         ["pantry_changed", "unsupported_version"].contains(payload["code"] as? String) {
        mutations.removeAll { $0.requestId == requestId }
        pendingMutations.remove(requestId)
        persistMutations()
      }
    case "reachability":
      isReachable = payload["reachable"] as? Bool ?? isReachable
    default: break
    }
  }

  private func receiveSnapshot(_ payload: [String: Any]) {
    guard let data = pantrosJSONData(payload), let next = try? JSONDecoder().decode(PantrosWatchSnapshot.self, from: data), next.version == 1 else {
      lastError = "This Pantros version sent an unreadable watch snapshot."
      return
    }
    snapshot = next
    selectedItemIds = Set(next.selectedItemIds)
    for mutation in mutations where mutation.pantryId == next.pantryId {
      applyOptimisticSelection(mutation)
    }
    selectedItemIds = selectedItemIds.intersection(Set(next.items.map(\.id)))
    lastSync = Date()
    lastError = nil
    persistSnapshot()
    persistSelection()
  }

  private func receiveAcknowledgement(_ payload: [String: Any]) {
    if let requestId = payload["requestId"] as? String {
      mutations.removeAll { $0.requestId == requestId }
      pendingMutations.remove(requestId)
      persistMutations()
    }
    if let succeeded = payload["succeeded"] as? [String] {
      selectedItemIds.subtract(succeeded)
      persistSelection()
    }
    if payload["succeeded"] is [String] || payload["failed"] is [[String: Any]] {
      resultKind = ((payload["failed"] as? [[String: Any]])?.isEmpty ?? true) ? .success : .partial
    }
    lastResult = (payload["message"] as? String) ?? "Pantros synced your shopping cart."
    lastError = nil
    if let snapshot = payload["snapshot"] as? [String: Any] { receiveSnapshot(snapshot) }
  }

  private func enqueue(_ mutation: PantrosWatchMutation) {
    mutations.append(mutation)
    pendingMutations.insert(mutation.requestId)
    persistMutations()
    send(pantrosJSONDictionary(mutation) ?? [:])
  }

  private func send(_ message: [String: Any]) {
    guard WCSession.isSupported() else {
      lastError = "Apple Watch is not paired with this iPhone."
      return
    }
    let session = WCSession.default
    isReachable = session.isReachable
    if session.isReachable {
      session.sendMessage(message, replyHandler: nil) { [weak self] error in
        Task { @MainActor in self?.lastError = error.localizedDescription }
      }
    } else {
      session.transferUserInfo(message)
    }
  }

  private func applyOptimisticSelection(_ mutation: PantrosWatchMutation) {
    if mutation.kind == "addItem", let itemId = mutation.itemId { selectedItemIds.insert(itemId) }
    if mutation.kind == "removeItem", let itemId = mutation.itemId { selectedItemIds.remove(itemId) }
  }

  private func restore() {
    if let data = defaults.data(forKey: snapshotKey) { snapshot = try? JSONDecoder().decode(PantrosWatchSnapshot.self, from: data) }
    selectedItemIds = Set(defaults.stringArray(forKey: selectionKey) ?? snapshot?.selectedItemIds ?? [])
    if let data = defaults.data(forKey: pendingKey) { mutations = (try? JSONDecoder().decode([PantrosWatchMutation].self, from: data)) ?? [] }
    pendingMutations = Set(mutations.map(\.requestId))
    if mutations.contains(where: { $0.kind == "completeItems" }) { resultKind = .pending }
  }

  private func persistSnapshot() {
    if let snapshot, let data = try? JSONEncoder().encode(snapshot) { defaults.set(data, forKey: snapshotKey) }
  }

  private func persistSelection() { defaults.set(Array(selectedItemIds), forKey: selectionKey) }

  private func persistMutations() {
    if let data = try? JSONEncoder().encode(mutations) { defaults.set(data, forKey: pendingKey) }
  }

  private func clearAuthenticatedData() {
    snapshot = nil
    selectedItemIds.removeAll()
    mutations.removeAll()
    pendingMutations.removeAll()
    defaults.removeObject(forKey: snapshotKey)
    defaults.removeObject(forKey: selectionKey)
    defaults.removeObject(forKey: pendingKey)
  }
}

private final class PantrosWatchSessionDelegate: NSObject, WCSessionDelegate {
  weak var store: PantrosWatchStore?

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    Task { @MainActor [weak self] in
      self?.store?.updateReachability(session.isReachable)
      if let error { self?.store?.receiveSessionError(error) }
      self?.store?.requestRefresh()
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    Task { @MainActor [weak self] in self?.store?.updateReachability(session.isReachable) }
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    Task { @MainActor [weak self] in self?.store?.receive(applicationContext) }
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    Task { @MainActor [weak self] in self?.store?.receive(message) }
  }

  #if os(iOS)
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { session.activate() }
  #endif
}
