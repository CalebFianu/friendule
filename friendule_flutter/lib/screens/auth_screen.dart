import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../widgets/ds/ds_button.dart';
import '../widgets/ds/ds_icon_button.dart';
import '../widgets/ds/ds_input.dart';
import '../widgets/ds/ds_segmented_control.dart';

enum AuthMode { login, register }

class AuthScreen extends ConsumerStatefulWidget {
  final VoidCallback? onToggleDark;
  final bool isDark;

  const AuthScreen({
    super.key,
    this.onToggleDark,
    this.isDark = false,
  });

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  AuthMode _mode = AuthMode.login;
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscurePassword = true;
  String? _clientError;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    setState(() => _clientError = null);

    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!emailRegex.hasMatch(email)) {
      setState(() => _clientError = 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setState(() => _clientError = 'Password must be at least 6 characters.');
      return;
    }

    if (_mode == AuthMode.register && password != confirm) {
      setState(() => _clientError = 'Passwords do not match.');
      return;
    }

    if (_mode == AuthMode.login) {
      await ref.read(authProvider.notifier).login(email, password);
    } else {
      await ref.read(authProvider.notifier).register(email, password);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState.isLoading;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final errorMessage = _clientError ??
        (authState.hasError ? (authState.error?.toString().replaceAll('Exception: ', '') ?? 'Authentication failed') : null);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top bar with dark mode toggle
                  if (widget.onToggleDark != null)
                    Align(
                      alignment: Alignment.topRight,
                      child: DsIconButton(
                        icon: Icon(
                          widget.isDark ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                          size: 18,
                        ),
                        variant: DsIconButtonVariant.surface,
                        shape: DsIconButtonShape.circle,
                        onPressed: widget.onToggleDark,
                        tooltip: widget.isDark ? 'Light mode' : 'Dark mode',
                      ),
                    ),
                  const SizedBox(height: 12),

                  // Brand Hero Logo
                  Center(
                    child: SizedBox(
                      width: 68,
                      height: 36,
                      child: Stack(
                        children: [
                          Positioned(
                            left: 0,
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.danger,
                                border: Border.all(
                                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                  width: 2.5,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            left: 18,
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.warning,
                                border: Border.all(
                                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                  width: 2.5,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            left: 36,
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isDark ? AppColors.violet400 : AppColors.violet500,
                                border: Border.all(
                                  color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                                  width: 2.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Title & Subtitle
                  Center(
                    child: Text(
                      'Friendule',
                      style: AppTypography.display(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Center(
                    child: Text(
                      'Know when your people are free.',
                      style: AppTypography.body(
                        color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Mode Toggle
                  Center(
                    child: DsSegmentedControl<AuthMode>(
                      value: _mode,
                      onChanged: (mode) {
                        setState(() {
                          _mode = mode;
                          _clientError = null;
                        });
                      },
                      options: const [
                        DsSegmentOption(label: 'Log in', value: AuthMode.login),
                        DsSegmentOption(label: 'Create account', value: AuthMode.register),
                      ],
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Auth Card Container
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.surfaceCardDark : AppColors.surfaceCardLight,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark ? AppColors.borderSubtleDark : AppColors.borderSubtleLight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.06),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Error message banner
                        if (errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.catRoseFillDark : AppColors.catRoseFillLight,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isDark ? AppColors.catRoseInkDark : AppColors.danger,
                                width: 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    errorMessage,
                                    style: AppTypography.sm(
                                      color: isDark ? AppColors.catRoseInkDark : AppColors.catRoseInkLight,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 18),
                        ],

                        // Email Field
                        Text(
                          'EMAIL',
                          style: AppTypography.xxs(
                            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            letterSpacing: 0.06,
                          ),
                        ),
                        const SizedBox(height: 6),
                        DsInput(
                          controller: _emailController,
                          placeholder: 'you@example.com',
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          prefixIcon: const Icon(Icons.mail_outline_rounded),
                        ),
                        const SizedBox(height: 18),

                        // Password Field
                        Text(
                          'PASSWORD',
                          style: AppTypography.xxs(
                            color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                            letterSpacing: 0.06,
                          ),
                        ),
                        const SizedBox(height: 6),
                        DsInput(
                          controller: _passwordController,
                          placeholder: '••••••••',
                          obscureText: _obscurePassword,
                          textInputAction: _mode == AuthMode.register ? TextInputAction.next : TextInputAction.done,
                          onSubmitted: _mode == AuthMode.login ? (_) => _handleSubmit() : null,
                          prefixIcon: const Icon(Icons.lock_outline_rounded),
                          suffixIcon: GestureDetector(
                            onTap: () => setState(() => _obscurePassword = !_obscurePassword),
                            child: Icon(
                              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                            ),
                          ),
                        ),

                        // Confirm Password (if Register)
                        if (_mode == AuthMode.register) ...[
                          const SizedBox(height: 18),
                          Text(
                            'CONFIRM PASSWORD',
                            style: AppTypography.xxs(
                              color: isDark ? AppColors.textTertiaryDark : AppColors.textTertiaryLight,
                              letterSpacing: 0.06,
                            ),
                          ),
                          const SizedBox(height: 6),
                          DsInput(
                            controller: _confirmController,
                            placeholder: '••••••••',
                            obscureText: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            onSubmitted: (_) => _handleSubmit(),
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                          ),
                        ],
                        const SizedBox(height: 24),

                        // Submit Button
                        DsButton(
                          variant: DsButtonVariant.primary,
                          size: DsButtonSize.lg,
                          fullWidth: true,
                          loading: isLoading,
                          onPressed: _handleSubmit,
                          text: _mode == AuthMode.login ? 'Log in' : 'Create account',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
