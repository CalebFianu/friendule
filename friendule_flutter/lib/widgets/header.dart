import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../providers/ui_provider.dart';
import '../providers/undo_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_avatar.dart';
import 'ds/ds_icon_button.dart';

class Header extends ConsumerWidget {
  const Header({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider).value;
    final lastAction = ref.watch(undoProvider);
    final uiState = ref.watch(uiProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final userEmail = authState?.email ?? '';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Brand Logo
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 44,
                height: 24,
                child: Stack(
                  children: [
                    Positioned(
                      left: 0,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.danger,
                          border: Border.all(
                            color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      left: 11,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.warning,
                          border: Border.all(
                            color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      left: 22,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isDark ? AppColors.violet400 : AppColors.violet500,
                          border: Border.all(
                            color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Friendule',
                    style: AppTypography.title(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ).copyWith(fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                ],
              ),
            ],
          ),

          const Spacer(),

          // Revert / Undo Button
          if (lastAction != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () {
                  ref.read(undoProvider.notifier).revert();
                  ref.read(uiProvider.notifier).flash('Action reverted');
                },
                child: Container(
                  height: 32,
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceInsetDark : AppColors.accentWashLight,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: isDark ? AppColors.borderBrandDark : AppColors.violet400,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.undo_rounded,
                        size: 15,
                        color: isDark ? AppColors.violet300 : AppColors.violet600,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Revert',
                        style: AppTypography.xs(
                          color: isDark ? AppColors.violet300 : AppColors.violet600,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Dark mode toggle
          DsIconButton(
            icon: Icon(
              uiState.isDarkMode ? Icons.wb_sunny_rounded : Icons.nightlight_round,
              size: 16,
            ),
            size: DsIconButtonSize.sm,
            shape: DsIconButtonShape.circle,
            variant: DsIconButtonVariant.surface,
            onPressed: () {
              ref.read(uiProvider.notifier).toggleDarkMode();
            },
            tooltip: uiState.isDarkMode ? 'Light mode' : 'Dark mode',
          ),
          const SizedBox(width: 8),

          // User Profile & Sign out
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'logout') {
                ref.read(authProvider.notifier).logout();
              }
            },
            color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            itemBuilder: (context) => [
              PopupMenuItem(
                enabled: false,
                child: Text(
                  userEmail,
                  style: AppTypography.sm(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ),
              const PopupMenuDivider(),
              PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    const Icon(Icons.logout_rounded, color: AppColors.danger, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Sign out',
                      style: AppTypography.body(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            child: DsAvatar(name: userEmail, size: 30),
          ),
        ],
      ),
    );
  }
}
