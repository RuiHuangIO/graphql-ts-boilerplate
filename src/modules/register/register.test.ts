import { request } from "graphql-request";
import { startServer } from "../../startServer";
import { User } from "../../entity/User";
import {
  emailTaken,
  emailTooShort,
  invlidEmail,
  passwordTooShort
} from "./errorMessages";

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

const mutation = (e: string, p: string) => `
mutation{
  register(email:"${e}", password:"${p}"){
    path
    message
  }
}
`;

test("Register user", async () => {
  // check for success registration
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // test for duplicate email
  const secondResponse: any = await request(
    getHost(),
    mutation(email, password)
  );
  expect(secondResponse.register).toHaveLength(1);
  expect(secondResponse.register[0]).toEqual({
    path: "email",
    message: emailTaken
  });

  // catch bad email
  const ThirdResponse: any = await request(getHost(), mutation("b", password));
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

  // check for valid password

  const FourthResponse: any = await request(getHost(), mutation(email, "ab"));
  expect(FourthResponse).toEqual({
    register: [
      {
        path: "password",
        message: passwordTooShort
      }
    ]
  });

  // check for both email and password

  const FifthResponse: any = await request(getHost(), mutation("ab", "ab"));
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
