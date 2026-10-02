// app/components/auth/types.ts

export type AuthMessages = {
  signIn: string;
  signUp: string;
  welcomeBack: string;
  createAccount: string;

  email: string;
  confirmEmail: string;
  emailsDontMatch: string;

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

  forgotPasswordDescription: string;
  resetPasswordDescription: string;
  sendResetCodeButton: string;
  resetPasswordButton: string;
};
