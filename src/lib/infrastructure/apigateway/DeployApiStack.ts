import {NestedStack, NestedStackProps } from "aws-cdk-lib";
import {Construct} from "constructs";
import {Deployment, Method, RestApi, Stage} from "aws-cdk-lib/aws-apigateway";

interface DeployStackProps extends NestedStackProps {
    prefix: string;
    restApi: RestApi;
    methods: Method[];
}
export class DeployApiStack extends NestedStack {
    constructor(scope: Construct, props: DeployStackProps) {
        super(scope, `${ props.prefix }ApiDeployStack`, props);

        const deployment = new Deployment(this, `${ props.prefix }Deployment`, {
            api: RestApi.fromRestApiId(this, props.restApi.restApiName, props.restApi.restApiId),
        });
        if (props.methods) {
            for (const method of props.methods) {
                deployment.node.addDependency(method);
            }
        }
        new Stage(this, `${ props.prefix }Stage`, { deployment });
    }
}