import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../components/glass_box.dart';
import '../theme/styles.dart';

class CommunityFeedScreen extends StatelessWidget {
  const CommunityFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'INTEL FEED',
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: AppColors.accentBlue,
            ),
          ),
          Text(
            'Community Impact',
            style: GoogleFonts.inter(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 24),
          
          _FeedCard(
            author: 'Alice (Relief Hub)',
            time: '12m ago',
            content: 'Successfully routed 50 meals from The Grand Hyatt to the downtown shelter. Exceptional rider performance tonight!',
            impact: '50 Meals Saved',
            tags: ['#ZeroHunger', '#ResQAlpha'],
          ),
          const SizedBox(height: 16),
          _FeedCard(
            author: 'John (Elite Rider)',
            time: '1h ago',
            content: 'Just completed a critical rescue at Green Valley Bakery. The breads are still warm! Heading to Node 7 for dropoff.',
            impact: '12 Breads Rescued',
            tags: ['#OnTheMove', '#ResQ'],
          ),
          const SizedBox(height: 16),
          _FeedCard(
            author: 'System Terminal',
            time: '3h ago',
            content: 'Network Milestone: We have collectively prevented 1.2T of CO2 emissions via optimized surplus routing.',
            impact: 'Global Milestone',
            tags: ['#Impact', '#SDG12'],
          ),
          const SizedBox(height: 100), // Padding for the nav bar
        ],
      ),
    );
  }
}

class _FeedCard extends StatelessWidget {
  final String author;
  final String time;
  final String content;
  final String impact;
  final List<String> tags;

  const _FeedCard({
    required this.author,
    required this.time,
    required this.content,
    required this.impact,
    required this.tags,
  });

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.white.withOpacity(0.05),
                child: Icon(LucideIcons.user, color: Colors.white70, size: 16),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      author,
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      time,
                      style: GoogleFonts.inter(fontSize: 10, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.moreHorizontal, color: Colors.white.withOpacity(0.24), size: 18),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            content,
            style: GoogleFonts.inter(fontSize: 15, color: Colors.white.withOpacity(0.9), height: 1.5),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            children: tags.map((tag) => Text(
              tag,
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.accentBlue, fontWeight: FontWeight.bold),
            )).toList(),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.accentGreen.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.zap, color: AppColors.accentGreen, size: 14),
                const SizedBox(width: 8),
                Text(
                  impact.toUpperCase(),
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.accentGreen),
                ),
              ],
            ),
          ),
          Divider(color: Colors.white.withOpacity(0.05), height: 32),
          Row(
            children: [
              _ActionButton(icon: LucideIcons.heart, count: '12'),
              const SizedBox(width: 24),
              _ActionButton(icon: LucideIcons.messageSquare, count: '4'),
              const Spacer(),
              Icon(LucideIcons.share2, color: Colors.white.withOpacity(0.24), size: 18),
            ],
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String count;

  const _ActionButton({required this.icon, required this.count});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: Colors.white.withOpacity(0.24), size: 18),
        const SizedBox(width: 8),
        Text(
          count,
          style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withOpacity(0.24), fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
