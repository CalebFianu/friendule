import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

enum DsToggleSize { sm, md }

class DsToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool>? onChanged;
  final DsToggleSize size;
  final bool disabled;

  const DsToggle({
    super.key,
    required this.value,
    this.onChanged,
    this.size = DsToggleSize.md,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final double width;
    final double height;
    final double knobSize;

    switch (size) {
      case DsToggleSize.sm:
        width = 36;
        height = 20;
        knobSize = 14;
        break;
      case DsToggleSize.md:
        width = 46;
        height = 26;
        knobSize = 20;
        break;
    }

    final activeColor = isDark ? AppColors.violet400 : AppColors.violet500;
    final inactiveColor = isDark ? AppColors.slate700 : AppColors.slate300;

    return Opacity(
      opacity: disabled ? 0.5 : 1.0,
      child: GestureDetector(
        onTap: (!disabled && onChanged != null) ? () => onChanged!(!value) : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          width: width,
          height: height,
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            color: value ? activeColor : inactiveColor,
          ),
          child: Align(
            alignment: value ? Alignment.centerRight : Alignment.centerLeft,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOutCubic,
              width: knobSize,
              height: knobSize,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x33000000),
                    blurRadius: 3,
                    offset: Offset(0, 1),
                  )
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
