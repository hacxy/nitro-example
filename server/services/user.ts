export const createUser = async (userInfo: any) => {
  await prisma.users.create({
    data: userInfo
  })
}

