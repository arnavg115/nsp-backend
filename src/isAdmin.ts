import { MiddlewareFn } from "type-graphql";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";

export const isAdmin: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.payload) {
    throw new Error("Internal Error");
  }
  const usr = await User.findOne({ where: { id: context.payload.userId } });
  if (!usr) {
    throw new Error("Not found");
  }
  if (!usr.admin) {
    throw new Error("Not admin user");
  }

  return next();
};
