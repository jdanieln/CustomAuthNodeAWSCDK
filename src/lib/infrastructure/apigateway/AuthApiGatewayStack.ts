import {NestedStack, NestedStackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {ServerlessStack} from "../serverless/ServerlessStack";
import {DataStack} from "../dynamodb/DataStack";
import {Method, RestApi} from "aws-cdk-lib/aws-apigateway";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {addCorsOptions} from "../services/cors";
interface ApiGatewayProps extends NestedStackProps {
    prefix: string;
    readonly restApi: RestApi;
    dataStack: DataStack;
    serverLessStack: ServerlessStack;
}
export class AuthApiGatewayStack extends NestedStack {
    public readonly methods: Array<Method> = [];
    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id, props);

        const registerIntegration = new apigateway.LambdaIntegration(props.serverLessStack.register);
        const tokenIntegration = new apigateway.LambdaIntegration(props.serverLessStack.token);

        const apiGateway = RestApi.fromRestApiAttributes(this, props.restApi.restApiName, {
           restApiId: props.restApi.restApiId,
           rootResourceId: props.restApi.root.resourceId
        });

        const registerRoot = apiGateway.root.addResource("register");
        const registerRootPostMethod = registerRoot.addMethod("POST", registerIntegration);
        this.methods.push(registerRootPostMethod);
        addCorsOptions(registerRoot);

        const tokenRoot = apiGateway.root.addResource("token");
        const tokenRootPostMethod = tokenRoot.addMethod("POST", tokenIntegration);
        this.methods.push(tokenRootPostMethod);
        addCorsOptions(tokenRoot);
    }
}