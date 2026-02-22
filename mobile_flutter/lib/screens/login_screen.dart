import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../components/glass_box.dart';
import '../components/premium_button.dart';
import '../theme/styles.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPass = false;
  bool _showHints = false;
  bool _loading = false;

  final List<Map<String, String>> _demoUsers = [
    {'role': 'Admin', 'email': 'admin@resq.ai', 'pass': 'admin123', 'avatar': '⚡'},
    {'role': 'Donor', 'email': 'donor@resq.ai', 'pass': 'donor123', 'avatar': '🍱'},
    {'role': 'Rider', 'email': 'rider@resq.ai', 'pass': 'rider123', 'avatar': '🛵'},
    {'role': 'NGO', 'email': 'ngo@resq.ai', 'pass': 'ngo123', 'avatar': '🤝'},
  ];

  void _fillHint(Map<String, String> user) {
    setState(() {
      _emailController.text = user['email']!;
      _passwordController.text = user['pass']!;
      _showHints = false;
    });
  }

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
                  'Sign In.',
                  style: GoogleFonts.inter(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Access the global logistics terminal.',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 48),
                
                // Email Field
                _InputField(
                  label: 'EMAIL ADDRESS',
                  controller: _emailController,
                  icon: LucideIcons.mail,
                  placeholder: 'you@resq.ai',
                ),
                const SizedBox(height: 24),
                
                // Password Field
                _InputField(
                  label: 'PASSWORD',
                  controller: _passwordController,
                  icon: LucideIcons.lock,
                  placeholder: '••••••••',
                  isPassword: true,
                  showPass: _showPass,
                  onTogglePass: () => setState(() => _showPass = !_showPass),
                ),
                
                const SizedBox(height: 48),
                
                PremiumButton(
                  title: 'Authorize Entry',
                  loading: _loading,
                  onPress: () async {
                    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please fill in all fields')),
                      );
                      return;
                    }

                    setState(() => _loading = true);
                    try {
                      await Provider.of<AuthProvider>(context, listen: false)
                          .login(_emailController.text, _passwordController.text);
                      if (mounted) {
                        Navigator.pushReplacementNamed(context, '/dashboard');
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
                  icon: LucideIcons.logIn,
                ),
                
                const SizedBox(height: 24),
                
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/register'),
                    child: RichText(
                      text: TextSpan(
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.bold,
                          color: Colors.white.withOpacity(0.4),
                        ),
                        children: const [
                          TextSpan(text: "New to the network? "),
                          TextSpan(
                            text: 'Register Now',
                            style: TextStyle(color: AppColors.accentBlue),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: 40),
                
                // Demo Hints
                GestureDetector(
                  onTap: () => setState(() => _showHints = !_showHints),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.zap, size: 14, color: AppColors.accentOrange),
                        const SizedBox(width: 8),
                        Text(
                          '${_showHints ? 'HIDE' : 'SHOW'} DEMO CREDENTIALS',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                if (_showHints) ...[
                  const SizedBox(height: 12),
                  ..._demoUsers.map((user) => Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: GestureDetector(
                      onTap: () => _fillHint(user),
                      child: GlassBox(
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        child: Row(
                          children: [
                            Text(user['avatar']!, style: const TextStyle(fontSize: 20)),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user['role']!.toUpperCase(),
                                    style: GoogleFonts.inter(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.accentBlue,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                  Text(
                                    user['email']!,
                                    style: GoogleFonts.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(LucideIcons.chevronRight, size: 14, color: Colors.white.withOpacity(0.24)),
                          ],
                        ),
                      ),
                    ),
                  )),
                ],
                
                const SizedBox(height: 40),
                Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.shield, size: 14, color: Colors.white.withOpacity(0.1)),
                      const SizedBox(width: 8),
                      Text(
                        'SDG-12 COMPLIANCE TERMINAL',
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

class _InputField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final String placeholder;
  final bool isPassword;
  final bool? showPass;
  final VoidCallback? onTogglePass;

  const _InputField({
    required this.label,
    required this.controller,
    required this.icon,
    required this.placeholder,
    this.isPassword = false,
    this.showPass,
    this.onTogglePass,
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
                  obscureText: isPassword && !(showPass ?? false),
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
              if (isPassword)
                IconButton(
                  onPressed: onTogglePass,
                  icon: Icon(
                    (showPass ?? false) ? LucideIcons.eyeOff : LucideIcons.eye,
                    size: 18,
                    color: Colors.white.withOpacity(0.24),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
