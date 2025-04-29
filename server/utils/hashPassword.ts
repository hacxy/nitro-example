import bcrypt from "bcryptjs";

export const hashPassword = async (password: string, salt: number = 12) => {
  return await bcrypt.hash(password, salt);
};
export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};


