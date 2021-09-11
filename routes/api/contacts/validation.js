const Joi = require("joi");
const mongoose = require("mongoose");

const schemaCreateContact = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z' '\-()0-9]{3,30}$/)
    .required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  phone: Joi.string()
    .pattern(/^[' '\-()0-9]{3,30}$/)
    .required(),
});

const schemaUpdateContact = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z' '\-()0-9]{3,30}$/)
    .optional(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: false }).optional(),
  phone: Joi.string()
    .pattern(/^[' '\-()0-9]{3,30}$/)
    .optional(),
}).or("name", "email", "phone");

const validate = async (schema, obj, next) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (err) {
    next({
      status: 400,
      message: err.message,
    });
  }
};

module.exports = {
  validationCreateContact: (req, res, next) => {
    if ("name" in req.body && "email" in req.body && "phone" in req.body) {
      return validate(schemaCreateContact, req.body, next);
    }
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Missing required name field",
    });
  },
  validationUpdateContact: (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ status: "error", code: 400, message: "Missing fields" });
    }
    return validate(schemaUpdateContact, req.body, next);
  },
  validateMongoId: (req, _res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.contactId)) {
      return next({
        status: 400,
        message: "Invalid ObjectId",
      });
    }
    next();
  },
};
