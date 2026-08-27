class EditorState {
  final String mode; // 'new' | 'edit'
  final String? id;
  final String friendId;
  final String title;
  final String status; // 'busy', 'free', 'together'
  final bool allDay;
  final String start; // 'HH:MM'
  final String end; // 'HH:MM'
  final String repeat; // 'once', 'weekly', 'daily'
  final String date; // 'YYYY-MM-DD'
  final List<int> weekdays; // 0=Sun..6=Sat
  final String? dateFrom; // 'YYYY-MM-DD'
  final String? dateTo; // 'YYYY-MM-DD'

  const EditorState({
    required this.mode,
    this.id,
    required this.friendId,
    this.title = '',
    this.status = 'busy',
    this.allDay = false,
    this.start = '09:00',
    this.end = '10:00',
    this.repeat = 'once',
    required this.date,
    this.weekdays = const [],
    this.dateFrom,
    this.dateTo,
  });

  EditorState copyWith({
    String? mode,
    String? id,
    String? friendId,
    String? title,
    String? status,
    bool? allDay,
    String? start,
    String? end,
    String? repeat,
    String? date,
    List<int>? weekdays,
    String? dateFrom,
    String? dateTo,
  }) {
    return EditorState(
      mode: mode ?? this.mode,
      id: id ?? this.id,
      friendId: friendId ?? this.friendId,
      title: title ?? this.title,
      status: status ?? this.status,
      allDay: allDay ?? this.allDay,
      start: start ?? this.start,
      end: end ?? this.end,
      repeat: repeat ?? this.repeat,
      date: date ?? this.date,
      weekdays: weekdays ?? this.weekdays,
      dateFrom: dateFrom ?? this.dateFrom,
      dateTo: dateTo ?? this.dateTo,
    );
  }
}
