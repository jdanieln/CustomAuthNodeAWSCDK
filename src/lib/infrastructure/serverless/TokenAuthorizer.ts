import { Construct } from "constructs";
import {Code} from "aws-cdk-lib/aws-lambda";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {StackProps} from "aws-cdk-lib";

interface TokenAuthorizerProps extends StackProps {
    lambdasPath: string;
    USERS_TABLE_NAME: string;
}
export class TokenAuthorizer {
    private readonly runtime = lambda.Runtime.NODEJS_14_X;
    private readonly code: Code;
    public readonly authorizer: lambda.Function;

    constructor(scope: Construct, props: TokenAuthorizerProps) {

        this.code = lambda.Code.fromAsset(props.lambdasPath);

        this.authorizer = new lambda.Function(scope, 'TokenAuthorizer', {
            runtime: this.runtime,
            code: this.code,
            handler: 'authorizer.handler',
            environment: {
                USERS_TABLE_NAME: props.USERS_TABLE_NAME
            }
        });
    }
}
