import Foundation

struct PantrosWatchSnapshotItem: Codable, Identifiable, Hashable {
  let id: String
  let name: String
  let quantity: Int
  let cartId: String?
  let isSelected: Bool
}

struct PantrosWatchSnapshot: Codable {
  let version: Int
  let pantryId: String
  let pantryName: String
  let revision: String
  let items: [PantrosWatchSnapshotItem]
  let selectedItemIds: [String]
}

struct PantrosWatchMutation: Codable, Hashable {
  let kind: String
  let version: Int
  let requestId: String
  let pantryId: String
  let itemId: String?
  let itemIds: [String]?
}

func pantrosJSONDictionary<T: Encodable>(_ value: T) -> [String: Any]? {
  guard let data = try? JSONEncoder().encode(value),
        let object = try? JSONSerialization.jsonObject(with: data),
        let dictionary = object as? [String: Any] else {
    return nil
  }
  return dictionary
}

func pantrosJSONData(_ dictionary: [String: Any]) -> Data? {
  try? JSONSerialization.data(withJSONObject: dictionary)
}
