import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("email")
export class Email extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id:string

    @Column()
    email:string
}