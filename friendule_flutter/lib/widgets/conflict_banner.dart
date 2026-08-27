import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/rule.dart';
import '../models/undo_action.dart';
import '../providers/conflicts_provider.dart';
import '../providers/editor_provider.dart';
import '../providers/rules_provider.dart';
import '../providers/ui_provider.dart';
import '../providers/undo_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_badge.dart';
import 'ds/ds_button.dart';

String _describeRule(Rule r) {
  final when = r.recurrence == 'once'
      ? (r.date ?? '')
      : r.recurrence == 'daily'
          ? 'every day'
          : 'weekly (${(r.weekdays ?? []).map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')})';
  final times = r.allDay ? 'All day' : '${r.timeStart}–${r.timeEnd}';
  return '"${r.title}" · $when · $times';
}

class ConflictBanner extends ConsumerWidget {
  const ConflictBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conflicts = ref.watch(conflictsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (conflicts.isEmpty) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(top: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.catAmberFillDark : AppColors.catAmberFillLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Title
          Row(
            children: [
              Icon(
                Icons.warning_amber_rounded,
                color: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${conflicts.length} conflicting rule${conflicts.length > 1 ? 's' : ''} — busy & free overlap',
                  style: AppTypography.sm(
                    color: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Conflicting Pairs
          ...conflicts.map((pair) {
            final a = pair.$1;
            final b = pair.$2;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                ),
              ),
              child: Column(
                children: [
                  _buildRuleRow(context, ref, a, isDark),
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  _buildRuleRow(context, ref, b, isDark),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildRuleRow(BuildContext context, WidgetRef ref, Rule rule, bool isDark) {
    return Row(
      children: [
        DsBadge.fromStatus(rule.status),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            _describeRule(rule),
            style: AppTypography.xs(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        DsButton(
          variant: DsButtonVariant.secondary,
          size: DsButtonSize.sm,
          text: 'Edit',
          onPressed: () {
            ref.read(editorProvider.notifier).openEdit(rule);
          },
        ),
        const SizedBox(width: 4),
        DsButton(
          variant: DsButtonVariant.danger,
          size: DsButtonSize.sm,
          text: 'Delete',
          onPressed: () async {
            await ref.read(rulesProvider.notifier).deleteRule(rule.id);
            ref.read(undoProvider.notifier).track(UndoAction.delete([rule]));
            ref.read(uiProvider.notifier).flash('Rule removed');
          },
        ),
      ],
    );
  }
}
