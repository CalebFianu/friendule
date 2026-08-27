import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/theme/app_theme.dart';
import 'package:friendule_flutter/widgets/ds/ds_avatar.dart';
import 'package:friendule_flutter/widgets/ds/ds_badge.dart';
import 'package:friendule_flutter/widgets/ds/ds_button.dart';
import 'package:friendule_flutter/widgets/ds/ds_event_chip.dart';
import 'package:friendule_flutter/widgets/ds/ds_input.dart';
import 'package:friendule_flutter/widgets/ds/ds_segmented_control.dart';
import 'package:friendule_flutter/widgets/ds/ds_toggle.dart';

void main() {
  group('Design System Primitives', () {
    testWidgets('DsButton renders and triggers onPressed', (tester) async {
      var pressed = false;
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: DsButton(
              text: 'Save',
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );

      expect(find.text('Save'), findsOneWidget);
      await tester.tap(find.text('Save'));
      expect(pressed, isTrue);
    });

    testWidgets('DsAvatar computes initials from name', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: const Scaffold(
            body: DsAvatar(name: 'Jordan Lee'),
          ),
        ),
      );

      expect(find.text('JL'), findsOneWidget);
    });

    testWidgets('DsBadge renders status variant correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: Column(
              children: [
                DsBadge.fromStatus('busy'),
                DsBadge.fromStatus('free'),
                DsBadge.fromStatus('together'),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Busy'), findsOneWidget);
      expect(find.text('Free'), findsOneWidget);
      expect(find.text('Together'), findsOneWidget);
    });

    testWidgets('DsToggle updates on user tap', (tester) async {
      var val = false;
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return DsToggle(
                  value: val,
                  onChanged: (newVal) {
                    setState(() => val = newVal);
                  },
                );
              },
            ),
          ),
        ),
      );

      expect(val, isFalse);
      await tester.tap(find.byType(DsToggle));
      await tester.pumpAndSettle();
      expect(val, isTrue);
    });

    testWidgets('DsSegmentedControl changes selected option on tap', (tester) async {
      var current = 'month';
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return DsSegmentedControl<String>(
                  value: current,
                  options: const [
                    DsSegmentOption(label: 'month', value: 'month'),
                    DsSegmentOption(label: 'week', value: 'week'),
                  ],
                  onChanged: (newVal) {
                    setState(() => current = newVal);
                  },
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('month'), findsOneWidget);
      expect(find.text('week'), findsOneWidget);
      await tester.tap(find.text('week'));
      await tester.pumpAndSettle();
      expect(current, 'week');
    });

    testWidgets('DsInput receives text input', (tester) async {
      final controller = TextEditingController();
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: Scaffold(
            body: DsInput(
              controller: controller,
              placeholder: 'Enter title',
            ),
          ),
        ),
      );

      await tester.enterText(find.byType(TextFormField), 'Yoga');
      expect(controller.text, 'Yoga');
    });

    testWidgets('DsEventChip displays title and time', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light(),
          home: const Scaffold(
            body: DsEventChip(
              title: 'Work Shift',
              time: '9:00 AM – 5:00 PM',
              category: 'busy',
            ),
          ),
        ),
      );

      expect(find.text('Work Shift'), findsOneWidget);
      expect(find.text('9:00 AM – 5:00 PM'), findsOneWidget);
    });
  });
}
