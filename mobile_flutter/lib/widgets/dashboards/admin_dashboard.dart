import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../components/glass_box.dart';
import '../../theme/styles.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

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
                    'Terminal Alpha',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        'Admin',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(LucideIcons.zap, size: 18, color: AppColors.accentOrange),
                    ],
                  ),
                ],
              ),
              CircleAvatar(
                backgroundColor: AppColors.accentBlue.withOpacity(0.1),
                child: Icon(LucideIcons.user, color: AppColors.accentBlue, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          // Main Telemetry Card
          GlassBox(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.accentBlue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(LucideIcons.globe, color: AppColors.accentBlue, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Network Telemetry',
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            '24.8k',
                            style: GoogleFonts.inter(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'Total meals rescued globally via ResQ-AI',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(LucideIcons.trendingUp, size: 14, color: AppColors.accentGreen),
                    const SizedBox(width: 4),
                    Text(
                      '12% from yesterday',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.accentGreen,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _SmallStatCard(
                  icon: LucideIcons.flame,
                  color: AppColors.accentOrange,
                  value: '48',
                  label: 'NGO Partners',
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _SmallStatCard(
                  icon: LucideIcons.heart,
                  color: Colors.redAccent,
                  value: '1.2T',
                  label: 'CO₂ Prevented',
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 32),
          Text(
            'Quick Actions',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          
          _ActionRow(
            icon: LucideIcons.zap,
            color: AppColors.accentOrange,
            title: 'Emergency Dispatch',
            subtitle: 'Broadcast high-urgency tickets',
          ),
          const SizedBox(height: 12),
          _ActionRow(
            icon: LucideIcons.map,
            color: AppColors.accentBlue,
            title: 'Live Telemetry',
            subtitle: 'View real-time city map',
          ),
        ],
      ),
    );
  }
}

class _SmallStatCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String value;
  final String label;

  const _SmallStatCard({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 16),
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
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;

  const _ActionRow({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(LucideIcons.chevronRight, size: 18, color: Colors.white.withOpacity(0.24)),
        ],
      ),
    );
  }
}
