import '../models/rule.dart';
import 'api_client.dart';

class ParseResponse {
  final String intent; // 'create', 'delete', 'update'
  final List<Rule> rules;
  final Map<String, dynamic>? deleteFilter;
  final Map<String, dynamic>? updateFilter;
  final Map<String, dynamic>? updateFields;
  final String? clarificationNeeded;

  const ParseResponse({
    required this.intent,
    this.rules = const [],
    this.deleteFilter,
    this.updateFilter,
    this.updateFields,
    this.clarificationNeeded,
  });

  factory ParseResponse.fromJson(Map<String, dynamic> json) {
    final intent = json['intent'] as String? ?? 'create';
    final clarification = json['clarification_needed'] as String?;

    List<Rule> parsedRules = [];
    if (json['rules'] is List) {
      parsedRules = (json['rules'] as List)
          .map((r) => Rule.fromJson(r as Map<String, dynamic>))
          .toList();
    }

    return ParseResponse(
      intent: intent,
      rules: parsedRules,
      deleteFilter: json['delete_filter'] as Map<String, dynamic>?,
      updateFilter: json['update_filter'] as Map<String, dynamic>?,
      updateFields: json['update_fields'] as Map<String, dynamic>?,
      clarificationNeeded: clarification,
    );
  }
}

class ParseService {
  final ApiClient apiClient;

  ParseService({required this.apiClient});

  Future<ParseResponse> parseSchedule({
    required String text,
    required List<Rule> existingRules,
  }) async {
    final response = await apiClient.post(
      '/parse',
      data: {
        'text': text.trim(),
        'existingRules': existingRules
            .map((r) => {
                  'title': r.title,
                  'status': r.status,
                  'recurrence': r.recurrence,
                  'weekdays': r.weekdays,
                  'date': r.date,
                  'timeStart': r.timeStart,
                  'timeEnd': r.timeEnd,
                  'allDay': r.allDay,
                })
            .toList(),
      },
    );

    final data = response.data as Map<String, dynamic>;
    return ParseResponse.fromJson(data);
  }
}
