import { IsString, Matches, MinLength } from 'class-validator';

export function IsStrongPassword() {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  
  return function(object: object, propertyName: string) {
    IsString()(object, propertyName);
    MinLength(12)(object, propertyName);
    Matches(
      regex,
      {
        message:
          'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
      },
    )(object, propertyName);
  };
}
