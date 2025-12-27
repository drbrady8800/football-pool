import { useQuery } from '@tanstack/react-query';
import { getUsers, getUserById } from '@/lib/api/users';
import { type User } from '@/db/types';

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });
}

export function useUserById(userId: string) {
  return useQuery<User>({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}
