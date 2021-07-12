import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Article } from "./Articles";

@ObjectType()
@Entity("editions")
export class Edition extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column("int")
  num: number;

  @Field()
  @Column()
  name: string;

  @Field(() => [Article])
  @OneToMany(() => Article, (articles) => articles.Edition)
  articles: Article[];
}
