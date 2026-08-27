import '../theme/color_utils.dart';

class Friend {
  final String id;
  final String name;
  final String color;
  final String description;
  final String timezone;
  final bool isSelf;
  final int? createdAt;

  // Derived fields
  final String firstName;
  final String initials;
  final Colorset colorset;
  final String status;

  Friend({
    required this.id,
    required this.name,
    required this.color,
    this.description = '',
    this.timezone = 'Africa/Accra',
    this.isSelf = false,
    this.createdAt,
    String? firstName,
    String? initials,
    Colorset? colorset,
    String? status,
  })  : firstName = firstName ?? _deriveFirstName(name),
        initials = initials ?? _deriveInitials(name),
        colorset = colorset ?? makeColorsetFromString(color),
        status = status ?? (description.isNotEmpty ? description : 'Friend');

  static String _deriveFirstName(String name) {
    final words = name.trim().split(RegExp(r'\s+'));
    return words.isNotEmpty ? words[0] : '';
  }

  static String _deriveInitials(String name) {
    final words = name.trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '??';
    if (words.length == 1) {
      final w = words[0];
      return (w.length > 1 ? w.substring(0, 2) : w).toUpperCase();
    }
    return '${words.first[0]}${words.last[0]}'.toUpperCase();
  }

  static int? _parseTimestamp(dynamic val) {
    if (val == null) return null;
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val);
    return null;
  }

  factory Friend.fromJson(Map<String, dynamic> json) {
    final name = (json['name'] ?? '').toString();
    final color = (json['color'] ?? 'oklch(0.70 0.15 25)').toString();
    final description = (json['description'] ?? '').toString();
    final timezone = (json['timezone'] ?? 'Africa/Accra').toString();
    final isSelf = json['isSelf'] == true ||
        json['is_self'] == true ||
        json['isSelf'] == 1 ||
        json['is_self'] == 1 ||
        json['isSelf'] == 'true' ||
        json['is_self'] == 'true';
    final createdAt = _parseTimestamp(json['createdAt'] ?? json['created_at']);

    return Friend(
      id: (json['id'] ?? '').toString(),
      name: name,
      color: color,
      description: description,
      timezone: timezone,
      isSelf: isSelf,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'description': description,
      'timezone': timezone,
      'isSelf': isSelf,
      if (createdAt != null) 'createdAt': createdAt,
    };
  }

  Friend copyWith({
    String? id,
    String? name,
    String? color,
    String? description,
    String? timezone,
    bool? isSelf,
    int? createdAt,
    String? firstName,
    String? initials,
    Colorset? colorset,
    String? status,
  }) {
    return Friend(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      description: description ?? this.description,
      timezone: timezone ?? this.timezone,
      isSelf: isSelf ?? this.isSelf,
      createdAt: createdAt ?? this.createdAt,
      firstName: firstName ?? this.firstName,
      initials: initials ?? this.initials,
      colorset: colorset ?? this.colorset,
      status: status ?? this.status,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Friend &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name &&
          color == other.color &&
          description == other.description &&
          timezone == other.timezone &&
          isSelf == other.isSelf;

  @override
  int get hashCode => Object.hash(id, name, color, description, timezone, isSelf);
}
