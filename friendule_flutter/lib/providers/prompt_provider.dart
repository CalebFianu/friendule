import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/clarification.dart';
import '../models/confirm_action.dart';
import '../models/rule.dart';
import '../models/undo_action.dart';
import '../services/parse_service.dart';
import '../services/transcribe_service.dart';
import '../utils/conflict_detector.dart';
import '../utils/filter_matcher.dart';
import 'auth_provider.dart';
import 'calendar_provider.dart';
import 'conflicts_provider.dart';
import 'friends_provider.dart';
import 'rules_provider.dart';
import 'ui_provider.dart';
import 'undo_provider.dart';

final parseServiceProvider = Provider<ParseService>((ref) {
  final client = ref.watch(apiClientProvider);
  return ParseService(apiClient: client);
});

final transcribeServiceProvider = Provider<TranscribeService>((ref) {
  final client = ref.watch(apiClientProvider);
  return TranscribeService(apiClient: client);
});

class PromptState {
  final String text;
  final bool isParsing;
  final bool isRecording;
  final bool isTranscribing;
  final String? micError;

  const PromptState({
    this.text = '',
    this.isParsing = false,
    this.isRecording = false,
    this.isTranscribing = false,
    this.micError,
  });

  bool get isBusy => isParsing || isTranscribing;

  PromptState copyWith({
    String? text,
    bool? isParsing,
    bool? isRecording,
    bool? isTranscribing,
    String? micError,
    bool clearMicError = false,
  }) {
    return PromptState(
      text: text ?? this.text,
      isParsing: isParsing ?? this.isParsing,
      isRecording: isRecording ?? this.isRecording,
      isTranscribing: isTranscribing ?? this.isTranscribing,
      micError: clearMicError ? null : (micError ?? this.micError),
    );
  }
}

class PromptNotifier extends Notifier<PromptState> {
  @override
  PromptState build() => const PromptState();

  void setText(String t) {
    state = state.copyWith(text: t);
  }

  void clearText() {
    state = state.copyWith(text: '');
  }

  void setRecording(bool recording) {
    state = state.copyWith(isRecording: recording, clearMicError: true);
  }

  void setTranscribing(bool transcribing) {
    state = state.copyWith(isTranscribing: transcribing);
  }

  void setMicError(String? error) {
    state = state.copyWith(micError: error);
  }

