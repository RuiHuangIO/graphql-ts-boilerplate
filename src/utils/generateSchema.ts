import { importSchema } from "graphql-import";
import { GraphQLSchema } from "graphql";
import * as path from "path";
// use this to resolve the problem with paths when using importSchema
import * as fs from "fs";
import { mergeSchemas, makeExecutableSchema } from "graphql-tools";

export const generateSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "../modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  return mergeSchemas({ schemas });
};
