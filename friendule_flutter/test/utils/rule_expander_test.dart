import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/models/rule.dart';
import 'package:friendule_flutter/utils/rule_expander.dart';

void main() {
  setUpAll(() {
    ensureTimezoneInitialized();
  });

  group('rule_expander', () {
    test('expands once rule for matching date', () {
      final rule = const Rule(
        id: 'r1',
        friendId: 'f1',
        title: 'Doctor',
        status: 'busy',
        recurrence: 'once',
        date: '2026-04-10',
        timeStart: '14:00',
        timeEnd: '15:00',
      );

      final intervals = expandRules(
        rules: [rule],
        friendZone: 'UTC',
        viewerZone: 'UTC',
        rangeStart: '2026-04-01',
        rangeEnd: '2026-04-30',
      );

      expect(intervals.length, 1);
      expect(intervals[0].title, 'Doctor');
      expect(intervals[0].date, '2026-04-10');
      expect(intervals[0].startMin, 14 * 60);
      expect(intervals[0].endMin, 15 * 60);
    });

    test('expands weekly rule across date range', () {
      // Mondays and Wednesdays (1 and 3)
      final rule = const Rule(
        id: 'r2',
        friendId: 'f1',
        title: 'Gym',
        status: 'busy',
        recurrence: 'weekly',
        weekdays: [1, 3],
        timeStart: '07:00',
        timeEnd: '08:00',
      );

      final intervals = expandRules(
        rules: [rule],
        friendZone: 'UTC',
        viewerZone: 'UTC',
        rangeStart: '2026-04-01', // Wed (3)
        rangeEnd: '2026-04-08', // Wed (3)
      );

      // Apr 1 (Wed), Apr 6 (Mon), Apr 8 (Wed) -> 3 intervals
      expect(intervals.length, 3);
      expect(intervals.map((i) => i.date).toList(), [
        '2026-04-01',
        '2026-04-06',
        '2026-04-08',
      ]);
    });

    test('respects date bounds for recurring rules', () {
      final rule = const Rule(
        id: 'r3',
        friendId: 'f1',
        title: 'Sprint',
        status: 'busy',
        recurrence: 'daily',
        timeStart: '09:00',
        timeEnd: '10:00',
        dateFrom: '2026-04-05',
        dateTo: '2026-04-07',
      );

      final intervals = expandRules(
        rules: [rule],
        friendZone: 'UTC',
        viewerZone: 'UTC',
        rangeStart: '2026-04-01',
        rangeEnd: '2026-04-30',
      );

      expect(intervals.length, 3);
      expect(intervals.map((i) => i.date).toList(), [
        '2026-04-05',
        '2026-04-06',
        '2026-04-07',
      ]);
    });

    test('correctly converts time between timezones', () {
      // Friend in London (UTC+1 in summer: 2026-07-15) has meeting at 14:00 (13:00 UTC)
      // Viewer in New York (EDT, UTC-4) -> should be 09:00 (540 mins)
      final rule = const Rule(
        id: 'r4',
        friendId: 'f1',
        title: 'London Sync',
        status: 'busy',
        recurrence: 'once',
        date: '2026-07-15',
        timeStart: '14:00',
        timeEnd: '15:00',
      );

      final intervals = expandRules(
        rules: [rule],
        friendZone: 'Europe/London',
        viewerZone: 'America/New_York',
        rangeStart: '2026-07-01',
        rangeEnd: '2026-07-31',
      );

      expect(intervals.length, 1);
      expect(intervals[0].date, '2026-07-15');
      expect(intervals[0].startMin, 9 * 60); // 09:00 EDT
      expect(intervals[0].endMin, 10 * 60); // 10:00 EDT
    });
  });
}
