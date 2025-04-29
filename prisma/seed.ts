import { PrismaClient } from '@prisma/client';
import { User } from './seed-data';

export const initDatabase = async () => {
  const prisma = new PrismaClient();

  // 创建用户数据
  await prisma.users.createMany({ data: User, skipDuplicates: true });

};

initDatabase();
