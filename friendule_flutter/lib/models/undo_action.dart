import 'rule.dart';

class RuleUpdateSnapshot {
  final String id;
  final Rule before;

  const RuleUpdateSnapshot({
    required this.id,
    required this.before,
  });
}

class UndoAction {
  final String type; // 'create' | 'delete' | 'update'
  final List<Rule> created;
  final List<Rule> deleted;
  final List<RuleUpdateSnapshot> changes;

  const UndoAction({
    required this.type,
    this.created = const [],
    this.deleted = const [],
    this.changes = const [],
  });

  factory UndoAction.create(List<Rule> created) {
    return UndoAction(type: 'create', created: created);
  }

  factory UndoAction.delete(List<Rule> deleted) {
    return UndoAction(type: 'delete', deleted: deleted);
  }

  factory UndoAction.update(List<RuleUpdateSnapshot> changes) {
    return UndoAction(type: 'update', changes: changes);
  }
}
