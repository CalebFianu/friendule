import 'package:flutter_test/flutter_test.dart';
import 'package:friendule_flutter/models/friend.dart';
import 'package:friendule_flutter/models/rule.dart';
import 'package:friendule_flutter/models/user.dart';

void main() {
  group('models', () {
    test('User serialization roundtrip', () {
      const user = User(id: 'u1', email: 'test@example.com', token: 'jwt-123');
      final json = user.toJson();
      final parsed = User.fromJson(json);

      expect(parsed.id, user.id);
      expect(parsed.email, user.email);
      expect(parsed.token, user.token);
    });

    test('Friend hydration of firstName and initials', () {
      final friend = Friend(
        id: 'f1',
        name: 'Jordan Lee',
        color: '#E76A6B',
        description: 'Designer',
      );

      expect(friend.firstName, 'Jordan');
      expect(friend.initials, 'JL');
      expect(friend.status, 'Designer');
    });

    test('Friend handles string createdAt from PostgreSQL BIGINT', () {
      final json = {
        'id': 'f1',
        'name': 'Me',
        'color': 'oklch(0.65 0.15 260)',
        'description': '',
        'timezone': 'UTC',
        'isSelf': true,
        'createdAt': '1787831535526',
      };
      final friend = Friend.fromJson(json);

      expect(friend.id, 'f1');
      expect(friend.name, 'Me');
      expect(friend.isSelf, isTrue);
      expect(friend.createdAt, 1787831535526);
    });

    test('Rule serialization roundtrip', () {
      const rule = Rule(
        id: 'r1',
        friendId: 'f1',
        title: 'Standup',
        status: 'busy',
        recurrence: 'weekly',
        weekdays: [1, 2, 3, 4, 5],
        timeStart: '09:00',
        timeEnd: '09:30',
        allDay: false,
      );

      final json = rule.toJson();
      final parsed = Rule.fromJson(json);

      expect(parsed.id, rule.id);
      expect(parsed.friendId, rule.friendId);
      expect(parsed.title, rule.title);
      expect(parsed.status, rule.status);
      expect(parsed.recurrence, rule.recurrence);
      expect(parsed.weekdays, rule.weekdays);
      expect(parsed.timeStart, rule.timeStart);
      expect(parsed.timeEnd, rule.timeEnd);
    });

    test('Rule handles string createdAt and dynamic weekdays', () {
      final json = {
        'id': 'r1',
        'friendId': 'f1',
        'title': 'Standup',
        'status': 'busy',
        'recurrence': 'weekly',
        'weekdays': '[1, 2, 3]',
        'timeStart': '09:00',
        'timeEnd': '09:30',
        'allDay': false,
        'createdAt': '1787831535526',
      };
      final rule = Rule.fromJson(json);

      expect(rule.id, 'r1');
      expect(rule.weekdays, [1, 2, 3]);
      expect(rule.createdAt, 1787831535526);
    });
  });
}
