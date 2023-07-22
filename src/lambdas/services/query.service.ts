interface QueryEqualsTo {
    tableName: string;
    field: string;
    value: string;
}

interface QueryFilterByCompany {
    tableName: string;
}

export const generateQueryEqualsTo =
    (query: QueryEqualsTo) => ({
        TableName: query.tableName,
        FilterExpression: `${ query.field }= :fieldValue`,
        ExpressionAttributeValues: {
            ':fieldValue': query.value
        }
    });