const AuthenticationController = require('./AuthenticationController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  Role,
} = require('../models');
const User = {};
const {
  EmailAlreadyTakenError,
  EmailNotRegisteredError,
  WrongPasswordError,
  InsufficientAccessError,
  RecordNotFoundError,
} = require('../errors');
const {JWT_SIGNATURE_KEY} = require('../../config/application');

const generateRandomNum = () => {
  return Math.floor(Math.random() * 10 + 1);
};
const mockRole = {
  id: 1,
  name: 'COSTUMER',
};
const mockUser = {
  id: 420,
  name: 'sussy baka',
  email: new Date().getSeconds() + '@amongus.com',
  password: 'the_impostor_is_sus',
  image: 'this_is_image',
  roleId: 1,
};
mockUser.encryptedPassword = bcrypt.hashSync(mockUser.password, 10);


const mockUserRes = {
  id: mockUser.id,
  name: mockUser.name,
  email: mockUser.email,
  encryptedPassword: mockUser.encryptedPassword,
  roleId: mockRole.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserModel = {
  findOne: jest.fn().mockReturnValue(null),
  create: jest.fn().mockReturnValue(mockUserRes),
};
const mockRoleModel = {
  findOne: jest.fn().mockReturnValue(mockRole),
};

describe('AuthenticationController', () => {
  describe('#encryptPassword', () => {
    it('should return valid bcrypt hashed password string', () => {
      const mockPass = 'amongus' + generateRandomNum();

      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        userModel, roleModel, bcrypt, jwt,
      });

      const hashResult = controller.encryptPassword(mockPass);

      expect(bcrypt.compareSync(mockPass, hashResult)).toEqual(true);
    });
  });

  describe('#verifyPassword', () => {
    it('should return true if hash and pass match.', () => {
      const mockPass = 'amongus' + generateRandomNum();
      const mockHass = bcrypt.hashSync(mockPass, 10);

      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        userModel, roleModel, bcrypt, jwt,
      });

      const result = controller.verifyPassword(mockPass, mockHass);
      expect(result).toEqual(true);
    });

    it('should return false if hash and pass not match.', () => {
      const mockPass = 'amongus' + generateRandomNum();
      const mockHass = bcrypt.hashSync(mockPass + 'sus', 10);

      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        userModel, roleModel, bcrypt, jwt,
      });

      const result = controller.verifyPassword(mockPass, mockHass);
      expect(result).toEqual(false);
    });
  });

  describe('#createTokenFromUser', () => {
    it('should return valid jwt token based on user and role.', () => {
      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        userModel, roleModel, bcrypt, jwt,
      });

      const token = controller.createTokenFromUser(mockUser, mockRole);
      const expectedToken = jwt.sign({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.image,
        role: {
          id: mockRole.id,
          name: mockRole.name,
        },
      }, JWT_SIGNATURE_KEY);

      expect(token).toEqual(expectedToken);
    });
  });

  describe('#decodeToken', () => {
    it('should return user data from given valid jwt token.', () => {
      const mockUser = {
        id: 420,
        name: 'sussy baka',
        email: 'amongus@420.com',
        image: 'this_is_image',
        role: {
          id: 2,
          name: 'ADMIN',
        },
      };
      const mockToken = jwt.sign(mockUser, JWT_SIGNATURE_KEY);

      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        userModel, roleModel, bcrypt, jwt,
      });

      const decodeResult = controller.decodeToken(mockToken);
      delete decodeResult['iat'];

      expect(decodeResult).toEqual(mockUser);
    });
  });

  describe('#handleRegister', () => {
    it('should return res.status(201) and token if request valid.',
        async () => {
          const mockReq = {
            body: {
              name: mockUser.name,
              email: mockUser.email,
              password: mockUser.password,
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleRegister(
              mockReq, mockRes, mockNext,
          );

          const expectedToken = controller.createTokenFromUser(
              mockUserRes, mockRole,
          );

          expect(mockUserModel.create).toHaveBeenCalled();
          expect(mockRes.status).toHaveBeenCalledWith(201);
          expect(mockRes.json).toHaveBeenCalledWith({
            accessToken: expectedToken,
          });
        },
    );

    it('should return res.status(422) and err instance if email already taken.',
        async () => {
          const mockReq = {
            body: {
              name: mockUser.name,
              email: mockUser.email,
              password: mockUser.password,
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockReturnValue(true),
          };
          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleRegister(
              mockReq, mockRes, mockNext,
          );

          const expectedErr = new EmailAlreadyTakenError(mockUser.email);

          expect(mockUserModel.findOne).toHaveBeenCalled();
          expect(mockRes.status).toHaveBeenCalledWith(422);
          expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
        },
    );

    it('should go to next function to handle general error.',
        async () => {
          const mockReq = {
            body: {
              name: mockUser.name,
              email: mockUser.email,
              password: mockUser.password,
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockRejectedValue(
                new Error('random sus error'),
            ),
          };
          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleRegister(
              mockReq, mockRes, mockNext,
          );

          expect(mockNext).toHaveBeenCalled();
        },
    );
  });

  describe('#handleLogin', () => {
    it('should res.status(201) and return access token if login valid',
        async () => {
          const mockReq = {
            body: {
              email: mockUser.email,
              password: mockUser.password,
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockReturnValue({
              ...mockUserRes,
              Role: mockRole,
            }),
          };

          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleLogin(mockReq, mockRes, mockNext);
          const expectedToken = controller.createTokenFromUser(
              {...mockUserRes, Role: mockRole}, mockRole,
          );

          expect(mockUserModel.findOne).toHaveBeenCalled();
          expect(mockRes.status).toHaveBeenCalledWith(201);
          expect(mockRes.json).toHaveBeenCalledWith({
            accessToken: expectedToken,
          });
        });

    it('should res.status(404) and return error if email not registered.',
        async () => {
          const mockReq = {
            body: {
              email: mockUser.email,
              password: mockUser.password,
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockReturnValue(null),
          };

          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleLogin(mockReq, mockRes, mockNext);

          const expectedErr = new EmailNotRegisteredError(mockUser.email);

          expect(mockUserModel.findOne).toHaveBeenCalled();
          expect(mockRes.status).toHaveBeenCalledWith(404);
          expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
        });

    it('should res.status(401) and return error if password wrong.',
        async () => {
          const mockReq = {
            body: {
              email: mockUser.email,
              password: 'sus_password',
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockReturnValue({
              ...mockUserRes,
              Role: mockRole,
            }),
          };

          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleLogin(mockReq, mockRes, mockNext);

          const expectedErr = new WrongPasswordError();

          expect(mockUserModel.findOne).toHaveBeenCalled();
          expect(mockRes.status).toHaveBeenCalledWith(401);
          expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
        });

    it('should run next function on general error',
        async () => {
          const mockReq = {
            body: {
              email: mockUser.email,
              password: 'sus_password',
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const mockUserModel = {
            findOne: jest.fn().mockRejectedValue(new Error('whatev')),
          };

          const controller = new AuthenticationController({
            userModel: mockUserModel,
            roleModel: mockRoleModel,
            bcrypt,
            jwt,
          });

          await controller.handleLogin(mockReq, mockRes, mockNext);

          expect(mockNext).toHaveBeenCalled();
        });
  });

  describe('authorize', () => {
    it('should run next function if bearer token and role valid.', async () => {
      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        roleModel, userModel, bcrypt, jwt,
      });
      const mockToken = controller.createTokenFromUser(mockUser, mockRole);
      const mockReq = {
        headers: {
          authorization: 'Bearer ' + mockToken,
        },
      };
      const mockNext = jest.fn();

      const authorizeCustomer = controller.authorize('COSTUMER');
      await authorizeCustomer(mockReq, {}, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should res.status(401) with InsufficientAccessError .' +
      'if token valid but role invalid.'
    , async () => {
      const roleModel = Role;
      const userModel = User;
      const controller = new AuthenticationController({
        roleModel, userModel, bcrypt, jwt,
      });
      const mockToken = controller.createTokenFromUser(mockUser, mockRole);
      const mockReq = {
        headers: {
          authorization: 'Bearer ' + mockToken,
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const authorizeCustomer = controller.authorize('ADMIN');
      await authorizeCustomer(mockReq, mockRes, mockNext);

      const err = new InsufficientAccessError('COSTUMER');

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details || null,
        },
      });
    });

    it('should res.status(401) with error instance if token wrong.',
        async () => {
          const roleModel = Role;
          const userModel = User;
          const controller = new AuthenticationController({
            roleModel, userModel, bcrypt, jwt,
          });
          const mockToken = controller.createTokenFromUser(mockUser, mockRole);
          const mockReq = {
            headers: {
              authorization: 'Bearer ' + mockToken + 'uwu',
            },
          };
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
          };
          const mockNext = jest.fn();

          const authorizeCustomer = controller.authorize('ADMIN');
          await authorizeCustomer(mockReq, mockRes, mockNext);

          expect(mockRes.status).toHaveBeenCalledWith(401);
        });
  });

  describe('#handleGetUser', () => {
    it('should res.status(200) and return user data', async () => {
      const mockReq = {
        user: mockUser,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockUserModel = {
        findByPk: jest.fn().mockReturnValue(mockUser),
      };
      const mockRoleModel = {
        findByPk: jest.fn().mockReturnValue(true),
      };

      const controller = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt, jwt,
      });

      await controller.handleGetUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should res.status(404) with RecordNotFoundError ' +
     'if user not found.',
    async () => {
      const mockReq = {
        user: mockUser,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockUserModel = {
        findByPk: jest.fn().mockReturnValue(false),
      };
      const mockRoleModel = {
        findByPk: jest.fn().mockReturnValue(false),
      };

      const controller = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt, jwt,
      });

      await controller.handleGetUser(mockReq, mockRes);
      const expectedErr = new RecordNotFoundError(mockUser.name);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
    });

    it('should res.status(404) with RecordNotFoundError ' +
      'if role not found.',
    async () => {
      const mockReq = {
        user: mockUser,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      const mockUserModel = {
        findByPk: jest.fn().mockReturnValue(true),
      };
      const mockRoleModel = {
        findByPk: jest.fn().mockReturnValue(false),
      };

      const controller = new AuthenticationController({
        userModel: mockUserModel,
        roleModel: mockRoleModel,
        bcrypt, jwt,
      });

      await controller.handleGetUser(mockReq, mockRes);
      const expectedErr = new RecordNotFoundError(mockUser.name);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expectedErr);
    });
  });
});
