import { importSchema } from "graphql-import";
import { GraphQLServer } from "graphql-yoga";
import { GraphQLSchema } from "graphql";
import { createTypeormConn } from "./utils/createTypeormConn";
import * as path from "path";
// use this to resolve the problem with paths when using importSchema
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};
