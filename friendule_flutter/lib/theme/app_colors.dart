import 'package:flutter/material.dart';

class AppColors {
  // Slate scale
  static const Color slate0 = Color(0xFFFFFFFF);
  static const Color slate25 = Color(0xFFFBFBFE);
  static const Color slate50 = Color(0xFFF6F6FB);
  static const Color slate100 = Color(0xFFEEEEF4);
  static const Color slate200 = Color(0xFFE2E2EC);
  static const Color slate300 = Color(0xFFCCCCDA);
  static const Color slate400 = Color(0xFFA3A3B8);
  static const Color slate500 = Color(0xFF7A7A92);
  static const Color slate600 = Color(0xFF585870);
  static const Color slate700 = Color(0xFF3F3F54);
  static const Color slate800 = Color(0xFF282838);
  static const Color slate900 = Color(0xFF191924);
  static const Color slate950 = Color(0xFF101019);

  // Violet scale
  static const Color violet50 = Color(0xFFF2F0FF);
  static const Color violet100 = Color(0xFFE6E2FF);
  static const Color violet200 = Color(0xFFCFC7FF);
  static const Color violet300 = Color(0xFFB0A2FF);
  static const Color violet400 = Color(0xFF8F7BFA);
  static const Color violet500 = Color(0xFF6C5CE7);
  static const Color violet600 = Color(0xFF5A48D6);
  static const Color violet700 = Color(0xFF4A39B3);
  static const Color violet800 = Color(0xFF3A2D8C);
  static const Color violet900 = Color(0xFF2A2166);

  // Functional
  static const Color success = Color(0xFF1F8F68);
  static const Color warning = Color(0xFFD98A0B);
  static const Color danger = Color(0xFFE0466A);
  static const Color info = Color(0xFF2F6BD6);

  // Category Colors Light
  static const Color catVioletFillLight = Color(0xFFECE8FF);
  static const Color catVioletInkLight = Color(0xFF5A48D6);

  static const Color catBlueFillLight = Color(0xFFE4F0FF);
  static const Color catBlueInkLight = Color(0xFF2F6BD6);

  static const Color catMintFillLight = Color(0xFFDCF5EC);
  static const Color catMintInkLight = Color(0xFF1F8F68);

  static const Color catAmberFillLight = Color(0xFFFDF0D8);
  static const Color catAmberInkLight = Color(0xFFB47708);

  static const Color catRoseFillLight = Color(0xFFFFE6EE);
  static const Color catRoseInkLight = Color(0xFFD63B6E);

  static const Color catSageFillLight = Color(0xFFE7EFE4);
  static const Color catSageInkLight = Color(0xFF4F7A45);

  // Category Colors Dark
  static const Color catVioletFillDark = Color(0xFF2B2360);
  static const Color catVioletInkDark = Color(0xFFC9BEFF);

  static const Color catBlueFillDark = Color(0xFF16304F);
  static const Color catBlueInkDark = Color(0xFFA9CBFF);

  static const Color catMintFillDark = Color(0xFF103A2E);
  static const Color catMintInkDark = Color(0xFF8FE6C6);

  static const Color catAmberFillDark = Color(0xFF3A2C0E);
  static const Color catAmberInkDark = Color(0xFFF2C66A);

  static const Color catRoseFillDark = Color(0xFF3D1626);
  static const Color catRoseInkDark = Color(0xFFFFA6C4);

  static const Color catSageFillDark = Color(0xFF223020);
  static const Color catSageInkDark = Color(0xFFB3D6A6);

  // Light Theme Tokens
  static const Color bgAppLight = slate50;
  static const Color bgCanvasLight = Color(0xFFEFEEFB);
  static const Color surfaceCardLight = slate0;
  static const Color surfaceSunkenLight = slate50;
  static const Color surfaceHoverLight = slate100;
  static const Color surfaceInsetLight = slate100;

  static const Color textPrimaryLight = slate900;
  static const Color textSecondaryLight = slate600;
  static const Color textTertiaryLight = slate400;
  static const Color textInverseLight = slate0;
  static const Color textBrandLight = violet600;

  static const Color borderSubtleLight = slate200;
  static const Color borderStrongLight = slate300;
  static const Color borderBrandLight = violet500;

  static const Color accentLight = violet500;
  static const Color accentHoverLight = violet600;
  static const Color accentPressLight = violet700;
  static const Color accentWashLight = violet50;

  // Dark Theme Tokens
  static const Color bgAppDark = slate950;
  static const Color bgCanvasDark = Color(0xFF0C0C14);
  static const Color surfaceCardDark = slate900;
  static const Color surfaceSunkenDark = slate950;
  static const Color surfaceHoverDark = slate800;
  static const Color surfaceInsetDark = slate800;

  static const Color textPrimaryDark = Color(0xFFF3F3F8);
  static const Color textSecondaryDark = Color(0xFFB4B4C6);
  static const Color textTertiaryDark = Color(0xFF75758C);
  static const Color textInverseDark = slate950;
  static const Color textBrandDark = violet300;

  static const Color borderSubtleDark = Color(0xFF2B2B3C);
  static const Color borderStrongDark = Color(0xFF3A3A4F);
  static const Color borderBrandDark = violet400;

  static const Color accentDark = violet400;
  static const Color accentHoverDark = violet300;
  static const Color accentPressDark = violet200;
  static const Color accentWashDark = Color(0x336C5CE7);
}

class CategoryColors {
  final Color fill;
  final Color ink;

  const CategoryColors({required this.fill, required this.ink});

  static CategoryColors get(String category, {required bool isDark}) {
    switch (category.toLowerCase()) {
      case 'blue':
      case 'info':
        return CategoryColors(
          fill: isDark ? AppColors.catBlueFillDark : AppColors.catBlueFillLight,
          ink: isDark ? AppColors.catBlueInkDark : AppColors.catBlueInkLight,
        );
      case 'mint':
      case 'success':
      case 'free':
        return CategoryColors(
          fill: isDark ? AppColors.catMintFillDark : AppColors.catMintFillLight,
          ink: isDark ? AppColors.catMintInkDark : AppColors.catMintInkLight,
        );
      case 'amber':
      case 'warning':
        return CategoryColors(
          fill: isDark ? AppColors.catAmberFillDark : AppColors.catAmberFillLight,
          ink: isDark ? AppColors.catAmberInkDark : AppColors.catAmberInkLight,
        );
      case 'rose':
      case 'danger':
      case 'busy':
        return CategoryColors(
          fill: isDark ? AppColors.catRoseFillDark : AppColors.catRoseFillLight,
          ink: isDark ? AppColors.catRoseInkDark : AppColors.catRoseInkLight,
        );
      case 'sage':
        return CategoryColors(
          fill: isDark ? AppColors.catSageFillDark : AppColors.catSageFillLight,
          ink: isDark ? AppColors.catSageInkDark : AppColors.catSageInkLight,
        );
      case 'violet':
      case 'together':
      case 'brand':
      default:
        return CategoryColors(
          fill: isDark ? AppColors.catVioletFillDark : AppColors.catVioletFillLight,
          ink: isDark ? AppColors.catVioletInkDark : AppColors.catVioletInkLight,
        );
    }
  }
}
