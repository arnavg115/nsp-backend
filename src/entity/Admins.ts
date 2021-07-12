import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("admins")
export class admins extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column("bigint")
  timestamp: number;
}
