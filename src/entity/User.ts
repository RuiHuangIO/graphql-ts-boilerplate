import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  BaseEntity
} from "typeorm";
import * as uuidv4 from "uuid/v4";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;
  // use string so it's not guessable

  @Column("varchar", { length: 255 })
  email: string;
  // good to have max length

  @Column("text")
  password: string;
  // using text since we are going to hash

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }
}
