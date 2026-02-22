import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../components/glass_box.dart';
import '../components/premium_button.dart';
import '../theme/styles.dart';

class DonorWizardScreen extends StatefulWidget {
  const DonorWizardScreen({super.key});

  @override
  State<DonorWizardScreen> createState() => _DonorWizardScreenState();
}

class _DonorWizardScreenState extends State<DonorWizardScreen> {
  int _currentStep = 0;
  final _itemNameController = TextEditingController();
  final _quantityController = TextEditingController();
  final _addressController = TextEditingController();
  String _category = 'veg';

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() => _currentStep++);
    } else {
      // Submit
      Navigator.pop(context);
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                      onPressed: _prevStep,
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
                          'STEP 0${_currentStep + 1} OF 03',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                            color: AppColors.accentBlue,
                          ),
                        ),
                        Text(
                          _getStepTitle(),
                          style: GoogleFonts.inter(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Step Progress Bar
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: List.generate(3, (index) => Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: index <= _currentStep ? AppColors.accentBlue : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  )),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Main Step Content
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: _buildStepContent(),
                ),
              ),
              
              // Bottom Action
              Padding(
                padding: const EdgeInsets.all(24),
                child: PremiumButton(
                  title: _currentStep == 2 ? 'Initialize Rescue' : 'Next Protocol',
                  onPress: _nextStep,
                  icon: _currentStep == 2 ? LucideIcons.zap : LucideIcons.arrowRight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case 0: return 'Item Details';
      case 1: return 'Logistics Vector';
      case 2: return 'Confirmation';
      default: return 'Wizard';
    }
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0: return _buildItemDetails();
      case 1: return _buildLogisticsVector();
      case 2: return _buildConfirmation();
      default: return const SizedBox();
    }
  }

  Widget _buildItemDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _InputField(
          label: 'ITEM NAME',
          controller: _itemNameController,
          placeholder: 'e.g. Fresh Garden Salad',
        ),
        const SizedBox(height: 24),
        Text(
          'CATEGORY',
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            _CategoryTab(
              label: 'VEG',
              isSelected: _category == 'veg',
              onTap: () => setState(() => _category = 'veg'),
              color: AppColors.accentGreen,
            ),
            const SizedBox(width: 12),
            _CategoryTab(
              label: 'NON-VEG',
              isSelected: _category == 'nonveg',
              onTap: () => setState(() => _category = 'nonveg'),
              color: Colors.redAccent,
            ),
          ],
        ),
        const SizedBox(height: 24),
        _InputField(
          label: 'SHELF LIFE (HOURS)',
          controller: _quantityController,
          placeholder: 'e.g. 4',
          keyboardType: TextInputType.number,
        ),
      ],
    );
  }

  Widget _buildLogisticsVector() {
    return Column(
      children: [
        _InputField(
          label: 'PICKUP ADDRESS',
          controller: _addressController,
          placeholder: 'e.g. 123 Green St, Silicon Valley',
          maxLines: 3,
        ),
        const SizedBox(height: 24),
        GlassBox(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Icon(LucideIcons.mapPin, color: AppColors.accentBlue, size: 24),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Detecting GPS Vector...',
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Text(
                      'Accuracy: ± 5 meters',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Icon(LucideIcons.checkCircle2, color: AppColors.accentGreen, size: 18),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConfirmation() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GlassBox(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              _SummaryRow(label: 'Item', value: _itemNameController.text),
              Divider(color: Colors.white.withOpacity(0.05), height: 32),
              _SummaryRow(label: 'Category', value: _category.toUpperCase()),
              Divider(color: Colors.white.withOpacity(0.05), height: 32),
              _SummaryRow(label: 'Address', value: _addressController.text),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.accentBlue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.accentBlue.withOpacity(0.2)),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.shieldCheck, color: AppColors.accentBlue, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Your donation path is encrypted and verified for SDG-12 compliance.',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.accentBlue),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InputField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String placeholder;
  final TextInputType keyboardType;
  final int maxLines;

  const _InputField({
    required this.label,
    required this.controller,
    required this.placeholder,
    this.keyboardType = TextInputType.text,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            maxLines: maxLines,
            style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              border: InputBorder.none,
              hintText: placeholder,
              hintStyle: GoogleFonts.inter(color: Colors.white.withOpacity(0.24), fontSize: 14),
            ),
          ),
        ),
      ],
    );
  }
}

class _CategoryTab extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final Color color;

  const _CategoryTab({
    required this.label,
    required this.isSelected,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.2) : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected ? color : Colors.white.withOpacity(0.05),
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: isSelected ? color : Colors.white.withOpacity(0.24),
                letterSpacing: 2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.inter(color: AppColors.textSecondary, fontSize: 13)),
        Text(
          value.isEmpty ? 'Not Specified' : value,
          style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ],
    );
  }
}
