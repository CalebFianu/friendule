import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/editor_state.dart';
import '../models/rule.dart';
import '../models/undo_action.dart';
import '../utils/conflict_detector.dart';
import '../utils/date_utils.dart';
import 'rules_provider.dart';
import 'ui_provider.dart';
import 'undo_provider.dart';

class EditorNotifier extends Notifier<EditorState?> {
  @override
  EditorState? build() => null;

  void openNew({
    required String friendId,
    required String date,
    int? startMin,
  }) {
    final effectiveMin = startMin ?? 720; // 12:00 PM default
    final wd = parseYmd(date).weekday % 7;

    state = EditorState(
      mode: 'new',
      friendId: friendId,
      title: '',
      status: 'busy',
      allDay: false,
      start: hhmm(effectiveMin),
      end: hhmm(effectiveMin + 60),
      repeat: 'once',
      date: date,
      weekdays: [wd],
      dateFrom: null,
      dateTo: null,
    );
  }

  void openEdit(Rule rule) {
    state = EditorState(
      mode: 'edit',
      id: rule.id,
      friendId: rule.friendId,
      title: rule.title,
      status: rule.status,
      allDay: rule.allDay,
      start: rule.timeStart ?? '09:00',
      end: rule.timeEnd ?? '10:00',
      repeat: rule.recurrence,
      date: rule.date ?? ymd(DateTime.now()),
      weekdays: rule.weekdays != null && rule.weekdays!.isNotEmpty
          ? List.from(rule.weekdays!)
          : [parseYmd(rule.date ?? ymd(DateTime.now())).weekday % 7],
      dateFrom: rule.dateFrom,
      dateTo: rule.dateTo,
    );
  }

  void update(EditorState Function(EditorState) patch) {
    if (state != null) {
      state = patch(state!);
    }
  }

  void toggleWeekday(int day) {
    if (state == null) return;
    final current = List<int>.from(state!.weekdays);
    if (current.contains(day)) {
      current.remove(day);
    } else {
      current.add(day);
      current.sort();
    }
    state = state!.copyWith(weekdays: current);
  }

  void close() {
    state = null;
  }

  Future<bool> save() async {
    final ed = state;
    if (ed == null) return false;

    final title = ed.title.trim().isNotEmpty ? ed.title.trim() : 'Untitled';
    final recurrence = ed.repeat;
    final weekdays = recurrence == 'weekly'
        ? (ed.weekdays.isNotEmpty ? ed.weekdays : [parseYmd(ed.date).weekday % 7])
        : null;

    final candidate = Rule(
      id: ed.id ?? '',
      friendId: ed.friendId,
      title: title,
      status: ed.status,
      recurrence: recurrence,
      allDay: ed.allDay,
      timeStart: ed.allDay ? null : ed.start,
      timeEnd: ed.allDay ? null : ed.end,
      date: recurrence == 'once' ? ed.date : null,
      weekdays: weekdays,
      dateFrom: recurrence != 'once' && ed.dateFrom != null && ed.dateFrom!.isNotEmpty
          ? ed.dateFrom
          : null,
      dateTo: recurrence != 'once' && ed.dateTo != null && ed.dateTo!.isNotEmpty
          ? ed.dateTo
          : null,
      rawText: '',
    );

    final allRules = ref.read(rulesProvider).value ?? [];
    final hasConflict = hasStatusConflict(
      candidate: candidate,
      existingRules: allRules,
      excludeId: ed.id,
    );

    if (hasConflict) {
      ref.read(uiProvider.notifier).flash(
            'Conflict: friend already has an opposing schedule on that day',
          );
      return false;
    }

    final rulesNotifier = ref.read(rulesProvider.notifier);

    if (ed.mode == 'edit' && ed.id != null) {
      final beforeRule = allRules.firstWhere((r) => r.id == ed.id);
      await rulesNotifier.updateRule(ed.id!, candidate);
      ref.read(undoProvider.notifier).track(
            UndoAction.update([RuleUpdateSnapshot(id: ed.id!, before: beforeRule)]),
          );
      ref.read(uiProvider.notifier).flash('Event updated');
    } else {
      final created = await rulesNotifier.createRule(candidate);
      ref.read(undoProvider.notifier).track(UndoAction.create([created]));
      ref.read(uiProvider.notifier).flash('Rule added');
    }

    state = null;
    return true;
  }

  Future<void> delete() async {
    final ed = state;
    if (ed == null || ed.id == null) return;

    final allRules = ref.read(rulesProvider).value ?? [];
    final ruleToDelete = allRules.firstWhere((r) => r.id == ed.id);

    await ref.read(rulesProvider.notifier).deleteRule(ed.id!);
    ref.read(undoProvider.notifier).track(UndoAction.delete([ruleToDelete]));
    ref.read(uiProvider.notifier).flash('Rule removed');
    state = null;
  }
}

final editorProvider = NotifierProvider<EditorNotifier, EditorState?>(() {
  return EditorNotifier();
});
