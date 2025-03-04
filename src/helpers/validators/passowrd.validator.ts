import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    if (!password) {
      return null; // Allow empty passwords (handled by required validator)
    }

    const hasSpecialCharOrDigit = /[\W\d]/.test(password); // Matches special characters or digits
    const hasLetter = /[a-zA-Z]/.test(password); // Matches any letter (upper or lowercase)
    const isLongEnough = password.length >= 8;
    const isVeryLong = password.length > 15;

    if (isVeryLong || (hasSpecialCharOrDigit && hasLetter && isLongEnough)) {
      return null; // Valid password
    }

    return { passwordStrength: true }; // Invalid password
  };
}
