import '../models/rule.dart';
import 'api_client.dart';

class RulesService {
  final ApiClient apiClient;

  RulesService({required this.apiClient});

  Future<List<Rule>> getRules({String? friendId}) async {
    final response = await apiClient.get(
      '/rules',
      queryParameters: friendId != null ? {'friendId': friendId} : null,
    );
    final data = response.data as Map<String, dynamic>;
    final list = data['rules'] as List<dynamic>? ?? [];
    return list.map((json) => Rule.fromJson(json as Map<String, dynamic>)).toList();
  }

  Future<Rule> createRule(Rule rule) async {
    final response = await apiClient.post(
      '/rules',
      data: rule.toJson(),
    );
    final data = response.data as Map<String, dynamic>;
    return Rule.fromJson(data);
  }

  Future<Rule> updateRule(String id, Rule rule) async {
    final response = await apiClient.put(
      '/rules/$id',
      data: rule.toJson(),
    );
    final data = response.data as Map<String, dynamic>;
    return Rule.fromJson(data);
  }

  Future<void> deleteRule(String id) async {
    await apiClient.delete('/rules/$id');
  }
}
