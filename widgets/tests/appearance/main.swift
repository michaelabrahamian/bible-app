import Foundation

let light = SharedWidgetAppearance.Colors(background: "#F3F6F8", foreground: "#253B4C")
let dark = SharedWidgetAppearance.Colors(background: "#141E28", foreground: "#E5EDF5")
for mode in [SharedWidgetAppearance.Mode.system, .light, .dark] {
  let value = SharedWidgetAppearance(themeId: "ocean", appearance: mode, light: light, dark: dark)
  precondition(value.isValid)
  precondition(value.colors(isDark: false) == (mode == .dark ? dark : light))
  precondition(value.colors(isDark: true) == (mode == .light ? light : dark))
  let data = try JSONEncoder().encode(value)
  let restored = try JSONDecoder().decode(SharedWidgetAppearance.self, from: data)
  precondition(restored == value)
}
for bad in ["#123456\n", "#ABCDEG", "FFFFFF", "#12345", "#+12345"] {
  precondition(!SharedWidgetAppearance.Colors(background: bad, foreground: "#FFFFFF").isValid)
}
precondition(!SharedWidgetAppearance(themeId: "", appearance: .system, light: light, dark: dark).isValid)
print("Shared widget appearance: System/Light/Dark selection, round trips and colour validation passed")
