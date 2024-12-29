import { type User } from '@/db/types';
import { getApiUrl } from '@/lib/utils';

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${getApiUrl()}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await response.json();
  return data["users"];
}

export async function getUserById(userId: string): Promise<User> {
  const response = await fetch(`${getApiUrl()}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data["user"];
}
