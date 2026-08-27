import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/utils/date_utils.dart';

void main() {
  group('date_utils', () {
    test('pad formats single digit with leading zero', () {
      expect(pad(5), '05');
      expect(pad(12), '12');
    });

    test('ymd formats DateTime to YYYY-MM-DD', () {
      final dt = DateTime(2026, 4, 9);
      expect(ymd(dt), '2026-04-09');
    });

    test('parseYmd parses YYYY-MM-DD to DateTime', () {
      final dt = parseYmd('2026-04-09');
      expect(dt.year, 2026);
      expect(dt.month, 4);
      expect(dt.day, 9);
    });

    test('addDays adds positive and negative days correctly', () {
      final dt = DateTime(2026, 4, 1);
      expect(ymd(addDays(dt, 7)), '2026-04-08');
      expect(ymd(addDays(dt, -1)), '2026-03-31');
    });

    test('fmtTime formats minutes to 12h format', () {
      expect(fmtTime(null), '');
      expect(fmtTime(0), '12 AM');
      expect(fmtTime(540), '9 AM');
      expect(fmtTime(570), '9:30 AM');
      expect(fmtTime(720), '12 PM');
      expect(fmtTime(1020), '5 PM');
      expect(fmtTime(1035), '5:15 PM');
    });

    test('shortTime formats minutes compactly', () {
      expect(shortTime(null), '');
      expect(shortTime(540), '9a');
      expect(shortTime(570), '9:30a');
      expect(shortTime(1020), '5p');
    });

    test('hhmm formats minutes to HH:MM', () {
      expect(hhmm(540), '09:00');
      expect(hhmm(1035), '17:15');
    });

    test('toMin parses HH:MM to minutes since midnight', () {
      expect(toMin('09:00'), 540);
      expect(toMin('17:15'), 1035);
      expect(toMin(null), 0);
    });

    test('prettyDate formats date nicely', () {
      expect(prettyDate('2026-04-09'), 'Thu Apr 9');
    });

    test('buildGrid produces exactly 42 calendar cells starting on Sunday', () {
      final cur = DateTime(2026, 4, 15);
      final grid = buildGrid(cur);
      expect(grid.length, 42);
      expect(grid[0].weekday, 0); // First day is Sunday
      expect(grid.any((c) => c.inMonth), isTrue);
    });
  });
}
