import * as AWS from 'aws-sdk';
const db = new AWS.DynamoDB.DocumentClient();

import { permissions } from './services/permissions.service';
const authService = require('./services/auth.services');

const SECRET = process.env.SECRET || "ZB_[}&2wERPy7|J"
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || "";

export const handler = async (event: any, context: any, callback: any) : Promise <any> => {
    console.log('context:', context);
    console.log('event:', event);
    console.log('headers:', event.headers);
    const { authorizationToken, methodArn } = event;

    const tmp = methodArn.split(':');

    try {
        const decoded = authService.decodeToken(authorizationToken, SECRET);

        const { userId } = decoded;

        console.log('decoded', decoded, userId);

        const userParams = {
            TableName: USERS_TABLE_NAME,
            Key: {
                userId: userId
            }
        };

        const userResponse = await db.get(userParams).promise();

        const user: any = userResponse.Item;

        callback(null, authService.generatePolicy(user, permissions, 'Allow', event.methodArn));

    } catch(err) {
        console.log('err', err);
        callback("Unauthorized");   // Return a 401 Unauthorized response
    }
};

