import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';

enum DsInputSize { sm, md, lg }

class DsInput extends StatefulWidget {
  final TextEditingController? controller;
  final String? initialValue;
  final String? placeholder;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final bool invalid;
  final DsInputSize size;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputType keyboardType;
  final TextInputAction? textInputAction;
  final bool autofocus;
  final bool readOnly;
  final int maxLines;
  final FocusNode? focusNode;

  const DsInput({
    super.key,
    this.controller,
    this.initialValue,
    this.placeholder,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.invalid = false,
    this.size = DsInputSize.md,
    this.onChanged,
    this.onSubmitted,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.autofocus = false,
    this.readOnly = false,
    this.maxLines = 1,
    this.focusNode,
  });

  @override
  State<DsInput> createState() => _DsInputState();
}

class _DsInputState extends State<DsInput> {
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_handleFocusChange);
  }

  void _handleFocusChange() {
    if (mounted) {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    }
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final double height;
    switch (widget.size) {
      case DsInputSize.sm:
        height = 36;
        break;
      case DsInputSize.lg:
        height = 50;
        break;
      case DsInputSize.md:
        height = 44;
        break;
    }

    final Color borderColor;
    final List<BoxShadow> shadows;

    if (widget.invalid) {
      borderColor = AppColors.danger;
      shadows = [
        BoxShadow(
          color: AppColors.danger.withValues(alpha: 0.2),
          blurRadius: 4,
          spreadRadius: 2,
        )
      ];
    } else if (_isFocused) {
      borderColor = isDark ? AppColors.violet400 : AppColors.violet500;
      shadows = [
        BoxShadow(
          color: (isDark ? AppColors.violet400 : AppColors.violet500).withValues(alpha: 0.25),
          blurRadius: 6,
          spreadRadius: 2,
        )
      ];
    } else {
      borderColor = isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight;
      shadows = [];
    }

    final bg = isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final hintColor = isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 140),
      curve: Curves.easeOut,
      height: widget.maxLines == 1 ? height : null,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: shadows,
      ),
      child: Row(
        crossAxisAlignment:
            widget.maxLines > 1 ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          if (widget.prefixIcon != null) ...[
            Padding(
              padding: EdgeInsets.only(
                right: 8,
                top: widget.maxLines > 1 ? 10 : 0,
              ),
              child: IconTheme(
                data: IconThemeData(color: hintColor, size: 20),
                child: widget.prefixIcon!,
              ),
            ),
          ],
          Expanded(
            child: TextFormField(
              controller: widget.controller,
              initialValue: widget.initialValue,
              focusNode: _focusNode,
              autofocus: widget.autofocus,
              readOnly: widget.readOnly,
              obscureText: widget.obscureText,
              maxLines: widget.maxLines,
              keyboardType: widget.keyboardType,
              textInputAction: widget.textInputAction,
              onChanged: widget.onChanged,
              onFieldSubmitted: widget.onSubmitted,
              style: AppTypography.body(color: textColor),
              decoration: InputDecoration(
                isDense: true,
                border: InputBorder.none,
                focusedBorder: InputBorder.none,
                enabledBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                disabledBorder: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                hintText: widget.placeholder,
                hintStyle: AppTypography.body(color: hintColor),
              ),
            ),
          ),
          if (widget.suffixIcon != null) ...[
            Padding(
              padding: const EdgeInsets.only(left: 8),
              child: IconTheme(
                data: IconThemeData(color: hintColor, size: 20),
                child: widget.suffixIcon!,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
