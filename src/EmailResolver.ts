import { Arg, Mutation, Resolver } from "type-graphql";
import { Email } from "./entity/Email";

@Resolver()
export class EmailResolver {
  @Mutation(() => Boolean)
  async addEmail(@Arg("email") email: string) {
    try {
      Email.insert({
        email,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}
