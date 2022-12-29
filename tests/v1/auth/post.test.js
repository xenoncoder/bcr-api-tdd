const request = require('supertest');
const app = require('../../../app');
const {User} = require('../../../app/models');

describe('POST /v1/auth/register', () => {
  const regCred = {
    name: 'RainPedia',
    email: new Date().getDate() + '@madaracorp.biz.id',
    password: 'password',
  };

  afterAll(async () => {
    User.findOne({
      where: {email: regCred.email},
    }).then((user) => {
      user.destroy({
        truncate: true,
      });
    });
  });

  // eslint-disable-next-line max-len
  it('should response code 201 and return token if create success.', async () => {
    return request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(regCred)
        .then((res) => {
          expect(res.statusCode).toBe(201);
          expect(res.body).toHaveProperty('accessToken');
        });
  });

  it('should response code 422 if email already reg.', async () => {
    return request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send(regCred)
        .then((res) => {
          expect(res.statusCode).toBe(422);
        });
  });
});

describe('POST /v1/auth/login', () => {
  const loginCred = {
    email: new Date().getDate() + '@premiumsource.biz.id',
    password: 'Koalabear1@',
  };

  beforeAll(async () => {
    return request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          ...loginCred,
          name: 'RainPedia',
        });
  });

  afterAll(async () => {
    await User.destroy({
      where: {email: loginCred.email},
    });
  });

  // eslint-disable-next-line max-len
  it('should response code 201 and return token if create success.', async () => {
    return request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send(loginCred)
        .then((res) => {
          expect(res.statusCode).toBe(201);
          expect(res.body).toHaveProperty('accessToken');
        });
  });

  it('should response code 404 if email not found.', async () => {
    return request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          ...loginCred,
          email: 'wrong_email',
        })
        .then((res) => {
          expect(res.statusCode).toBe(404);
        });
  });

  it('should response code 401 if password wrong.', async () => {
    return request(app)
        .post('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          ...loginCred,
          password: 'wrong_password',
        })
        .then((res) => {
          expect(res.statusCode).toBe(401);
        });
  });
});
