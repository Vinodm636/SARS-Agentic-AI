jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({})),
  },
}));

import { getErrorMessage } from './api';

describe('getErrorMessage', () => {
  it('returns a readable message for FastAPI validation errors', () => {
    const error = {
      response: {
        data: {
          detail: [
            { type: 'value_error', loc: ['body', 'age'], msg: 'value is not a valid integer', input: 'abc' },
          ],
        },
      },
    };

    expect(getErrorMessage(error)).toBe('value is not a valid integer');
  });

  it('falls back to a provided message when the error is empty', () => {
    expect(getErrorMessage(null, 'Something went wrong')).toBe('Something went wrong');
  });
});
