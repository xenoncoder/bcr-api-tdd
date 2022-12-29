const request = require('supertest');
const app = require('../../../app');
const {User} = require('../../../app/models');

describe('GET /v1/auth/whoami', () => {
  const regCred = {
    name: 'RainPedia',
    email: new Date().getDate() + '@madaracorp.biz.id',
    password: 'password',
  };
  let token;

  beforeAll(async () => {
    const res = await request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(regCred);
    token = res.body.accessToken;
  });

  afterAll(async () => {
    await User.destroy({
      where: {email: regCred.email},
    });
  });

  it('should response code 200 and return user object if success', async () => {
    return request(app)
        .get('/v1/auth/whoami')
        .set('Content-Type', 'application/json')
        .set('authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('email');
        });
  });
});
