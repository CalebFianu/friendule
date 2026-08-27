import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/friend.dart';
import '../services/friends_service.dart';
import 'auth_provider.dart';

final friendsServiceProvider = Provider<FriendsService>((ref) {
  final client = ref.watch(apiClientProvider);
  return FriendsService(apiClient: client);
});

class FriendsNotifier extends AsyncNotifier<List<Friend>> {
  late final FriendsService _friendsService;

  @override
  Future<List<Friend>> build() async {
    _friendsService = ref.watch(friendsServiceProvider);
    final user = ref.watch(authProvider).value;
    if (user == null) return [];

    return _friendsService.getFriends();
  }

  Future<void> reload() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return _friendsService.getFriends();
    });
  }

  Future<Friend> addFriend({
    required String name,
    String? color,
    String? description,
    String? timezone,
  }) async {
    final created = await _friendsService.addFriend(
      name: name,
      color: color,
      description: description,
      timezone: timezone,
    );

    final currentList = state.value ?? [];
    state = AsyncValue.data([...currentList, created]);
    return created;
  }

  Future<Friend> updateFriend(
    String id, {
    String? name,
    String? color,
    String? description,
    String? timezone,
  }) async {
    final updated = await _friendsService.updateFriend(
      id,
      name: name,
      color: color,
      description: description,
      timezone: timezone,
    );

    final currentList = state.value ?? [];
    state = AsyncValue.data(
      currentList.map((f) => f.id == id ? updated : f).toList(),
    );
    return updated;
  }

  Future<void> deleteFriend(String id) async {
    await _friendsService.deleteFriend(id);
    final currentList = state.value ?? [];
    state = AsyncValue.data(currentList.where((f) => f.id != id).toList());
  }
}

final friendsProvider = AsyncNotifierProvider<FriendsNotifier, List<Friend>>(() {
  return FriendsNotifier();
});

final regularFriendsProvider = Provider<List<Friend>>((ref) {
  final friends = ref.watch(friendsProvider).value ?? [];
  return friends.where((f) => !f.isSelf).toList();
});

final personalFriendProvider = Provider<Friend?>((ref) {
  final friends = ref.watch(friendsProvider).value ?? [];
  try {
    return friends.firstWhere((f) => f.isSelf);
  } catch (_) {
    return null;
  }
});
