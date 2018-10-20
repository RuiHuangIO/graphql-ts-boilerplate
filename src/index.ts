import "reflect-metadata"; // Keeping this line for typeORM
import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import { resolvers } from "./resolvers";
import * as path from "path";
// use this to resolve the problem with paths when using importSchema
import { createConnection } from "typeorm";

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

  const server = new GraphQLServer({ typeDefs, resolvers });
  await createConnection();
  await server.start();
  console.log("Server is running on localhost:4000");
};

startServer();
