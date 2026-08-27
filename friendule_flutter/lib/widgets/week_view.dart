import 'dart:math';
import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/interval.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_event_chip.dart';

const double kHourHeight = 52.0;
const int kRailStart = 6; // 6 AM
const int kRailEnd = 23; // 11 PM

class WeekView extends StatelessWidget {
  final DateTime cursor;
  final List<ScheduleInterval> Function(String date) getIntervalsOnDate;
  final void Function(String ymd, int startMin) onOpenDay;
  final void Function(ScheduleInterval interval) onEditEvent;

  const WeekView({
    super.key,
    required this.cursor,
    required this.getIntervalsOnDate,
    required this.onOpenDay,
    required this.onEditEvent,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final now = DateTime.now();
    final todayY = ymd(now);
    final nowMin = now.hour * 60 + now.minute;

    final ws = addDays(cursor, -(cursor.weekday % 7)); // Sunday start of week
    final totalTimelineHeight = (kRailEnd - kRailStart) * kHourHeight;

    final weekDays = List.generate(7, (i) {
      final d = addDays(ws, i);
      final y = ymd(d);
      final isT = y == todayY;
      final inst = getIntervalsOnDate(y);
      final allDay = inst.where((e) => e.allDay).toList();
      final timed = inst.where((e) => !e.allDay).toList();

      double? nowTop;
      if (isT && nowMin >= kRailStart * 60 && nowMin <= kRailEnd * 60) {
        nowTop = ((nowMin - kRailStart * 60) / 60.0) * kHourHeight;
      }

      return (
        date: d,
        ymd: y,
        isToday: isT,
        weekday: d.weekday % 7,
        dayNum: d.day,
        allDay: allDay,
        timed: timed,
        nowTop: nowTop,
      );
    });

    final hasAnyAllDay = weekDays.any((d) => d.allDay.isNotEmpty);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: SizedBox(
            width: max(760, MediaQuery.of(context).size.width - 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Day Headers Row
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                    border: Border(
                      bottom: BorderSide(
                        color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      const SizedBox(width: 54), // Time rail spacer
                      ...weekDays.map((day) {
                        return Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: day.isToday
                                  ? (isDark ? AppColors.accentWashDark : AppColors.accentWashLight)
                                  : Colors.transparent,
                              border: Border(
                                left: BorderSide(
                                  color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                                ),
                              ),
                            ),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  kWeekdays[day.weekday].toUpperCase(),
                                  style: AppTypography.xxs(
                                    color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.06,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                day.isToday
                                    ? Container(
                                        width: 26,
                                        height: 26,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: isDark ? AppColors.violet400 : AppColors.violet500,
                                        ),
                                        alignment: Alignment.center,
                                        child: Text(
                                          '${day.dayNum}',
                                          style: AppTypography.sm(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      )
                                    : Text(
                                        '${day.dayNum}',
                                        style: AppTypography.sm(
                                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),

                // All-day Row (if any)
                if (hasAnyAllDay)
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                      border: Border(
                        bottom: BorderSide(
                          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                        ),
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 54,
                          child: Padding(
                            padding: const EdgeInsets.only(top: 8, right: 6),
                            child: Text(
                              'ALL-DAY',
                              textAlign: TextAlign.right,
                              style: AppTypography.xxs(
                                color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.05,
                              ),
                            ),
                          ),
                        ),
                        ...weekDays.map((day) {
                          return Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                border: Border(
                                  left: BorderSide(
                                    color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                                  ),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: day.allDay.map((ev) {
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 3),
                                    child: DsEventChip(
                                      title: ev.title,
                                      category: ev.status,
                                      fromFriendColor: ev.fromFriend?.colorset.solid,
                                      onTap: () => onEditEvent(ev),
                                    ),
                                  );
                                }).toList(),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),

                // Scrollable Timeline Hours & Events
                SizedBox(
                  height: 480,
                  child: SingleChildScrollView(
                    child: SizedBox(
                      height: totalTimelineHeight,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Time Rail Column (6 AM to 11 PM)
                          SizedBox(
                            width: 54,
                            child: Stack(
                              children: List.generate(kRailEnd - kRailStart, (i) {
                                final hour = kRailStart + i;
                                final ap = hour < 12 ? 'AM' : 'PM';
                                var hh = hour % 12;
                                if (hh == 0) hh = 12;

                                return Positioned(
                                  top: i * kHourHeight - 8,
                                  right: 8,
                                  child: Text(
                                    '$hh $ap',
                                    style: AppTypography.mono(
                                      color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ),

                          // 7 Day Timeline Columns
                          ...weekDays.map((day) {
                            return Expanded(
                              child: Container(
                                height: totalTimelineHeight,
                                decoration: BoxDecoration(
                                  border: Border(
                                    left: BorderSide(
                                      color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                                    ),
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    // Repeating Hour Grid Lines & Tap Targets
                                    ...List.generate(kRailEnd - kRailStart, (hi) {
                                      final hour = kRailStart + hi;
                                      return Positioned(
                                        top: hi * kHourHeight,
                                        left: 0,
                                        right: 0,
                                        height: kHourHeight,
                                        child: GestureDetector(
                                          onTap: () => onOpenDay(day.ymd, hour * 60),
                                          behavior: HitTestBehavior.opaque,
                                          child: Container(
                                            decoration: BoxDecoration(
                                              border: Border(
                                                top: BorderSide(
                                                  color: (isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight)
                                                      .withValues(alpha: 0.5),
                                                  width: 1,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    }),

                                    // Timed Events Blocks
                                    ...day.timed.map((ev) {
                                      final start = ev.startMin ?? (kRailStart * 60);
                                      final end = ev.endMin ?? (start + 60);

                                      final top = max(
                                        0.0,
                                        ((start - kRailStart * 60) / 60.0) * kHourHeight,
                                      );
                                      final bottom = ((min(end, kRailEnd * 60) - kRailStart * 60) / 60.0) * kHourHeight;
                                      final height = max(26.0, bottom - top);

                                      final cat = CategoryColors.get(ev.status, isDark: isDark);

                                      return Positioned(
                                        top: top,
                                        left: 2,
                                        right: 2,
                                        height: height,
                                        child: GestureDetector(
                                          onTap: () => onEditEvent(ev),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: cat.fill,
                                              borderRadius: BorderRadius.circular(6),
                                              border: Border(
                                                left: BorderSide(color: cat.ink, width: 3),
                                              ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: Colors.black.withValues(alpha: 0.06),
                                                  blurRadius: 3,
                                                  offset: const Offset(0, 1),
                                                ),
                                              ],
                                            ),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Row(
                                                  children: [
                                                    if (ev.fromFriend != null) ...[
                                                      Container(
                                                        width: 8,
                                                        height: 8,
                                                        decoration: BoxDecoration(
                                                          shape: BoxShape.circle,
                                                          color: ev.fromFriend!.colorset.solid,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 4),
                                                    ],
                                                    Expanded(
                                                      child: Text(
                                                        ev.title,
                                                        style: AppTypography.xxs(
                                                          color: cat.ink,
                                                          fontWeight: FontWeight.w700,
                                                        ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                if (height > 34) ...[
                                                  const SizedBox(height: 1),
                                                  Text(
                                                    '${fmtTime(ev.startMin)}–${fmtTime(ev.endMin)}',
                                                    style: AppTypography.mono(
                                                      color: cat.ink.withValues(alpha: 0.85),
                                                      fontSize: 10,
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    }),

                                    // Live "Now" Indicator Line
                                    if (day.nowTop != null)
                                      Positioned(
                                        top: day.nowTop!,
                                        left: 0,
                                        right: 0,
                                        child: Stack(
                                          clipBehavior: Clip.none,
                                          children: [
                                            Container(
                                              height: 2,
                                              color: isDark ? AppColors.violet400 : AppColors.violet500,
                                            ),
                                            Positioned(
                                              left: -4,
                                              top: -3,
                                              child: Container(
                                                width: 8,
                                                height: 8,
                                                decoration: BoxDecoration(
                                                  shape: BoxShape.circle,
                                                  color: isDark ? AppColors.violet400 : AppColors.violet500,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
