export class ValidationError extends Error {
  constructor(details) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad request') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

export class PayloadTooLargeError extends Error {
  constructor(message = 'Request body is too large') {
    super(message);
    this.name = 'PayloadTooLargeError';
    this.statusCode = 413;
  }
}
