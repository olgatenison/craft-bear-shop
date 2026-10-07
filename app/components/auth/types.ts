// app/components/auth/types.ts

export type AuthMessages = {
  signIn: string;
  signUp: string;
  welcomeBack: string;
  createAccount: string;

  email: string;

  password: string;
  confirmPassword: string;
  passwordsDontMatch: string;

  passwordStrength: string;
  passwordHint: string;
  passwordStrengthWeak: string;
  passwordStrengthMedium: string;
  passwordStrengthStrong: string;
  weakPassword: string;

  showPasswordAria: string;
  hidePasswordAria: string;

  forgotPassword: string;
  submitSignIn: string;
  submitSignUp: string;

  enterEmailFirst: string;
  resetSent: string;

  accountCreated: string;
  signInFlowIncomplete: string;
  signUpFlowIncomplete: string;
  somethingWentWrong: string;

  emailAlreadyExists: string;
  incorrectPassword: string;
  userNotFound: string;

  passwordOrEmailIncorrect: string;
  passwordValidationFailed: string;
  passwordMatchesIdentifier: string;
  passwordCompromised: string;

  verificationCodeIncorrect: string;
  verificationExpired: string;
  verificationFailed: string;

  invalidEmail: string;
  tooManyRequests: string;

  verifyEmailTitle: string;
  verificationCodeSentTo: string;
  verificationCodeLabel: string;
  verifyEmailButton: string;
  resendCodeButton: string;
  resendCodeSuccess: string;
  changeEmailButton: string;

  forgotPasswordDescription: string;
  resetPasswordDescription: string;
  sendResetCodeButton: string;
  resetPasswordButton: string;
};
