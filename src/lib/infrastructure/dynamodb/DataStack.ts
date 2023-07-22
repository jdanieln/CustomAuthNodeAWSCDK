import {Stack} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import {Construct} from "constructs";
import {User} from "./User";
export interface DataProps extends cdk.StackProps {
    prefix: string;
}
export class DataStack extends Stack {
    constructor(scope: Construct, id: string, props: DataProps) {
        super(scope, id, props);

        User.getInstance({
            context: this,
            prefix: props.prefix
        });
    }
}