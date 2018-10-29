import { GraphQLServer } from "graphql-yoga";
import * as session from "express-session";
import { createTypeormConn } from "./utils/createTypeormConn";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { generateSchema } from "./utils/generateSchema";
import * as connectRedis from "connect-redis";
import "dotenv/config";

const SESSION_SECRET = process.env.SESSION_SECRET as string;
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: generateSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session
    })
  });

  server.express.use(
    session({
      store: new RedisStore({}),
      name: "mochi",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // no need https for development
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const cors = {
    // where front end will be
    credentials: true,
    origin: process.env.FRONTEND_HOST as string
  };

  server.express.get("/confirm/:id", confirmEmail);

  await createTypeormConn();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test" ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");
  return app;
};
