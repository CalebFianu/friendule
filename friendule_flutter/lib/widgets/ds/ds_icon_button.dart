import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

enum DsIconButtonVariant { surface, soft, ghost, ink }

enum DsIconButtonShape { rounded, circle }

enum DsIconButtonSize { sm, md, lg }

class DsIconButton extends StatelessWidget {
  final Widget icon;
  final VoidCallback? onPressed;
  final DsIconButtonVariant variant;
  final DsIconButtonShape shape;
  final DsIconButtonSize size;
  final bool disabled;
  final String? tooltip;

  const DsIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.variant = DsIconButtonVariant.surface,
    this.shape = DsIconButtonShape.rounded,
    this.size = DsIconButtonSize.md,
    this.disabled = false,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isInteractive = !disabled && onPressed != null;

    final double dim;
    switch (size) {
      case DsIconButtonSize.sm:
        dim = 30;
        break;
      case DsIconButtonSize.lg:
        dim = 44;
        break;
      case DsIconButtonSize.md:
        dim = 38;
        break;
    }

    Color bg;
    Color fg;
    BorderSide border = BorderSide.none;

    switch (variant) {
      case DsIconButtonVariant.surface:
        bg = isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight;
        fg = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        border = BorderSide(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
          width: 1,
        );
        break;
      case DsIconButtonVariant.soft:
        bg = isDark ? AppColors.accentWashDark : AppColors.accentWashLight;
        fg = isDark ? AppColors.textBrandDark : AppColors.textBrandLight;
        break;
      case DsIconButtonVariant.ghost:
        bg = Colors.transparent;
        fg = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
        break;
      case DsIconButtonVariant.ink:
        bg = isDark ? AppColors.slate0 : AppColors.slate900;
        fg = isDark ? AppColors.slate950 : AppColors.slate0;
        break;
    }

    final borderRadius = shape == DsIconButtonShape.circle
        ? BorderRadius.circular(999)
        : BorderRadius.circular(12);

    Widget button = MouseRegion(
      cursor: isInteractive ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: Opacity(
        opacity: disabled ? 0.45 : 1.0,
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: isInteractive ? onPressed : null,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            width: dim,
            height: dim,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: borderRadius,
              border: border != BorderSide.none ? Border.fromBorderSide(border) : null,
            ),
            child: Center(
              child: IconTheme(
                data: IconThemeData(color: fg, size: dim * 0.48),
                child: icon,
              ),
            ),
          ),
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: button);
    }
    return button;
  }
}
