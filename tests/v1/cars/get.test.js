const request = require('supertest');
const app = require('../../../app');
const admin = require('../../../config/admin');

describe('GET /v1/cars', () => {
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

  it('should response code 200 and return car list.', async () => {
    return request(app)
        .get('/v1/cars')
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveProperty('cars');
          expect(res.body).toHaveProperty('meta');
        });
  });
});
