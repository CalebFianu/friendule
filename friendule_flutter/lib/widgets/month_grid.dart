import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/interval.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_event_chip.dart';

class MonthGrid extends StatelessWidget {
  final DateTime cursor;
  final List<ScheduleInterval> Function(String date) getIntervalsOnDate;
  final void Function(String ymd, int startMin) onOpenDay;
  final void Function(ScheduleInterval interval) onEditEvent;

  const MonthGrid({
    super.key,
    required this.cursor,
    required this.getIntervalsOnDate,
    required this.onOpenDay,
    required this.onEditEvent,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final grid = buildGrid(cursor);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Weekday Column Headers
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

        // 6-week x 7-day Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            mainAxisSpacing: 5,
            crossAxisSpacing: 5,
            childAspectRatio: 0.76,
          ),
          itemCount: 42,
          itemBuilder: (context, index) {
            final cell = grid[index];
            final events = getIntervalsOnDate(cell.ymd);
            final displayChips = events.take(3).toList();
            final remaining = events.length - displayChips.length;

            final cellBg = cell.inMonth
                ? (isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight)
                : (isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight);

            final borderColor = cell.isToday
                ? (isDark ? AppColors.violet400 : AppColors.violet500)
                : (isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight);

            return GestureDetector(
              onTap: () => onOpenDay(cell.ymd, 720),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                decoration: BoxDecoration(
                  color: cellBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: borderColor,
                    width: cell.isToday ? 1.5 : 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
                      blurRadius: 3,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Day Number Indicator
                    Align(
                      alignment: Alignment.topRight,
                      child: cell.isToday
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
                    ),
                    const SizedBox(height: 3),

                    // Event Chips
                    Expanded(
                      child: SingleChildScrollView(
                        physics: const NeverScrollableScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            ...displayChips.map((ev) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 2),
                                child: DsEventChip(
                                  title: ev.allDay
                                      ? ev.title
                                      : '${shortTime(ev.startMin)} ${ev.title}',
                                  category: ev.status,
                                  fromFriendColor: ev.fromFriend?.colorset.solid,
                                  onTap: () => onEditEvent(ev),
                                ),
                              );
                            }),
                            if (remaining > 0)
                              Padding(
                                padding: const EdgeInsets.only(left: 2, top: 1),
                                child: Text(
                                  '+$remaining more',
                                  style: AppTypography.xxs(
                                    color: isDark
                                        ? AppColors.textTertiaryDark
                                        : AppColors.textTertiaryLight,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
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
