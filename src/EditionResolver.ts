import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Article } from "./entity/Articles";
import { Edition } from "./entity/Editions";
import { isAdmin } from "./isAdmin";
import { isAuth } from "./isAuth";
import { kebabCase } from "./utils/strings";
import { send } from "./sendEmail";
@Resolver()
export class EditionResolver {
  @Query(() => [Edition])
  async getAll() {
    return await Edition.find({ relations: ["articles"] });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async addOneEdition(
    @Arg("name") name: string,
    @Arg("num", () => Int) num: number
  ): Promise<boolean> {
    const ed = await Edition.findOne({ where: { num } });
    if (ed) {
      throw new Error("Edition already exists");
    }
    try {
      await Edition.insert({
        name,
        num,
      });
    } catch (err) {
      throw new Error("Error adding Edition");
    }
    try {
      send(
        `Hi There 👋 ,\nWe Released a new Edition.\n To checkout our new Edition, ${name} click here.`,
        `<div>
        <h1><strong>Hi There 👋,</strong></h1>
        <h3>We released a new Edition.</h3>
        <p>To checkout our new Edition ${name} click <a href="https://new-solutions-project.vercel.app/edition/${num}">here</a></p>
      </div>`,
        `New Edition: Edition ${num}`
      );

      return true;
    } catch (err) {
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async addOneArticle(
    @Arg("name") name: string,
    @Arg("desc") desc: string,
    @Arg("Edition_Num", () => Int) Edition_Num: number
  ): Promise<boolean> {
    const ed = await Edition.findOne({ where: { num: Edition_Num } });
    if (!ed) {
      throw new Error("No edition found");
    }
    const href = kebabCase(name);
    try {
      await Article.insert({
        href,
        desc,
        name,
        Edition: ed,
      });

      return true;
    } catch (err) {
      return false;
    }
  }
}
