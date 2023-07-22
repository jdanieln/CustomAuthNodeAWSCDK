import { Table} from "aws-cdk-lib/aws-dynamodb";
import * as lambda from 'aws-cdk-lib/aws-lambda';
export class TableSecurity {

    constructor(private table: Table) {
    }

    public grantReadWriteData(lambdaFunction: lambda.Function): void {
        this.table.grantReadWriteData(lambdaFunction);
    }

    public grantReadData(lambdaFunction: lambda.Function): void {
        this.table.grantReadData(lambdaFunction);
    }

    public grantWriteData(lambdaFunction: lambda.Function): void {
        this.table.grantWriteData(lambdaFunction);
    }
}
