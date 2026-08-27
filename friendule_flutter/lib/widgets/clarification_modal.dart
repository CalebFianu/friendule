import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/clarification.dart';
import '../providers/prompt_provider.dart';
import '../providers/ui_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_button.dart';
import 'ds/ds_input.dart';

class ClarificationModal extends ConsumerStatefulWidget {
  final ClarificationState clarification;

  const ClarificationModal({
    super.key,
    required this.clarification,
  });

  @override
  ConsumerState<ClarificationModal> createState() => _ClarificationModalState();
}

class _ClarificationModalState extends ConsumerState<ClarificationModal> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleConfirm() {
    final answer = _controller.text.trim();
    if (answer.isEmpty) return;

    final combined = '${widget.clarification.originalPrompt}\n$answer';
    ref.read(uiProvider.notifier).closeClarification();
    ref.read(promptProvider.notifier).commitPrompt(overrideText: combined);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      backgroundColor: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header with Amber Question Icon
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.catAmberFillDark : AppColors.catAmberFillLight,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      Icons.help_outline_rounded,
                      color: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'A little more info needed',
                          style: AppTypography.title(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.clarification.question,
                          style: AppTypography.body(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Answer Input
              DsInput(
                controller: _controller,
                placeholder: 'Type your answer…',
                autofocus: true,
                onSubmitted: (_) => _handleConfirm(),
              ),
              const SizedBox(height: 20),

              // Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DsButton(
                    variant: DsButtonVariant.secondary,
                    text: 'Cancel',
                    onPressed: () {
                      ref.read(uiProvider.notifier).closeClarification();
                    },
                  ),
                  const SizedBox(width: 8),
                  DsButton(
                    variant: DsButtonVariant.primary,
                    text: 'Submit',
                    onPressed: _handleConfirm,
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
