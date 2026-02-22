import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:swipe_cards/swipe_cards.dart';
import '../components/glass_box.dart';
import '../theme/styles.dart';

class RiderSwipeScreen extends StatefulWidget {
  const RiderSwipeScreen({super.key});

  @override
  State<RiderSwipeScreen> createState() => _RiderSwipeScreenState();
}

class _RiderSwipeScreenState extends State<RiderSwipeScreen> {
  final List<SwipeItem> _swipeItems = [];
  late MatchEngine _matchEngine;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey();

  final List<Map<String, dynamic>> _demoTasks = [
    {
      'title': 'The Grand Hyatt',
      'items': '24 Portions (Pasta, Salad)',
      'distance': '0.8 km away',
      'expires': 'Expires in 45m',
      'priority': 'HIGH',
      'icon': LucideIcons.building2,
    },
    {
      'title': 'Green Valley Bakery',
      'items': '12 Large Breads',
      'distance': '1.2 km away',
      'expires': 'Expires in 1h 20m',
      'priority': 'MEDIUM',
      'icon': LucideIcons.utensils,
    },
    {
      'title': 'Community Event C',
      'items': '50 Buffet Meals',
      'distance': '2.5 km away',
      'expires': 'Expires in 30m',
      'priority': 'CRITICAL',
      'icon': LucideIcons.users,
    },
  ];

  @override
  void initState() {
    for (var task in _demoTasks) {
      _swipeItems.add(SwipeItem(
        content: task,
        likeAction: () {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text("Rescue Accepted: ${task['title']}"),
            duration: const Duration(milliseconds: 500),
          ));
        },
        nopeAction: () {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text("Task Declined"),
            duration: const Duration(milliseconds: 500),
          ));
        },
      ));
    }
    _matchEngine = MatchEngine(swipeItems: _swipeItems);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      body: TactileBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(LucideIcons.arrowLeft, color: Colors.white),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.05),
                        padding: const EdgeInsets.all(12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SEARCHING NODES...',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                            color: AppColors.accentBlue,
                          ),
                        ),
                        Text(
                          'Active Gigs',
                          style: GoogleFonts.inter(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Icon(LucideIcons.navigation, color: AppColors.accentGreen, size: 24),
                  ],
                ),
              ),
              
              const Expanded(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                  child: _CardStack(),
                ),
              ),
              
              // Key Legend
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _ActionHint(icon: LucideIcons.arrowLeft, label: 'DECLINE', color: Colors.redAccent),
                    const SizedBox(width: 40),
                    _ActionHint(icon: LucideIcons.arrowRight, label: 'ACCEPT', color: AppColors.accentGreen),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CardStack extends StatefulWidget {
  const _CardStack();

  @override
  State<_CardStack> createState() => _CardStackState();
}

class _CardStackState extends State<_CardStack> {
  late MatchEngine _matchEngine;
  final List<SwipeItem> _swipeItems = [];
  
  @override
  void initState() {
    final List<Map<String, dynamic>> demoTasks = [
      {
        'title': 'The Grand Hyatt',
        'items': '24 Portions (Pasta, Salad)',
        'distance': '0.8 km away',
        'expires': 'Expires in 45m',
        'priority': 'HIGH',
        'icon': LucideIcons.building2,
      },
      {
        'title': 'Green Valley Bakery',
        'items': '12 Large Breads',
        'distance': '1.2 km away',
        'expires': 'Expires in 1h 20m',
        'priority': 'MEDIUM',
        'icon': LucideIcons.utensils,
      },
      {
        'title': 'Central Plaza Pool',
        'items': '50 Buffet Meals',
        'distance': '2.5 km away',
        'expires': 'Expires in 30m',
        'priority': 'CRITICAL',
        'icon': LucideIcons.users,
      },
    ];

    for (var task in demoTasks) {
      _swipeItems.add(SwipeItem(
        content: task,
        likeAction: () {},
        nopeAction: () {},
      ));
    }
    _matchEngine = MatchEngine(swipeItems: _swipeItems);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SwipeCards(
      matchEngine: _matchEngine,
      itemBuilder: (BuildContext context, int index) {
        final task = _swipeItems[index].content as Map<String, dynamic>;
        return _RescueCard(task: task);
      },
      onStackFinished: () {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text("No more gigs available in this vector."),
          duration: Duration(seconds: 2),
        ));
      },
      itemChanged: (SwipeItem item, int index) {},
      upSwipeAllowed: false,
      fillSpace: true,
    );
  }
}

class _RescueCard extends StatelessWidget {
  final Map<String, dynamic> task;

  const _RescueCard({required this.task});

  @override
  Widget build(BuildContext context) {
    return GlassBox(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.accentBlue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(task['icon'], color: AppColors.accentBlue, size: 28),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _getPriorityColor(task['priority']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _getPriorityColor(task['priority']).withOpacity(0.2)),
                ),
                child: Text(
                  task['priority'],
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: _getPriorityColor(task['priority']),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            task['title'],
            style: GoogleFonts.inter(
              fontSize: 28,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            task['items'],
            style: GoogleFonts.inter(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          _CardInfoRow(icon: LucideIcons.mapPin, text: task['distance']),
          const SizedBox(height: 12),
          _CardInfoRow(icon: LucideIcons.clock, text: task['expires']),
          const SizedBox(height: 48),
          Center(
            child: Opacity(
              opacity: 0.2,
              child: Column(
                children: [
                  Icon(LucideIcons.shieldCheck, color: Colors.white, size: 24),
                  const SizedBox(height: 8),
                  Text(
                    'VERIFIED RESCUE PROTOCOL',
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getPriorityColor(String priority) {
    if (priority == 'CRITICAL') return Colors.redAccent;
    if (priority == 'HIGH') return AppColors.accentOrange;
    return AppColors.accentGreen;
  }
}

class _CardInfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _CardInfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: AppColors.accentBlue, size: 18),
        const SizedBox(width: 12),
        Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}

class _ActionHint extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ActionHint({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: color.withOpacity(0.3), width: 1),
          ),
          child: Icon(icon, color: color, size: 16),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
            color: color.withOpacity(0.5),
          ),
        ),
      ],
    );
  }
}
