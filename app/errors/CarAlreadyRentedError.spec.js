const CarAlreadyRentedError = require('./CarAlreadyRentedError');

describe('CarAlreadyRentedError', () => {
  describe('#getDetails', () => {
    it('should return car object when called.', () => {
      const mockCar = {
        name: 'car',
      };
      const err = new CarAlreadyRentedError(mockCar);

      expect(err.details).toEqual({car: mockCar});
    });
  });
});
