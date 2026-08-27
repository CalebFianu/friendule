import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/friend.dart';
import '../providers/calendar_provider.dart';
import '../providers/expansion_provider.dart';
import '../providers/friends_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/date_utils.dart';
import 'ds/ds_badge.dart';
import 'ds/ds_icon_button.dart';

class FriendSwitcher extends ConsumerWidget {
  final Friend friend;
  final VoidCallback onOpenAddFriend;

  const FriendSwitcher({
    super.key,
    required this.friend,
    required this.onOpenAddFriend,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final regularFriends = ref.watch(regularFriendsProvider);
    final cal = ref.watch(calendarProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final now = DateTime.now();
    final todayY = ymd(now);
    final nowMin = now.hour * 60 + now.minute;

    final todayIntervals = ref.watch(
      friendInstancesOnDateProvider((friend.id, todayY)),
    );

    final isBusyNow = todayIntervals.any(
          (e) =>
              e.status == 'busy' &&
              !e.allDay &&
              e.startMin != null &&
              e.endMin != null &&
              nowMin >= e.startMin! &&
              nowMin < e.endMin!,
        ) ||
        todayIntervals.any((e) => e.status == 'busy' && e.allDay);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Top Row: Prev Button, Friend Info, Next Button
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Previous Friend Button
              DsIconButton(
                icon: const Icon(Icons.chevron_left_rounded, size: 20),
                shape: DsIconButtonShape.circle,
                size: DsIconButtonSize.sm,
                onPressed: () {
                  ref.read(calendarProvider.notifier).prevFriend(regularFriends.length);
                },
                tooltip: 'Previous friend',
              ),
              const SizedBox(width: 12),

              // Friend Avatar & Details
              Expanded(
                child: Row(
                  children: [
                    // Large Friend Avatar with colorset
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: friend.colorset.tint,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: friend.colorset.tintBorder,
                          width: 1.5,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        friend.initials,
                        style: AppTypography.title(
                          color: friend.colorset.deep,
                        ).copyWith(fontSize: 17, fontWeight: FontWeight.w800),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Friend Name & Status
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            friend.name,
                            style: AppTypography.title(
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.textPrimaryLight,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            friend.status,
                            style: AppTypography.sm(
                              color: isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.textSecondaryLight,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 5),
                          DsBadge(
                            tone: isBusyNow ? DsBadgeTone.danger : DsBadgeTone.success,
                            dot: true,
                            text: isBusyNow ? 'Busy right now' : 'Free right now',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Next Friend Button
              DsIconButton(
                icon: const Icon(Icons.chevron_right_rounded, size: 20),
                shape: DsIconButtonShape.circle,
                size: DsIconButtonSize.sm,
                onPressed: () {
                  ref.read(calendarProvider.notifier).nextFriend(regularFriends.length);
                },
                tooltip: 'Next friend',
              ),
            ],
          ),

          const SizedBox(height: 14),
          const Divider(height: 1),
          const SizedBox(height: 12),

          // Bottom Quick-Pick Avatar Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                ...regularFriends.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final fr = entry.value;
                  final isSelected = idx == cal.friendIdx;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () {
                        ref.read(calendarProvider.notifier).pickFriend(idx);
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 140),
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: isSelected ? fr.colorset.solid : fr.colorset.tint,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected
                                ? fr.colorset.solid
                                : fr.colorset.tintBorder,
                            width: 1.5,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: fr.colorset.solid.withValues(alpha: 0.35),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  )
                                ]
                              : null,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          fr.initials,
                          style: AppTypography.xxs(
                            color: isSelected ? Colors.white : fr.colorset.deep,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  );
                }),

                // Add Friend Pill
                GestureDetector(
                  onTap: onOpenAddFriend,
                  child: Container(
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                        style: BorderStyle.solid,
                        width: 1,
                      ),
                    ),
                    alignment: Alignment.center,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.add_rounded,
                          size: 16,
                          color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          'Add',
                          style: AppTypography.xs(
                            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
