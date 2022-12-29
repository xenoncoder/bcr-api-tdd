const request = require('supertest');
const app = require('../../../../app');
const {Car} = require('../../../../app/models');
const admin = require('../../../../config/admin');

describe('DELETE /v1/cars/:id', () => {
  const mockCar = {
    name: 'Sussy car',
    price: 69420,
    image: 'this_is_image',
    size: 'LARGE',
  };
  const adminLoginCred = {
    email: admin.email,
    password: admin.password,
  };
  let token;
  let car;

  beforeAll(async () => {
    car = await Car.create(mockCar);
    const res = await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(adminLoginCred);
    token = res.body.accessToken;
    return car;
  });

  afterAll(async () => {
    car.destroy({truncate: true});
  });

  it('should response code 204 if success.', async () => {
    return request(app)
        .delete('/v1/cars/' + car.id)
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).toBe(204);
        });
  });

  it('should response code 404 if car not found.', async () => {
    return request(app)
        .delete('/v1/cars/' + 9999999)
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).toBe(404);
        });
  });
});
