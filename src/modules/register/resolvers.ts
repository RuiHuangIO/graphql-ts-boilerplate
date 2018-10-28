import { ResolverMap } from "../../types/graphql-utils";
import * as bcrypt from "bcryptjs";
import * as yup from "yup";
import { GQL } from "../../types/schema";
import { User } from "../../entity/User";
import { formatYupError } from "../../utils/formatYupError";
import {
  emailTaken,
  emailTooShort,
  invlidEmail,
  passwordTooShort
} from "./errorMessages";
import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import { sendEmail } from "../../utils/sendEmail";
import { v4 } from "uuid";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailTooShort)
    .max(255)
    .email(invlidEmail),
  password: yup
    .string()
    .min(3, passwordTooShort)
    .max(255)
  // good to have hard caps on length
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;
      const userExists = await User.findOne({
        where: { email },
        select: ["id"]
      });
      if (userExists) {
        // can throw error here, but we can return error as an object
        return [
          {
            path: "email",
            message: emailTaken
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        id: v4(),
        email,
        password: hashedPassword
      });
      await user.save();

      if (process.env.NODE_ENV !== "test") {
        await sendEmail(
          email,
          await createConfirmEmailLink(url, user.id, redis)
        );
      }

      return null;
    }
  }
};
