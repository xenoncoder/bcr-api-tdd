const request = require('supertest');
const app = require('../../../../app');
const {Car} = require('../../../../app/models');

describe('GET /v1/cars/:id', () => {
  const mockCar = {
    name: 'Sussy car',
    price: 69420,
    image: 'this_is_image',
    size: 'LARGE',
  };
  let car;

  beforeAll(async () => {
    car = await Car.create(mockCar);
    return car;
  });

  afterAll(async () => {
    car.destroy();
  });

  it('should response code 200 and return car data.', async () => {
    return request(app)
        .get('/v1/cars/' + car.id)
        .set('Content-Type', 'application/json')
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body).toMatchObject(mockCar);
        });
  });
});
