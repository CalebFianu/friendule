import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/rule.dart';
import '../services/rules_service.dart';
import 'auth_provider.dart';

final rulesServiceProvider = Provider<RulesService>((ref) {
  final client = ref.watch(apiClientProvider);
  return RulesService(apiClient: client);
});

class RulesNotifier extends AsyncNotifier<List<Rule>> {
  late final RulesService _rulesService;

  @override
  Future<List<Rule>> build() async {
    _rulesService = ref.watch(rulesServiceProvider);
    final user = ref.watch(authProvider).value;
    if (user == null) return [];

    return _rulesService.getRules();
  }

  Future<void> reload() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return _rulesService.getRules();
    });
  }

  Future<Rule> createRule(Rule rule) async {
    final created = await _rulesService.createRule(rule);
    final currentList = state.value ?? [];
    state = AsyncValue.data([...currentList, created]);
    return created;
  }

  Future<List<Rule>> createRules(List<Rule> rules) async {
    final saved = <Rule>[];
    for (final r in rules) {
      final created = await _rulesService.createRule(r);
      saved.add(created);
    }
    final currentList = state.value ?? [];
    state = AsyncValue.data([...currentList, ...saved]);
    return saved;
  }

  Future<Rule> updateRule(String id, Rule rule) async {
    final updated = await _rulesService.updateRule(id, rule);
    final currentList = state.value ?? [];
    state = AsyncValue.data(
      currentList.map((r) => r.id == id ? updated : r).toList(),
    );
    return updated;
  }

  Future<void> deleteRule(String id) async {
    await _rulesService.deleteRule(id);
    final currentList = state.value ?? [];
    state = AsyncValue.data(currentList.where((r) => r.id != id).toList());
  }

  Future<void> deleteRules(List<Rule> rulesToDelete) async {
    final idsToDelete = rulesToDelete.map((r) => r.id).toSet();
    for (final id in idsToDelete) {
      await _rulesService.deleteRule(id);
    }
    final currentList = state.value ?? [];
    state = AsyncValue.data(
      currentList.where((r) => !idsToDelete.contains(r.id)).toList(),
    );
  }
}

final rulesProvider = AsyncNotifierProvider<RulesNotifier, List<Rule>>(() {
  return RulesNotifier();
});
