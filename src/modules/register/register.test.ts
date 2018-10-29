import { request } from "graphql-request";
import { User } from "../../entity/User";
import {
  emailTaken,
  emailTooShort,
  invlidEmail,
  passwordTooShort
} from "./errorMessages";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";

const email = "mochi@ruihuang.io";
const password = "123456";

const mutation = (e: string, p: string) => `
mutation{
  register(email:"${e}", password:"${p}"){
    path
    message
  }
}
`;

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(async () => {
  conn.close();
});

describe("Register user", async () => {
  test("Check for dupe emails", async () => {
    // check for success registration
    const response = await request(
      process.env.TEST_HOST as string,
      // we trust that this won't be null
      mutation(email, password)
    );
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // test for duplicate email
    const secondResponse: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, password)
    );
    expect(secondResponse.register).toHaveLength(1);
    expect(secondResponse.register[0]).toEqual({
      path: "email",
      message: emailTaken
    });
  });

  test("Check bad email", async () => {
    // catch bad email
    const ThirdResponse: any = await request(
      process.env.TEST_HOST as string,
      mutation("b", password)
    );
    expect(ThirdResponse).toEqual({
      register: [
        {
          path: "email",
          message: emailTooShort
        },
        {
          path: "email",
          message: invlidEmail
        }
      ]
    });
  });

  test("Check bad password", async () => {
    // check for valid password
    const FourthResponse: any = await request(
      process.env.TEST_HOST as string,
      mutation(email, "ab")
    );
    expect(FourthResponse).toEqual({
      register: [
        {
          path: "password",
          message: passwordTooShort
        }
      ]
    });
  });

  test("Check bad password and bad email", async () => {
    // check for both email and password
    const FifthResponse: any = await request(
      process.env.TEST_HOST as string,
      mutation("ab", "ab")
    );
    expect(FifthResponse).toEqual({
      register: [
        {
          path: "email",
          message: emailTooShort
        },
        {
          path: "email",
          message: invlidEmail
        },
        {
          path: "password",
          message: passwordTooShort
        }
      ]
    });
  });
});
