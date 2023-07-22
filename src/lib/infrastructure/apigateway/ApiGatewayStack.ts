import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Method, RestApi} from "aws-cdk-lib/aws-apigateway";
import {DataStack} from "../dynamodb/DataStack";
import {ServerlessStack} from "../serverless/ServerlessStack";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {addCorsOptions} from "../services/cors";
import {User} from "../dynamodb/User";
import {TokenAuthorizer} from "../serverless/TokenAuthorizer";
interface ApiGatewayProps extends NestedStackProps {
    prefix: string;
    readonly restApi: RestApi;
    lambdasPath: string;
    dataStack: DataStack;
    serverLessStack: ServerlessStack;
}

export class ApiGatewayStack extends NestedStack {
    public readonly methods: Array<Method> = [];
    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id, props);

        const healthCheckIntegration = new apigateway.LambdaIntegration(props.serverLessStack.healthCheck);

        const apiGateway = RestApi.fromRestApiAttributes(this, props.restApi.restApiName, {
            restApiId: props.restApi.restApiId,
            rootResourceId: props.restApi.root.resourceId
        });

        const user = User.getInstance();

        const tokenAuthorizerLambda = new TokenAuthorizer(this, {
            lambdasPath: props.lambdasPath,
            USERS_TABLE_NAME: user.table.tableName
        });
        const customAuthorizer = new apigateway.TokenAuthorizer(this, `CustomTokenAuthorizer`, {
            handler: tokenAuthorizerLambda.authorizer,
        });

        const healthCheckRoot = apiGateway.root.addResource("health-check");
        const healthCheckRootMethod = healthCheckRoot.addMethod("GET", healthCheckIntegration, {
            authorizer: customAuthorizer
        });
        this.methods.push(healthCheckRootMethod);
        addCorsOptions(healthCheckRoot);

    }
}