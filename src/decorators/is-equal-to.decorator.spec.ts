import { validate } from 'class-validator';

import { IsEqualTo } from './is-equal-to.decorator';

class PasswordDTO {
  password: string;

  @IsEqualTo('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

describe('IsEqualTo decorator', () => {
  it('should pass validation when values match', async () => {
    const dto = new PasswordDTO();
    dto.password = 'securePassword123';
    dto.confirmPassword = 'securePassword123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when values do not match', async () => {
    const dto = new PasswordDTO();
    dto.password = 'securePassword123';
    dto.confirmPassword = 'differentPassword';

    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toHaveProperty('IsEqualTo');
    expect(errors[0].constraints?.IsEqualTo).toBe('Passwords do not match');
  });
});
