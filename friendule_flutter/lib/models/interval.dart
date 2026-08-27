import 'friend.dart';

class ScheduleInterval {
  final String id;
  final String ruleId;
  final String friendId;
  final String title;
  final String status; // 'busy', 'free', 'together'
  final bool allDay;
  final int? startMin; // minutes since midnight in viewer zone
  final int? endMin; // minutes since midnight in viewer zone
  final String date; // 'YYYY-MM-DD' in viewer zone
  final String isoStart;
  final String isoEnd;
  final Friend? fromFriend; // for 'together' events shown on personal calendar

  const ScheduleInterval({
    required this.id,
    required this.ruleId,
    required this.friendId,
    required this.title,
    required this.status,
    required this.allDay,
    this.startMin,
    this.endMin,
    required this.date,
    required this.isoStart,
    required this.isoEnd,
    this.fromFriend,
  });

  ScheduleInterval copyWith({
    String? id,
    String? ruleId,
    String? friendId,
    String? title,
    String? status,
    bool? allDay,
    int? startMin,
    int? endMin,
    String? date,
    String? isoStart,
    String? isoEnd,
    Friend? fromFriend,
  }) {
    return ScheduleInterval(
      id: id ?? this.id,
      ruleId: ruleId ?? this.ruleId,
      friendId: friendId ?? this.friendId,
      title: title ?? this.title,
      status: status ?? this.status,
      allDay: allDay ?? this.allDay,
      startMin: startMin ?? this.startMin,
      endMin: endMin ?? this.endMin,
      date: date ?? this.date,
      isoStart: isoStart ?? this.isoStart,
      isoEnd: isoEnd ?? this.isoEnd,
      fromFriend: fromFriend ?? this.fromFriend,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ScheduleInterval &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          ruleId == other.ruleId &&
          friendId == other.friendId &&
          title == other.title &&
          status == other.status &&
          allDay == other.allDay &&
          startMin == other.startMin &&
          endMin == other.endMin &&
          date == other.date &&
          fromFriend?.id == other.fromFriend?.id;

  @override
  int get hashCode => Object.hash(
        id,
        ruleId,
        friendId,
        title,
        status,
        allDay,
        startMin,
        endMin,
        date,
        fromFriend?.id,
      );
}
