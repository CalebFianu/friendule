import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/models/rule.dart';
import 'package:friendule_flutter/utils/filter_matcher.dart';

void main() {
  group('filter_matcher', () {
    const gymRule = Rule(
      id: '1',
      friendId: 'f1',
      title: 'Morning Gym',
      status: 'busy',
      recurrence: 'weekly',
      weekdays: [1, 3, 5],
    );

    const onceRule = Rule(
      id: '2',
      friendId: 'f1',
      title: 'Dentist',
      status: 'busy',
      recurrence: 'once',
      date: '2026-04-10',
    );

    test('matches by all flag', () {
      expect(matchesFilter(gymRule, {'all': true}), isTrue);
    });

    test('matches by title_keywords', () {
      expect(
        matchesFilter(gymRule, {
          'title_keywords': ['gym']
        }),
        isTrue,
      );
      expect(
        matchesFilter(gymRule, {
          'title_keywords': ['dentist']
        }),
        isFalse,
      );
    });

    test('matches by weekdays', () {
      expect(
        matchesFilter(gymRule, {
          'weekdays': [1]
        }),
        isTrue,
      );
      expect(
        matchesFilter(gymRule, {
          'weekdays': [2]
        }),
        isFalse,
      );
    });

    test('matches by date', () {
      expect(
        matchesFilter(onceRule, {
          'date': '2026-04-10',
        }),
        isTrue,
      );
      expect(
        matchesFilter(onceRule, {
          'date': '2026-04-11',
        }),
        isFalse,
      );
    });
  });
}
