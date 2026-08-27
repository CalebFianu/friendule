import '../models/rule.dart';
import 'date_utils.dart';

bool matchesFilter(Rule rule, Map<String, dynamic>? filter) {
  if (filter == null) return false;
  if (filter['all'] == true) return true;

  final statusFilter = filter['status'] as String?;
  if (statusFilter != null && statusFilter != 'any' && rule.status != statusFilter) {
    return false;
  }

  final dateFilter = filter['date'] as String?;
  final rawKeywords = filter['title_keywords'];
  List<String>? keywords;
  if (rawKeywords is List) {
    keywords = rawKeywords.map((e) => e.toString().toLowerCase()).toList();
  }

  if (dateFilter != null && dateFilter.isNotEmpty) {
    final hasNarrowingFilter = (keywords != null && keywords.isNotEmpty) ||
        (statusFilter != null && statusFilter != 'any');

    if (rule.recurrence == 'once') {
      if (rule.date != dateFilter) return false;
    } else if (rule.recurrence == 'weekly') {
      if (!hasNarrowingFilter) return false;
      final wd = parseYmd(dateFilter).weekday % 7;
      if (rule.weekdays == null || !rule.weekdays!.contains(wd)) return false;
    } else if (rule.recurrence == 'daily') {
      if (!hasNarrowingFilter) return false;
    } else {
      return false;
    }

    if (keywords != null && keywords.isNotEmpty) {
      final titleLower = rule.title.toLowerCase();
      if (!keywords.any((kw) => titleLower.contains(kw))) return false;
    }
    return true;
  }

  final recurrenceFilter = filter['recurrence'] as String?;
  if (recurrenceFilter != null &&
      recurrenceFilter != 'any' &&
      rule.recurrence != recurrenceFilter) {
    return false;
  }

  final rawWd = filter['weekdays'];
  List<int>? weekdaysFilter;
  if (rawWd is List) {
    weekdaysFilter = rawWd.map((e) => (e as num).toInt()).toList();
  }

  if (weekdaysFilter != null && weekdaysFilter.isNotEmpty) {
    if (rule.recurrence == 'weekly') {
      if (rule.weekdays == null || !rule.weekdays!.any((wd) => weekdaysFilter!.contains(wd))) {
        return false;
      }
    } else if (rule.recurrence == 'once') {
      if (rule.date == null) return false;
      final ruleWd = parseYmd(rule.date!).weekday % 7;
      if (!weekdaysFilter.contains(ruleWd)) return false;
    }
  }

  if (keywords != null && keywords.isNotEmpty) {
    final titleLower = rule.title.toLowerCase();
    if (!keywords.any((kw) => titleLower.contains(kw))) return false;
  }

  return true;
}
