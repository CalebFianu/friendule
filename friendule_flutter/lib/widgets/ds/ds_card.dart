import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

enum DsCardVariant { defaultStyle, sunken, feature }

enum DsCardPadding { sm, md, lg }

class DsCard extends StatelessWidget {
  final Widget child;
  final DsCardVariant variant;
  final DsCardPadding padding;
  final VoidCallback? onTap;
  final double? width;
  final double? height;

  const DsCard({
    super.key,
    required this.child,
    this.variant = DsCardVariant.defaultStyle,
    this.padding = DsCardPadding.md,
    this.onTap,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final EdgeInsets insets;
    switch (padding) {
      case DsCardPadding.sm:
        insets = const EdgeInsets.all(12);
        break;
      case DsCardPadding.lg:
        insets = const EdgeInsets.all(20);
        break;
      case DsCardPadding.md:
        insets = const EdgeInsets.all(16);
        break;
    }

    Color bg;
    Border? border;
    List<BoxShadow> shadows = [];
    Gradient? gradient;

    switch (variant) {
      case DsCardVariant.sunken:
        bg = isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight;
        border = Border.all(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
          width: 1,
        );
        break;
      case DsCardVariant.feature:
        bg = Colors.transparent;
        gradient = const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppColors.violet400, AppColors.violet600],
        );
        shadows = [
          BoxShadow(
            color: AppColors.violet500.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ];
        break;
      case DsCardVariant.defaultStyle:
        bg = isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight;
        border = Border.all(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
          width: 1,
        );
        shadows = [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ];
        break;
    }

    final decoration = BoxDecoration(
      color: bg,
      gradient: gradient,
      borderRadius: BorderRadius.circular(18),
      border: border,
      boxShadow: shadows,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Ink(
            width: width,
            height: height,
            decoration: decoration,
            padding: insets,
            child: child,
          ),
        ),
      );
    }

    return Container(
      width: width,
      height: height,
      decoration: decoration,
      padding: insets,
      child: child,
    );
  }
}
