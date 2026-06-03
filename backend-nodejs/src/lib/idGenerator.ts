import { prisma } from './prisma.js';

export async function generateNextUserId(role: 'NASABAH' | 'PETUGAS' | 'PENGURUS'): Promise<string> {
  let prefix = 'NS';
  if (role === 'PENGURUS') prefix = 'ADMIN';
  if (role === 'PETUGAS') prefix = 'STAFF';

  const users = await prisma.user.findMany({
    where: {
      role: role,
      id: {
        startsWith: prefix,
      },
    },
    select: {
      id: true,
    },
  });

  const numbers = users
    .map((u) => {
      const match = u.id.match(new RegExp(`^${prefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `${prefix}${padded}`;
}
