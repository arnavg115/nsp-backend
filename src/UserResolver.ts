import {
  Resolver,
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { hash, compare } from "bcryptjs";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { verify } from "jsonwebtoken";
import { admins } from "./entity/Admins";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
  @Field(() => User)
  user: User;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "Hi!";
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: MyContext) {
    return `Your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() context: MyContext) {
    const authorization = context.req.headers["authorization"];

    if (!authorization) {
      return null;
    }

    try {
      const token = authorization.split(" ")[1];
      const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
      const test = await User.findOne(payload.userId);
      return test;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new Error(`Invalid login.`);
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error(`Invalid login.`);
    }

    // Login successful
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
      user,
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");

    return true;
  }

  // @Mutation(() => Boolean)
  // async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
  //   await getConnection().getRepository(User).increment({ id: userId }, 'tokenVersion', 1)

  //   return true
  // }

  @Mutation(() => Boolean)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("adminPassword") adminPassword: string
  ) {
    const hashedPassword = await hash(password, 12);
    const res = await admins.findOne({ where: { code: adminPassword } });
    const len = !res && adminPassword.length === 6;
    const has = len
      ? process.env.ADMIN_PASSWORD?.includes(adminPassword)
      : false;
    const user = await User.findOne({ where: { username } });
    if (user) {
      throw new Error("User already registered");
    }
    try {
      const time = Date.now();
      if (has) {
        admins.insert({
          code: adminPassword,
          timestamp: time,
        });
      }
      await User.insert({
        username,
        password: hashedPassword,
        admin: has,
      });
    } catch (e) {
      console.log(e);
      return false;
    }

    return true;
  }
}
