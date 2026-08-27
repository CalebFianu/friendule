import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../theme/color_utils.dart';

class DsAvatar extends StatelessWidget {
  final String name;
  final double size;
  final String? tone;
  final Colorset? colorset;
  final String? status; // 'online', 'busy', null
  final bool ring;

  const DsAvatar({
    super.key,
    required this.name,
    this.size = 36,
    this.tone,
    this.colorset,
    this.status,
    this.ring = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final String initials;
    final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) {
      initials = '??';
    } else if (words.length == 1) {
      final w = words[0];
      initials = (w.length > 1 ? w.substring(0, 2) : w).toUpperCase();
    } else {
      initials = '${words.first[0]}${words.last[0]}'.toUpperCase();
    }

    final Color fill;
    final Color ink;

    if (colorset != null) {
      fill = colorset!.tint;
      ink = colorset!.deep;
    } else if (tone != null) {
      final cat = CategoryColors.get(tone!, isDark: isDark);
      fill = cat.fill;
      ink = cat.ink;
    } else {
      final hash = name.codeUnits.fold(0, (sum, c) => sum + c);
      final tones = ['violet', 'blue', 'mint', 'amber', 'rose', 'sage'];
      final picked = tones[hash % tones.length];
      final cat = CategoryColors.get(picked, isDark: isDark);
      fill = cat.fill;
      ink = cat.ink;
    }

    final statusColor = status == 'online'
        ? AppColors.success
        : status == 'busy'
            ? AppColors.warning
            : null;

    final statusDotSize = size * 0.28;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: fill,
            border: ring
                ? Border.all(
                    color: isDark ? AppColors.violet400 : AppColors.violet500,
                    width: 2,
                  )
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            initials,
            style: AppTypography.xxs(
              color: ink,
              fontWeight: FontWeight.w700,
            ).copyWith(fontSize: size * 0.38),
          ),
        ),
        if (statusColor != null)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: statusDotSize,
              height: statusDotSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: statusColor,
                border: Border.all(
                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                  width: 1.5,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
