import * as jwt from 'jsonwebtoken';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    generateTokens: (data: any) => {
        const {
            userData,
            SECRET,
            REFRESH_SECRET,
            JWT_EXPIRES_IN,
            REFRESH_JWT_EXPIRES_IN
        } = data;

        const token = jwt.sign(userData, SECRET, { expiresIn: JWT_EXPIRES_IN });
        const refreshToken = jwt.sign(userData, REFRESH_SECRET, { expiresIn: REFRESH_JWT_EXPIRES_IN });
        return { token, refreshToken };
    },
    decodeToken: (token: string, SECRET: string) => {
        return jwt.verify(token, SECRET);
    },
    setHeaders: (token: string, refreshToken: string) => {
        return {
            'X-Authorization-token': token,
            'X-Authorization-refresh-token': refreshToken
        };
    },
    generatePolicy: (user: any, permissions: any, effect: any, methodArn: any) => {
        const authResponse: any = {};
        const { userId, companyId } = user;
        authResponse.principalId = userId;
        if (effect && methodArn) {
            const policyDocument: any = {};
            policyDocument.Version = '2012-10-17';
            policyDocument.Statement = [];

            console.log( '***', permissions, methodArn);
            permissions.forEach((permission: any) => {
                const methodArnArray = methodArn.split('/');
                permission.methods.filter((method: string) => !['PRINT', 'EXPORT']
                    .includes(method))
                    .forEach((method: string) => {
                        let resource: string = '';
                        resource = `${methodArnArray[0]}/${methodArnArray[1]}/${method}/${permission.resource}`;

                        console.log('resource:', resource);

                        if(method !== 'PUT' && method !== 'DELETE') {
                            const statement: any = {};
                            statement.Action = 'execute-controllers:Invoke';
                            statement.Effect = effect;
                            statement.Resource = resource;
                            policyDocument.Statement.push(statement);
                        }

                        if(['PUT', 'GET', 'DELETE'].includes(method)) {
                            const statementWithId: any = {};
                            statementWithId.Action = 'execute-controllers:Invoke';
                            statementWithId.Effect = effect;

                            statementWithId.Resource = `${ resource }/*`;
                            policyDocument.Statement.push(statementWithId);
                        }

                    });
            });

            authResponse.policyDocument = policyDocument;
        }

        authResponse.context = {
            'userId': `${ userId }`,
            'companyId': `${ companyId }`
        };

        return authResponse;
    },
    getRequestConext: (event: any) => {
        const {
            requestContext
        } = event;

        const {
            authorizer
        } = requestContext;

        return authorizer;
    }
}