  Future<void> commitPrompt({String? overrideText}) async {
    final textToParse = (overrideText ?? state.text).trim();
    final uiNotifier = ref.read(uiProvider.notifier);

    if (textToParse.isEmpty) {
      uiNotifier.flash('Type a schedule description first');
      return;
    }

    final cal = ref.read(calendarProvider);
    final personalFriend = ref.read(personalFriendProvider);
    final selectedFriend = ref.read(selectedFriendProvider);
    final effectiveFriend = cal.tab == 'personal' ? personalFriend : selectedFriend;

    if (effectiveFriend == null) {
      uiNotifier.flash(
        cal.tab == 'personal' ? 'Your calendar is loading…' : 'Add a friend first',
      );
      return;
    }

    state = state.copyWith(isParsing: true);

    try {
      final allRules = ref.read(rulesProvider).value ?? [];
      final friendRules = allRules.where((r) => r.friendId == effectiveFriend.id).toList();

      final parseService = ref.read(parseServiceProvider);
      final response = await parseService.parseSchedule(
        text: textToParse,
        existingRules: friendRules,
      );

      if (response.clarificationNeeded != null &&
          response.clarificationNeeded!.isNotEmpty) {
        uiNotifier.openClarification(
          ClarificationState(
            question: response.clarificationNeeded!,
            originalPrompt: textToParse,
          ),
        );
        return;
      }

      final rulesNotifier = ref.read(rulesProvider.notifier);
      final undoNotifier = ref.read(undoProvider.notifier);

      if (response.intent == 'delete') {
        final toDelete = friendRules
            .where((r) => matchesFilter(r, response.deleteFilter))
            .toList();

        if (toDelete.isEmpty) {
          uiNotifier.flash('No matching rules found to delete');
          return;
        }

        uiNotifier.openConfirm(
          ConfirmAction(
            intent: 'delete',
            affectedRules: toDelete,
            onConfirm: () async {
              uiNotifier.closeConfirm();
              try {
                await rulesNotifier.deleteRules(toDelete);
                undoNotifier.track(UndoAction.delete(toDelete));
                clearText();
                uiNotifier.flash(
                  'Removed ${toDelete.length} rule${toDelete.length > 1 ? 's' : ''}',
                );
              } catch (e) {
                uiNotifier.flash('Delete failed: $e');
              }
            },
            onCancel: () => uiNotifier.closeConfirm(),
          ),
        );
        return;
      }

      if (response.intent == 'update') {
        final updateFields = response.updateFields ?? {};
        final toUpdate = friendRules
            .where((r) => matchesFilter(r, response.updateFilter))
            .toList();

        if (toUpdate.isEmpty) {
          uiNotifier.flash('No matching rules found to update');
          return;
        }

        final snapshots = toUpdate
            .map((r) => RuleUpdateSnapshot(id: r.id, before: r))
            .toList();

        uiNotifier.openConfirm(
          ConfirmAction(
            intent: 'update',
            affectedRules: toUpdate,
            updateFields: updateFields,
            onConfirm: () async {
              uiNotifier.closeConfirm();
              try {
                for (final rule in toUpdate) {
                  final isAllDay = updateFields['allDay'] == true ||
                      (updateFields['allDay'] == null && rule.allDay);
                  final updatedRule = rule.copyWith(
                    title: updateFields['title'] as String?,
                    status: updateFields['status'] as String?,
                    allDay: isAllDay,
                    timeStart: isAllDay ? null : (updateFields['timeStart'] as String?),
                    timeEnd: isAllDay ? null : (updateFields['timeEnd'] as String?),
                    recurrence: updateFields['recurrence'] as String?,
                    weekdays: updateFields['weekdays'] != null
                        ? List<int>.from(updateFields['weekdays'] as List)
                        : null,
                    date: updateFields['date'] as String?,
                  );
                  await rulesNotifier.updateRule(rule.id, updatedRule);
                }
                undoNotifier.track(UndoAction.update(snapshots));
                clearText();
                uiNotifier.flash(
                  'Updated ${toUpdate.length} rule${toUpdate.length > 1 ? 's' : ''}',
                );
              } catch (e) {
                uiNotifier.flash('Update failed: $e');
              }
            },
            onCancel: () => uiNotifier.closeConfirm(),
          ),
        );
        return;
      }

      // Create intent (default)
      if (response.rules.isEmpty) {
        uiNotifier.flash("Couldn't extract any schedule rules from that");
        return;
      }

      final saved = <Rule>[];
      var skipped = 0;

      for (final r in response.rules) {
        final candidate = r.copyWith(
          friendId: effectiveFriend.id,
          rawText: textToParse,
        );

        if (hasStatusConflict(candidate: candidate, existingRules: allRules)) {
          skipped++;
          continue;
        }

        final created = await rulesNotifier.createRule(candidate);
        saved.add(created);
      }

      clearText();
      final forLabel =
          cal.tab == 'personal' ? 'your calendar' : effectiveFriend.firstName;

      if (saved.isEmpty) {
        uiNotifier.flash(
          'All parsed rules conflicted with existing schedule — none added',
        );
      } else {
        undoNotifier.track(UndoAction.create(saved));
        final skippedText = skipped > 0 ? ' ($skipped conflict${skipped > 1 ? 's' : ''} skipped)' : '';
        uiNotifier.flash(
          'Added ${saved.length} rule${saved.length > 1 ? 's' : ''} for $forLabel$skippedText',
        );
      }
    } catch (e) {
      uiNotifier.flash('Error: $e');
    } finally {
      state = state.copyWith(isParsing: false);
    }
  }
}

final promptProvider = NotifierProvider<PromptNotifier, PromptState>(() {
  return PromptNotifier();
});
