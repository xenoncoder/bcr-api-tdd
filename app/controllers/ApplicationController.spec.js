/* eslint-disable linebreak-style */
const ApplicationController = require('./ApplicationController');
const {NotFoundError} = require('../errors');
const generateRandomNum = () => {
  return Math.floor(Math.random() * 10 + 1);
};

describe('ApplicationController', () => {
  describe('#handleGetRoot', () => {
    it('should call res.status(200) and res.json with status and message',
        async () => {
          const mockRequest = {};
          const mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
          };

          const controller = new ApplicationController();
          await controller.handleGetRoot(mockRequest, mockResponse);

          expect(mockResponse.status).toHaveBeenCalledWith(200);
          expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'OK',
            message: 'BCR API is up and running!',
          });
        },
    );
  });

  describe('#handleNotFound', () => {
    it('should call res.status(500) and res.json ' +
        'with error object(name, message, details)',
    async () => {
      const method = 'POST';
      const url = '/itsmemarioo';

      const mockRequest = {
        method, url,
      };
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      const controller = new ApplicationController();
      await controller.handleNotFound(mockRequest, mockResponse);

      const err = new NotFoundError(mockRequest.method, mockRequest.url);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });
    });
  });

  describe('#handleError', () => {
    it('should call res.status(500) and res.json ' +
      'with error object(name, message, details) ',
    async () => {
      const err = new Error('It\'s a me mariooo');

      const mockRequest = {};
      const mockResponse = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const mockNext = jest.fn();

      const controller = new ApplicationController();
      await controller.handleError(err, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details || null,
        },
      });
    },
    );
  });

  describe('#getOffsetFromRequest', () => {
    it('should calculate and return correct offset value',
        async () => {
          const page = generateRandomNum();
          const pageSize = generateRandomNum();

          const mockRequest = {query: {page, pageSize}};

          const controller = new ApplicationController();
          const returnVal = await controller.getOffsetFromRequest(mockRequest);

          const expectedVal = (page - 1) * pageSize;
          expect(returnVal).toBe(expectedVal);
        },
    );
    it('should be able to handle null "page" and "pageSize" value from req',
        async () => {
          const page = 1;
          const pageSize = 10;

          const mockRequest = {query: {}};

          const controller = new ApplicationController();
          const returnVal = await controller.getOffsetFromRequest(mockRequest);

          const expectedVal = (page - 1) * pageSize;
          expect(returnVal).toBe(expectedVal);
        });
  });

  describe('#builldPaginationObject', () => {
    it('should calculate and return correct pagination object',
        async () => {
          const page = generateRandomNum();
          const pageSize = generateRandomNum();
          const count = generateRandomNum();

          const mockRequest = {query: {page, pageSize}};

          const controller = new ApplicationController();
          const returnVal = await controller.buildPaginationObject(
              mockRequest, count,
          );

          const pageCount = Math.ceil(count / pageSize);
          expect(returnVal).toEqual({
            page,
            pageCount,
            pageSize,
            count,
          });
        });
    it('should be able to handle emoty "page" and "pageSize" value from req',
        async () => {
          const page = 1;
          const pageSize = 10;
          const count = 1;

          const mockRequest = {query: {}};

          const controller = new ApplicationController();
          const returnVal = await controller.buildPaginationObject(
              mockRequest, count,
          );

          const pageCount = Math.ceil(count / pageSize);
          expect(returnVal).toEqual({
            page,
            pageCount,
            pageSize,
            count,
          });
        });
  });
});


