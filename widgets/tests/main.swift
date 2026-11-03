import Foundation

var checks = 0
for zone in ["Australia/Sydney", "America/Los_Angeles", "Asia/Yerevan", "Pacific/Auckland"] {
  let calendar = DailyVerseCalendar.gregorian(timeZone: TimeZone(identifier: zone)!)
  for (year, month, day) in [(2026, 1, 1), (2026, 4, 4), (2026, 10, 3), (2028, 2, 28), (2025, 12, 31)] {
    let now = calendar.date(from: DateComponents(year: year, month: month, day: day, hour: 12))!
    let dates = DailyVerseCalendar.dates(from: now, calendar: calendar)
    precondition(dates.count == 8 && dates[0] == now)
    let initial = DailyVerseCalendar.index(for: now, count: 25, calendar: calendar)
    for offset in 1...7 {
      precondition(calendar.component(.hour, from: dates[offset]) == 0)
      precondition(calendar.component(.minute, from: dates[offset]) == 0)
      precondition(DailyVerseCalendar.index(for: dates[offset], count: 25, calendar: calendar) == (initial + offset) % 25)
      checks += 1
    }
    let late = calendar.date(bySettingHour: 23, minute: 59, second: 59, of: now)!
    precondition(DailyVerseCalendar.index(for: late, count: 25, calendar: calendar) == initial)
  }
}
print("Daily verse calendar: \(checks) midnight, DST and year-boundary checks passed")
