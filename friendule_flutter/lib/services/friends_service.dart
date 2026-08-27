import '../models/friend.dart';
import 'api_client.dart';

class FriendsService {
  final ApiClient apiClient;

  FriendsService({required this.apiClient});

  Future<List<Friend>> getFriends() async {
    final response = await apiClient.get('/friends');
    final data = response.data as Map<String, dynamic>;
    final list = data['friends'] as List<dynamic>? ?? [];
    return list.map((json) => Friend.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<Friend> addFriend({
    required String name,
    String? color,
    String? description,
    String? timezone,
  }) async {
    final response = await apiClient.post(
      '/friends',
      data: {
        'name': name.trim(),
        if (color != null) 'color': color,
        if (description != null) 'description': description.trim(),
        if (timezone != null) 'timezone': timezone.trim(),
      },
    );
    final data = response.data as Map<String, dynamic>;
    return Friend.fromJson(data);
  }

  Future<Friend> updateFriend(
    String id, {
    String? name,
    String? color,
    String? description,
    String? timezone,
  }) async {
    final response = await apiClient.patch(
      '/friends/$id',
      data: {
        if (name != null) 'name': name.trim(),
        if (color != null) 'color': color,
        if (description != null) 'description': description.trim(),
        if (timezone != null) 'timezone': timezone.trim(),
      },
    );
    final data = response.data as Map<String, dynamic>;
    return Friend.fromJson(data);
  }

  Future<void> deleteFriend(String id) async {
    await apiClient.delete('/friends/$id');
  }
}
