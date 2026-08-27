import 'api_client.dart';

class TranscribeService {
  final ApiClient apiClient;

  TranscribeService({required this.apiClient});

  Future<String> transcribeAudio({
    required String audioBase64,
    String mimeType = 'audio/webm',
  }) async {
    final response = await apiClient.post(
      '/transcribe',
      data: {
        'audio': audioBase64,
        'mimeType': mimeType,
      },
    );

    final data = response.data as Map<String, dynamic>;
    return data['text'] as String? ?? '';
  }
}
