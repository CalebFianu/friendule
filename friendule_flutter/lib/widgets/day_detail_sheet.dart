import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/ui_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_badge.dart';

class DayDetailSheet extends ConsumerWidget {
  final DayDetailPayload payload;

  const DayDetailSheet({
    super.key,
    required this.payload,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final freeCount = payload.rows.where((r) => !r.isBusy).length;

    return Container(
      padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Sheet Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.slate700 : AppColors.slate300,
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prettyDate(payload.ymd),
                      style: AppTypography.h3(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$freeCount of ${payload.rows.length} friends look free',
                      style: AppTypography.sm(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Friend list
            ...payload.rows.map((row) {
              final fr = row.friend;
              final cs = fr.colorset;

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Friend Avatar
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: cs.tint,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: cs.tintBorder, width: 1.5),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        fr.initials,
                        style: AppTypography.sm(
                          color: cs.deep,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Friend Schedule Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                fr.name,
                                style: AppTypography.body(
                                  color: isDark
                                      ? AppColors.textPrimaryDark
                                      : AppColors.textPrimaryLight,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              DsBadge.fromStatus(
                                row.isBusy
                                    ? 'busy'
                                    : row.isTogether
                                        ? 'together'
                                        : 'free',
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),

                          // Event tags or "Wide open"
                          if (row.intervals.isEmpty)
                            Text(
                              'Wide open — ping them!',
                              style: AppTypography.xs(
                                color: AppColors.success,
                                fontWeight: FontWeight.w600,
                              ),
                            )
                          else
                            Wrap(
                              spacing: 4,
                              runSpacing: 4,
                              children: row.intervals.map((e) {
                                final cat = CategoryColors.get(e.status, isDark: isDark);
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: cat.fill,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${e.allDay ? 'All day' : '${fmtTime(e.startMin)}–${fmtTime(e.endMin)}'} · ${e.title}',
                                    style: AppTypography.xxs(
                                      color: cat.ink,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
