import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";
import cors from "cors";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
import { EditionResolver } from "./EditionResolver";
import { EmailResolver } from "./EmailResolver";
import sgMail from "@sendgrid/mail";

console.log("Hello");
(async () => {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(cookieParser());

  sgMail.setApiKey(process.env.SG_API_KEY!);
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;

    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (e) {
      return res.send({ ok: false, accessToken: "" });
    }

    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection({
    type: "postgres",
    url: process.env.POSTGRES_URI,
    synchronize: true,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, EditionResolver, EmailResolver],
    }),
    context: ({ req, res }) => ({
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });
  // if (process.env.NODE_ENV === "production") {
  //   app.listen(4000, () => {
  //     console.log("Express server started on port 4000");
  //   });
  // } else {
  const P = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  app.listen(P, () => {
    console.log("Express server started on port " + P);
  });
  // }
})();

// createConnection()
//   .then(async (connection) => {
//     console.log('Inserting a new user into the database...')
//     const user = new User()
//     user.firstName = 'Timber'
//     user.lastName = 'Saw'
//     user.age = 25
//     await connection.manager.save(user)
//     console.log('Saved a new user with id: ' + user.id)

//     console.log('Loading users from the database...')
//     const users = await connection.manager.find(User)
//     console.log('Loaded users: ', users)

//     console.log('Here you can setup and run express/koa/any other framework.')
//   })
//   .catch((error) => console.log(error))
