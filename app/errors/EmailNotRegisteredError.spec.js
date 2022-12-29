const EmailNotRegisteredError = require('./EmailNotRegisteredError');

describe('EmailNotRegisteredError', () => {
  describe('#getDetails', () => {
    it('should return email object when called.', () => {
      const email = 'uwu';
      const err = new EmailNotRegisteredError(email);

      expect(err.details).toEqual({email});
    });
  });
});
