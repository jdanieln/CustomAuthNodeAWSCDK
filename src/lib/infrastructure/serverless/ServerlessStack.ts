import { Stack, StackProps} from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Code } from 'aws-cdk-lib/aws-lambda';
import {Construct} from "constructs";
import {DataStack} from "../dynamodb/DataStack";
import {TableSecurity} from "../security/TableSecurity";
import { User } from "../dynamodb/User";
interface ServerlessProps extends StackProps {
    dataStack: DataStack;
    jwtExpiresIn: string;
    lambdasPath: string;
    USER_TABLE_NAME: string;
    USER_TABLE_PRIMARY_KEY: string;
}
export class ServerlessStack extends Stack {
    private readonly runtime = lambda.Runtime.NODEJS_14_X;
    public readonly register: lambda.Function;

    public readonly healthCheck: lambda.Function;
    public readonly token: lambda.Function;
    private readonly code: Code;
    constructor(scope: Construct, id: string, props: ServerlessProps) {
        super(scope, id, props);

        this.code = lambda.Code.fromAsset(props.lambdasPath || '');

        this.register = new lambda.Function(scope, 'register', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.register',
            environment: {
                USER_TABLE_NAME: props.USER_TABLE_NAME,
                USER_TABLE_PRIMARY_KEY: props.USER_TABLE_PRIMARY_KEY,
            }
        });

        this.token = new lambda.Function(scope, 'token', {
            runtime: this.runtime,
            code: this.code,
            handler: 'user.token',
            environment: {
                USER_TABLE_NAME: props.USER_TABLE_NAME
            }
        });

        this.healthCheck = new lambda.Function(scope, 'health-check', {
            runtime: this.runtime,
            code: this.code,
            handler: 'health.check',
            environment: {
                USER_TABLE_NAME: props.USER_TABLE_NAME
            }
        });

        const userTable = User.getInstance();
        new TableSecurity(userTable.table).grantReadWriteData(this.register);
        new TableSecurity(userTable.table).grantReadWriteData(this.token);
    }
}