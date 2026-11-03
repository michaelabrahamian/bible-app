import SwiftUI
import WidgetKit

struct DailyVerse: Decodable {
  let reference: String
  let armenianReference: String
  let armenianText: String
  let englishText: String
  let url: String
}

struct DailyVerseEntry: TimelineEntry {
  let date: Date
  var verse: DailyVerse {
    dailyVerses[DailyVerseCalendar.index(for: date, count: dailyVerses.count)]
  }
}

struct DailyVerseProvider: TimelineProvider {
  func placeholder(in context: Context) -> DailyVerseEntry {
    DailyVerseEntry(date: Date())
  }

  func getSnapshot(in context: Context, completion: @escaping (DailyVerseEntry) -> Void) {
    completion(DailyVerseEntry(date: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<DailyVerseEntry>) -> Void) {
    // Rebuild in the extension itself: no background app, server, or finite
    // app-authored schedule to run out of entries. Calendar math respects DST.
    let entries = DailyVerseCalendar.dates(from: Date()).map { DailyVerseEntry(date: $0) }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

struct DailyVerseView: View {
  @Environment(\.widgetFamily) private var family
  @Environment(\.colorScheme) private var colorScheme
  let entry: DailyVerseEntry

  private var small: Bool { family == .systemSmall }
  private var large: Bool { family == .systemLarge }
  private var background: Color {
    colorScheme == .dark
      ? Color(red: 0.114, green: 0.161, blue: 0.133)
      : Color(red: 0.969, green: 0.965, blue: 0.949)
  }
  private var foreground: Color {
    colorScheme == .dark
      ? Color(red: 0.914, green: 0.933, blue: 0.898)
      : Color(red: 0.141, green: 0.231, blue: 0.196)
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
    StaticConfiguration(kind: "DailyVerseWidget", provider: DailyVerseProvider()) { entry in
      DailyVerseView(entry: entry)
    }
    .configurationDisplayName("Daily Bible Verse")
    .description("An Armenian verse each day, with English on larger widgets.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}
