const HttpCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const limiterAPI = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res, next) => {
    return res.status(HttpCode.TOO_MANY_REQUESTS).json({
      status: "error",
      code: HttpCode.TOO_MANY_REQUESTS,
      message: "TOO_MANY_REQUESTS",
    });
  },
};

const Subscr = {
  STARTER: "starter",
  PRO: "pro",
  BUSINESS: "business",
};

module.exports = { HttpCode, Subscr, limiterAPI };
