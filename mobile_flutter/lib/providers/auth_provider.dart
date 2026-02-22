import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

enum UserRole { admin, donor, rider, ngo, guest }

class UserSession {
  final String email;
  final UserRole role;
  final String name;
  final String token;

  UserSession({
    required this.email,
    required this.role,
    required this.name,
    required this.token,
  });
}

class AuthProvider with ChangeNotifier {
  UserSession? _session;

  UserSession? get session => _session;
  bool get isAuthenticated => _session != null;
  UserRole get role => _session?.role ?? UserRole.guest;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('user_email');
    final roleStr = prefs.getString('user_role');
    final name = prefs.getString('user_name');
    final token = prefs.getString('user_token');

    if (email != null && roleStr != null && name != null && token != null) {
      _session = UserSession(
        email: email,
        role: UserRole.values.firstWhere((e) => e.toString() == roleStr),
        name: name,
        token: token,
      );
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await ApiService.login(email, password);
      
      _session = UserSession(
        email: email,
        role: _parseRole(response['role']),
        name: response['name'] ?? 'User',
        token: response['token'],
      );

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_email', email);
      await prefs.setString('user_role', _session!.role.toString());
      await prefs.setString('user_name', _session!.name);
      await prefs.setString('user_token', _session!.token);

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> register(Map<String, dynamic> userData) async {
    try {
      await ApiService.register(userData);
    } catch (e) {
      rethrow;
    }
  }

  void logout() async {
    _session = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    notifyListeners();
  }

  UserRole _parseRole(String? role) {
    switch (role?.toLowerCase()) {
      case 'admin': return UserRole.admin;
      case 'donor': return UserRole.donor;
      case 'rider': return UserRole.rider;
      case 'ngo': return UserRole.ngo;
      default: return UserRole.donor;
    }
  }
}
