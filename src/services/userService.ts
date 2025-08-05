import { PrismaClient, User } from '@prisma/client';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * Create a new user with email uniqueness check
 * @param userData - User data to create
 * @returns Promise<UserResponse> - Created user data (without password)
 * @throws Error if email already exists for active user
 */
export async function createUser(userData: CreateUserData): Promise<UserResponse> {
  const { email, name, password } = userData;

  // Validar contraseña fuerte: mínimo 8 caracteres, letras y números
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    throw new Error('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.');
  }

  // Validar email de dominio permitido
  if (!/^([\w.-]+)@(gmail|hotmail|outlook|yahoo)\.com$/i.test(email)) {
    throw new Error('Solo se permiten correos de Gmail, Hotmail, Outlook o Yahoo.');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser && existingUser.isActive) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const passwordHash = await hashPassword(password);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      isActive: true,
      lastLoginAt: new Date(),
    },
    create: {
      email,
      name,
      passwordHash,
      isActive: true,
    },
  });

  // Return user data without password
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Find a user by email
 * @param email - User email to search for
 * @returns Promise<User | null> - User data or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email }
  });
}

/**
 * Update user's last login timestamp
 * @param userId - User ID to update
 * @returns Promise<UserResponse> - Updated user data
 */
export async function updateLastLogin(userId: string): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}/**

 * Check if a user account is expired (> 30 days since last login)
 * @param user - User object to check
 * @returns boolean - True if account is expired, false otherwise
 */
export function isAccountExpired(user: User): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return user.lastLoginAt < thirtyDaysAgo;
}

/**
 * Reactivate an expired user account with new password
 * @param email - User email to reactivate
 * @param newPassword - New password for the account
 * @returns Promise<UserResponse> - Reactivated user data
 * @throws Error if user not found or account is not expired
 */
export async function reactivateUser(email: string, newPassword: string): Promise<UserResponse> {
  const existingUser = await findUserByEmail(email);
  
  if (!existingUser) {
    throw new Error('User not found');
  }

  if (existingUser.isActive && !isAccountExpired(existingUser)) {
    throw new Error('Account is still active and not expired');
  }

  // Hash the new password
  const passwordHash = await hashPassword(newPassword);

  // Update user with new password and reactivate
  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      isActive: true,
      lastLoginAt: new Date(),
    }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Deactivate a user account
 * @param userId - User ID to deactivate
 * @returns Promise<UserResponse> - Deactivated user data
 */
export async function deactivateUser(userId: string): Promise<UserResponse> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Find users with lastLoginAt > 30 days (inactive users)
 * @returns Promise<User[]> - Array of inactive users
 */
export async function findInactiveUsers(): Promise<User[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return await prisma.user.findMany({
    where: {
      lastLoginAt: {
        lt: thirtyDaysAgo
      }
    }
  });
}

/**
 * Delete inactive users from database
 * @returns Promise<{ count: number, deletedUsers: string[] }> - Count and IDs of deleted users
 */
export async function deleteInactiveUsers(): Promise<{ count: number, deletedUsers: string[] }> {
  const inactiveUsers = await findInactiveUsers();
  const deletedUserIds = inactiveUsers.map(user => user.id);

  if (inactiveUsers.length === 0) {
    return { count: 0, deletedUsers: [] };
  }

  // Delete users in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({
      where: {
        id: {
          in: deletedUserIds
        }
      }
    });
  });

  return {
    count: inactiveUsers.length,
    deletedUsers: deletedUserIds
  };
}