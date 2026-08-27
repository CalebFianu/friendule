class User {
  final String id;
  final String email;
  final String token;

  const User({
    required this.id,
    required this.email,
    required this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: (json['id'] ?? json['user']?['id'] ?? '').toString(),
      email: (json['email'] ?? json['user']?['email'] ?? '').toString(),
      token: (json['token'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'token': token,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? token,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      token: token ?? this.token,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is User &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          token == other.token;

  @override
  int get hashCode => Object.hash(id, email, token);
}
