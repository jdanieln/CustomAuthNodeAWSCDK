import {response} from "./services/response.service";
import {StatusCodes} from "http-status-codes";

exports.check = async function(event: any) {
    return response(StatusCodes.OK, {
        message: "Hello World!"
    });
}