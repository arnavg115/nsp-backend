import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Email } from "./entity/Email";
import { isAdmin } from "./isAdmin";
import { isAuth } from "./isAuth";

@Resolver()
export class EmailResolver {
  @Mutation(() => Boolean)
  async addEmail(@Arg("email") email: string) {
    const em = await Email.findOne({ where: { email } });
    if (em) {
      return false;
    }
    try {
      Email.insert({
        email,
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  @Query(() => [Email])
  @UseMiddleware(isAuth, isAdmin)
  async getAllEmails(): Promise<Email[]> {
    return await Email.find();
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async DeleteEmail(@Arg("email") email: string) {
    try {
      await Email.delete({ email });
      return true;
    } catch (err) {
      return false;
    }
  }
}
