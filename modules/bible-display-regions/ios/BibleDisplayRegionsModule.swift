import ExpoModulesCore
import UIKit

public final class BibleDisplayRegionsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BibleDisplayRegions")
    View(BibleDisplayRegionsView.self) {
      Events("onRegionsChange")
    }
  }
}

// Use the reserved region API for layout, rather than guessing the fold from
// device names, screen aspect ratios, or hinge angles.
// https://developer.apple.com/videos/play/tech-talks/111463/
final class BibleDisplayRegionsView: ExpoView {
  let onRegionsChange = EventDispatcher()
  private var previous: NSDictionary?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    isUserInteractionEnabled = false
    if #available(iOS 27.1, *) {
      addInteraction(UIHingeInteraction { [weak self] _, _ in
        self?.setNeedsLayout()
      })
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    setNeedsLayout()
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    setNeedsLayout()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    guard window != nil else { return }
    var divisions: [[String: CGFloat]] = []
    if #available(iOS 27.1, *) {
      // Querying during layout participates in UIKit observation tracking.
      divisions = reservedRegions(kind: .division, options: .includeInactive).map {
        ["x": $0.frame.minX, "y": $0.frame.minY,
         "width": $0.frame.width, "height": $0.frame.height]
      }
    }
    let payload: [String: Any] = [
      "width": bounds.width, "height": bounds.height, "divisions": divisions,
      "safeAreaInsets": ["left": safeAreaInsets.left, "right": safeAreaInsets.right]
    ]
    let value = payload as NSDictionary
    guard previous != value else { return }
    previous = value
    onRegionsChange(payload)
  }
}
