export function response(statusCodes: number, body: object | Array<object>) {
    return {
        statusCode: statusCodes,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
        },
        body: JSON.stringify(body)
    }
}