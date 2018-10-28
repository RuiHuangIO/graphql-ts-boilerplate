import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";
import { GQL } from "../../types/schema";
import { loginError, unconfirmedEmail } from "./errorMessage";

const loginFailed = [
  {
    path: "email",
    message: loginError
  }
];

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye"
  },
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return loginFailed;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: unconfirmedEmail
          }
        ];
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return loginFailed;
      }

      return null;
    }
  }
};
