/**
 * Tests for observer name validator
 */

import {
  validateObserverName,
  looksLikeDiscordUsername,
  looksLikeTwitchUsername,
} from '../observerNameValidator';

describe('observerNameValidator', () => {
  describe('validateObserverName', () => {
    describe('Valid names', () => {
      test('accepts simple Discord usernames', () => {
        expect(validateObserverName('username123')).toBe('');
        expect(validateObserverName('user_name')).toBe('');
        expect(validateObserverName('user.name')).toBe('');
        expect(validateObserverName('user_name.123')).toBe('');
      });

      test('accepts simple Twitch usernames', () => {
        expect(validateObserverName('username')).toBe('');
        expect(validateObserverName('user123')).toBe('');
        expect(validateObserverName('user_name_123')).toBe('');
      });

      test('accepts full names with spaces', () => {
        expect(validateObserverName('John Doe')).toBe('');
        expect(validateObserverName('Jane Smith')).toBe('');
        expect(validateObserverName('Dr. Robert Jones')).toBe('');
      });

      test('accepts names with hyphens', () => {
        expect(validateObserverName('Mary-Jane')).toBe('');
        expect(validateObserverName('Jean-Luc')).toBe('');
      });

      test('accepts international characters', () => {
        expect(validateObserverName('José García')).toBe('');
        expect(validateObserverName('Müller')).toBe('');
        expect(validateObserverName('Søren')).toBe('');
        expect(validateObserverName('李明')).toBe('');
        expect(validateObserverName('Владимир')).toBe('');
      });

      test('accepts minimum length (2 chars)', () => {
        expect(validateObserverName('AB')).toBe('');
        expect(validateObserverName('12')).toBe('');
        expect(validateObserverName('A1')).toBe('');
      });

      test('accepts maximum length (32 chars)', () => {
        const maxLength = 'a'.repeat(32);
        expect(validateObserverName(maxLength)).toBe('');
      });

      test('accepts mixed formats', () => {
        expect(validateObserverName('User Name_123')).toBe('');
        expect(validateObserverName('observer.one')).toBe('');
        expect(validateObserverName('test-user_2024')).toBe('');
      });
    });

    describe('Invalid names - empty/missing', () => {
      test('rejects empty string', () => {
        expect(validateObserverName('')).toContain('required');
      });

      test('rejects whitespace only', () => {
        expect(validateObserverName('   ')).toContain('at least 2 characters');
      });

      test('rejects null', () => {
        expect(validateObserverName(null)).toContain('required');
      });

      test('rejects undefined', () => {
        expect(validateObserverName(undefined)).toContain('required');
      });

      test('rejects non-string values', () => {
        expect(validateObserverName(123)).toContain('required');
        expect(validateObserverName({})).toContain('required');
        expect(validateObserverName([])).toContain('required');
      });
    });

    describe('Invalid names - length', () => {
      test('rejects names shorter than 2 characters', () => {
        expect(validateObserverName('A')).toContain('at least 2 characters');
        expect(validateObserverName('1')).toContain('at least 2 characters');
      });

      test('rejects names longer than 32 characters', () => {
        const tooLong = 'a'.repeat(33);
        expect(validateObserverName(tooLong)).toContain(
          '32 characters or less'
        );
      });
    });

    describe('Invalid names - characters', () => {
      test('rejects special characters', () => {
        expect(validateObserverName('user@name')).toContain('can only contain');
        expect(validateObserverName('user#123')).toContain('can only contain');
        expect(validateObserverName('user$name')).toContain('can only contain');
        expect(validateObserverName('user%test')).toContain('can only contain');
        expect(validateObserverName('user&co')).toContain('can only contain');
        expect(validateObserverName('user*name')).toContain('can only contain');
      });

      test('rejects emoji', () => {
        expect(validateObserverName('user😀')).toContain('can only contain');
        expect(validateObserverName('🎮gamer')).toContain('can only contain');
      });

      test('rejects names with only symbols', () => {
        expect(validateObserverName('___')).toContain(
          'at least one letter or number'
        );
        expect(validateObserverName('...')).toContain(
          'at least one letter or number'
        );
        expect(validateObserverName('---')).toContain(
          'at least one letter or number'
        );
        expect(validateObserverName('_ . -')).toContain(
          'at least one letter or number'
        );
      });
    });

    describe('Invalid names - Discord rules', () => {
      test('rejects consecutive periods', () => {
        expect(validateObserverName('user..name')).toContain(
          'consecutive periods'
        );
        expect(validateObserverName('test...123')).toContain(
          'consecutive periods'
        );
      });

      test('rejects names starting with period', () => {
        expect(validateObserverName('.username')).toContain(
          'start or end with a period'
        );
      });

      test('rejects names ending with period', () => {
        expect(validateObserverName('username.')).toContain(
          'start or end with a period'
        );
      });
    });

    describe('Trimming behavior', () => {
      test('trims leading whitespace', () => {
        expect(validateObserverName('  username')).toBe('');
      });

      test('trims trailing whitespace', () => {
        expect(validateObserverName('username  ')).toBe('');
      });

      test('trims both leading and trailing whitespace', () => {
        expect(validateObserverName('  username  ')).toBe('');
      });

      test('validates trimmed length', () => {
        // Single char after trimming
        expect(validateObserverName(' A ')).toContain('at least 2 characters');
      });
    });
  });

  describe('looksLikeDiscordUsername', () => {
    test('identifies valid Discord usernames', () => {
      expect(looksLikeDiscordUsername('username')).toBe(true);
      expect(looksLikeDiscordUsername('user_name')).toBe(true);
      expect(looksLikeDiscordUsername('user.name')).toBe(true);
      expect(looksLikeDiscordUsername('user_name.123')).toBe(true);
      expect(looksLikeDiscordUsername('AB')).toBe(true); // Min length
    });

    test('rejects names with spaces (not Discord format)', () => {
      expect(looksLikeDiscordUsername('John Doe')).toBe(false);
      expect(looksLikeDiscordUsername('user name')).toBe(false);
    });

    test('rejects names with hyphens (not Discord format)', () => {
      expect(looksLikeDiscordUsername('user-name')).toBe(false);
    });

    test('rejects names outside Discord length range', () => {
      expect(looksLikeDiscordUsername('A')).toBe(false); // Too short
      expect(looksLikeDiscordUsername('a'.repeat(33))).toBe(false); // Too long
    });

    test('rejects invalid input', () => {
      expect(looksLikeDiscordUsername('')).toBe(false);
      expect(looksLikeDiscordUsername(null)).toBe(false);
      expect(looksLikeDiscordUsername(undefined)).toBe(false);
      expect(looksLikeDiscordUsername(123)).toBe(false);
    });
  });

  describe('looksLikeTwitchUsername', () => {
    test('identifies valid Twitch usernames', () => {
      expect(looksLikeTwitchUsername('username')).toBe(true);
      expect(looksLikeTwitchUsername('user123')).toBe(true);
      expect(looksLikeTwitchUsername('user_name_123')).toBe(true);
      expect(looksLikeTwitchUsername('TestUser')).toBe(true);
    });

    test('requires starting with a letter', () => {
      expect(looksLikeTwitchUsername('1username')).toBe(false);
      expect(looksLikeTwitchUsername('_username')).toBe(false);
    });

    test('rejects names with periods (not Twitch format)', () => {
      expect(looksLikeTwitchUsername('user.name')).toBe(false);
    });

    test('rejects names with hyphens (not Twitch format)', () => {
      expect(looksLikeTwitchUsername('user-name')).toBe(false);
    });

    test('rejects names with spaces (not Twitch format)', () => {
      expect(looksLikeTwitchUsername('user name')).toBe(false);
    });

    test('rejects names outside Twitch length range', () => {
      expect(looksLikeTwitchUsername('ABC')).toBe(false); // Too short (min 4)
      expect(looksLikeTwitchUsername('a'.repeat(26))).toBe(false); // Too long (max 25)
    });

    test('accepts minimum length (4 chars)', () => {
      expect(looksLikeTwitchUsername('ABCD')).toBe(true);
    });

    test('accepts maximum length (25 chars)', () => {
      expect(looksLikeTwitchUsername('a' + '1'.repeat(24))).toBe(true);
    });

    test('rejects invalid input', () => {
      expect(looksLikeTwitchUsername('')).toBe(false);
      expect(looksLikeTwitchUsername(null)).toBe(false);
      expect(looksLikeTwitchUsername(undefined)).toBe(false);
      expect(looksLikeTwitchUsername(123)).toBe(false);
    });
  });

  describe('Real-world examples', () => {
    test('accepts common Discord usernames', () => {
      expect(validateObserverName('gamer_123')).toBe('');
      expect(validateObserverName('cool.user')).toBe('');
      expect(validateObserverName('pro_player_2024')).toBe('');
    });

    test('accepts common Twitch usernames', () => {
      expect(validateObserverName('xXxGamerxXx')).toBe('');
      expect(validateObserverName('streamer_pro')).toBe('');
      expect(validateObserverName('live_gaming')).toBe('');
    });

    test('accepts researcher/staff names', () => {
      expect(validateObserverName('Dr. Smith')).toBe('');
      expect(validateObserverName('Sarah Johnson')).toBe('');
      expect(validateObserverName('Lab Tech 3')).toBe('');
    });
  });
});
