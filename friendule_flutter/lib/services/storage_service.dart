import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';

class StorageService {
  static const String _userKey = 'friendule_auth_user';
  static const String _tokenKey = 'friendule_jwt_token';
  static const String _themeKey = 'friendule_theme_mode';

  final FlutterSecureStorage _storage;

  StorageService([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  Future<void> saveUser(User user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
    await _storage.write(key: _tokenKey, value: user.token);
  }

  Future<User?> getUser() async {
    try {
      final jsonStr = await _storage.read(key: _userKey);
      if (jsonStr == null) return null;
      return User.fromJson(jsonDecode(jsonStr) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<String?> getToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearAuth() async {
    await _storage.delete(key: _userKey);
    await _storage.delete(key: _tokenKey);
  }

  Future<void> saveThemeMode(String mode) async {
    await _storage.write(key: _themeKey, value: mode);
  }

  Future<String?> getThemeMode() async {
    try {
      return await _storage.read(key: _themeKey);
    } catch (_) {
      return null;
    }
  }
}
