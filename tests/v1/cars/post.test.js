const request = require('supertest');
const app = require('../../../app');
const admin = require('../../../config/admin');

describe('POST /v1/cars', () => {
  const loginCred = {
    email: admin.email,
    password: admin.password,
  };
  let token;

  beforeAll(async () => {
    const res = await request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(loginCred);
    token = res.body.accessToken;
  });

  it('should response code 201 and return created car.', async () => {
    return request(app)
        .post('/v1/cars')
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).toBe(201);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('price');
          expect(res.body).toHaveProperty('size');
        });
  });
});
