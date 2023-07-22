import { response } from './services/response.service';
const createUserSchema = require('./validations/CreateUserSchema');

import { ErrorsService } from './services/errors.service';
import {StatusCodes} from "http-status-codes";
const errorsService = new ErrorsService();

import * as AWS from "aws-sdk";
const db = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { hashSync } = bcrypt;

const saltRounds = 10;

const USER_TABLE_NAME = process.env.USER_TABLE_NAME || "";
const USER_TABLE_PRIMARY_KEY = process.env.PRIMARY_KEY || "";

exports.create = async function(event: any) {
    const { body } = event;

    console.log('event', event);

    if (!body) {
        return response(StatusCodes.BAD_REQUEST, {
            message: errorsService.INVALID_BODY_PARAMS
        });
    }

    const item = typeof body == 'object' ? body : JSON.parse(body);

    const { error } = createUserSchema.validate(item);

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

exports.token = async function(event: any) { }