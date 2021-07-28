// configuration for graphql codegen
module.exports = {
  schema: [
    {
      "http://localhost:8080/v1/graphql": {
        headers: {
          "x-hasura-admin-secret": "admin-secret",
        },
      },
    },
  ],
  documents: ["./tests/**/*.graphql"],
  overwrite: true,
  generates: {
    "./tests/utils/graphql.request.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
};
