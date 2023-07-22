import * as Joi from 'joi';

const createUserSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = createUserSchema;