import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

enum DsSegmentedControlSize { sm, md }

class DsSegmentOption<T> {
  final String label;
  final T value;
  final Widget? icon;

  const DsSegmentOption({
    required this.label,
    required this.value,
    this.icon,
  });
}

class DsSegmentedControl<T> extends StatelessWidget {
  final List<DsSegmentOption<T>> options;
  final T value;
  final ValueChanged<T> onChanged;
  final DsSegmentedControlSize size;

  const DsSegmentedControl({
    super.key,
    required this.options,
    required this.value,
    required this.onChanged,
    this.size = DsSegmentedControlSize.md,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final double height;
    final double horizontalPadding;
    final TextStyle textStyle;

    switch (size) {
      case DsSegmentedControlSize.sm:
        height = 30;
        horizontalPadding = 10;
        textStyle = AppTypography.xs(fontWeight: FontWeight.w600);
        break;
      case DsSegmentedControlSize.md:
        height = 38;
        horizontalPadding = 14;
        textStyle = AppTypography.sm(fontWeight: FontWeight.w600);
        break;
    }

    final containerBg = isDark ? AppColors.surfaceInsetDark : AppColors.surfaceInsetLight;
    final activeBg = isDark ? AppColors.violet400 : AppColors.violet500;
    final inactiveText = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: containerBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: options.map((opt) {
          final isSelected = opt.value == value;
          return GestureDetector(
            onTap: () => onChanged(opt.value),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 140),
              curve: Curves.easeOut,
              height: height,
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              decoration: BoxDecoration(
                color: isSelected ? activeBg : Colors.transparent,
                borderRadius: BorderRadius.circular(9),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: (isDark ? AppColors.violet400 : AppColors.violet500)
                              .withValues(alpha: 0.25),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        )
                      ]
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (opt.icon != null) ...[
                    IconTheme(
                      data: IconThemeData(
                        color: isSelected ? Colors.white : inactiveText,
                        size: 16,
                      ),
                      child: opt.icon!,
                    ),
                    const SizedBox(width: 5),
                  ],
                  Text(
                    opt.label,
                    style: textStyle.copyWith(
                      color: isSelected ? Colors.white : inactiveText,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
