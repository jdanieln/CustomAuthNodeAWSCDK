export class ErrorsService {
    public readonly INVALID_BODY_PARAMS: string = 'solicitud no válida, parámetros incorrectos en el cuerpo de la solicitud';
    public readonly INCORRECT_CREDENTIALS: string = 'Credenciales incorrectas';
    public readonly USER_ALREADY_EXISTS: string = 'El usuario ya existe';
    public readonly GROUP_NOT_EXISTS: string = 'El grupo no existe';
    public readonly RESERVED_RESPONSE: string = `Error: You're using AWS reserved keywords as attributes`;
    public readonly DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

}