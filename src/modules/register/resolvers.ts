import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import { GQL } from "../../types/schema";
import { User } from "../../entity/User";

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const userExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userExists) {
        // can throw error here, but we can return error as an object
        return [
          {
            path: "email",
            message: "Email is already used"
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword
      });
      await user.save();
      return null;
    }
  }
};
