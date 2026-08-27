import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'utils/rule_expander.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  ensureTimezoneInitialized();
  runApp(
    const ProviderScope(
      child: FrienduleApp(),
    ),
  );
}
