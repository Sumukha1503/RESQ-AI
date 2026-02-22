import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../components/glass_box.dart';
import '../../components/premium_button.dart';
import '../../theme/styles.dart';

class DonorDashboard extends StatelessWidget {
  const DonorDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back,',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Text(
                    'Donor Hero',
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              CircleAvatar(
                backgroundColor: AppColors.accentOrange.withOpacity(0.1),
                child: Icon(LucideIcons.heart, color: AppColors.accentOrange, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          // Hero / Call to Action
          GlassBox(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.accentBlue.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(LucideIcons.package, color: AppColors.accentBlue, size: 40),
                ),
                const SizedBox(height: 24),
                Text(
                  'Have Surplus Food?',
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your donation can feed a family in need today. Every meal count.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 32),
                PremiumButton(
                  title: 'Initialize Donation',
                  onPress: () => Navigator.pushNamed(context, '/donor-wizard'),
                  icon: LucideIcons.plus,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 48),
          
          Text(
            'Recent Impact',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          
          _ImpactStat(
            icon: LucideIcons.clock,
            label: 'Total Donations',
            value: '14',
          ),
          const SizedBox(height: 12),
          _ImpactStat(
            icon: LucideIcons.users,
            label: 'Lives Impacted',
            value: '42',
          ),
        ],
      ),
    );
  }
}

class _ImpactStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ImpactStat({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Icon(icon, color: AppColors.accentBlue, size: 20),
          const SizedBox(width: 16),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: Colors.white,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: AppColors.accentGreen,
            ),
          ),
        ],
      ),
    );
  }
}
