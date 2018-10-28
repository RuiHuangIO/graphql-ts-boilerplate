import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  // use string so it's not guessable

  @Column("varchar", { length: 255 })
  email: string;
  // good to have max length
  // we can add "unique: true" here to do error check,
  // but this is less flexible when we want to allow email null

  @Column("text")
  password: string;
  // using text since we are going to hash

  @Column("boolean", { default: false })
  confirmed: boolean;
}
