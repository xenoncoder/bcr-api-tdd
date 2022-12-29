const request = require('supertest');
const app = require('../../../../app');
const {Car} = require('../../../../app/models');
const dayjs = require('dayjs');

describe('POST /v1/cars/:id/rent', () => {
  const mockCar = {
    name: 'Sussy car',
    price: 69420,
    image: 'this_is_image',
    size: 'LARGE',
  };
  const userLoginCred = {
    email: 'Fikri@binar.co.id',
    password: '123456',
  };
  let token;
  const rentStartedAt = new Date().toISOString();
  const rentEndedAt = dayjs(rentStartedAt).add(1, 'day');
  const mockRentUser = {
    rentStartedAt: rentStartedAt,
    rentEndedAt: rentEndedAt,
  };
  let car;

  beforeAll(async () => {
    car = await Car.create(mockCar);
    const res = await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(userLoginCred);
    token = res.body.accessToken;
    return car;
  });

  afterAll(async () => {
    car.destroy({truncate: true});
  });

  it('should response code 201 and return rent data.', async () => {
    return request(app)
        .post('/v1/cars/' + car.id + '/rent')
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send(mockRentUser)
        .then((res) => {
          expect(res.statusCode).toBe(201);
          expect(res.body).toHaveProperty('rentStartedAt');
        });
  });

  it('should response code 422 when car already rented.', async () => {
    return request(app)
        .post('/v1/cars/' + car.id + '/rent')
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .send(mockRentUser)
        .then((res) => {
          expect(res.statusCode).toBe(422);
        });
  });
});
