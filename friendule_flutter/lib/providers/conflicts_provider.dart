import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/rule.dart';
import '../utils/conflict_detector.dart';
import 'calendar_provider.dart';
import 'friends_provider.dart';
import 'rules_provider.dart';

final selectedFriendProvider = Provider((ref) {
  final regularFriends = ref.watch(regularFriendsProvider);
  final cal = ref.watch(calendarProvider);
  if (regularFriends.isEmpty) return null;
  final safeIdx = cal.friendIdx.clamp(0, regularFriends.length - 1);
  return regularFriends[safeIdx];
});

final conflictsProvider = Provider<List<(Rule, Rule)>>((ref) {
  final friend = ref.watch(selectedFriendProvider);
  final allRules = ref.watch(rulesProvider).value ?? [];

  if (friend == null) return [];

  final friendRules = allRules.where((r) => r.friendId == friend.id).toList();
  return findFriendConflicts(friendRules);
});
