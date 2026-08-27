import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/undo_action.dart';
import 'rules_provider.dart';

class UndoNotifier extends Notifier<UndoAction?> {
  @override
  UndoAction? build() => null;

  void track(UndoAction action) {
    state = action;
  }

  void clear() {
    state = null;
  }

  Future<void> revert() async {
    final action = state;
    if (action == null) return;

    final rulesNotifier = ref.read(rulesProvider.notifier);

    if (action.type == 'create') {
      // Revert creation -> delete created rules
      await rulesNotifier.deleteRules(action.created);
    } else if (action.type == 'delete') {
      // Revert deletion -> recreate deleted rules
      await rulesNotifier.createRules(action.deleted);
    } else if (action.type == 'update') {
      // Revert update -> restore each rule to previous snapshot
      for (final snapshot in action.changes) {
        await rulesNotifier.updateRule(snapshot.id, snapshot.before);
      }
    }

    state = null;
  }
}

final undoProvider = NotifierProvider<UndoNotifier, UndoAction?>(() {
  return UndoNotifier();
});
