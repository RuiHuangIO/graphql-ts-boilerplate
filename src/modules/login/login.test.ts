// To test successful user login, we are going to register a user, then confirm the email and login.

import { request } from "graphql-request";
import { loginError, unconfirmedEmail } from "./errorMessage";
import { User } from "../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { Connection } from "typeorm";

const email = "mochi@ruihuang.io";
const password = "123456";

const registerMutation = (e: string, p: string) => `
mutation{
  register(email:"${e}", password:"${p}"){
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation{
  login(email:"${e}", password:"${p}"){
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
// Make error logging in as a function, with parameters e(email), p(password), errMsg(expected error message)

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

describe("Login", () => {
  test("Test login with email not registered", async () => {
    await loginExpectError("cookie@ruihuang.io", "123456", loginError);
    // use a email that is not in db
  });

  test("Login when email is not confirmed", async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    await loginExpectError(email, password, unconfirmedEmail);

    User.update({ email }, { confirmed: true });

    await loginExpectError(email, "wrongpassword", loginError);

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({ login: null });
  });
});
