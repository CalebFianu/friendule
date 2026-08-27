import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/models/rule.dart';
import 'package:friendule_flutter/utils/conflict_detector.dart';

void main() {
  group('conflict_detector', () {
    test('timesOverlap correctly identifies overlapping time ranges', () {
      const r1 = Rule(
        id: '1',
        friendId: 'f1',
        title: 'A',
        status: 'busy',
        recurrence: 'once',
        timeStart: '09:00',
        timeEnd: '11:00',
      );
      const r2 = Rule(
        id: '2',
        friendId: 'f1',
        title: 'B',
        status: 'free',
        recurrence: 'once',
        timeStart: '10:00',
        timeEnd: '12:00',
      );
      const r3 = Rule(
        id: '3',
        friendId: 'f1',
        title: 'C',
        status: 'free',
        recurrence: 'once',
        timeStart: '11:00',
        timeEnd: '13:00',
      );

      expect(timesOverlap(r1, r2), isTrue);
      expect(timesOverlap(r1, r3), isFalse);
    });

    test('rulesOverlap checks day and time overlap', () {
      const weeklyMon = Rule(
        id: '1',
        friendId: 'f1',
        title: 'Work',
        status: 'busy',
        recurrence: 'weekly',
        weekdays: [1], // Mon
        timeStart: '09:00',
        timeEnd: '17:00',
      );

      // 2026-04-06 is Monday
      const onceMon = Rule(
        id: '2',
        friendId: 'f1',
        title: 'Free day',
        status: 'free',
        recurrence: 'once',
        date: '2026-04-06',
        allDay: true,
      );

      // 2026-04-07 is Tuesday
      const onceTue = Rule(
        id: '3',
        friendId: 'f1',
        title: 'Free day',
        status: 'free',
        recurrence: 'once',
        date: '2026-04-07',
        allDay: true,
      );

      expect(rulesOverlap(weeklyMon, onceMon), isTrue);
      expect(rulesOverlap(weeklyMon, onceTue), isFalse);
    });

    test('findFriendConflicts finds busy/free overlapping pairs', () {
      const busyRule = Rule(
        id: '1',
        friendId: 'f1',
        title: 'Work',
        status: 'busy',
        recurrence: 'daily',
        timeStart: '09:00',
        timeEnd: '17:00',
      );
      const freeRule = Rule(
        id: '2',
        friendId: 'f1',
        title: 'Lunch',
        status: 'free',
        recurrence: 'daily',
        timeStart: '12:00',
        timeEnd: '13:00',
      );

      final conflicts = findFriendConflicts([busyRule, freeRule]);
      expect(conflicts.length, 1);
      expect(conflicts[0].$1.id, '1');
      expect(conflicts[0].$2.id, '2');
    });
  });
}
