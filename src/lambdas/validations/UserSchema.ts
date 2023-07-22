import * as Joi from 'joi';

const userSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = userSchema;