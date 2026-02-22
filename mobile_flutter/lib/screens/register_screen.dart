import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../components/premium_button.dart';
import '../theme/styles.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'donor';
  bool _loading = false;

  final List<Map<String, String>> _roles = [
    {'id': 'donor', 'label': 'Donor', 'icon': '🍱'},
    {'id': 'rider', 'label': 'Rider', 'icon': '🛵'},
    {'id': 'ngo', 'label': 'NGO', 'icon': '🤝'},
    {'id': 'admin', 'label': 'Admin', 'icon': '⚡'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: TactileBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
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
                const SizedBox(height: 32),
                Text(
                  'Register.',
                  style: GoogleFonts.inter(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Join the zero-waste intelligence network.',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 48),

                // Name
                _InputField(
                  label: 'FULL NAME',
                  controller: _nameController,
                  icon: LucideIcons.user,
                  placeholder: 'John Doe',
                ),
                const SizedBox(height: 24),

                // Email
                _InputField(
                  label: 'EMAIL VECTOR',
                  controller: _emailController,
                  icon: LucideIcons.mail,
                  placeholder: 'you@resq.ai',
                ),
                const SizedBox(height: 24),

                // Password
                _InputField(
                  label: 'PASS-KEY',
                  controller: _passwordController,
                  icon: LucideIcons.lock,
                  placeholder: '••••••••',
                  isPassword: true,
                ),
                const SizedBox(height: 32),

                // Role Selection
                Text(
                  'NETWORK ROLE',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 2.2,
                  children: _roles.map((role) => _RoleButton(
                    role: role,
                    isSelected: _selectedRole == role['id'],
                    onSelect: () => setState(() => _selectedRole = role['id']!),
                  )).toList(),
                ),

                const SizedBox(height: 48),
                
                PremiumButton(
                  title: 'Initialize Account',
                  loading: _loading,
                  onPress: () async {
                    if (_nameController.text.isEmpty || _emailController.text.isEmpty || _passwordController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill in all fields')),
                      );
                      return;
                    }

                    setState(() => _loading = true);
                    try {
                      await Provider.of<AuthProvider>(context, listen: false).register({
                        'name': _nameController.text,
                        'email': _emailController.text,
                        'password': _passwordController.text,
                        'role': _selectedRole,
                      });
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Registration successful. Please sign in.')),
                        );
                        Navigator.pushReplacementNamed(context, '/login');
                      }
                    } catch (e) {
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(e.toString())),
                        );
                      }
                    } finally {
                      if (mounted) setState(() => _loading = false);
                    }
                  },
                  icon: LucideIcons.zap,
                ),
                
                const SizedBox(height: 16),
                
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    child: RichText(
                      text: TextSpan(
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: Colors.white.withOpacity(0.4),
                        ),
                        children: const [
                          TextSpan(text: 'Already have an account? '),
                          TextSpan(
                            text: 'Sign In',
                            style: TextStyle(color: AppColors.accentBlue),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
                Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.shield, size: 14, color: Colors.white.withOpacity(0.1)),
                      const SizedBox(width: 8),
                      Text(
                        'ENCRYPTED ONBOARDING VECTOR',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 3,
                          color: Colors.white.withOpacity(0.1),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final Map<String, String> role;
  final bool isSelected;
  final VoidCallback onSelect;

  const _RoleButton({
    required this.role,
    required this.isSelected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelect,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentBlue.withOpacity(0.2) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.accentBlue : Colors.white.withOpacity(0.05),
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(role['icon']!, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 8),
            Text(
              role['label']!.toUpperCase(),
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 1,
                color: isSelected ? AppColors.accentBlue : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final String placeholder;
  final bool isPassword;

  const _InputField({
    required this.label,
    required this.controller,
    required this.icon,
    required this.placeholder,
    this.isPassword = false,
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
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 18, color: AppColors.accentBlue),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: controller,
                  obscureText: isPassword,
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: placeholder,
                    hintStyle: GoogleFonts.inter(color: Colors.white.withOpacity(0.24)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
