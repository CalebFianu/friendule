import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../providers/calendar_provider.dart';
import '../providers/friends_provider.dart';
import '../providers/ui_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_button.dart';
import 'ds/ds_input.dart';

class AddFriendModal extends ConsumerStatefulWidget {
  const AddFriendModal({super.key});

  @override
  ConsumerState<AddFriendModal> createState() => _AddFriendModalState();
}

class _AddFriendModalState extends ConsumerState<AddFriendModal> {
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  String _selectedTimezone = 'Africa/Accra';
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ref.read(uiProvider.notifier).flash('Please enter a name');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final friends = ref.read(friendsProvider).value ?? [];
      final usedColors = friends.map((f) => f.color).toSet();
      final color = kPaletteHex.firstWhere(
        (c) => !usedColors.contains(c),
        orElse: () => kPaletteHex[friends.length % kPaletteHex.length],
      );

      final created = await ref.read(friendsProvider.notifier).addFriend(
            name: name,
            color: color,
            description: _descController.text.trim(),
            timezone: _selectedTimezone,
          );

      if (mounted) {
        Navigator.pop(context);
        ref.read(calendarProvider.notifier).setTab('friends');
        ref.read(uiProvider.notifier).flash('${created.firstName} added!');
      }
    } catch (e) {
      if (mounted) {
        ref.read(uiProvider.notifier).flash('Failed to add friend: $e');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Sheet Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.slate700 : AppColors.slate300,
                    borderRadius: BorderRadius.circular(999),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Add a friend',
                        style: AppTypography.h3(
                          color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'They’ll show up in your schedule view.',
                        style: AppTypography.sm(
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Name Input
              Text(
                'NAME',
                style: AppTypography.xxs(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.06,
                ),
              ),
              const SizedBox(height: 6),
              DsInput(
                controller: _nameController,
                placeholder: 'e.g. Jordan Lee',
                autofocus: true,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 16),

              // Description Input
              Text(
                'DESCRIPTION (OPTIONAL)',
                style: AppTypography.xxs(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.06,
                ),
              ),
              const SizedBox(height: 6),
              DsInput(
                controller: _descController,
                placeholder: 'e.g. Remote dev · free on weekends',
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 16),

              // Timezone Dropdown
              Text(
                'TIMEZONE',
                style: AppTypography.xxs(
                  color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.06,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                  ),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedTimezone,
                    isExpanded: true,
                    dropdownColor: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                    style: AppTypography.body(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                    items: kCommonTimezones.map((tz) {
                      return DropdownMenuItem(
                        value: tz,
                        child: Text(tz.replaceAll('_', ' ')),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedTimezone = val);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DsButton(
                    variant: DsButtonVariant.secondary,
                    text: 'Cancel',
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 8),
                  DsButton(
                    variant: DsButtonVariant.primary,
                    text: 'Add friend',
                    loading: _isLoading,
                    onPressed: _handleSave,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
