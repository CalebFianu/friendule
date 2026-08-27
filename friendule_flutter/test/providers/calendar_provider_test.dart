import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/providers/calendar_provider.dart';

void main() {
  group('calendar_provider', () {
    test('initial state defaults to current date and personal tab', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final state = container.read(calendarProvider);
      expect(state.tab, 'personal');
      expect(state.view, 'month');
      expect(state.cursor, isNotEmpty);
      expect(state.friendIdx, 0);
      expect(state.everyoneFilter, isEmpty);
    });

    test('navigation updates period and friends correctly', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(calendarProvider.notifier);

      notifier.setCursor('2026-04-15');
      expect(container.read(calendarProvider).cursor, '2026-04-15');

      notifier.nextPeriod();
      expect(container.read(calendarProvider).cursor, '2026-05-01');

      notifier.prevPeriod();
      expect(container.read(calendarProvider).cursor, '2026-04-01');

      notifier.nextFriend(3);
      expect(container.read(calendarProvider).friendIdx, 1);

      notifier.nextFriend(3);
      expect(container.read(calendarProvider).friendIdx, 2);

      notifier.nextFriend(3);
      expect(container.read(calendarProvider).friendIdx, 0);

      notifier.prevFriend(3);
      expect(container.read(calendarProvider).friendIdx, 2);
    });

    test('everyone filter toggles correctly', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      final notifier = container.read(calendarProvider.notifier);

      notifier.toggleEveryoneFilter('friend-1');
      expect(container.read(calendarProvider).everyoneFilter, ['friend-1']);

      notifier.toggleEveryoneFilter('friend-2');
      expect(container.read(calendarProvider).everyoneFilter, ['friend-1', 'friend-2']);

      notifier.toggleEveryoneFilter('friend-1');
      expect(container.read(calendarProvider).everyoneFilter, ['friend-2']);

      notifier.clearEveryoneFilter();
      expect(container.read(calendarProvider).everyoneFilter, isEmpty);
    });
  });
}
