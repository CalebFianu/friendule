import '../models/user.dart';
import 'api_client.dart';
import 'storage_service.dart';

class AuthService {
  final ApiClient apiClient;
  final StorageService storageService;

  AuthService({
    required this.apiClient,
    required this.storageService,
  });

  Future<User> register({
    required String email,
    required String password,
  }) async {
    final response = await apiClient.post(
      '/auth/register',
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    final data = response.data as Map<String, dynamic>;
    final user = User.fromJson(data);
    await storageService.saveUser(user);
    return user;
  }

  Future<User> login({
    required String email,
    required String password,
  }) async {
    final response = await apiClient.post(
      '/auth/login',
      data: {
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );

    final data = response.data as Map<String, dynamic>;
    final user = User.fromJson(data);
    await storageService.saveUser(user);
    return user;
  }

  Future<void> logout() async {
    await storageService.clearAuth();
  }

  Future<User?> getSavedSession() async {
    return storageService.getUser();
  }
}
