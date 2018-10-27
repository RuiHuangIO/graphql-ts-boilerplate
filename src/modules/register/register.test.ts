import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";

let getHost = () => "";

interface AddressInfo {
  address: string;
  family: string;
  port: number;
}

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = "mochi@ruihuang.io";
const password = "123456";

const mutation = `
mutation{
  register(email:"${email}", password:"${password}"){
    path
    message
  }
}
`;

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  const secondResponse: any = await request(getHost(), mutation);
  expect(secondResponse.register).toHaveLength(1);
  expect(secondResponse.register[0].path).toEqual("email");
  // expect(secondResponse).toEqual({
  //   register: [
  //     {
  //       path: "email",
  //       message: "Email is already used"
  //     }
  //   ]
  // });
  // We don't want above because changing message will fail the test.
});
