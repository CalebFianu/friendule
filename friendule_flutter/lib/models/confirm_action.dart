import 'rule.dart';

class ConfirmAction {
  final String intent; // 'delete' | 'update' | 'revert'
  final List<Rule> affectedRules;
  final Map<String, dynamic>? updateFields;
  final String? revertType; // 'create' | 'delete' | 'update'
  final Future<void> Function() onConfirm;
  final void Function() onCancel;

  const ConfirmAction({
    required this.intent,
    required this.affectedRules,
    this.updateFields,
    this.revertType,
    required this.onConfirm,
    required this.onCancel,
  });
}
