import ExpoModulesCore
import Foundation
import WidgetKit

public final class BibleWidgetAppearanceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BibleWidgetAppearance")

    AsyncFunction("setAppearance") { (json: String) in
      let data = Data(json.utf8)
      let appearance = try JSONDecoder().decode(SharedWidgetAppearance.self, from: data)
      guard appearance.isValid, let url = SharedWidgetAppearance.fileURL() else {
        throw NSError(domain: "BibleWidgetAppearance", code: 1,
                      userInfo: [NSLocalizedDescriptionKey: "Widget appearance or App Group configuration is invalid"])
      }
      // Avoid redundant reloads on launch/foreground. Atomic writes ensure the
      // widget cannot read a partial file or race an asynchronous preferences flush.
      if (try? Data(contentsOf: url)) == data { return }
      try data.write(to: url, options: .atomic)
      WidgetCenter.shared.reloadTimelines(ofKind: "DailyVerseWidget")
    }
  }
}
