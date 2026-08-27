class Rule {
  final String id;
  final String friendId;
  final String title;
  final String status; // 'busy', 'free', 'together'
  final String recurrence; // 'once', 'weekly', 'daily'
  final bool allDay;
  final String? timeStart; // 'HH:MM'
  final String? timeEnd; // 'HH:MM'
  final String? date; // 'YYYY-MM-DD'
  final List<int>? weekdays; // 0=Sun..6=Sat
  final String? dateFrom; // 'YYYY-MM-DD'
  final String? dateTo; // 'YYYY-MM-DD'
  final String? rawText;
  final int? createdAt;

  const Rule({
    required this.id,
    required this.friendId,
    required this.title,
    required this.status,
    required this.recurrence,
    this.allDay = false,
    this.timeStart,
    this.timeEnd,
    this.date,
    this.weekdays,
    this.dateFrom,
    this.dateTo,
    this.rawText,
    this.createdAt,
  });

  static int? _parseTimestamp(dynamic val) {
    if (val == null) return null;
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val);
    return null;
  }

  factory Rule.fromJson(Map<String, dynamic> json) {
    List<int>? parsedWeekdays;
    final rawWd = json['weekdays'];
    if (rawWd is List) {
      parsedWeekdays = rawWd.map((e) => e is int ? e : int.tryParse(e.toString()) ?? 0).toList();
    } else if (rawWd is String && rawWd.isNotEmpty) {
      // In case backend stored as JSON string
      try {
        final list = rawWd
            .replaceAll('[', '')
            .replaceAll(']', '')
            .split(',')
            .where((s) => s.trim().isNotEmpty)
            .map((s) => int.parse(s.trim()))
            .toList();
        parsedWeekdays = list;
      } catch (_) {}
    }

    final isAllDay = json['allDay'] == true ||
        json['all_day'] == true ||
        json['allDay'] == 1 ||
        json['all_day'] == 1 ||
        json['allDay'] == 'true' ||
        json['all_day'] == 'true';
    final createdAt = _parseTimestamp(json['createdAt'] ?? json['created_at']);

    return Rule(
      id: (json['id'] ?? '').toString(),
      friendId: (json['friendId'] ?? json['friend_id'] ?? '').toString(),
      title: (json['title'] ?? 'Untitled').toString(),
      status: (json['status'] ?? 'busy').toString(),
      recurrence: (json['recurrence'] ?? 'once').toString(),
      allDay: isAllDay,
      timeStart: json['timeStart']?.toString() ?? json['time_start']?.toString(),
      timeEnd: json['timeEnd']?.toString() ?? json['time_end']?.toString(),
      date: json['date']?.toString(),
      weekdays: parsedWeekdays,
      dateFrom: json['dateFrom']?.toString() ?? json['date_from']?.toString(),
      dateTo: json['dateTo']?.toString() ?? json['date_to']?.toString(),
      rawText: json['rawText']?.toString() ?? json['raw_text']?.toString(),
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'friendId': friendId,
      'title': title,
      'status': status,
      'recurrence': recurrence,
      'allDay': allDay,
      if (timeStart != null) 'timeStart': timeStart,
      if (timeEnd != null) 'timeEnd': timeEnd,
      if (date != null) 'date': date,
      if (weekdays != null) 'weekdays': weekdays,
      if (dateFrom != null) 'dateFrom': dateFrom,
      if (dateTo != null) 'dateTo': dateTo,
      if (rawText != null) 'rawText': rawText,
      if (createdAt != null) 'createdAt': createdAt,
    };
  }

  Rule copyWith({
    String? id,
    String? friendId,
    String? title,
    String? status,
    String? recurrence,
    bool? allDay,
    String? timeStart,
    String? timeEnd,
    String? date,
    List<int>? weekdays,
    String? dateFrom,
    String? dateTo,
    String? rawText,
    int? createdAt,
  }) {
    return Rule(
      id: id ?? this.id,
      friendId: friendId ?? this.friendId,
      title: title ?? this.title,
      status: status ?? this.status,
      recurrence: recurrence ?? this.recurrence,
      allDay: allDay ?? this.allDay,
      timeStart: timeStart ?? this.timeStart,
      timeEnd: timeEnd ?? this.timeEnd,
      date: date ?? this.date,
      weekdays: weekdays ?? this.weekdays,
      dateFrom: dateFrom ?? this.dateFrom,
      dateTo: dateTo ?? this.dateTo,
      rawText: rawText ?? this.rawText,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Rule &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          friendId == other.friendId &&
          title == other.title &&
          status == other.status &&
          recurrence == other.recurrence &&
          allDay == other.allDay &&
          timeStart == other.timeStart &&
          timeEnd == other.timeEnd &&
          date == other.date &&
          dateFrom == other.dateFrom &&
          dateTo == other.dateTo;

  @override
  int get hashCode => Object.hash(
        id,
        friendId,
        title,
        status,
        recurrence,
        allDay,
        timeStart,
        timeEnd,
        date,
        dateFrom,
        dateTo,
      );
}
