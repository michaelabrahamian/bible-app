import Foundation

enum DailyVerseCalendar {
  static func gregorian(timeZone: TimeZone = .autoupdatingCurrent) -> Calendar {
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = timeZone
    return calendar
  }

  static func index(for date: Date, count: Int, calendar: Calendar = gregorian()) -> Int {
    let epoch = calendar.date(from: DateComponents(year: 2026, month: 1, day: 1))!
    let day = calendar.startOfDay(for: date)
    let days = calendar.dateComponents([.day], from: epoch, to: day).day!
    return ((days % count) + count) % count
  }

  static func dates(from now: Date, calendar: Calendar = gregorian()) -> [Date] {
    let today = calendar.startOfDay(for: now)
    return [now] + (1...7).map {
      calendar.date(byAdding: .day, value: $0, to: today)!
    }
  }
}
