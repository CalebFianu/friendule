import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/editor_state.dart';
import '../providers/editor_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_button.dart';
import 'ds/ds_input.dart';
import 'ds/ds_segmented_control.dart';
import 'ds/ds_toggle.dart';

class EventEditorSheet extends ConsumerStatefulWidget {
  final EditorState editorState;

  const EventEditorSheet({
    super.key,
    required this.editorState,
  });

  @override
  ConsumerState<EventEditorSheet> createState() => _EventEditorSheetState();
}

class _EventEditorSheetState extends ConsumerState<EventEditorSheet> {
  late final TextEditingController _titleController;
  final wdLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.editorState.title);
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _pickDate({
    required BuildContext context,
    required String currentDate,
    required ValueChanged<String> onSelected,
  }) async {
    final initial = parseYmd(currentDate.isNotEmpty ? currentDate : ymd(DateTime.now()));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2020),
      lastDate: DateTime(2040),
    );
    if (picked != null) {
      onSelected(ymd(picked));
    }
  }

  Future<void> _pickTime({
    required BuildContext context,
    required String currentTime,
    required ValueChanged<String> onSelected,
  }) async {
    final parts = currentTime.split(':').map(int.parse).toList();
    final initial = TimeOfDay(hour: parts[0], minute: parts.length > 1 ? parts[1] : 0);
    final picked = await showTimePicker(
      context: context,
      initialTime: initial,
    );
    if (picked != null) {
      onSelected('${pad(picked.hour)}:${pad(picked.minute)}');
    }
  }

  @override
  Widget build(BuildContext context) {
    final ed = ref.watch(editorProvider) ?? widget.editorState;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Sheet Handle Bar
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

              // Title Header & Close
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    ed.mode == 'edit' ? 'Edit event' : 'New event',
                    style: AppTypography.h3(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Event Title Input
              Text(
                'WHAT’S HAPPENING',
                style: AppTypography.xxs(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.06,
                ),
              ),
              const SizedBox(height: 6),
              DsInput(
                controller: _titleController,
                placeholder: 'e.g. Yoga, Work, Free time',
                onChanged: (text) => ref.read(editorProvider.notifier).update((s) => s.copyWith(title: text)),
              ),
              const SizedBox(height: 16),

              // Status & Recurrence Row
              Row(
                children: [
                  // Status
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'STATUS',
                          style: AppTypography.xxs(
                            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.06,
                          ),
                        ),
                        const SizedBox(height: 6),
                        DsSegmentedControl<String>(
                          size: DsSegmentedControlSize.sm,
                          value: ed.status,
                          onChanged: (v) => ref.read(editorProvider.notifier).update((s) => s.copyWith(status: v)),
                          options: const [
                            DsSegmentOption(label: 'busy', value: 'busy'),
                            DsSegmentOption(label: 'free', value: 'free'),
                            DsSegmentOption(label: 'together', value: 'together'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),

                  // When / Repeat
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'WHEN',
                          style: AppTypography.xxs(
                            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.06,
                          ),
                        ),
                        const SizedBox(height: 6),
                        DsSegmentedControl<String>(
                          size: DsSegmentedControlSize.sm,
                          value: ed.repeat,
                          onChanged: (v) => ref.read(editorProvider.notifier).update((s) => s.copyWith(repeat: v)),
                          options: const [
                            DsSegmentOption(label: 'once', value: 'once'),
                            DsSegmentOption(label: 'weekly', value: 'weekly'),
                            DsSegmentOption(label: 'daily', value: 'daily'),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              // Once -> Date Picker
              if (ed.repeat == 'once') ...[
                const SizedBox(height: 16),
                Text(
                  'DATE',
                  style: AppTypography.xxs(
                    color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.06,
                  ),
                ),
                const SizedBox(height: 6),
                GestureDetector(
                  onTap: () => _pickDate(
                    context: context,
                    currentDate: ed.date,
                    onSelected: (d) => ref.read(editorProvider.notifier).update((s) => s.copyWith(date: d)),
                  ),
                  child: Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          prettyDate(ed.date),
                          style: AppTypography.body(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                        Icon(
                          Icons.calendar_today_rounded,
                          size: 18,
                          color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                        ),
                      ],
                    ),
                  ),
                ),
              ],

              // Weekly -> Weekdays Selector
              if (ed.repeat == 'weekly') ...[
                const SizedBox(height: 16),
                Text(
                  'REPEATS ON',
                  style: AppTypography.xxs(
                    color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.06,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(7, (i) {
                    final isSelected = ed.weekdays.contains(i);
                    return GestureDetector(
                      onTap: () => ref.read(editorProvider.notifier).toggleWeekday(i),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 140),
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? (isDark ? AppColors.violet400 : AppColors.violet500)
                              : (isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceCardLight),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected
                                ? (isDark ? AppColors.violet400 : AppColors.violet500)
                                : (isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight),
                            width: 1.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          wdLabels[i],
                          style: AppTypography.sm(
                            color: isSelected
                                ? Colors.white
                                : (isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ],

              // Date bounds for weekly / daily rules
              if (ed.repeat != 'once') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ACTIVE FROM (OPTIONAL)',
                            style: AppTypography.xxs(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.06,
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () => _pickDate(
                              context: context,
                              currentDate: ed.dateFrom ?? ymd(DateTime.now()),
                              onSelected: (d) => ref.read(editorProvider.notifier).update((s) => s.copyWith(dateFrom: d)),
                            ),
                            child: Container(
                              height: 44,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                                ),
                              ),
                              alignment: Alignment.centerLeft,
                              child: Text(
                                ed.dateFrom != null && ed.dateFrom!.isNotEmpty
                                    ? prettyDate(ed.dateFrom!)
                                    : 'None',
                                style: AppTypography.sm(
                                  color: ed.dateFrom != null && ed.dateFrom!.isNotEmpty
                                      ? (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)
                                      : (isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'UNTIL (OPTIONAL)',
                            style: AppTypography.xxs(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.06,
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () => _pickDate(
                              context: context,
                              currentDate: ed.dateTo ?? ymd(DateTime.now()),
                              onSelected: (d) => ref.read(editorProvider.notifier).update((s) => s.copyWith(dateTo: d)),
                            ),
                            child: Container(
                              height: 44,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                                ),
                              ),
                              alignment: Alignment.centerLeft,
                              child: Text(
                                ed.dateTo != null && ed.dateTo!.isNotEmpty
                                    ? prettyDate(ed.dateTo!)
                                    : 'None',
                                style: AppTypography.sm(
                                  color: ed.dateTo != null && ed.dateTo!.isNotEmpty
                                      ? (isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)
                                      : (isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],

              // All-day Toggle
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'All-day event',
                    style: AppTypography.body(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  DsToggle(
                    value: ed.allDay,
                    onChanged: (val) => ref.read(editorProvider.notifier).update((s) => s.copyWith(allDay: val)),
                  ),
                ],
              ),

              // Start / End Time Pickers (if not all-day)
              if (!ed.allDay) ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'START TIME',
                            style: AppTypography.xxs(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.06,
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () => _pickTime(
                              context: context,
                              currentTime: ed.start,
                              onSelected: (t) => ref.read(editorProvider.notifier).update((s) => s.copyWith(start: t)),
                            ),
                            child: Container(
                              height: 44,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                                ),
                              ),
                              alignment: Alignment.centerLeft,
                              child: Text(
                                fmtTime(toMin(ed.start)),
                                style: AppTypography.body(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'END TIME',
                            style: AppTypography.xxs(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.06,
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () => _pickTime(
                              context: context,
                              currentTime: ed.end,
                              onSelected: (t) => ref.read(editorProvider.notifier).update((s) => s.copyWith(end: t)),
                            ),
                            child: Container(
                              height: 44,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                                ),
                              ),
                              alignment: Alignment.centerLeft,
                              child: Text(
                                fmtTime(toMin(ed.end)),
                                style: AppTypography.body(
                                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              // Action Buttons
              Row(
                children: [
                  if (ed.mode == 'edit')
                    DsButton(
                      variant: DsButtonVariant.danger,
                      text: 'Delete',
                      onPressed: () async {
                        await ref.read(editorProvider.notifier).delete();
                        if (context.mounted) {
                          Navigator.of(context).pop();
                        }
                      },
                    ),
                  const Spacer(),
                  DsButton(
                    variant: DsButtonVariant.secondary,
                    text: 'Cancel',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  DsButton(
                    variant: DsButtonVariant.primary,
                    text: 'Save',
                    onPressed: () async {
                      final success = await ref.read(editorProvider.notifier).save();
                      if (success && context.mounted) {
                        Navigator.of(context).pop();
                      }
                    },
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
