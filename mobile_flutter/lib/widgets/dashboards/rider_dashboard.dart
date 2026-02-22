import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../components/glass_box.dart';
import '../../components/premium_button.dart';
import '../../theme/styles.dart';

class RiderDashboard extends StatelessWidget {
  const RiderDashboard({super.key});

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
                    'Rider Active',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.accentBlue,
                    ),
                  ),
                  Text(
                    'Elite Unit 04',
                    style: GoogleFonts.inter(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              CircleAvatar(
                backgroundColor: AppColors.accentBlue.withOpacity(0.1),
                child: Icon(LucideIcons.bike, color: AppColors.accentBlue, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          _RiderStatRow(),
          
          const SizedBox(height: 32),
          
          GlassBox(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.navigation, color: AppColors.accentGreen, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      'Gig Radar',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  '3 urgent rescues available near your current location. Real-time routing enabled.',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),
                PremiumButton(
                  title: 'View Available Gigs',
                  onPress: () => Navigator.pushNamed(context, '/rider-swipe'),
                  icon: LucideIcons.mapPin,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          Text(
            'Vehicle Status',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          
          _VehicleStatusCard(),
        ],
      ),
    );
  }
}

class _RiderStatRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: GlassBox(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(LucideIcons.truck, color: AppColors.accentGreen, size: 20),
                const SizedBox(height: 12),
                const Text('412', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                Text('Total Deliveries', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: GlassBox(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(LucideIcons.star, color: Colors.amber, size: 20),
                const SizedBox(height: 12),
                const Text('4.9', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                Text('Service Rating', style: GoogleFonts.inter(fontSize: 10, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _VehicleStatusCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ELECTRIC HUB 01',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: AppColors.accentBlue,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                '84% CHARGED',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
              ),
            ],
          ),
          const Spacer(),
          Icon(LucideIcons.batteryCharging, color: AppColors.accentGreen, size: 24),
        ],
      ),
    );
  }
}
