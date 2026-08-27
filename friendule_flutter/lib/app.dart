import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/auth_provider.dart';
import 'providers/ui_provider.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

class FrienduleApp extends ConsumerWidget {
  const FrienduleApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final isDark = ref.watch(uiProvider.select((s) => s.isDarkMode));

    return MaterialApp(
      title: 'Friendule',
      debugShowCheckedModeBanner: false,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      home: authState.when(
        data: (user) {
          if (user != null) {
            return const HomeScreen();
          }
          return AuthScreen(
            isDark: isDark,
            onToggleDark: () => ref.read(uiProvider.notifier).toggleDarkMode(),
          );
        },
        loading: () => Scaffold(
          body: Center(
            child: CircularProgressIndicator(
              color: isDark ? const Color(0xFFA29BFE) : const Color(0xFF6C5CE7),
            ),
          ),
        ),
        error: (err, stack) => AuthScreen(
          isDark: isDark,
          onToggleDark: () => ref.read(uiProvider.notifier).toggleDarkMode(),
        ),
      ),
    );
  }
}
