import * as cdk from 'aws-cdk-lib';
import {Stack} from "aws-cdk-lib";
import {Construct} from "constructs";
import {RestApi} from "aws-cdk-lib/aws-apigateway";

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

    }
}