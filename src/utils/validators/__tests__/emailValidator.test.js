import {
  isValidEmail,
  parseEmailList,
  validateEmailInput,
} from '../emailValidator';

describe('emailValidator', () => {
  describe('isValidEmail', () => {
    describe('Valid emails', () => {
      it('should accept standard email addresses', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('test.user@example.com')).toBe(true);
        expect(isValidEmail('user+tag@example.com')).toBe(true);
        expect(isValidEmail('user_name@example.com')).toBe(true);
      });

      it('should accept emails with subdomains', () => {
        expect(isValidEmail('user@mail.example.com')).toBe(true);
        expect(isValidEmail('user@subdomain.mail.example.com')).toBe(true);
      });

      it('should accept emails with numbers', () => {
        expect(isValidEmail('user123@example.com')).toBe(true);
        expect(isValidEmail('123user@example.com')).toBe(true);
        expect(isValidEmail('user@example123.com')).toBe(true);
      });

      it('should accept emails with hyphens in domain', () => {
        expect(isValidEmail('user@my-domain.com')).toBe(true);
        expect(isValidEmail('user@example-mail.co.uk')).toBe(true);
      });

      it('should accept emails with special characters in local part', () => {
        expect(isValidEmail('user.name@example.com')).toBe(true);
        expect(isValidEmail('user_name@example.com')).toBe(true);
        expect(isValidEmail('user+tag@example.com')).toBe(true);
        expect(isValidEmail('user%special@example.com')).toBe(true);
        expect(isValidEmail('user-name@example.com')).toBe(true);
      });

      it('should accept emails with long TLDs', () => {
        expect(isValidEmail('user@example.museum')).toBe(true);
        expect(isValidEmail('user@example.info')).toBe(true);
      });

      it('should trim whitespace', () => {
        expect(isValidEmail('  user@example.com  ')).toBe(true);
        expect(isValidEmail('\tuser@example.com\t')).toBe(true);
      });
    });

    describe('Invalid emails', () => {
      it('should reject empty or null input', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('   ')).toBe(false);
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(undefined)).toBe(false);
      });

      it('should reject non-string input', () => {
        expect(isValidEmail(123)).toBe(false);
        expect(isValidEmail({})).toBe(false);
        expect(isValidEmail([])).toBe(false);
      });

      it('should reject emails without @ symbol', () => {
        expect(isValidEmail('userexample.com')).toBe(false);
        expect(isValidEmail('user.example.com')).toBe(false);
      });

      it('should reject emails without domain', () => {
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
      });

      it('should reject emails without TLD', () => {
        expect(isValidEmail('user@example')).toBe(false);
        expect(isValidEmail('user@localhost')).toBe(false);
      });

      it('should reject emails with spaces', () => {
        expect(isValidEmail('user name@example.com')).toBe(false);
        expect(isValidEmail('user@exam ple.com')).toBe(false);
        expect(isValidEmail('user @example.com')).toBe(false);
      });

      it('should reject emails with multiple @ symbols', () => {
        expect(isValidEmail('user@@example.com')).toBe(false);
        expect(isValidEmail('user@name@example.com')).toBe(false);
      });

      it('should reject emails with consecutive dots', () => {
        expect(isValidEmail('user..name@example.com')).toBe(false);
        expect(isValidEmail('user@example..com')).toBe(false);
      });

      it('should reject emails starting or ending with dot in local part', () => {
        expect(isValidEmail('.user@example.com')).toBe(false);
        expect(isValidEmail('user.@example.com')).toBe(false);
      });

      it('should reject emails with invalid characters', () => {
        expect(isValidEmail('user#name@example.com')).toBe(false);
        expect(isValidEmail('user!name@example.com')).toBe(false);
        expect(isValidEmail('user$name@example.com')).toBe(false);
        expect(isValidEmail('user&name@example.com')).toBe(false);
      });

      it('should reject emails with only one character TLD', () => {
        expect(isValidEmail('user@example.c')).toBe(false);
      });

      it('should reject emails exceeding maximum length', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(isValidEmail(longEmail)).toBe(false);
      });

      it('should reject emails with missing local part', () => {
        expect(isValidEmail('@example.com')).toBe(false);
      });

      it('should reject emails with missing domain', () => {
        expect(isValidEmail('user@')).toBe(false);
      });
    });
  });

  describe('parseEmailList', () => {
    describe('Valid email lists', () => {
      it('should parse single email', () => {
        const result = parseEmailList('user@example.com');
        expect(result.valid).toBe(true);
        expect(result.emails).toEqual(['user@example.com']);
        expect(result.invalidEmails).toEqual([]);
        expect(result.error).toBe('');
      });

      it('should parse multiple comma-separated emails', () => {
        const result = parseEmailList('user1@example.com,user2@example.com');
        expect(result.valid).toBe(true);
        expect(result.emails).toEqual([
          'user1@example.com',
          'user2@example.com',
        ]);
        expect(result.invalidEmails).toEqual([]);
        expect(result.error).toBe('');
      });

      it('should trim whitespace around emails', () => {
        const result = parseEmailList(
          '  user1@example.com , user2@example.com  '
        );
        expect(result.valid).toBe(true);
        expect(result.emails).toEqual([
          'user1@example.com',
          'user2@example.com',
        ]);
      });

      it('should handle trailing commas', () => {
        const result = parseEmailList('user1@example.com,user2@example.com,');
        expect(result.valid).toBe(true);
        expect(result.emails).toEqual([
          'user1@example.com',
          'user2@example.com',
        ]);
      });

      it('should parse up to maximum number of emails', () => {
        const emails = Array(10)
          .fill(0)
          .map((_, i) => `user${i}@example.com`)
          .join(',');
        const result = parseEmailList(emails);
        expect(result.valid).toBe(true);
        expect(result.emails).toHaveLength(10);
      });
    });

    describe('Invalid email lists', () => {
      it('should reject empty input', () => {
        const result = parseEmailList('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email is required');
      });

      it('should reject null or undefined', () => {
        const result1 = parseEmailList(null);
        expect(result1.valid).toBe(false);
        expect(result1.error).toBe('Email is required');

        const result2 = parseEmailList(undefined);
        expect(result2.valid).toBe(false);
        expect(result2.error).toBe('Email is required');
      });

      it('should reject whitespace-only input', () => {
        const result = parseEmailList('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Email is required');
      });

      it('should reject list with invalid email', () => {
        const result = parseEmailList(
          'user1@example.com,invalid-email,user2@example.com'
        );
        expect(result.valid).toBe(false);
        expect(result.invalidEmails).toEqual(['invalid-email']);
        expect(result.error).toContain('Invalid email format');
        expect(result.error).toContain('invalid-email');
      });

      it('should reject list with multiple invalid emails', () => {
        const result = parseEmailList('invalid1,user@example.com,invalid2');
        expect(result.valid).toBe(false);
        expect(result.invalidEmails).toContain('invalid1');
        expect(result.invalidEmails).toContain('invalid2');
        expect(result.error).toContain('Invalid email format');
      });

      it('should reject duplicate emails', () => {
        const result = parseEmailList('user@example.com,user@example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Duplicate email address');
        expect(result.error).toContain('user@example.com');
      });

      it('should detect duplicates case-insensitively', () => {
        const result = parseEmailList('user@example.com,USER@EXAMPLE.COM');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Duplicate email address');
      });

      it('should reject too many recipients', () => {
        const emails = Array(15)
          .fill(0)
          .map((_, i) => `user${i}@example.com`)
          .join(',');
        const result = parseEmailList(emails);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Too many recipients');
        expect(result.error).toContain('max 10');
      });

      it('should return first invalid email in error message', () => {
        const result = parseEmailList(
          'valid@example.com,invalid,another-invalid'
        );
        expect(result.valid).toBe(false);
        expect(result.error).toContain('invalid');
      });
    });
  });

  describe('validateEmailInput', () => {
    describe('Valid inputs', () => {
      it('should accept empty input (optional email)', () => {
        expect(validateEmailInput('')).toBe('');
        expect(validateEmailInput('   ')).toBe('');
        expect(validateEmailInput(null)).toBe('');
        expect(validateEmailInput(undefined)).toBe('');
      });

      it('should accept valid single email', () => {
        expect(validateEmailInput('user@example.com')).toBe('');
      });

      it('should accept valid comma-separated emails', () => {
        expect(validateEmailInput('user1@example.com,user2@example.com')).toBe(
          ''
        );
      });

      it('should accept emails with whitespace around them', () => {
        expect(validateEmailInput('  user@example.com  ')).toBe('');
      });
    });

    describe('Invalid inputs', () => {
      it('should return error for invalid email format', () => {
        const error = validateEmailInput('invalid-email');
        expect(error).toBeTruthy();
        expect(error).toContain('Invalid email format');
      });

      it('should return error for duplicate emails', () => {
        const error = validateEmailInput('user@example.com,user@example.com');
        expect(error).toBeTruthy();
        expect(error).toContain('Duplicate email address');
      });

      it('should return error for too many recipients', () => {
        const emails = Array(15)
          .fill(0)
          .map((_, i) => `user${i}@example.com`)
          .join(',');
        const error = validateEmailInput(emails);
        expect(error).toBeTruthy();
        expect(error).toContain('Too many recipients');
      });

      it('should return error for mixed valid and invalid emails', () => {
        const error = validateEmailInput('valid@example.com,invalid');
        expect(error).toBeTruthy();
        expect(error).toContain('Invalid email format');
      });
    });

    describe('Edge cases', () => {
      it('should handle commas without emails', () => {
        const error = validateEmailInput('user@example.com,,,');
        expect(error).toBe(''); // Trailing commas ignored
      });

      it('should handle very long email addresses', () => {
        const longEmail = 'a'.repeat(250) + '@example.com';
        const error = validateEmailInput(longEmail);
        expect(error).toBeTruthy();
      });

      it('should handle special characters in email', () => {
        expect(validateEmailInput('user+tag@example.com')).toBe('');
        expect(validateEmailInput('user.name@example.com')).toBe('');
        expect(validateEmailInput('user_name@example.com')).toBe('');
      });
    });
  });
});
