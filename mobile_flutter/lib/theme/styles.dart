import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary Palette
  static const Color background = Color(0xFF080C14);
  static const Color surface = Color(0xFF141828);
  static const Color accentBlue = Color(0xFF63B3ED);
  static const Color accentGreen = Color(0xFF68D391);
  static const Color accentOrange = Color(0xFFF6AD55);
  static const Color textPrimary = Colors.white;
  static const Color textSecondary = Color(0xFF94A3B8);
  
  // Gradients
  static const LinearGradient premiumGradient = LinearGradient(
    colors: [Color(0xFF63B3ED), Color(0xFF68D391)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static final LinearGradient glassGradient = LinearGradient(
    colors: [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.05)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

class AppStyles {
  static ThemeData get luxuryDark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.accentBlue,
        secondary: AppColors.accentGreen,
        surface: AppColors.surface,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          letterSpacing: -1.5,
          color: AppColors.textPrimary,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          letterSpacing: -1.0,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }
}

class TactileBackground extends StatelessWidget {
  final Widget child;

  const TactileBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -100,
          left: -50,
          child: _Blob(color: AppColors.accentBlue.withOpacity(0.1), size: 300),
        ),
        Positioned(
          bottom: -150,
          right: -50,
          child: _Blob(color: AppColors.accentGreen.withOpacity(0.1), size: 400),
        ),
        child,
      ],
    );
  }
}

class _Blob extends StatelessWidget {
  final Color color;
  final double size;

  const _Blob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
      ),
    );
  }
}
