import { response } from './services/response.service';
const userSchema = require('./validations/UserSchema');

const authService = require('./services/auth.service');
import { ErrorsService } from './services/errors.service';
import {StatusCodes} from "http-status-codes";
const errorsService = new ErrorsService();

const gravatar = require('gravatar');
import * as AWS from "aws-sdk";
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { hashSync } = bcrypt;
const passwordHash = require('password-hash');

const saltRounds = 10;

const USER_TABLE_NAME = process.env.USER_TABLE_NAME || "";
const USER_TABLE_PRIMARY_KEY = process.env.USER_TABLE_PRIMARY_KEY || "";
const SECRET = process.env.SECRET || "ZB_[}&2wERPy7|J"
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ZB_[}&2wERPy7|J.."
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || 900
const REFRESH_JWT_EXPIRES_IN = '720h'

exports.register = async function(event: any) {
    const { body } = event;

    console.log('event', event);

    if (!body) {
        return response(StatusCodes.BAD_REQUEST, {
            message: errorsService.INVALID_BODY_PARAMS
        });
    }

    const item = typeof body == 'object' ? body : JSON.parse(body);

    const { error } = userSchema.validate(item);

    if(error) {
        return response(StatusCodes.UNPROCESSABLE_ENTITY, {
            message: error
        });
    }

    const { userName, password } = item;
    const userNameQuery = {
        TableName: USER_TABLE_NAME,
        FilterExpression: 'userName = :userNameValue',
        ExpressionAttributeValues: {
            ':userNameValue': userName
        }
    };

    const userNameResponse = await db.scan(userNameQuery).promise();
    const userNameDB = userNameResponse.Items;

    if (Array.isArray(userNameDB) && userNameDB.length) {
        return response(StatusCodes.CONFLICT, {
            message: errorsService.USER_ALREADY_EXISTS
        });
    }

    item.password = await hashSync(password, saltRounds);

    const userId = uuidv4();

    item[USER_TABLE_PRIMARY_KEY] = userId;

    const params = {
        TableName: USER_TABLE_NAME,
        Item: {
            ...item
        }
    };

    try {
        await db.put(params).promise();
        return response(StatusCodes.OK, {
            userId
        });
    } catch (dbError) {
        console.log('createUser', dbError);
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            errorsService.DYNAMODB_EXECUTION_ERROR : errorsService.RESERVED_RESPONSE;

        return response(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: errorResponse
        });
    }
}

exports.token = async function(event: any) {
    const { body } = event;

    if (!body) {
        return response(StatusCodes.BAD_REQUEST, {
            message: errorsService.INVALID_BODY_PARAMS
        });
    }

    const item = typeof body == 'object' ? body : JSON.parse(body);

    const { error } = userSchema.validate(item);

    if(error) {
        return response(StatusCodes.UNPROCESSABLE_ENTITY, {
            message: error
        });
    }

    const {
        userName,
        password
    } = item;

    const params = {
        TableName: USER_TABLE_NAME,
        FilterExpression: 'userName = :userNameValue',
        ExpressionAttributeValues: {
            ':userNameValue': userName
        }
    };

    try {
        const userResponse: any = await db.scan(params).promise();
        const user = userResponse.Items[0];

        if(!user) {
            return response(StatusCodes.UNAUTHORIZED, {
                message: errorsService.INCORRECT_CREDENTIALS
            });
        }


        const validPassword = bcrypt.compare(password, user.password);


        if (!validPassword) {
            return response(StatusCodes.UNAUTHORIZED, {
                message: errorsService.INCORRECT_CREDENTIALS
            });
        }

        let userData: any =  {
            userId: user.userId
        };


        const photo = gravatar.url(userName, {s: '100', r: 'x', d: 'retro'}, true);

        const { token, refreshToken } = authService.generateTokens({
            userData,
            SECRET,
            REFRESH_SECRET,
            JWT_EXPIRES_IN,
            REFRESH_JWT_EXPIRES_IN
        });

        return response(StatusCodes.OK, {
            token,
            refreshToken,
            user: {
                userName,
                photo,
            }
        });

    } catch (dbError) {
        console.log('login | dbError:', dbError);
        return response(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: dbError
        });
    }
}
