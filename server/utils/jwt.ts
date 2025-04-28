import jwt from 'jsonwebtoken'

interface Account {
  username: string,
  password: string
}

export const useSignJwt = (payload: Account) => {
  return jwt.sign(
    payload,
    'tj991118.',
    // process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
}

