const EmailAlreadyTakenError = require('./EmailAlreadyTakenError');

describe('EmailAlreadyTakenError', () => {
  describe('#getDetails', () => {
    it('should return email object when called.', () => {
      const email = 'uwu';
      const err = new EmailAlreadyTakenError(email);

      expect(err.details).toEqual({email});
    });
  });
});
