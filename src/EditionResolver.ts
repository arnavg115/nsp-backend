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
import Fuse from "fuse.js";

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
  @Query(() => Edition)
  async getOneEdition(
    @Arg("index", () => Int) index: number
  ): Promise<Edition> {
    const res = await Edition.findOne({
      where: { num: index },
      relations: ["articles"],
    });
    if (!res) {
      throw new Error("Edition not Found");
    }
    return res;
  }

  @Query(() => [Edition])
  async getSearch(@Arg("query") query: string) {
    const ls = await Edition.find({ relations: ["articles"] });
    let ret: any[] = [];
    const fuse = new Fuse(ls, {
      keys: ["name", "articles.desc", "articles.name"],
    });

    const res = fuse.search(query);
    res.forEach((x) => {
      ret.push(x.item);
    });
    return ret;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async deleteEdition(@Arg("id", () => Int) id: number) {
    const ed = await Edition.findOne({
      where: { id },
      relations: ["articles"],
    });
    if (!ed) {
      throw new Error("Not Found");
    }
    const lst: number[] = [];
    ed.articles.forEach((x) => {
      lst.push(x.id);
    });

    lst.forEach((y) => {
      Article.delete({ id: y });
    });

    try {
      await Edition.delete({ id });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async deleteArticle(@Arg("id", () => Int) id: number): Promise<boolean> {
    const art = await Article.findOne({ where: { id } });
    if (!art) {
      throw new Error("Not Found");
    }
    try {
      await Article.delete({ id });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
