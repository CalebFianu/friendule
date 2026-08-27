import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../utils/date_utils.dart';

class CalendarState {
  final String tab; // 'personal', 'friends', 'everyone'
  final String view; // 'month', 'week'
  final String cursor; // 'YYYY-MM-DD'
  final int friendIdx;
  final List<String> everyoneFilter;

  const CalendarState({
    this.tab = 'personal',
    this.view = 'month',
    required this.cursor,
    this.friendIdx = 0,
    this.everyoneFilter = const [],
  });

  CalendarState copyWith({
    String? tab,
    String? view,
    String? cursor,
    int? friendIdx,
    List<String>? everyoneFilter,
  }) {
    return CalendarState(
      tab: tab ?? this.tab,
      view: view ?? this.view,
      cursor: cursor ?? this.cursor,
      friendIdx: friendIdx ?? this.friendIdx,
      everyoneFilter: everyoneFilter ?? this.everyoneFilter,
    );
  }
}

class CalendarNotifier extends Notifier<CalendarState> {
  @override
  CalendarState build() {
    return CalendarState(cursor: ymd(DateTime.now()));
  }

  void setTab(String tab) {
    state = state.copyWith(tab: tab);
  }

  void setView(String view) {
    state = state.copyWith(view: view);
  }

  void setCursor(String cursor) {
    state = state.copyWith(cursor: cursor);
  }

  void goToday() {
    state = state.copyWith(cursor: ymd(DateTime.now()));
  }

  void prevPeriod() {
    final cur = parseYmd(state.cursor);
    if (state.view == 'week' && (state.tab == 'friends' || state.tab == 'personal')) {
      state = state.copyWith(cursor: ymd(addDays(cur, -7)));
    } else {
      state = state.copyWith(cursor: ymd(DateTime(cur.year, cur.month - 1, 1)));
    }
  }

  void nextPeriod() {
    final cur = parseYmd(state.cursor);
    if (state.view == 'week' && (state.tab == 'friends' || state.tab == 'personal')) {
      state = state.copyWith(cursor: ymd(addDays(cur, 7)));
    } else {
      state = state.copyWith(cursor: ymd(DateTime(cur.year, cur.month + 1, 1)));
    }
  }

  void prevFriend(int regularFriendCount) {
    if (regularFriendCount <= 0) return;
    final newIdx = (state.friendIdx - 1 + regularFriendCount) % regularFriendCount;
    state = state.copyWith(friendIdx: newIdx);
  }

  void nextFriend(int regularFriendCount) {
    if (regularFriendCount <= 0) return;
    final newIdx = (state.friendIdx + 1) % regularFriendCount;
    state = state.copyWith(friendIdx: newIdx);
  }

  void pickFriend(int idx) {
    state = state.copyWith(friendIdx: idx, tab: 'friends');
  }

  void toggleEveryoneFilter(String id) {
    final current = state.everyoneFilter;
    if (current.contains(id)) {
      state = state.copyWith(everyoneFilter: current.where((x) => x != id).toList());
    } else {
      state = state.copyWith(everyoneFilter: [...current, id]);
    }
  }

  void clearEveryoneFilter() {
    state = state.copyWith(everyoneFilter: []);
  }
}

final calendarProvider = NotifierProvider<CalendarNotifier, CalendarState>(() {
  return CalendarNotifier();
});
