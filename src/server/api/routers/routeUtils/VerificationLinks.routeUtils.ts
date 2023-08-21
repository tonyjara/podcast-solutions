import jwt from "jsonwebtoken";

export const makeSignedToken = ({
  email,
  firstName,
  lastName,
  uuid,
  secret,
}: {
  email: string;
  firstName: string;
  lastName: string;
  uuid: string;
  secret: string;
}) =>
  jwt.sign(
    {
      data: {
        email,
        firstName,
        lastName,
        linkId: uuid,
      },
    },
    secret,
    { expiresIn: 60 * 60 },
  );
