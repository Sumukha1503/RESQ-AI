import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../components/glass_box.dart';
import '../../components/premium_button.dart';
import '../../theme/styles.dart';

class NGODashboard extends StatelessWidget {
  const NGODashboard({super.key});

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
                  Row(
                    children: [
                      Text(
                        'Relief Hub',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('🤝', style: TextStyle(fontSize: 20)),
                    ],
                  ),
                  Text(
                    'AI-powered demand-supply coordination terminal.',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              CircleAvatar(
                backgroundColor: AppColors.accentGreen.withOpacity(0.1),
                child: Icon(LucideIcons.home, color: AppColors.accentGreen, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Emergency Protocol Alert
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.amber.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                Icon(LucideIcons.alertTriangle, color: Colors.amber, size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Emergency Protocol',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber,
                        ),
                      ),
                      Text(
                        'Declare Priority Shortage\nRoute immediate surpluses to your hub.',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: Colors.amber.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(LucideIcons.chevronRight, color: Colors.amber, size: 18),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Logistics Request Card
          GlassBox(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.shieldCheck, color: AppColors.accentBlue, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      'Logistics Request',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _FormField(
                  label: 'Meals Required',
                  placeholder: 'e.g. 500',
                ),
                const SizedBox(height: 16),
                _FormField(
                  label: 'Distribution Vector',
                  placeholder: 'e.g. Koramangala Slum Area',
                ),
                const SizedBox(height: 24),
                PremiumButton(
                  title: 'Find Surplus Food',
                  onPress: () {},
                  icon: LucideIcons.search,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 48),
          
          // Pulse / Standby Mode
          Center(
            child: Column(
              children: [
                Icon(LucideIcons.activity, color: Colors.white.withOpacity(0.1), size: 48),
                const SizedBox(height: 12),
                Text(
                  'Hub Standby Mode',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label;
  final String placeholder;

  const _FormField({required this.label, required this.placeholder});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          placeholder,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: Colors.white.withOpacity(0.24),
          ),
        ),
        Divider(color: Colors.white.withOpacity(0.1), height: 24),
      ],
    );
  }
}
