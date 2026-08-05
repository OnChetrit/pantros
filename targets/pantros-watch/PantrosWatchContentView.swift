import SwiftUI

struct PantrosWatchContentView: View {
  @ObservedObject var store: PantrosWatchStore

  var body: some View {
    NavigationStack {
      if let snapshot = store.snapshot {
        List {
          if !store.availableItems.isEmpty {
            Section {
              ForEach(store.availableItems) { item in
                HStack {
                  Text(item.name).lineLimit(2)
                  Spacer(minLength: 8)
                  Text("\(item.quantity)")
                    .foregroundStyle(.secondary)
                    .font(.body.monospacedDigit())
                }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .background(Color.primary.opacity(0.001))
                .contentShape(Rectangle())
                .onTapGesture {
                  store.toggle(item)
                }
              }
            } header: {
              Text(snapshot.pantryName)
            }
          } else if snapshot.items.isEmpty {
            Text("Your Pantros cart is empty.").foregroundStyle(.secondary)
          } else {
            Text("All cart items are selected.").foregroundStyle(.secondary)
          }
        }
        .listStyle(.automatic)
        .navigationTitle("Cart")
        .toolbar {
          ToolbarItem(placement: .topBarTrailing) {
            NavigationLink(destination: PantrosWatchReviewView(store: store)) {
              ZStack(alignment: .topTrailing) {
                Image(systemName: "cart")

                if store.selectedItems.count > 0 {
                  Text("\(store.selectedItems.count)")
                    .font(.caption2.weight(.bold).monospacedDigit())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 4)
                    .frame(minWidth: 16, minHeight: 16)
                    .background(Capsule().fill(.red))
                    .offset(x: 8, y: -8)
                }
              }
              .accessibilityElement(children: .combine)
              .accessibilityLabel("Shopping cart")
              .accessibilityValue("\(store.selectedItems.count) items")
            }
            .disabled(store.selectedItems.isEmpty)
          }
        }
      } else {
        VStack(spacing: 8) {
          ProgressView()
          Text(store.lastError ?? "Waiting for Pantros on your iPhone…").multilineTextAlignment(.center).font(.caption)
          Button("Refresh") { store.requestRefresh() }
        }
        .padding()
        .navigationTitle("Pantros")
      }
    }
  }
}

struct PantrosWatchReviewView: View {
  @ObservedObject var store: PantrosWatchStore

  var body: some View {
    List {
      Section {
        ForEach(store.selectedItems) { item in
          HStack {
            Text(item.name).lineLimit(2)
            Spacer()
            Text("\(item.quantity)")
              .foregroundStyle(.secondary)
              .font(.body.monospacedDigit())
            Button { store.remove(item) } label: { Image(systemName: "minus.circle") }
              .buttonStyle(.borderless)
          }
        }
      } header: {
        Text("\(store.selectedItems.count) selected")
      }

      if store.selectedItems.isEmpty {
        Text("Tap items in your Pantros cart to add them here.").foregroundStyle(.secondary)
      }

      Section {
        Button("Complete selected") { store.completeSelected() }
          .disabled(store.selectedItems.isEmpty)
        Button("Clear all", role: .destructive) { store.clearAll() }
          .disabled(store.selectedItems.isEmpty)
      }

      if store.resultKind != nil {
        Section {
          NavigationLink("View completion result", destination: PantrosWatchResultView(store: store))
        }
      }

      if let error = store.lastError {
        Text(error).foregroundStyle(.red).font(.caption)
      }
    }
    .listStyle(.automatic)
    .navigationTitle("Shopping cart")
  }
}

struct PantrosWatchResultView: View {
  @ObservedObject var store: PantrosWatchStore

  var body: some View {
    VStack(spacing: 10) {
      Image(systemName: iconName)
        .font(.title2)
        .foregroundStyle(iconColor)
      Text(title).font(.headline)
      Text(store.lastResult ?? message)
        .multilineTextAlignment(.center)
        .font(.caption)
        .foregroundStyle(.secondary)
      Button("Done") { store.dismissResult() }
    }
    .padding()
    .navigationTitle("Completion")
  }

  private var title: String {
    switch store.resultKind {
    case .success: return "Items completed"
    case .partial: return "Some items need review"
    case .pending: return "Waiting for iPhone"
    case nil: return "Completion"
    }
  }

  private var message: String {
    switch store.resultKind {
    case .success: return "The selected items were moved back to your pantry."
    case .partial: return "Unavailable items remain selected so you can retry them."
    case .pending: return "Your iPhone will finish this when it is available."
    case nil: return ""
    }
  }

  private var iconName: String {
    switch store.resultKind {
    case .success: return "checkmark.circle.fill"
    case .partial: return "exclamationmark.triangle.fill"
    case .pending: return "arrow.triangle.2.circlepath"
    case nil: return "cart"
    }
  }

  private var iconColor: Color {
    switch store.resultKind {
    case .success: return .green
    case .partial: return .orange
    case .pending: return .blue
    case nil: return .secondary
    }
  }
}
