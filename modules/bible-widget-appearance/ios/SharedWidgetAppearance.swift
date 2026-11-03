import Foundation

struct SharedWidgetAppearance: Codable, Equatable {
  enum Mode: String, Codable { case system, light, dark }

  struct Colors: Codable, Equatable {
    let background: String
    let foreground: String

    var isValid: Bool {
      [background, foreground].allSatisfy {
        $0.utf8.count == 7 && $0.hasPrefix("#") &&
          $0.dropFirst().allSatisfy { "0123456789abcdefABCDEF".contains($0) }
      }
    }
  }

  let themeId: String
  let appearance: Mode
  let light: Colors
  let dark: Colors

  var isValid: Bool { !themeId.isEmpty && light.isValid && dark.isValid }

  func colors(isDark: Bool) -> Colors {
    switch appearance {
    case .light: return light
    case .dark: return dark
    case .system: return isDark ? dark : light
    }
  }

  static func fileURL() -> URL? {
    guard let group = Bundle.main.object(forInfoDictionaryKey: "BibleWidgetAppGroupIdentifier") as? String,
          let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) else { return nil }
    return container.appendingPathComponent("widget-appearance.json")
  }

  static func load() -> SharedWidgetAppearance? {
    guard let url = fileURL(), let data = try? Data(contentsOf: url),
          let value = try? JSONDecoder().decode(Self.self, from: data), value.isValid else { return nil }
    return value
  }
}
