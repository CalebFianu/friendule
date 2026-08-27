import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../config/constants.dart';
import '../models/friend.dart';
import '../providers/prompt_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import 'ds/ds_button.dart';

class PromptBox extends ConsumerStatefulWidget {
  final Friend friend;

  const PromptBox({
    super.key,
    required this.friend,
  });

  @override
  ConsumerState<PromptBox> createState() => _PromptBoxState();
}

class _PromptBoxState extends ConsumerState<PromptBox> {
  final _controller = TextEditingController();
  final _audioRecorder = AudioRecorder();
  final _speech = stt.SpeechToText();
  bool _speechAvailable = false;
  String? _recordingPath;

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    try {
      _speechAvailable = await _speech.initialize(
        onError: (err) {
          if (mounted) {
            ref.read(promptProvider.notifier).setMicError('Speech recognition error: ${err.errorMsg}');
          }
        },
      );
    } catch (_) {
      _speechAvailable = false;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _audioRecorder.dispose();
    _speech.stop();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final promptNotifier = ref.read(promptProvider.notifier);
    promptNotifier.setMicError(null);

    // Check microphone permission
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      promptNotifier.setMicError('Microphone permission denied');
      return;
    }

    promptNotifier.setRecording(true);
    _controller.clear();

    // Start live speech-to-text if available
    if (_speechAvailable) {
      try {
        await _speech.listen(
          onResult: (result) {
            if (mounted) {
              _controller.text = result.recognizedWords;
              ref.read(promptProvider.notifier).setText(result.recognizedWords);
            }
          },
          listenOptions: stt.SpeechListenOptions(
            listenMode: stt.ListenMode.dictation,
          ),
        );
      } catch (_) {}
    }

    // Also record audio file for high accuracy backend transcription
    try {
      if (await _audioRecorder.hasPermission()) {
        final dir = await getTemporaryDirectory();
        _recordingPath = '${dir.path}/recording_${DateTime.now().millisecondsSinceEpoch}.m4a';
        await _audioRecorder.start(
          const RecordConfig(encoder: AudioEncoder.aacLc),
          path: _recordingPath!,
        );
      }
    } catch (_) {}
  }

  Future<void> _stopRecording() async {
    final promptNotifier = ref.read(promptProvider.notifier);

    if (_speech.isListening) {
      await _speech.stop();
    }

    String? path;
    try {
      if (await _audioRecorder.isRecording()) {
        path = await _audioRecorder.stop();
      }
    } catch (_) {}

    promptNotifier.setRecording(false);

    // If speech-to-text already got something, keep it; otherwise send to backend whisper
    if (_controller.text.trim().isEmpty && path != null) {
      final file = File(path);
      if (await file.exists()) {
        promptNotifier.setTranscribing(true);
        try {
          final bytes = await file.readAsBytes();
          final base64Audio = base64Encode(bytes);
          final transcribeService = ref.read(transcribeServiceProvider);
          final text = await transcribeService.transcribeAudio(
            audioBase64: base64Audio,
            mimeType: 'audio/mp4',
          );
          if (text.isNotEmpty && mounted) {
            _controller.text = text;
            promptNotifier.setText(text);
          }
        } catch (e) {
          promptNotifier.setMicError('Transcription failed: $e');
        } finally {
          promptNotifier.setTranscribing(false);
        }
      }
    }
  }

  void _handleSubmit() {
    final promptNotifier = ref.read(promptProvider.notifier);
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      promptNotifier.commitPrompt(overrideText: text);
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final promptState = ref.watch(promptProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final isBusy = promptState.isBusy;
    final isRecording = promptState.isRecording;

    final label = widget.friend.isSelf
        ? 'Add, update or remove your schedule'
        : 'Add, update or remove ${widget.friend.firstName}’s schedule';

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
            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Row with Sparkle / Spinner
          Row(
            children: [
              isBusy
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: isDark ? AppColors.violet400 : AppColors.violet500,
                      ),
                    )
                  : Icon(
                      Icons.auto_awesome_rounded,
                      size: 16,
                      color: isDark ? AppColors.violet400 : AppColors.violet500,
                    ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.sm(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Input + Mic + Submit Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Text Field Container
              Expanded(
                child: Container(
                  height: 46,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isRecording
                          ? AppColors.danger
                          : isDark
                              ? AppColors.borderBrandDark
                              : AppColors.borderBrandLight,
                      width: isRecording ? 2 : 1.5,
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          readOnly: isRecording,
                          enabled: !isBusy,
                          onChanged: (text) => ref.read(promptProvider.notifier).setText(text),
                          onSubmitted: (_) => _handleSubmit(),
                          style: AppTypography.body(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                          ),
                          decoration: InputDecoration(
                            isDense: true,
                            border: InputBorder.none,
                            hintText: isRecording
                                ? 'Listening… speak now'
                                : 'e.g. Busy weekdays 9–5 • Clear Monday',
                            hintStyle: AppTypography.sm(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            ),
                          ),
                        ),
                      ),
                      // Mic Action Button
                      GestureDetector(
                        onTap: isBusy
                            ? null
                            : () {
                                if (isRecording) {
                                  _stopRecording();
                                } else {
                                  _startRecording();
                                }
                              },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: isRecording
                                ? AppColors.danger
                                : (isDark ? AppColors.accentWashDark : AppColors.accentWashLight),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                            size: 18,
                            color: isRecording
                                ? Colors.white
                                : (isDark ? AppColors.violet300 : AppColors.violet600),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Submit Button
              DsButton(
                variant: DsButtonVariant.primary,
                size: DsButtonSize.md,
                loading: isBusy,
                disabled: isRecording,
                text: promptState.isParsing
                    ? 'Thinking…'
                    : promptState.isTranscribing
                        ? 'Transcribing…'
                        : 'Submit',
                onPressed: _handleSubmit,
              ),
            ],
          ),

          // Error / Status Notice
          if (promptState.micError != null) ...[
            const SizedBox(height: 8),
            Text(
              promptState.micError!,
              style: AppTypography.xs(color: AppColors.danger, fontWeight: FontWeight.w600),
            ),
          ],

          const SizedBox(height: 12),

          // Quick-Prompt Example Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: kPromptExamples.map((ex) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: isBusy || isRecording
                        ? null
                        : () {
                            _controller.text = ex;
                            ref.read(promptProvider.notifier).setText(ex);
                          },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.surfaceSunkenDark : AppColors.surfaceSunkenLight,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(
                          color: isDark ? AppColors.borderStrongDark : AppColors.borderStrongLight,
                        ),
                      ),
                      child: Text(
                        ex,
                        style: AppTypography.xs(
                          color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
