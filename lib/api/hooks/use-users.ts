import { useQuery } from '@tanstack/react-query';
import { getUsers, getUserById } from '../users';
import { type User } from '@/db/types';

export function useUsers(year: number) {
  return useQuery<User[]>({
    queryKey: ['users', year],
    queryFn: () => getUsers(year),
  });
}

export function useUserById(userId: string, year: number) {
  return useQuery<User>({
    queryKey: ['users', userId, year],
    queryFn: () => getUserById(userId, year),
    enabled: !!userId,
  });
}
