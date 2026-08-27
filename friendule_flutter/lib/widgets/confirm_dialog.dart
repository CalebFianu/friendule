import 'package:flutter/material.dart';
import '../config/constants.dart';
import '../models/confirm_action.dart';
import '../models/rule.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_badge.dart';
import 'ds/ds_button.dart';

String _describeSchedule(Rule rule) {
  final parts = <String>[];
  if (rule.recurrence == 'weekly' && rule.weekdays != null && rule.weekdays!.isNotEmpty) {
    parts.add(rule.weekdays!.map((d) => kWeekdays[d]).join(', '));
  } else if (rule.recurrence == 'once' && rule.date != null) {
    parts.add(rule.date!);
  } else if (rule.recurrence == 'daily') {
    parts.add('Every day');
  }

  if (rule.allDay) {
    parts.add('All day');
  } else if (rule.timeStart != null && rule.timeEnd != null) {
    parts.add('${rule.timeStart} – ${rule.timeEnd}');
  }

  if (rule.recurrence != 'once') {
    if (rule.dateFrom != null && rule.dateTo != null) {
      parts.add('${rule.dateFrom} to ${rule.dateTo}');
    } else if (rule.dateFrom != null) {
      parts.add('from ${rule.dateFrom}');
    } else if (rule.dateTo != null) {
      parts.add('until ${rule.dateTo}');
    }
  }

  return parts.join(' · ');
}

class ConfirmDialog extends StatelessWidget {
  final ConfirmAction action;

  const ConfirmDialog({
    super.key,
    required this.action,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isDelete = action.intent == 'delete';
    final isRevert = action.intent == 'revert';
    final count = action.affectedRules.length;

    final String title;
    final String subtitle;
    final String confirmLabel;
    final DsButtonVariant confirmVariant;

    if (isDelete) {
      title = 'Confirm deletion';
      subtitle = '$count rule${count > 1 ? 's' : ''} will be permanently removed.';
      confirmLabel = 'Delete ${count > 1 ? '$count rules' : 'rule'}';
      confirmVariant = DsButtonVariant.danger;
    } else if (isRevert) {
      title = 'Undo changes';
      subtitle = '$count rule${count > 1 ? 's' : ''} will be reverted.';
      confirmLabel = 'Revert';
      confirmVariant = DsButtonVariant.primary;
    } else {
      title = 'Confirm changes';
      subtitle = '$count rule${count > 1 ? 's' : ''} will be updated. Review changes below:';
      confirmLabel = 'Apply changes';
      confirmVariant = DsButtonVariant.primary;
    }

    return Dialog(
      backgroundColor: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520, maxHeight: 600),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                children: [
                  Icon(
                    isDelete
                        ? Icons.delete_outline_rounded
                        : isRevert
                            ? Icons.undo_rounded
                            : Icons.edit_note_rounded,
                    color: isDelete ? AppColors.danger : (isDark ? AppColors.violet400 : AppColors.violet500),
                    size: 24,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      title,
                      style: AppTypography.title(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: AppTypography.sm(
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 16),

              // Affected Rules List
              Flexible(
                child: SingleChildScrollView(
                  child: Column(
                    children: action.affectedRules.map((rule) {
                      if (isDelete || isRevert) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                            ),
                          ),
                          child: Row(
                            children: [
                              DsBadge.fromStatus(rule.status),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      rule.title,
                                      style: AppTypography.body(
                                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      _describeSchedule(rule),
                                      style: AppTypography.xs(
                                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      // Update Mode: Before / After Diff
                      final fields = action.updateFields ?? {};
                      final isAllDay = fields['allDay'] == true ||
                          (fields['allDay'] == null && rule.allDay);
                      final afterRule = rule.copyWith(
                        title: fields['title'] as String?,
                        status: fields['status'] as String?,
                        allDay: isAllDay,
                        timeStart: isAllDay ? null : (fields['timeStart'] as String?),
                        timeEnd: isAllDay ? null : (fields['timeEnd'] as String?),
                        recurrence: fields['recurrence'] as String?,
                        weekdays: fields['weekdays'] != null
                            ? List<int>.from(fields['weekdays'] as List)
                            : null,
                        date: fields['date'] as String?,
                      );

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Before
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'BEFORE',
                                    style: AppTypography.xxs(
                                      color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    rule.title,
                                    style: AppTypography.sm(
                                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    _describeSchedule(rule),
                                    style: AppTypography.xs(
                                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.arrow_forward_rounded,
                              size: 18,
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            ),
                            const SizedBox(width: 8),
                            // After
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'AFTER',
                                    style: AppTypography.xxs(
                                      color: isDark ? AppColors.violet300 : AppColors.violet600,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    afterRule.title,
                                    style: AppTypography.sm(
                                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  Text(
                                    _describeSchedule(afterRule),
                                    style: AppTypography.xs(
                                      color: isDark ? AppColors.violet300 : AppColors.violet600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DsButton(
                    variant: DsButtonVariant.secondary,
                    text: 'Cancel',
                    onPressed: action.onCancel,
                  ),
                  const SizedBox(width: 8),
                  DsButton(
                    variant: confirmVariant,
                    text: confirmLabel,
                    onPressed: action.onConfirm,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
