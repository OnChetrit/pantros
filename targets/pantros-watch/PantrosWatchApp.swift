import SwiftUI

@main
struct PantrosWatchApp: App {
  @StateObject private var store = PantrosWatchStore()

  var body: some Scene {
    WindowGroup {
      PantrosWatchContentView(store: store)
    }
  }
}
