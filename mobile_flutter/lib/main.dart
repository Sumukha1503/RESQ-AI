import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'providers/auth_provider.dart';
import 'theme/styles.dart';
import 'services/notification_service.dart';
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/donor_wizard_screen.dart';
import 'screens/rider_swipe_screen.dart';
import 'screens/impact_map_screen.dart';
import 'screens/community_feed_screen.dart';

void main() async {
  print('DEBUG: ResQ App Start');
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    print('DEBUG: Initializing Firebase...');
    await Firebase.initializeApp();
    await NotificationService.initialize();
  } catch (e) {
    print('DEBUG: Firebase Error: $e');
  }
  
  print('DEBUG: Running App');
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const ResQUApp(),
    ),
  );
}

class ResQUApp extends StatelessWidget {
  const ResQUApp({super.key});

  @override
  Widget build(BuildContext context) {
    print('DEBUG: Building ResQUApp');
    return MaterialApp(
      title: 'ResQ AI',
      debugShowCheckedModeBanner: false,
      theme: AppStyles.luxuryDark,
      initialRoute: '/',
      routes: {
        '/': (context) => const LandingScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/donor-wizard': (context) => const DonorWizardScreen(),
        '/rider-swipe': (context) => const RiderSwipeScreen(),
        '/impact-map': (context) => const ImpactMapScreen(),
        '/community-feed': (context) => const CommunityFeedScreen(),
      },
    );
  }
}
