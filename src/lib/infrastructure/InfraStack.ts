import * as cdk from 'aws-cdk-lib';
import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {RestApi} from "aws-cdk-lib/aws-apigateway";
import {DataStack} from "./dynamodb/DataStack";
import {ServerlessStack} from "./serverless/ServerlessStack";
import {User} from "./dynamodb/User";
import {AuthApiGatewayStack} from "./apigateway/AuthApiGatewayStack";
import {DeployApiStack} from "./apigateway/DeployApiStack";
import {ApiGatewayStack} from "./apigateway/ApiGatewayStack";

export interface InfraProps extends cdk.StackProps {
    prefix: string;
    jwtExpiresIn: string;
}
export class InfraStack extends Stack {
    constructor(scope: Construct, id: string, props: InfraProps) {
        super(scope, id, props);

        const prefix = props.prefix;

        const restApi = new RestApi(this, `${prefix}-rest-api`, {
            deploy: false
        });
        restApi.root.addMethod('ANY');

        const lambdasPath: string = 'build/lambdas';
        const jwtExpiresIn = props.jwtExpiresIn;

        const dataStack = new DataStack(this, `${prefix}-data`, {
            prefix
        });

        const userTable = User.getInstance();
        const serverLessStack = new ServerlessStack(this, `${prefix}-serverless`, {
            dataStack,
            jwtExpiresIn: jwtExpiresIn,
            lambdasPath,
            USER_TABLE_NAME: userTable.table.tableName,
            USER_TABLE_PRIMARY_KEY: userTable.primaryKey
        });

        const authApiGateWayStack = new AuthApiGatewayStack(this, `${prefix}-auth-api-gateway`, {
            dataStack,
            serverLessStack,
            prefix,
            restApi
        });

        const apiGateWayStack = new ApiGatewayStack(this, `${prefix}-api-gateway`, {
            dataStack,
            serverLessStack,
            lambdasPath,
            prefix,
            restApi
        });

        new DeployApiStack(this, {
            prefix,
            restApi,
            methods: authApiGateWayStack.methods.concat(apiGateWayStack.methods)
        });
    }
}