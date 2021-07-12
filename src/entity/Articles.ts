import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Edition } from "./Editions";

@ObjectType()
@Entity("articles")
export class Article extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  desc: string;

  @Field()
  @Column()
  href: string;

  @Field(() => Edition)
  @ManyToOne(() => Edition, (editions) => editions.articles)
  Edition: Edition;
}
