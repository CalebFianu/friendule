import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/friend.dart';
import '../providers/editor_provider.dart';
import '../providers/rules_provider.dart';
import '../providers/ui_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_badge.dart';
import 'ds/ds_button.dart';

class FriendDayPanelSheet extends ConsumerWidget {
  final FriendDayPayload payload;
  final Friend? friend;

  const FriendDayPanelSheet({
    super.key,
    required this.payload,
    this.friend,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final allRules = ref.watch(rulesProvider).value ?? [];

    final subtitle = friend == null
        ? 'Schedule'
        : friend!.isSelf
            ? 'Your schedule'
            : '${friend!.firstName}’s schedule';

    return Container(
      padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
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
            crossAxisAlignment: CrossAxisAlignment.start,
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
                    subtitle,
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

          // Events list
          if (payload.intervals.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Text(
                'No events — wide open!',
                style: AppTypography.body(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                ),
              ),
            )
          else
            ...payload.intervals.map((e) {
              final cat = CategoryColors.get(e.status, isDark: isDark);

              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).pop();
                    try {
                      final rule = allRules.firstWhere((r) => r.id == e.ruleId);
                      ref.read(editorProvider.notifier).openEdit(rule);
                    } catch (_) {}
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: e.fromFriend != null
                                ? e.fromFriend!.colorset.solid
                                : cat.ink,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                e.title,
                                style: AppTypography.body(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${e.fromFriend != null ? 'with ${e.fromFriend!.firstName} · ' : ''}${e.allDay ? 'All day' : '${fmtTime(e.startMin)} – ${fmtTime(e.endMin)}'}',
                                style: AppTypography.xs(
                                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        DsBadge.fromStatus(e.status),
                      ],
                    ),
                  ),
                ),
              );
            }),

          const SizedBox(height: 16),

          // Add event button
          DsButton(
            variant: DsButtonVariant.ink,
            size: DsButtonSize.lg,
            fullWidth: true,
            text: '+ Add event on this day',
            onPressed: () {
              Navigator.of(context).pop();
              if (friend != null) {
                ref.read(editorProvider.notifier).openNew(
                      friendId: friend!.id,
                      date: payload.ymd,
                      startMin: payload.startMin,
                    );
              }
            },
          ),
        ],
      ),
    );
  }
}
