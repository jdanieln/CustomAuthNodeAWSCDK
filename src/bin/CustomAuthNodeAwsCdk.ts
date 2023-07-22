#!/usr/bin/env node
import {InfraStack} from "../lib/infrastructure/InfraStack";

require("dotenv").config();
import * as cdk from 'aws-cdk-lib';

const stackEnv = process.env.STACK_ENV || "prod";
const app = new cdk.App();

const prefix = `${stackEnv}-custom-auth`;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '';

new InfraStack(app, `${prefix}-infra`, {
    prefix,
    jwtExpiresIn
});

