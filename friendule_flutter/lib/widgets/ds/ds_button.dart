import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

enum DsButtonVariant { primary, ink, secondary, soft, ghost, danger }

enum DsButtonSize { sm, md, lg }

class DsButton extends StatelessWidget {
  final Widget? child;
  final String? text;
  final VoidCallback? onPressed;
  final DsButtonVariant variant;
  final DsButtonSize size;
  final Widget? iconLeft;
  final Widget? iconRight;
  final bool fullWidth;
  final bool disabled;
  final bool loading;

  const DsButton({
    super.key,
    this.child,
    this.text,
    this.onPressed,
    this.variant = DsButtonVariant.primary,
    this.size = DsButtonSize.md,
    this.iconLeft,
    this.iconRight,
    this.fullWidth = false,
    this.disabled = false,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInteractive = !disabled && !loading && onPressed != null;

    final double height;
    final double horizontalPadding;
    final TextStyle textStyle;
    final double gap;
    final double radius;

    switch (size) {
      case DsButtonSize.sm:
        height = 34;
        horizontalPadding = 14;
        textStyle = AppTypography.sm(fontWeight: FontWeight.w600);
        gap = 6;
        radius = 10;
        break;
      case DsButtonSize.lg:
        height = 50;
        horizontalPadding = 24;
        textStyle = AppTypography.title(color: Colors.white);
        gap = 10;
        radius = 14;
        break;
      case DsButtonSize.md:
        height = 42;
        horizontalPadding = 18;
        textStyle = AppTypography.body(fontWeight: FontWeight.w600);
        gap = 8;
        radius = 14;
        break;
    }

    Color bg;
    Color fg;
    BorderSide border = BorderSide.none;
    List<BoxShadow> shadows = [];

    switch (variant) {
      case DsButtonVariant.primary:
        bg = isDark ? AppColors.violet400 : AppColors.violet500;
        fg = Colors.white;
        shadows = [
          BoxShadow(
            color: bg.withValues(alpha: 0.25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ];
        break;
      case DsButtonVariant.ink:
        bg = isDark ? AppColors.slate0 : AppColors.slate900;
        fg = isDark ? AppColors.slate950 : AppColors.slate0;
        shadows = [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 6,
            offset: const Offset(0, 2),
          )
        ];
        break;
      case DsButtonVariant.secondary:
        bg = isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight;
        fg = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
        border = BorderSide(
          color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
          width: 1,
        );
        break;
      case DsButtonVariant.soft:
        bg = isDark ? AppColors.accentWashDark : AppColors.accentWashLight;
        fg = isDark ? AppColors.textBrandDark : AppColors.textBrandLight;
        break;
      case DsButtonVariant.ghost:
        bg = Colors.transparent;
        fg = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        break;
      case DsButtonVariant.danger:
        bg = AppColors.danger;
        fg = Colors.white;
        shadows = [
          BoxShadow(
            color: AppColors.danger.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ];
        break;
    }

    Widget content = Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading)
          Padding(
            padding: EdgeInsets.only(right: gap),
            child: SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, color: fg),
            ),
          )
        else if (iconLeft != null)
          Padding(padding: EdgeInsets.only(right: gap), child: iconLeft!),
        if (child != null)
          child!
        else if (text != null)
          Text(text!, style: textStyle.copyWith(color: fg)),
        if (iconRight != null && !loading)
          Padding(padding: EdgeInsets.only(left: gap), child: iconRight!),
      ],
    );

    return MouseRegion(
      cursor: isInteractive ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: Opacity(
        opacity: disabled ? 0.45 : 1.0,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: isInteractive ? onPressed : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            height: height,
            padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(radius),
              border: border != BorderSide.none ? Border.fromBorderSide(border) : null,
              boxShadow: shadows,
            ),
            child: content,
          ),
        ),
      ),
    );
  }
}
