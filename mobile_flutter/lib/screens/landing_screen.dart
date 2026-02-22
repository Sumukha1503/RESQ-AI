import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../components/glass_box.dart';
import '../components/premium_button.dart';
import '../theme/styles.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    print('DEBUG: Building LandingScreen');
    return Scaffold(
      body: TactileBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header / Logo
                Center(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: AppColors.accentBlue,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.accentBlue.withOpacity(0.5),
                                  blurRadius: 15,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Icon(LucideIcons.zap, color: Colors.white, size: 28),
                          ),
                          const SizedBox(width: 12),
                          RichText(
                            text: TextSpan(
                              style: GoogleFonts.inter(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1.5,
                                color: Colors.white,
                              ),
                              children: const [
                                TextSpan(text: 'ResQ'),
                                TextSpan(
                                  text: 'AI',
                                  style: TextStyle(color: AppColors.accentBlue),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.accentBlue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.accentBlue.withOpacity(0.2)),
                        ),
                        child: Text(
                          'ZERO WASTE LOGISTICS NETWORK',
                          style: GoogleFonts.inter(
                            color: AppColors.accentBlue,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 80),

                // Hero Section
                Text(
                  'Save Food.\nSave the Planet.',
                  style: GoogleFonts.inter(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    height: 1.1,
                    letterSpacing: -2,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  "Harnessing AI to bridge the gap between surplus and hunger. Join the world's most advanced rescue network.",
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    height: 1.5,
                    color: AppColors.textSecondary,
                  ),
                ),
                
                const SizedBox(height: 48),
                
                PremiumButton(
                  title: 'Start Rescuing',
                  onPress: () => Navigator.pushNamed(context, '/register'),
                  icon: LucideIcons.arrowRight,
                ),
                
                const SizedBox(height: 16),
                
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    child: RichText(
                      text: TextSpan(
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: Colors.white.withOpacity(0.4),
                        ),
                        children: const [
                          TextSpan(text: 'Already a member? '),
                          TextSpan(
                            text: 'Sign In',
                            style: TextStyle(color: AppColors.accentBlue),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 60),

                // Community Feed Teaser
                Center(
                  child: Column(
                    children: [
                      RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: GoogleFonts.inter(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                          children: [
                            const TextSpan(text: 'Live from the '),
                            WidgetSpan(
                              child: ShaderMask(
                                shaderCallback: (bounds) => const LinearGradient(
                                  colors: [AppColors.accentBlue, AppColors.accentGreen],
                                ).createShader(Offset.zero & bounds.size),
                                child: Text(
                                  'Community',
                                  style: GoogleFonts.inter(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, '/login'),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'View Full Community Feed',
                              style: GoogleFonts.inter(
                                color: AppColors.accentBlue,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(LucideIcons.arrowRight, color: AppColors.accentBlue, size: 18),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 60),

                // Stats Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.2,
                  children: const [
                    _StatCard(
                      label: 'MEALS SAVED',
                      value: '12.8k',
                      icon: LucideIcons.heart,
                      color: Colors.redAccent,
                    ),
                    _StatCard(
                      label: 'CITY NODES',
                      value: '84+',
                      icon: LucideIcons.globe,
                      color: AppColors.accentBlue,
                    ),
                    _StatCard(
                      label: 'IMPACT SCORE',
                      value: '98%',
                      icon: LucideIcons.trendingUp,
                      color: AppColors.accentGreen,
                    ),
                    _StatCard(
                      label: 'SECURITY',
                      value: 'AES-256',
                      icon: LucideIcons.shield,
                      color: AppColors.accentOrange,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
