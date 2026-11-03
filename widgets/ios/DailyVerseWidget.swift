import SwiftUI
import WidgetKit
import AppIntents

enum DailyVerseBackground: String, AppEnum {
  case system, forest, ocean, clay, plum, white, cream, black, grey

  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Background"
  static var caseDisplayRepresentations: [DailyVerseBackground: DisplayRepresentation] = [
    .system: "System", .forest: "Forest", .ocean: "Ocean", .clay: "Clay",
    .plum: "Plum", .white: "White", .cream: "Cream", .black: "Black", .grey: "Grey"
  ]

  func colors(isDark: Bool) -> (background: Color, foreground: Color) {
    switch self {
    case .system:
      // Preserve the original widget's adaptive forest appearance by default.
      return isDark
        ? (Color(hex: 0x1D2922), Color(hex: 0xE9EEE5))
        : (Color(hex: 0xF7F6F2), Color(hex: 0x243B32))
    case .forest: return (Color(hex: 0x244B3A), Color(hex: 0xF8F7ED))
    case .ocean: return (Color(hex: 0x23465D), Color(hex: 0xF5F8FC))
    case .clay: return (Color(hex: 0x764833), Color(hex: 0xFFF7F1))
    case .plum: return (Color(hex: 0x593C60), Color(hex: 0xFBF5FB))
    case .white: return (Color(hex: 0xFFFFFF), Color(hex: 0x202421))
    case .cream: return (Color(hex: 0xF7F2E5), Color(hex: 0x3E3528))
    case .black: return (Color(hex: 0x111111), Color(hex: 0xF4F4EF))
    case .grey: return (Color(hex: 0xE5E5E3), Color(hex: 0x252825))
    }
  }
}

private extension Color {
  init(hex: UInt32) {
    self.init(.sRGB, red: Double((hex >> 16) & 255) / 255,
              green: Double((hex >> 8) & 255) / 255,
              blue: Double(hex & 255) / 255, opacity: 1)
  }
}

struct DailyVerseConfiguration: WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "Daily Bible Verse"
  static var description: IntentDescription = "Choose the background for this widget."

  @Parameter(title: "Background", default: .system)
  var background: DailyVerseBackground
}

struct DailyVerse: Decodable {
  let reference: String
  let armenianReference: String
  let armenianText: String
  let englishText: String
  let url: String
}

struct DailyVerseEntry: TimelineEntry {
  let date: Date
  var background: DailyVerseBackground = .system
  var verse: DailyVerse {
    dailyVerses[DailyVerseCalendar.index(for: date, count: dailyVerses.count)]
  }
}

struct DailyVerseProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> DailyVerseEntry {
    DailyVerseEntry(date: Date())
  }

  func snapshot(for configuration: DailyVerseConfiguration, in context: Context) async -> DailyVerseEntry {
    DailyVerseEntry(date: Date(), background: configuration.background)
  }

  func timeline(for configuration: DailyVerseConfiguration, in context: Context) async -> Timeline<DailyVerseEntry> {
    // Rebuild in the extension itself: no background app, server, or finite
    // app-authored schedule to run out of entries. Calendar math respects DST.
    let entries = DailyVerseCalendar.dates(from: Date()).map {
      DailyVerseEntry(date: $0, background: configuration.background)
    }
    return Timeline(entries: entries, policy: .atEnd)
  }
}

struct DailyVerseView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.colorScheme) private var colorScheme
  let entry: DailyVerseEntry

  private var small: Bool { family == .systemSmall }
  private var large: Bool { family == .systemLarge }
  private var background: Color {
    entry.background.colors(isDark: colorScheme == .dark).background
  }
  private var foreground: Color {
    entry.background.colors(isDark: colorScheme == .dark).foreground
  }

  var body: some View {
    VStack(alignment: .leading, spacing: large ? 16 : 8) {
      if !small {
        Text("Օրվա խոսքը")
          .font(.caption.weight(.semibold))
          .foregroundStyle(foreground.opacity(0.8))
      }
      Text(entry.verse.armenianText)
        .font(.system(size: large ? 23 : small ? 16 : 15))
        .minimumScaleFactor(0.8)
        .layoutPriority(1)
      if !small {
        Text(entry.verse.englishText)
          .font(.system(size: large ? 21 : 14, design: .serif))
          .minimumScaleFactor(0.8)
          .layoutPriority(1)
      }
      Spacer(minLength: 0)
      VStack(alignment: .leading, spacing: 2) {
        Text("\(entry.verse.armenianReference) · ՆԷ")
          .font(.caption.weight(.semibold))
        if !small {
          Text("\(entry.verse.reference) · KJV")
            .font(.caption2)
        }
      }
      .foregroundStyle(foreground.opacity(0.8))
    }
    .foregroundStyle(foreground)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    .containerBackground(background, for: .widget)
    .widgetURL(URL(string: entry.verse.url))
  }
}

@main
struct DailyVerseWidget: Widget {
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: "DailyVerseWidget", intent: DailyVerseConfiguration.self, provider: DailyVerseProvider()) { entry in
      DailyVerseView(entry: entry)
    }
    .configurationDisplayName("Daily Bible Verse")
    .description("An Armenian verse each day, with English on larger widgets.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
