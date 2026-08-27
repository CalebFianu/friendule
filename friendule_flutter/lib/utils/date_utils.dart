import '../config/constants.dart';

String pad(int n) {
  return n < 10 ? '0$n' : '$n';
}

String ymd(DateTime d) {
  return '${d.year}-${pad(d.month)}-${pad(d.day)}';
}

DateTime parseYmd(String s) {
  final parts = s.split('-').map(int.parse).toList();
  return DateTime(parts[0], parts[1], parts[2]);
}

DateTime addDays(DateTime d, int n) {
  return DateTime(d.year, d.month, d.day + n);
}

String fmtTime(int? min) {
  if (min == null) return '';
  final h = min ~/ 60;
  final m = min % 60;
  final ap = h < 12 ? 'AM' : 'PM';
  var hh = h % 12;
  if (hh == 0) hh = 12;
  return '$hh${m != 0 ? ':${pad(m)}' : ''} $ap';
}

String shortTime(int? min) {
  if (min == null) return '';
  final h = min ~/ 60;
  final m = min % 60;
  final ap = h < 12 ? 'a' : 'p';
  var hh = h % 12;
  if (hh == 0) hh = 12;
  return '$hh${m != 0 ? ':${pad(m)}' : ''}$ap';
}

String hhmm(int min) {
  return '${pad(min ~/ 60)}:${pad(min % 60)}';
}

int toMin(String? hhmmStr) {
  if (hhmmStr == null || hhmmStr.isEmpty) return 0;
  final parts = hhmmStr.split(':').map(int.parse).toList();
  return parts[0] * 60 + (parts.length > 1 ? parts[1] : 0);
}

String prettyDate(String y) {
  final d = parseYmd(y);
  final wd = d.weekday % 7; // Dart: 1=Mon..7=Sun -> 0=Sun..6=Sat
  return '${kWeekdays[wd]} ${kMonths[d.month - 1]} ${d.day}';
}

class CalendarGridCell {
  final DateTime date;
  final String ymd;
  final int day;
  final bool inMonth;
  final bool isToday;
  final int weekday; // 0=Sun..6=Sat

  const CalendarGridCell({
    required this.date,
    required this.ymd,
    required this.day,
    required this.inMonth,
    required this.isToday,
    required this.weekday,
  });
}

List<CalendarGridCell> buildGrid(DateTime cur) {
  final first = DateTime(cur.year, cur.month, 1);
  final firstWd = first.weekday % 7; // 0=Sun..6=Sat
  final start = addDays(first, -firstWd);
  final todayStr = ymd(DateTime.now());

  final grid = <CalendarGridCell>[];
  for (var i = 0; i < 42; i++) {
    final d = addDays(start, i);
    final y2 = ymd(d);
    grid.add(CalendarGridCell(
      date: d,
      ymd: y2,
      day: d.day,
      inMonth: d.month == cur.month,
      isToday: y2 == todayStr,
      weekday: d.weekday % 7,
    ));
  }
  return grid;
}
