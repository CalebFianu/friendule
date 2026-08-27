import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/interval.dart';
import '../utils/date_utils.dart';
import '../utils/rule_expander.dart';
import 'calendar_provider.dart';
import 'friends_provider.dart';
import 'rules_provider.dart';

class VisibleDateRange {
  final String start;
  final String end;

  const VisibleDateRange({required this.start, required this.end});
}

final visibleRangeProvider = Provider<VisibleDateRange>((ref) {
  final cal = ref.watch(calendarProvider);
  final cur = parseYmd(cal.cursor);

  if (cal.view == 'week' && (cal.tab == 'friends' || cal.tab == 'personal')) {
    final ws = addDays(cur, -(cur.weekday % 7));
    return VisibleDateRange(
      start: ymd(ws),
      end: ymd(addDays(ws, 6)),
    );
  }

  final first = DateTime(cur.year, cur.month, 1);
  final gridStart = addDays(first, -(first.weekday % 7));
  return VisibleDateRange(
    start: ymd(gridStart),
    end: ymd(addDays(gridStart, 41)),
  );
});

final viewerZoneProvider = Provider<String>((ref) {
  return 'UTC'; // default, can be dynamic or device timezone
});

final expansionProvider = Provider<Map<String, List<ScheduleInterval>>>((ref) {
  final friends = ref.watch(friendsProvider).value ?? [];
  final rules = ref.watch(rulesProvider).value ?? [];
  final range = ref.watch(visibleRangeProvider);
  final viewerZone = ref.watch(viewerZoneProvider);

  final map = <String, List<ScheduleInterval>>{};
  for (final f in friends) {
    final friendRules = rules.where((r) => r.friendId == f.id).toList();
    final friendZone = f.isSelf ? viewerZone : f.timezone;
    map[f.id] = expandRules(
      rules: friendRules,
      friendZone: friendZone,
      viewerZone: viewerZone,
      rangeStart: range.start,
      rangeEnd: range.end,
    );
  }
  return map;
});

final friendInstancesOnDateProvider =
    Provider.family<List<ScheduleInterval>, (String, String)>((ref, arg) {
  final (friendId, date) = arg;
  final map = ref.watch(expansionProvider);
  final list = map[friendId] ?? [];
  return list.where((e) => e.date == date).toList();
});

final personalInstancesOnDateProvider =
    Provider.family<List<ScheduleInterval>, String>((ref, date) {
  final personalFriend = ref.watch(personalFriendProvider);
  final regularFriends = ref.watch(regularFriendsProvider);
  final map = ref.watch(expansionProvider);

  if (personalFriend == null) return [];

  final ownEvs = (map[personalFriend.id] ?? []).where((e) => e.date == date).toList();
  final togetherEvs = <ScheduleInterval>[];

  for (final f in regularFriends) {
    final expanded = map[f.id] ?? [];
    for (final ev in expanded) {
      if (ev.date == date && ev.status == 'together') {
        togetherEvs.add(ev.copyWith(fromFriend: f));
      }
    }
  }

  final all = [...ownEvs, ...togetherEvs];
  all.sort((a, b) {
    final aAllDay = a.allDay ? -1 : 0;
    final bAllDay = b.allDay ? -1 : 0;
    final allDayCmp = aAllDay.compareTo(bAllDay);
    if (allDayCmp != 0) return allDayCmp;

    final aStart = a.startMin ?? 0;
    final bStart = b.startMin ?? 0;
    return aStart.compareTo(bStart);
  });

  return all;
});
