import { request } from "graphql-request";
import { host } from "./constants";
import { User } from "../src/entity/User";
import { createTypeormConn } from "../src/utils/createTypeormConn";

beforeAll(async () => {
  await createTypeormConn();
});

const email = "mochi@ruihuang.io";
const password = "123456";

const mutation = `
mutation{
  register(email:"${email}", password:"${password}")
}
`;

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

/*
TODO:
3. yarn test should start the server
4. test shouldn't create connection√
*/
