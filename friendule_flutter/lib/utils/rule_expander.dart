import 'package:timezone/data/latest.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;
import '../models/interval.dart';
import '../models/rule.dart';
import 'date_utils.dart';

bool _tzInitialized = false;

void ensureTimezoneInitialized() {
  if (!_tzInitialized) {
    tz_data.initializeTimeZones();
    _tzInitialized = true;
  }
}

tz.Location getLocation(String? zoneName) {
  ensureTimezoneInitialized();
  if (zoneName == null || zoneName.isEmpty) {
    return tz.getLocation('UTC');
  }
  try {
    return tz.getLocation(zoneName);
  } catch (_) {
    // Fallback if unrecognized
    return tz.getLocation('UTC');
  }
}

bool matchesDay(Rule rule, String isoDate, int weekdaySun) {
  // Check optional date bounds for recurring rules
  if (rule.dateFrom != null && rule.dateFrom!.isNotEmpty && isoDate.compareTo(rule.dateFrom!) < 0) {
    return false;
  }
  if (rule.dateTo != null && rule.dateTo!.isNotEmpty && isoDate.compareTo(rule.dateTo!) > 0) {
    return false;
  }

  switch (rule.recurrence) {
    case 'once':
      return rule.date == isoDate;
    case 'daily':
      return true;
    case 'weekly':
      return rule.weekdays != null && rule.weekdays!.contains(weekdaySun);
    default:
      return false;
  }
}

ScheduleInterval? buildInterval(
  Rule rule,
  tz.TZDateTime friendDayStart,
  tz.Location friendLocation,
  tz.Location viewerLocation,
) {
  final friendIsoDate = ymd(friendDayStart);
  final id = '${rule.id}_$friendIsoDate';

  if (rule.allDay) {
    // All-day events: express as the date in the viewer's zone corresponding
    // to the middle of the friend's day
    final midday = tz.TZDateTime(
      friendLocation,
      friendDayStart.year,
      friendDayStart.month,
      friendDayStart.day,
      12,
      0,
    );
    final viewerMidday = tz.TZDateTime.from(midday, viewerLocation);
    final viewerDate = ymd(viewerMidday);

    return ScheduleInterval(
      id: id,
      ruleId: rule.id,
      friendId: rule.friendId,
      title: rule.title,
      status: rule.status,
      allDay: true,
      startMin: null,
      endMin: null,
      date: viewerDate,
      isoStart: friendDayStart.toIso8601String(),
      isoEnd: friendDayStart.add(const Duration(days: 1)).toIso8601String(),
    );
  }

  // Timed event: build start/end in friend's zone, convert to viewer's zone
  final timeStartStr = rule.timeStart ?? '09:00';
  final timeEndStr = rule.timeEnd ?? '10:00';

  final startParts = timeStartStr.split(':').map(int.parse).toList();
  final endParts = timeEndStr.split(':').map(int.parse).toList();

  final friendStart = tz.TZDateTime(
    friendLocation,
    friendDayStart.year,
    friendDayStart.month,
    friendDayStart.day,
    startParts[0],
    startParts.length > 1 ? startParts[1] : 0,
  );

  final friendEnd = tz.TZDateTime(
    friendLocation,
    friendDayStart.year,
    friendDayStart.month,
    friendDayStart.day,
    endParts[0],
    endParts.length > 1 ? endParts[1] : 0,
  );

  final viewerStart = tz.TZDateTime.from(friendStart, viewerLocation);
  final viewerEnd = tz.TZDateTime.from(friendEnd, viewerLocation);

  final viewerDate = ymd(viewerStart);
  final startMin = viewerStart.hour * 60 + viewerStart.minute;
  var endMin = viewerEnd.hour * 60 + viewerEnd.minute;

  if (endMin <= startMin) {
    // Crosses midnight
    endMin = 1439;
  }

  return ScheduleInterval(
    id: id,
    ruleId: rule.id,
    friendId: rule.friendId,
    title: rule.title,
    status: rule.status,
    allDay: false,
    startMin: startMin,
    endMin: endMin,
    date: viewerDate,
    isoStart: viewerStart.toIso8601String(),
    isoEnd: viewerEnd.toIso8601String(),
  );
}

/// Expand schedule rules into concrete per-day intervals for a date range.
List<ScheduleInterval> expandRules({
  required List<Rule> rules,
  required String friendZone,
  required String viewerZone,
  required String rangeStart,
  required String rangeEnd,
}) {
  ensureTimezoneInitialized();
  final friendLocation = getLocation(friendZone);
  final viewerLocation = getLocation(viewerZone);

  final intervals = <ScheduleInterval>[];

  // We iterate days in the FRIEND's zone so weekday checks are correct for them.
  // Pad by 1 day on each side to cover offset spillover.
  final startDt = parseYmd(rangeStart);
  final endDt = parseYmd(rangeEnd);

  var cursor = tz.TZDateTime(
    friendLocation,
    startDt.year,
    startDt.month,
    startDt.day,
  ).subtract(const Duration(days: 1));

  final end = tz.TZDateTime(
    friendLocation,
    endDt.year,
    endDt.month,
    endDt.day,
    23,
    59,
    59,
  ).add(const Duration(days: 1));

  while (cursor.isBefore(end) || cursor.isAtSameMomentAs(end)) {
    final friendDate = ymd(cursor);
    final friendWeekday = cursor.weekday % 7; // Luxon/Dart 1=Mon..7=Sun -> 0=Sun..6=Sat

    for (final rule in rules) {
      if (!matchesDay(rule, friendDate, friendWeekday)) continue;

      final interval = buildInterval(rule, cursor, friendLocation, viewerLocation);
      if (interval == null) continue;

      // Only include if interval date falls within requested range
      if (interval.date.compareTo(rangeStart) >= 0 && interval.date.compareTo(rangeEnd) <= 0) {
        intervals.add(interval);
      }
    }

    cursor = cursor.add(const Duration(days: 1));
  }

  intervals.sort((a, b) {
    final dateCmp = a.date.compareTo(b.date);
    if (dateCmp != 0) return dateCmp;

    final aAllDay = a.allDay ? -1 : 0;
    final bAllDay = b.allDay ? -1 : 0;
    final allDayCmp = aAllDay.compareTo(bAllDay);
    if (allDayCmp != 0) return allDayCmp;

    final aStart = a.startMin ?? 0;
    final bStart = b.startMin ?? 0;
    return aStart.compareTo(bStart);
  });

  return intervals;
}
