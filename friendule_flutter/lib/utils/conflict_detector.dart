import '../models/rule.dart';
import 'date_utils.dart';

int? _toMins(String? timeStr) {
  if (timeStr == null || timeStr.isEmpty) return null;
  final parts = timeStr.split(':').map(int.parse).toList();
  return parts[0] * 60 + (parts.length > 1 ? parts[1] : 0);
}

bool timesOverlap(Rule a, Rule b) {
  if (a.allDay || b.allDay) return true;
  final aStart = _toMins(a.timeStart);
  final aEnd = _toMins(a.timeEnd);
  final bStart = _toMins(b.timeStart);
  final bEnd = _toMins(b.timeEnd);

  if (aStart == null || aEnd == null || bStart == null || bEnd == null) {
    return true;
  }
  return aStart < bEnd && bStart < aEnd;
}

bool rulesOverlap(Rule a, Rule b) {
  bool sharesDay;
  if (a.recurrence == 'daily' || b.recurrence == 'daily') {
    sharesDay = true;
  } else if (a.recurrence == 'once' && b.recurrence == 'once') {
    sharesDay = a.date == b.date;
  } else if (a.recurrence == 'once' && b.recurrence == 'weekly') {
    if (a.date == null || b.weekdays == null) {
      sharesDay = false;
    } else {
      final wd = parseYmd(a.date!).weekday % 7;
      sharesDay = b.weekdays!.contains(wd);
    }
  } else if (a.recurrence == 'weekly' && b.recurrence == 'once') {
    if (b.date == null || a.weekdays == null) {
      sharesDay = false;
    } else {
      final wd = parseYmd(b.date!).weekday % 7;
      sharesDay = a.weekdays!.contains(wd);
    }
  } else if (a.recurrence == 'weekly' && b.recurrence == 'weekly') {
    if (a.weekdays == null || b.weekdays == null) {
      sharesDay = false;
    } else {
      sharesDay = a.weekdays!.any((wd) => b.weekdays!.contains(wd));
    }
  } else {
    sharesDay = false;
  }

  return sharesDay && timesOverlap(a, b);
}

bool hasStatusConflict({
  required Rule candidate,
  required List<Rule> existingRules,
  String? excludeId,
}) {
  if (candidate.status == 'together') return false;
  final opposite = candidate.status == 'busy' ? 'free' : 'busy';

  final candidates = existingRules.where(
    (r) => r.friendId == candidate.friendId && r.id != excludeId && r.status == opposite,
  );

  return candidates.any((r) => rulesOverlap(candidate, r));
}

List<(Rule, Rule)> findFriendConflicts(List<Rule> friendRules) {
  final fr = friendRules.where((r) => r.status != 'together').toList();
  final pairs = <(Rule, Rule)>[];

  for (var i = 0; i < fr.length; i++) {
    for (var j = i + 1; j < fr.length; j++) {
      final a = fr[i];
      final b = fr[j];
      if (a.status != b.status && rulesOverlap(a, b)) {
        pairs.add((a, b));
      }
    }
  }

  return pairs;
}
