import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  static TextStyle display({Color? color}) => GoogleFonts.plusJakartaSans(
        fontSize: 36,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.03,
        height: 1.1,
        color: color,
      );

  static TextStyle h1({Color? color}) => GoogleFonts.plusJakartaSans(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.02,
        height: 1.15,
        color: color,
      );

  static TextStyle h2({Color? color}) => GoogleFonts.plusJakartaSans(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.02,
        height: 1.25,
        color: color,
      );

  static TextStyle h3({Color? color}) => GoogleFonts.plusJakartaSans(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.01,
        height: 1.3,
        color: color,
      );

  static TextStyle title({Color? color}) => GoogleFonts.plusJakartaSans(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.01,
        height: 1.3,
        color: color,
      );

  static TextStyle body({Color? color, FontWeight? fontWeight}) => GoogleFonts.plusJakartaSans(
        fontSize: 14,
        fontWeight: fontWeight ?? FontWeight.w400,
        height: 1.45,
        color: color,
      );

  static TextStyle sm({Color? color, FontWeight? fontWeight}) => GoogleFonts.plusJakartaSans(
        fontSize: 13,
        fontWeight: fontWeight ?? FontWeight.w500,
        height: 1.4,
        color: color,
      );

  static TextStyle xs({Color? color, FontWeight? fontWeight}) => GoogleFonts.plusJakartaSans(
        fontSize: 12,
        fontWeight: fontWeight ?? FontWeight.w600,
        height: 1.35,
        color: color,
      );

  static TextStyle xxs({Color? color, FontWeight? fontWeight, double? letterSpacing}) =>
      GoogleFonts.plusJakartaSans(
        fontSize: 11,
        fontWeight: fontWeight ?? FontWeight.w700,
        letterSpacing: letterSpacing ?? 0.05,
        height: 1.3,
        color: color,
      );

  static TextStyle mono({Color? color, double? fontSize, FontWeight? fontWeight}) =>
      GoogleFonts.jetBrainsMono(
        fontSize: fontSize ?? 12,
        fontWeight: fontWeight ?? FontWeight.w500,
        letterSpacing: -0.01,
        color: color,
      );
}
