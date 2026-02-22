import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../components/glass_box.dart';
import '../theme/styles.dart';

class ImpactMapScreen extends StatefulWidget {
  const ImpactMapScreen({super.key});

  @override
  State<ImpactMapScreen> createState() => _ImpactMapScreenState();
}

class _ImpactMapScreenState extends State<ImpactMapScreen> {
  late GoogleMapController _mapController;
  bool _mapReady = false;

  final CameraPosition _initialPosition = const CameraPosition(
    target: LatLng(12.9716, 77.5946), // Bangalore
    zoom: 13.0,
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // The Map Layer
          _buildMap(),
          
          // Gradient Overlay to blend with UI
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.4),
                    Colors.transparent,
                    Colors.black.withOpacity(0.6),
                  ],
                ),
              ),
            ),
          ),
          
          // UI Overlays
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                const Spacer(),
                _buildTelemetryCards(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMap() {
    // In a real environment, we'd check for API keys.
    // For this port, we'll implement a dark-themed map.
    return GoogleMap(
      initialCameraPosition: _initialPosition,
      onMapCreated: (controller) {
        _mapController = controller;
        setState(() => _mapReady = true);
        _applyMapStyle();
      },
      zoomControlsEnabled: false,
      myLocationButtonEnabled: false,
      compassEnabled: false,
      mapToolbarEnabled: false,
    );
  }

  void _applyMapStyle() {
    // Dark mode map style JSON would go here
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Icon(LucideIcons.arrowLeft, color: Colors.white),
            style: IconButton.styleFrom(
              backgroundColor: Colors.black.withOpacity(0.5),
              padding: const EdgeInsets.all(12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
          GlassBox(
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              children: [
                Icon(LucideIcons.radio, color: AppColors.accentBlue, size: 16),
                const SizedBox(width: 12),
                Text(
                  'LINK STABLE',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                    color: AppColors.accentBlue,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryCards() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: GlassBox(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Icon(LucideIcons.zap, color: AppColors.accentOrange, size: 20),
                      const SizedBox(height: 12),
                      const Text('12', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      Text('ACTIVE RESCUES', style: GoogleFonts.inter(fontSize: 8, color: AppColors.textSecondary, letterSpacing: 1)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GlassBox(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Icon(LucideIcons.users, color: AppColors.accentGreen, size: 20),
                      const SizedBox(height: 12),
                      const Text('142', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
                      Text('AVAILABLE RIDERS', style: GoogleFonts.inter(fontSize: 8, color: AppColors.textSecondary, letterSpacing: 1)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GlassBox(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Icon(LucideIcons.shieldCheck, color: AppColors.accentBlue, size: 24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'OSINT TELEMETRY ENABLED',
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.accentBlue),
                      ),
                      Text(
                        'Visualizing real-time supply chain vectors.',
                        style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
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
