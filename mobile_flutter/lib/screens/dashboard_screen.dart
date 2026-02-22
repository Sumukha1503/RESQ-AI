import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/styles.dart';
import '../components/glass_nav_bar.dart';
import '../widgets/dashboards/admin_dashboard.dart';
import '../widgets/dashboards/ngo_dashboard.dart';
import '../widgets/dashboards/donor_dashboard.dart';
import '../widgets/dashboards/rider_dashboard.dart';
import '../screens/impact_map_screen.dart';
import '../screens/community_feed_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final role = authProvider.role;

    return Scaffold(
      body: TactileBackground(
        child: SafeArea(
          bottom: false,
          child: Stack(
            children: [
              // Dynamic Content based on role and tab
              _buildBody(role),
              
              // Floating Glass Nav Bar
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: GlassNavBar(
                  currentIndex: _currentIndex,
                  onTap: (index) {
                    setState(() => _currentIndex = index);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(UserRole role) {
    // For now, if _currentIndex is 0, show the main dashboard
    // Other tabs are placeholders for now
    if (_currentIndex == 1) {
      return const CommunityFeedScreen();
    }

    if (_currentIndex == 2) {
      return const ImpactMapScreen();
    }

    if (_currentIndex != 0) {
      return Center(
        child: Text(
          'MODULE IN DEVELOPMENT',
          style: TextStyle(color: Colors.white.withOpacity(0.1), fontWeight: FontWeight.w900, letterSpacing: 5),
        ),
      );
    }

    switch (role) {
      case UserRole.admin:
        return const AdminDashboard();
      case UserRole.ngo:
        return const NGODashboard();
      case UserRole.donor:
        return const DonorDashboard();
      case UserRole.rider:
        return const RiderDashboard();
      default:
        return const Center(child: Text('Unauthorized Access Vector Detected.'));
    }
  }
}
