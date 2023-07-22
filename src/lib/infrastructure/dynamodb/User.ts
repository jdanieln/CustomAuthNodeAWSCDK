import {Construct} from "constructs";
import {AttributeType, Table} from "aws-cdk-lib/aws-dynamodb";
import * as cdk from 'aws-cdk-lib';
export interface TableProps {
    prefix: string;
    context: Construct;
}
export class User {

    private readonly _table: Table;
    private static instance: User;
    private _primaryKey: string = 'userId';

    private constructor(props: TableProps) {

        const tableName = `${ props.prefix }-users`;

        this._table = new Table(props.context, tableName, {
            partitionKey: {
                name: this._primaryKey,
                type: AttributeType.STRING,
            },
            tableName: tableName,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });

        this._table.addGlobalSecondaryIndex({
            indexName: 'userNameIndex',
            partitionKey: {
                name: 'userName',
                type: AttributeType.STRING
            }
        });
    }

    public static getInstance(props?: TableProps): User {
        if(!User.instance && props) {
            User.instance = new User(props);
        }

        return User.instance;
    }

    public get table() {
        return this._table;
    }

    public get primaryKey() {
        return this._primaryKey;
    }
}