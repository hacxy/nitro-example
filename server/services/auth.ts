import { Error } from "~/error/constants"

interface Account {
  username: string,
  password: string
}
export const login = async (account: Account) => {
  const result = await prisma.users.findUnique({
    where: { username: account.username }
  })

  if (!result) {
    throw createError(Error.INCORRECT_ACCOUNT_OR_PASSWORD)
  } else {
    if (account.password !== result.password) {
      throw createError(Error.INCORRECT_ACCOUNT_OR_PASSWORD)
    }
  }
  return result
}
