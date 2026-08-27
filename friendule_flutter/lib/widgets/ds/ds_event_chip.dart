import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

enum DsEventChipVariant { filled, line }

class DsEventChip extends StatelessWidget {
  final String title;
  final String? time;
  final String category; // 'busy' (rose), 'free' (mint), 'together' (violet) or color category name
  final DsEventChipVariant variant;
  final VoidCallback? onTap;
  final Color? fromFriendColor;

  const DsEventChip({
    super.key,
    required this.title,
    this.time,
    this.category = 'violet',
    this.variant = DsEventChipVariant.filled,
    this.onTap,
    this.fromFriendColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cat = CategoryColors.get(category, isDark: isDark);

    final Color bg;
    final Color textColor;
    final Color barColor = cat.ink;

    if (variant == DsEventChipVariant.line) {
      bg = isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight;
      textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    } else {
      bg = cat.fill;
      textColor = cat.ink;
    }

    Widget content = Container(
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border(
          left: BorderSide(color: barColor, width: 3),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (fromFriendColor != null) ...[
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: fromFriendColor,
                  ),
                ),
                const SizedBox(width: 4),
              ],
              Flexible(
                child: Text(
                  title,
                  style: AppTypography.xxs(
                    color: textColor,
                    fontWeight: FontWeight.w700,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
          if (time != null) ...[
            const SizedBox(height: 1),
            Text(
              time!,
              style: AppTypography.mono(
                color: variant == DsEventChipVariant.line
                    ? (isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight)
                    : textColor.withValues(alpha: 0.85),
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
          ],
        ],
      ),
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: content,
      );
    }
    return content;
  }
}
