import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/clarification.dart';
import '../models/confirm_action.dart';
import '../models/friend.dart';
import '../models/interval.dart';
import 'auth_provider.dart';

class DayDetailFriendRow {
  final Friend friend;
  final List<ScheduleInterval> intervals;
  final bool isBusy;
  final bool isTogether;

  const DayDetailFriendRow({
    required this.friend,
    required this.intervals,
    required this.isBusy,
    required this.isTogether,
  });
}

class DayDetailPayload {
  final String ymd;
  final List<DayDetailFriendRow> rows;

  const DayDetailPayload({required this.ymd, required this.rows});
}

class FriendDayPayload {
  final String ymd;
  final int startMin;
  final List<ScheduleInterval> intervals;

  const FriendDayPayload({
    required this.ymd,
    required this.startMin,
    required this.intervals,
  });
}

class UIState {
  final String? toast;
  final DayDetailPayload? dayDetail;
  final FriendDayPayload? friendDay;
  final ClarificationState? clarification;
  final ConfirmAction? confirmAction;
  final bool isDarkMode;

  const UIState({
    this.toast,
    this.dayDetail,
    this.friendDay,
    this.clarification,
    this.confirmAction,
    this.isDarkMode = false,
  });

  UIState copyWith({
    String? toast,
    bool clearToast = false,
    DayDetailPayload? dayDetail,
    bool clearDayDetail = false,
    FriendDayPayload? friendDay,
    bool clearFriendDay = false,
    ClarificationState? clarification,
    bool clearClarification = false,
    ConfirmAction? confirmAction,
    bool clearConfirmAction = false,
    bool? isDarkMode,
  }) {
    return UIState(
      toast: clearToast ? null : (toast ?? this.toast),
      dayDetail: clearDayDetail ? null : (dayDetail ?? this.dayDetail),
      friendDay: clearFriendDay ? null : (friendDay ?? this.friendDay),
      clarification: clearClarification ? null : (clarification ?? this.clarification),
      confirmAction: clearConfirmAction ? null : (confirmAction ?? this.confirmAction),
      isDarkMode: isDarkMode ?? this.isDarkMode,
    );
  }
}

class UINotifier extends Notifier<UIState> {
  Timer? _toastTimer;

  @override
  UIState build() {
    // Load stored theme mode asynchronously
    ref.read(storageServiceProvider).getThemeMode().then((mode) {
      if (mode != null) {
        state = state.copyWith(isDarkMode: mode == 'dark');
      }
    });
    return const UIState();
  }

  void toggleDarkMode() {
    final next = !state.isDarkMode;
    state = state.copyWith(isDarkMode: next);
    ref.read(storageServiceProvider).saveThemeMode(next ? 'dark' : 'light');
  }

  void flash(String message) {
    _toastTimer?.cancel();
    state = state.copyWith(toast: message);
    _toastTimer = Timer(const Duration(milliseconds: 2800), () {
      state = state.copyWith(clearToast: true);
    });
  }

  void openDayDetail(DayDetailPayload detail) {
    state = state.copyWith(dayDetail: detail);
  }

  void closeDayDetail() {
    state = state.copyWith(clearDayDetail: true);
  }

  void openFriendDay(FriendDayPayload friendDay) {
    state = state.copyWith(friendDay: friendDay);
  }

  void closeFriendDay() {
    state = state.copyWith(clearFriendDay: true);
  }

  void openClarification(ClarificationState clarification) {
    state = state.copyWith(clarification: clarification);
  }

  void closeClarification() {
    state = state.copyWith(clearClarification: true);
  }

  void openConfirm(ConfirmAction action) {
    state = state.copyWith(confirmAction: action);
  }

  void closeConfirm() {
    state = state.copyWith(clearConfirmAction: true);
  }
}

final uiProvider = NotifierProvider<UINotifier, UIState>(() {
  return UINotifier();
});
