import { GraphQLClient } from "graphql-request";
import { getSdk } from "./graphql.request";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// source environment variables
dotenv.config();

// parse the key out of the HASURA_GRAPHQL_JWT_SECRET environment variable
let secret = "";
try {
  secret = JSON.parse(process.env.HASURA_GRAPHQL_JWT_SECRET!).key;
} catch (e) {
  console.error(
    "HASURA_GRAPHQL_JWT_SECRET must be parsable json and have property key"
  );
  process.exit(1);
}

type UserOptions = {
  allowedRoles?: string[];
  defaultRole: string;
  userId: string;
  username: string;
};

type AdminOptions = {
  admin: boolean;
};

// define the configuration options for the client
type Options = UserOptions | AdminOptions;

// map the default role to the corresponding header
const mapOptionsToHeaders = (options: UserOptions) => ({
  "x-hasura-role": options.defaultRole,
});

// generate a JWT that includes roles, userId, and username
const generateJwt = (options: UserOptions): string =>
  jwt.sign(
    JSON.stringify({
      roles: options.allowedRoles,
      userId: options.userId,
      username: options.username,
    }),
    secret
  );

// configure the client
export default (options: Options): ReturnType<typeof getSdk> => {
  if (!process.env.GRAPHQL_ENDPOINT) {
    throw new Error("GRAPHQL_ENDPOINT is not defined");
  }
  if (!process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
    throw new Error("HASURA_GRAPHQL_ADMIN_SECRET is not defined");
  }

  // if we do not provide allowedRoles for the client we assume that the defaultRole is an allowed role
  if ('defaultRole' in options && !options.allowedRoles) {
    options.allowedRoles = [options.defaultRole];
  }

  // either configure an admin client (without JWT) or a user client (with JWT)
  const client = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
    headers: 'admin' in options
      ? { "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET }
      : {
          Authorization: `Bearer ${generateJwt(options)}`,
          ...mapOptionsToHeaders(options),
        },
  });

  return getSdk(client);
};
