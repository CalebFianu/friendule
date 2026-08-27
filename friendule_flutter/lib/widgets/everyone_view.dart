import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../models/friend.dart';
import '../providers/calendar_provider.dart';
import '../providers/expansion_provider.dart';
import '../providers/friends_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_icon_button.dart';

class EveryoneView extends ConsumerWidget {
  final void Function(String ymd) onOpenDay;

  const EveryoneView({
    super.key,
    required this.onOpenDay,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final friends = ref.watch(regularFriendsProvider);
    final cal = ref.watch(calendarProvider);
    final expandedByFriend = ref.watch(expansionProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final cur = parseYmd(cal.cursor);
    final monthLabel = '${kMonths[cur.month - 1]} ${cur.year}';

    final filterActive = cal.everyoneFilter.isNotEmpty;
    final filterFriends = filterActive
        ? friends.where((f) => cal.everyoneFilter.contains(f.id)).toList()
        : <Friend>[];
    final filterNames = filterFriends.map((f) => f.firstName).toList();

    final String everyoneFilterName;
    if (filterNames.length <= 2) {
      everyoneFilterName = filterNames.join(' & ');
    } else {
      everyoneFilterName =
          '${filterNames.sublist(0, filterNames.length - 1).join(', ')} & ${filterNames.last}';
    }

    bool isBusyOn(String friendId, String ymdDate) {
      final list = expandedByFriend[friendId] ?? [];
      return list.any((e) => e.date == ymdDate && e.status == 'busy');
    }

    // Compute Gathering Insight
    String insightTitle = 'Best time to gather';
    String insightLabel = 'Everyone’s pretty booked the next two weeks.';

    if (filterActive) {
      bool allBusy(String y) => filterFriends.any((fr) => isBusyOn(fr.id, y));
      String? nextFree;
      for (var i = 0; i < 14; i++) {
        final d = addDays(DateTime.now(), i);
        final y2 = ymd(d);
        if (!allBusy(y2)) {
          nextFree = y2;
          break;
        }
      }

      if (filterFriends.length == 1) {
        insightTitle = 'Next free for $everyoneFilterName';
        insightLabel = nextFree != null
            ? '${prettyDate(nextFree)} — $everyoneFilterName is free'
            : '$everyoneFilterName is booked the next two weeks.';
      } else {
        insightTitle = 'Best time for $everyoneFilterName';
        insightLabel = nextFree != null
            ? '${prettyDate(nextFree)} — all ${filterFriends.length} are free'
            : 'No shared free days in the next two weeks.';
      }
    } else {
      ({int count, String y, List<String> names})? best;
      for (var i = 0; i < 14; i++) {
        final d = addDays(DateTime.now(), i);
        final y2 = ymd(d);
        final freeNames = friends
            .where((fr) => !isBusyOn(fr.id, y2))
            .map((fr) => fr.firstName)
            .toList();

        if (best == null || freeNames.length > best.count) {
          best = (count: freeNames.length, y: y2, names: freeNames);
        }
        if (best.count == friends.length) break;
      }

      if (best != null) {
        if (best.count == 0) {
          insightLabel = 'No fully-free days soon — try the day view to find gaps.';
        } else if (best.count == friends.length) {
          insightLabel = '${prettyDate(best.y)} — all ${friends.length} are free!';
        } else {
          insightLabel =
              '${prettyDate(best.y)} — ${best.count} of ${friends.length} free (${best.names.join(', ')})';
        }
      }
    }

    final grid = buildGrid(cur);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Navigation Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Everyone · $monthLabel',
              style: AppTypography.title(
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ).copyWith(fontSize: 17, fontWeight: FontWeight.w800),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                DsIconButton(
                  icon: const Icon(Icons.chevron_left_rounded, size: 18),
                  shape: DsIconButtonShape.circle,
                  size: DsIconButtonSize.sm,
                  onPressed: () => ref.read(calendarProvider.notifier).prevPeriod(),
                  tooltip: 'Previous month',
                ),
                const SizedBox(width: 4),
                DsIconButton(
                  icon: const Icon(Icons.chevron_right_rounded, size: 18),
                  shape: DsIconButtonShape.circle,
                  size: DsIconButtonSize.sm,
                  onPressed: () => ref.read(calendarProvider.notifier).nextPeriod(),
                  tooltip: 'Next month',
                ),
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () => ref.read(calendarProvider.notifier).goToday(),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
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
          ],
        ),
        const SizedBox(height: 12),

        // Insight Hero Banner
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.violet500, AppColors.violet700],
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: AppColors.violet600.withValues(alpha: 0.3),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.access_time_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      insightTitle.toUpperCase(),
                      style: AppTypography.xxs(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.06,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      insightLabel,
                      style: AppTypography.title(color: Colors.white).copyWith(fontSize: 15),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Friend Filter Pills
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              if (filterActive)
                Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => ref.read(calendarProvider.notifier).clearEveryoneFilter(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.accentWashDark : AppColors.accentWashLight,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: isDark ? AppColors.borderBrandDark : AppColors.violet400,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: isDark ? AppColors.textBrandDark : AppColors.textBrandLight,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Show all',
                            style: AppTypography.xs(
                              color: isDark ? AppColors.textBrandDark : AppColors.textBrandLight,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ...friends.map((fr) {
                final active = cal.everyoneFilter.contains(fr.id);
                final dim = filterActive && !active;

                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => ref.read(calendarProvider.notifier).toggleEveryoneFilter(fr.id),
                    child: Opacity(
                      opacity: dim ? 0.5 : 1.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: active
                              ? fr.colorset.tint
                              : (isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(
                            color: active
                                ? fr.colorset.solid
                                : (isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: fr.colorset.solid,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              fr.firstName,
                              style: AppTypography.xs(
                                color: active
                                    ? fr.colorset.deep
                                    : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Weekday Headers
        Row(
          children: kWeekdays.map((wd) {
            return Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Text(
                    wd.toUpperCase(),
                    style: AppTypography.xxs(
                      color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.08,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),

        // Everyone 42-day availability grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            mainAxisSpacing: 5,
            crossAxisSpacing: 5,
            childAspectRatio: 0.88,
          ),
          itemCount: 42,
          itemBuilder: (context, index) {
            final cell = grid[index];
            final dots = <Friend>[];
            var freeCount = 0;
            var shown = 0;

            for (final fr in friends) {
              if (filterActive && !cal.everyoneFilter.contains(fr.id)) continue;
              shown++;
              if (isBusyOn(fr.id, cell.ymd)) {
                dots.add(fr);
              } else {
                freeCount++;
              }
            }

            final allFree = shown > 0 && freeCount == shown;
            final freeLabel = cell.inMonth && allFree ? (shown == 1 ? 'free' : 'all free') : '';

            final cellBg = cell.inMonth
                ? (isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight)
                : (isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight);

            final borderColor = cell.isToday
                ? (isDark ? AppColors.violet400 : AppColors.violet500)
                : (isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight);

            return GestureDetector(
              onTap: () => onOpenDay(cell.ymd),
              child: Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: cellBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: borderColor,
                    width: cell.isToday ? 1.5 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        cell.isToday
                            ? Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: isDark ? AppColors.violet400 : AppColors.violet500,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  '${cell.day}',
                                  style: AppTypography.xxs(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              )
                            : Text(
                                '${cell.day}',
                                style: AppTypography.xxs(
                                  color: cell.inMonth
                                      ? (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)
                                      : (isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                        if (freeLabel.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.catMintFillDark : AppColors.catMintFillLight,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              freeLabel,
                              style: AppTypography.xxs(
                                color: isDark ? AppColors.catMintInkDark : AppColors.catMintInkLight,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const Spacer(),

                    // Busy Friend Dots
                    Wrap(
                      spacing: 3,
                      runSpacing: 3,
                      children: dots.map((fr) {
                        return Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: fr.colorset.solid,
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}
