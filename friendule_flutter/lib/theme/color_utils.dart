import 'package:flutter/material.dart';
import '../config/constants.dart';

class Colorset {
  final Color solid;
  final Color tint;
  final Color tintBorder;
  final Color deep;

  const Colorset({
    required this.solid,
    required this.tint,
    required this.tintBorder,
    required this.deep,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Colorset &&
          runtimeType == other.runtimeType &&
          solid == other.solid &&
          tint == other.tint &&
          tintBorder == other.tintBorder &&
          deep == other.deep;

  @override
  int get hashCode => Object.hash(solid, tint, tintBorder, deep);
}

/// Creates a harmonious Colorset matching web CSS color-mix logic:
/// - tint: color-mix(in oklch, color 15%, white) -> Color.lerp(solid, Colors.white, 0.85)
/// - tintBorder: color-mix(in oklch, color 42%, white) -> Color.lerp(solid, Colors.white, 0.58)
/// - deep: color-mix(in oklch, color 72%, #3a2a1a) -> Color.lerp(solid, Color(0xFF3A2A1A), 0.28)
Colorset makeColorset(Color color) {
  final tint = Color.lerp(color, Colors.white, 0.85) ?? color.withValues(alpha: 0.15);
  final tintBorder = Color.lerp(color, Colors.white, 0.58) ?? color.withValues(alpha: 0.42);
  final deep = Color.lerp(color, const Color(0xFF3A2A1A), 0.28) ?? color;

  return Colorset(
    solid: color,
    tint: tint,
    tintBorder: tintBorder,
    deep: deep,
  );
}

/// Parses a color string that could be hex (#RRGGBB) or oklch(...) into a Flutter Color
Color parseColor(String? colorStr) {
  if (colorStr == null || colorStr.isEmpty) {
    return kPaletteColors[0];
  }

  final trimmed = colorStr.trim().toLowerCase();

  // If already hex
  if (trimmed.startsWith('#')) {
    final hex = trimmed.replaceAll('#', '');
    if (hex.length == 6) {
      return Color(int.parse('FF$hex', radix: 16));
    } else if (hex.length == 8) {
      return Color(int.parse(hex, radix: 16));
    }
  }

  // Handle known OKLCH strings from backend PALETTE
  if (trimmed.contains('oklch')) {
    if (trimmed.contains('25')) return kPaletteColors[0];
    if (trimmed.contains('65')) return kPaletteColors[1];
    if (trimmed.contains('155')) return kPaletteColors[2];
    if (trimmed.contains('245')) return kPaletteColors[3];
    if (trimmed.contains('320')) return kPaletteColors[4];
    if (trimmed.contains('195')) return kPaletteColors[5];
    if (trimmed.contains('285')) return kPaletteColors[6];
    if (trimmed.contains('110')) return kPaletteColors[7];
    if (trimmed.contains('260')) return const Color(0xFF6C5CE7); // Self friend default
  }

  // Fallback hash-based color pick
  final hash = trimmed.codeUnits.fold(0, (sum, c) => sum + c);
  return kPaletteColors[hash % kPaletteColors.length];
}

Colorset makeColorsetFromString(String? colorStr) {
  return makeColorset(parseColor(colorStr));
}
