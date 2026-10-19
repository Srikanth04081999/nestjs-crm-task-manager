import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const users = {
    create: jest.fn(),
    findForLogin: jest.fn(),
  };

  const jwt = {
    signAsync: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new AuthService(
      users as unknown as UsersService,
      jwt as unknown as JwtService,
    );
  });

  it('rejects an unknown account', async () => {
    users.findForLogin.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'unknown@example.com',
        password: 'ExamplePassword123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password', async () => {
    users.findForLogin.mockResolvedValue({
      id: 1,
      passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
    });

    await expect(
      service.login({
        email: 'raj@example.com',
        password: 'WrongPassword123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('returns a token without exposing the password hash', async () => {
    users.findForLogin.mockResolvedValue({
      id: 1,
      name: 'Raj',
      email: 'raj@example.com',
      role: 'user',
      passwordHash: await bcrypt.hash('CorrectPassword123!', 4),
    });

    jwt.signAsync.mockResolvedValue('test-token');

    const result = await service.login({
      email: 'raj@example.com',
      password: 'CorrectPassword123!',
    });

    expect(result.access_token).toBe('test-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 1 });
  });
});