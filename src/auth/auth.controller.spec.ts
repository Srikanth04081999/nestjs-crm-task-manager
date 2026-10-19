import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  it('returns the authentication result from the service', async () => {
    const service = {
      login: jest.fn().mockResolvedValue({
        access_token: 'test-token',
      }),
    };

    const controller = new AuthController(
      service as unknown as AuthService,
    );

    const dto = {
      email: 'raj@example.com',
      password: 'ExamplePassword123!',
    };

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'test-token',
    });

    expect(service.login).toHaveBeenCalledWith(dto);
  });
});