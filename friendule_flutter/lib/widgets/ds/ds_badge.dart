import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

enum DsBadgeTone { neutral, brand, success, warning, danger, info, together }

enum DsBadgeVariant { soft, solid, outline }

class DsBadge extends StatelessWidget {
  final Widget? child;
  final String? text;
  final DsBadgeTone tone;
  final DsBadgeVariant variant;
  final bool dot;

  const DsBadge({
    super.key,
    this.child,
    this.text,
    this.tone = DsBadgeTone.neutral,
    this.variant = DsBadgeVariant.soft,
    this.dot = false,
  });

  factory DsBadge.fromStatus(String status, {bool dot = false}) {
    switch (status.toLowerCase()) {
      case 'busy':
        return DsBadge(tone: DsBadgeTone.danger, text: 'Busy', dot: dot);
      case 'free':
        return DsBadge(tone: DsBadgeTone.success, text: 'Free', dot: dot);
      case 'together':
        return DsBadge(tone: DsBadgeTone.together, text: 'Together', dot: dot);
      default:
        return DsBadge(tone: DsBadgeTone.neutral, text: status, dot: dot);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color fill;
    Color ink;
    Color solid;

    switch (tone) {
      case DsBadgeTone.brand:
        fill = isDark ? AppColors.accentWashDark : AppColors.accentWashLight;
        ink = isDark ? AppColors.textBrandDark : AppColors.textBrandLight;
        solid = isDark ? AppColors.violet400 : AppColors.violet500;
        break;
      case DsBadgeTone.success:
        fill = isDark ? AppColors.catMintFillDark : AppColors.catMintFillLight;
        ink = isDark ? AppColors.catMintInkDark : AppColors.catMintInkLight;
        solid = AppColors.success;
        break;
      case DsBadgeTone.warning:
        fill = isDark ? AppColors.catAmberFillDark : AppColors.catAmberFillLight;
        ink = isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight;
        solid = AppColors.warning;
        break;
      case DsBadgeTone.danger:
        fill = isDark ? AppColors.catRoseFillDark : AppColors.catRoseFillLight;
        ink = isDark ? AppColors.catRoseInkDark : AppColors.catRoseInkLight;
        solid = AppColors.danger;
        break;
      case DsBadgeTone.info:
        fill = isDark ? AppColors.catBlueFillDark : AppColors.catBlueFillLight;
        ink = isDark ? AppColors.catBlueInkDark : AppColors.catBlueInkLight;
        solid = AppColors.info;
        break;
      case DsBadgeTone.together:
        fill = isDark ? AppColors.catVioletFillDark : AppColors.catVioletFillLight;
        ink = isDark ? AppColors.catVioletInkDark : AppColors.catVioletInkLight;
        solid = isDark ? AppColors.violet400 : AppColors.violet500;
        break;
      case DsBadgeTone.neutral:
        fill = isDark ? AppColors.surfaceInsetDark : AppColors.surfaceInsetLight;
        ink = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        solid = isDark ? AppColors.slate700 : AppColors.slate600;
        break;
    }

    Color bg;
    Color fg;
    Border? border;

    switch (variant) {
      case DsBadgeVariant.solid:
        bg = solid;
        fg = Colors.white;
        break;
      case DsBadgeVariant.outline:
        bg = Colors.transparent;
        fg = ink;
        border = Border.all(color: ink, width: 1);
        break;
      case DsBadgeVariant.soft:
        bg = fill;
        fg = ink;
        break;
    }

    return Container(
      height: 22,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: border,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (dot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: fg,
              ),
            ),
            const SizedBox(width: 5),
          ],
          if (child != null)
            child!
          else if (text != null)
            Text(
              text!,
              style: AppTypography.xxs(
                color: fg,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.02,
              ),
            ),
        ],
      ),
    );
  }
}
