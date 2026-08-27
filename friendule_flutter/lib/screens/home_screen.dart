import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../providers/calendar_provider.dart';
import '../providers/conflicts_provider.dart';
import '../providers/editor_provider.dart';
import '../providers/expansion_provider.dart';
import '../providers/friends_provider.dart';
import '../providers/rules_provider.dart';
import '../providers/ui_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import '../widgets/add_friend_modal.dart';
import '../widgets/clarification_modal.dart';
import '../widgets/confirm_dialog.dart';
import '../widgets/conflict_banner.dart';
import '../widgets/day_detail_sheet.dart';
import '../widgets/ds/ds_button.dart';
import '../widgets/ds/ds_icon_button.dart';
import '../widgets/ds/ds_segmented_control.dart';
import '../widgets/event_editor_sheet.dart';
import '../widgets/everyone_view.dart';
import '../widgets/friend_day_panel_sheet.dart';
import '../widgets/friend_switcher.dart';
import '../widgets/header.dart';
import '../widgets/month_grid.dart';
import '../widgets/prompt_box.dart';
import '../widgets/week_view.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _sheetOpen = false;

  void _openAddFriendModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddFriendModal(),
    );
  }

  void _checkAndShowModals() {
    final editorState = ref.watch(editorProvider);
    final uiState = ref.watch(uiProvider);

    if (editorState != null && !_sheetOpen) {
      _sheetOpen = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Theme.of(context).cardColor,
          builder: (context) => EventEditorSheet(editorState: editorState),
        ).then((_) {
          _sheetOpen = false;
          ref.read(editorProvider.notifier).close();
        });
      });
    }

    if (uiState.friendDay != null && !_sheetOpen) {
      _sheetOpen = true;
      final cal = ref.read(calendarProvider);
      final personalFriend = ref.read(personalFriendProvider);
      final selectedFriend = ref.read(selectedFriendProvider);
      final friend = cal.tab == 'personal' ? personalFriend : selectedFriend;

      WidgetsBinding.instance.addPostFrameCallback((_) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Theme.of(context).cardColor,
          builder: (context) => FriendDayPanelSheet(
            payload: uiState.friendDay!,
            friend: friend,
          ),
        ).then((_) {
          _sheetOpen = false;
          ref.read(uiProvider.notifier).closeFriendDay();
        });
      });
    }

    if (uiState.dayDetail != null && !_sheetOpen) {
      _sheetOpen = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Theme.of(context).cardColor,
          builder: (context) => DayDetailSheet(payload: uiState.dayDetail!),
        ).then((_) {
          _sheetOpen = false;
          ref.read(uiProvider.notifier).closeDayDetail();
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    _checkAndShowModals();

    final cal = ref.watch(calendarProvider);
    final friendsAsync = ref.watch(friendsProvider);
    final rulesAsync = ref.watch(rulesProvider);
    final personalFriend = ref.watch(personalFriendProvider);
    final regularFriends = ref.watch(regularFriendsProvider);
    final selectedFriend = ref.watch(selectedFriendProvider);
    final uiState = ref.watch(uiProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cur = parseYmd(cal.cursor);
    final isMonth = cal.view == 'month';
    final isWeek = cal.view == 'week';

    final monthLabel = '${kMonths[cur.month - 1]} ${cur.year}';
    String periodLabel = monthLabel;
    if (isWeek && (cal.tab == 'friends' || cal.tab == 'personal')) {
      final ws = addDays(cur, -(cur.weekday % 7));
      final we = addDays(ws, 6);
      periodLabel = '${kMonths[ws.month - 1]} ${ws.day} – '
          '${ws.month != we.month ? '${kMonths[we.month - 1]} ' : ''}${we.day}';
    }

    final effectiveFriend = cal.tab == 'personal' ? personalFriend : selectedFriend;

    final calendarControls = Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        DsSegmentedControl<String>(
          size: DsSegmentedControlSize.sm,
          value: cal.view,
          onChanged: (v) => ref.read(calendarProvider.notifier).setView(v),
          options: const [
            DsSegmentOption(label: 'month', value: 'month'),
            DsSegmentOption(label: 'week', value: 'week'),
          ],
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            DsIconButton(
              icon: const Icon(Icons.chevron_left_rounded, size: 16),
              shape: DsIconButtonShape.circle,
              size: DsIconButtonSize.sm,
              onPressed: () => ref.read(calendarProvider.notifier).prevPeriod(),
            ),
            const SizedBox(width: 4),
            Text(
              periodLabel,
              style: AppTypography.body(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(width: 4),
            DsIconButton(
              icon: const Icon(Icons.chevron_right_rounded, size: 16),
              shape: DsIconButtonShape.circle,
              size: DsIconButtonSize.sm,
              onPressed: () => ref.read(calendarProvider.notifier).nextPeriod(),
            ),
            const SizedBox(width: 6),
            GestureDetector(
              onTap: () => ref.read(calendarProvider.notifier).goToday(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                  ),
                ),
                child: Text(
                  'Today',
                  style: AppTypography.xs(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
        DsButton(
          variant: DsButtonVariant.ink,
          size: DsButtonSize.sm,
          text: '+ Add',
          onPressed: () {
            if (effectiveFriend != null) {
              ref.read(editorProvider.notifier).openNew(
                    friendId: effectiveFriend.id,
                    date: cal.cursor,
                  );
            }
          },
        ),
      ],
    );

    int navIndex;
    switch (cal.tab) {
      case 'friends':
        navIndex = 1;
        break;
      case 'everyone':
        navIndex = 2;
        break;
      case 'personal':
      default:
        navIndex = 0;
        break;
    }

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            RefreshIndicator(
              onRefresh: () async {
                await Future.wait([
                  ref.read(friendsProvider.notifier).reload(),
                  ref.read(rulesProvider.notifier).reload(),
                ]);
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 80),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 860),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // App Header
                        const Header(),
                        const SizedBox(height: 14),

                        // Loading State
                        if (friendsAsync.isLoading || rulesAsync.isLoading)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 40),
                            child: Center(child: CircularProgressIndicator()),
                          )
                        else ...[
                          // ── TAB: MY CALENDAR ──
                          if (cal.tab == 'personal') ...[
                            if (personalFriend == null)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 60),
                                child: Center(
                                  child: Text(
                                    'Setting up your personal calendar…',
                                    style: AppTypography.body(
                                      color: isDark
                                          ? AppColors.textTertiaryDark
                                          : AppColors.textTertiaryLight,
                                    ),
                                  ),
                                ),
                              )
                            else ...[
                              // Personal Header Card
                              Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppColors.surfaceCardDark
                                      : AppColors.surfaceCardLight,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isDark
                                        ? AppColors.borderSubtleDark
                                        : AppColors.borderSubtleLight,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 42,
                                      height: 42,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: isDark ? AppColors.violet400 : AppColors.violet500,
                                      ),
                                      alignment: Alignment.center,
                                      child: const Icon(
                                        Icons.person_rounded,
                                        color: Colors.white,
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'My Calendar',
                                          style: AppTypography.title(
                                            color: isDark
                                                ? AppColors.textPrimaryDark
                                                : AppColors.textPrimaryLight,
                                          ),
                                        ),
                                        Text(
                                          'Your personal schedule and shared moments',
                                          style: AppTypography.xs(
                                            color: isDark
                                                ? AppColors.textSecondaryDark
                                                : AppColors.textSecondaryLight,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 12),

                              PromptBox(friend: personalFriend),
                              const SizedBox(height: 16),
                              calendarControls,
                              const SizedBox(height: 14),

                              if (isMonth)
                                MonthGrid(
                                  cursor: cur,
                                  getIntervalsOnDate: (d) => ref.watch(personalInstancesOnDateProvider(d)),
                                  onOpenDay: (ymd, min) {
                                    final evs = ref.read(personalInstancesOnDateProvider(ymd));
                                    if (evs.isNotEmpty) {
                                      ref.read(uiProvider.notifier).openFriendDay(
                                            FriendDayPayload(
                                              ymd: ymd,
                                              startMin: min,
                                              intervals: evs,
                                            ),
                                          );
                                    } else {
                                      ref.read(editorProvider.notifier).openNew(
                                            friendId: personalFriend.id,
                                            date: ymd,
                                            startMin: min,
                                          );
                                    }
                                  },
                                  onEditEvent: (ev) {
                                    final allRules = ref.read(rulesProvider).value ?? [];
                                    try {
                                      final r = allRules.firstWhere((rule) => rule.id == ev.ruleId);
                                      ref.read(editorProvider.notifier).openEdit(r);
                                    } catch (_) {}
                                  },
                                ),

                              if (isWeek)
                                WeekView(
                                  cursor: cur,
                                  getIntervalsOnDate: (d) => ref.watch(personalInstancesOnDateProvider(d)),
                                  onOpenDay: (ymd, min) {
                                    final evs = ref.read(personalInstancesOnDateProvider(ymd));
                                    if (evs.isNotEmpty) {
                                      ref.read(uiProvider.notifier).openFriendDay(
                                            FriendDayPayload(
                                              ymd: ymd,
                                              startMin: min,
                                              intervals: evs,
                                            ),
                                          );
                                    } else {
                                      ref.read(editorProvider.notifier).openNew(
                                            friendId: personalFriend.id,
                                            date: ymd,
                                            startMin: min,
                                          );
                                    }
                                  },
                                  onEditEvent: (ev) {
                                    final allRules = ref.read(rulesProvider).value ?? [];
                                    try {
                                      final r = allRules.firstWhere((rule) => rule.id == ev.ruleId);
                                      ref.read(editorProvider.notifier).openEdit(r);
                                    } catch (_) {}
                                  },
                                ),
                            ],
                          ],

                          // ── TAB: PER FRIEND ──
                          if (cal.tab == 'friends') ...[
                            if (regularFriends.isEmpty)
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 60),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Welcome to Friendule!',
                                      style: AppTypography.h3(
                                        color: isDark
                                            ? AppColors.textPrimaryDark
                                            : AppColors.textPrimaryLight,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Add your first friend to get started.',
                                      style: AppTypography.body(
                                        color: isDark
                                            ? AppColors.textSecondaryDark
                                            : AppColors.textSecondaryLight,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    DsButton(
                                      variant: DsButtonVariant.ink,
                                      text: '+ Add your first friend',
                                      onPressed: _openAddFriendModal,
                                    ),
                                  ],
                                ),
                              )
                            else if (selectedFriend != null) ...[
                              FriendSwitcher(
                                friend: selectedFriend,
                                onOpenAddFriend: _openAddFriendModal,
                              ),
                              const ConflictBanner(),
                              const SizedBox(height: 12),
                              PromptBox(friend: selectedFriend),
                              const SizedBox(height: 16),
                              calendarControls,
                              const SizedBox(height: 14),

                              if (isMonth)
                                MonthGrid(
                                  cursor: cur,
                                  getIntervalsOnDate: (d) => ref.watch(
                                    friendInstancesOnDateProvider((selectedFriend.id, d)),
                                  ),
                                  onOpenDay: (ymd, min) {
                                    final evs = ref.read(
                                      friendInstancesOnDateProvider((selectedFriend.id, ymd)),
                                    );
                                    if (evs.isNotEmpty) {
                                      ref.read(uiProvider.notifier).openFriendDay(
                                            FriendDayPayload(
                                              ymd: ymd,
                                              startMin: min,
                                              intervals: evs,
                                            ),
                                          );
                                    } else {
                                      ref.read(editorProvider.notifier).openNew(
                                            friendId: selectedFriend.id,
                                            date: ymd,
                                            startMin: min,
                                          );
                                    }
                                  },
                                  onEditEvent: (ev) {
                                    final allRules = ref.read(rulesProvider).value ?? [];
                                    try {
                                      final r = allRules.firstWhere((rule) => rule.id == ev.ruleId);
                                      ref.read(editorProvider.notifier).openEdit(r);
                                    } catch (_) {}
                                  },
                                ),

                              if (isWeek)
                                WeekView(
                                  cursor: cur,
                                  getIntervalsOnDate: (d) => ref.watch(
                                    friendInstancesOnDateProvider((selectedFriend.id, d)),
                                  ),
                                  onOpenDay: (ymd, min) {
                                    final evs = ref.read(
                                      friendInstancesOnDateProvider((selectedFriend.id, ymd)),
                                    );
                                    if (evs.isNotEmpty) {
                                      ref.read(uiProvider.notifier).openFriendDay(
                                            FriendDayPayload(
                                              ymd: ymd,
                                              startMin: min,
                                              intervals: evs,
                                            ),
                                          );
                                    } else {
                                      ref.read(editorProvider.notifier).openNew(
                                            friendId: selectedFriend.id,
                                            date: ymd,
                                            startMin: min,
                                          );
                                    }
                                  },
                                  onEditEvent: (ev) {
                                    final allRules = ref.read(rulesProvider).value ?? [];
                                    try {
                                      final r = allRules.firstWhere((rule) => rule.id == ev.ruleId);
                                      ref.read(editorProvider.notifier).openEdit(r);
                                    } catch (_) {}
                                  },
                                ),
                            ],
                          ],

                          // ── TAB: EVERYONE ──
                          if (cal.tab == 'everyone') ...[
                            EveryoneView(
                              onOpenDay: (ymd) {
                                final expansionMap = ref.read(expansionProvider);
                                final rows = regularFriends.map((fr) {
                                  final evs = (expansionMap[fr.id] ?? [])
                                      .where((e) => e.date == ymd)
                                      .toList();
                                  final busy = evs.any((e) => e.status == 'busy');
                                  final together = !busy && evs.any((e) => e.status == 'together');
                                  return DayDetailFriendRow(
                                    friend: fr,
                                    intervals: evs,
                                    isBusy: busy,
                                    isTogether: together,
                                  );
                                }).toList();

                                ref.read(uiProvider.notifier).openDayDetail(
                                      DayDetailPayload(ymd: ymd, rows: rows),
                                    );
                              },
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Toast Alert Banner Overlay at bottom
            if (uiState.toast != null)
              Positioned(
                bottom: 16,
                left: 20,
                right: 20,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.slate0 : AppColors.slate900,
                      borderRadius: BorderRadius.circular(999),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Text(
                      uiState.toast!,
                      style: AppTypography.sm(
                        color: isDark ? AppColors.slate950 : AppColors.slate0,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),

            // Clarification Dialog Overlay
            if (uiState.clarification != null)
              Positioned.fill(
                child: Container(
                  color: Colors.black54,
                  child: Center(
                    child: ClarificationModal(clarification: uiState.clarification!),
                  ),
                ),
              ),

            // Confirmation Dialog Overlay
            if (uiState.confirmAction != null)
              Positioned.fill(
                child: Container(
                  color: Colors.black54,
                  child: Center(
                    child: ConfirmDialog(action: uiState.confirmAction!),
                  ),
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: navIndex,
        onDestinationSelected: (idx) {
          if (idx == 0) {
            ref.read(calendarProvider.notifier).setTab('personal');
          } else if (idx == 1) {
            ref.read(calendarProvider.notifier).setTab('friends');
          } else {
            ref.read(calendarProvider.notifier).setTab('everyone');
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'My Calendar',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline_rounded),
            selectedIcon: Icon(Icons.people_rounded),
            label: 'Per Friend',
          ),
          NavigationDestination(
            icon: Icon(Icons.groups_outlined),
            selectedIcon: Icon(Icons.groups_rounded),
            label: 'Everyone',
          ),
        ],
      ),
    );
  }
}
