import ExpoModulesCore
import WatchConnectivity

private final class PantrosWatchSessionDelegate: NSObject, WCSessionDelegate {
  private let pendingKey = "pantros.watch.pending"
  private var emit: (([String: Any]) -> Void)?

  func connect(emit: @escaping ([String: Any]) -> Void) {
    self.emit = emit
    guard WCSession.isSupported() else { return }
    WCSession.default.delegate = self
    WCSession.default.activate()
  }

  func updateSnapshot(_ payload: [String: Any]) {
    guard WCSession.isSupported() else { return }
    do {
      try WCSession.default.updateApplicationContext(["kind": "snapshot", "payload": payload])
    } catch {
      print("Pantros WatchConnectivity snapshot failed: \(error)")
    }
  }

  func sendToWatch(_ payload: [String: Any]) {
    guard WCSession.isSupported() else { return }
    let message: [String: Any] = ["kind": payload["kind"] ?? "acknowledgement", "payload": payload]
    if WCSession.default.isReachable {
      WCSession.default.sendMessage(message, replyHandler: nil) { error in
        print("Pantros WatchConnectivity message failed: \(error)")
      }
    } else {
      do {
        try WCSession.default.updateApplicationContext(message)
      } catch {
        print("Pantros WatchConnectivity context failed: \(error)")
      }
    }
  }

  func reset() {
    UserDefaults.standard.removeObject(forKey: pendingKey)
    sendToWatch(["kind": "error", "code": "signed_out", "message": "Sign in on your iPhone to use Pantros on Apple Watch."])
  }

  func pendingRequests() -> [[String: Any]] {
    guard let data = UserDefaults.standard.data(forKey: pendingKey),
          let values = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
      return []
    }
    return values
  }

  func clearPendingRequest(_ requestId: String) {
    let values = pendingRequests().filter { ($0["requestId"] as? String) != requestId }
    guard let data = try? JSONSerialization.data(withJSONObject: values) else { return }
    UserDefaults.standard.set(data, forKey: pendingKey)
  }

  private func receive(_ message: [String: Any], queued: Bool) {
    if queued {
      var values = pendingRequests()
      let requestId = message["requestId"] as? String
      if requestId == nil || !values.contains(where: { ($0["requestId"] as? String) == requestId }) {
        values.append(message)
        if let data = try? JSONSerialization.data(withJSONObject: values) {
          UserDefaults.standard.set(data, forKey: pendingKey)
        }
      }
    }
    DispatchQueue.main.async { [weak self] in self?.emit?(message) }
  }

  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
    if let error { print("Pantros WatchConnectivity activation failed: \(error)") }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    emit?(["kind": "reachability", "reachable": session.isReachable])
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    receive(message, queued: false)
  }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    receive(userInfo, queued: true)
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { session.activate() }
}

public final class PantrosWatchConnectivityModule: Module {
  private let delegate = PantrosWatchSessionDelegate()

  public func definition() -> ModuleDefinition {
    Name("PantrosWatchConnectivity")
    Events("onWatchRequest")

    OnCreate {
      self.delegate.connect { [weak self] message in
        self?.sendEvent("onWatchRequest", ["message": message])
      }
    }

    Function("activate") { self.delegate.connect { [weak self] message in
      self?.sendEvent("onWatchRequest", ["message": message])
    } }

    Function("updateSnapshot") { (payload: [String: Any]) in
      self.delegate.updateSnapshot(payload)
    }

    Function("sendToWatch") { (payload: [String: Any]) in
      self.delegate.sendToWatch(payload)
    }

    Function("resetAuthenticatedData") {
      self.delegate.reset()
    }

    Function("getPendingRequests") { self.delegate.pendingRequests() }

    Function("clearPendingRequest") { (requestId: String) in
      self.delegate.clearPendingRequest(requestId)
    }
  }
}
