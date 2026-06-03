import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nama: string;
  email: string;
  password: string;
  telepon?: string;
  alamat?: string;
}

export interface UserResponse {
  id: string;
  nama: string;
  email: string;
  role: string;
  saldo: number;
  totalSetoran: number;
  telepon?: string;
  alamat?: string;
  rekeningBank?: string;
  nomorRekening?: string;
  namaRekening?: string;
  createdAt: Date;
  tanggalBergabung?: Date;
  penimbanganPertama?: Date;
}

export class AuthService {
  static async login(data: LoginRequest): Promise<UserResponse | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (!user) {
        logger.warn('Login failed: user not found', { email: data.email });
        return null;
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        logger.warn('Login failed: invalid password', { email: data.email });
        return null;
      }

      logger.info('User login successful', { userId: user.id, email: user.email });

      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Login service error', error);
      throw error;
    }
  }

  static async register(data: RegisterRequest): Promise<UserResponse> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('Email sudah terdaftar');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          nama: data.nama,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          telepon: data.telepon || null,
          alamat: data.alamat || null,
          role: 'NASABAH',
          tanggalBergabung: new Date(),
        },
      });

      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
      });

      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Register service error', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<UserResponse | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      logger.error('Get user by ID error', error);
      throw error;
    }
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private static formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      saldo: parseFloat(user.saldo),
      totalSetoran: parseFloat(user.totalSetoran),
      telepon: user.telepon,
      alamat: user.alamat,
      rekeningBank: user.rekeningBank,
      nomorRekening: user.nomorRekening,
      namaRekening: user.namaRekening,
      createdAt: user.createdAt,
      tanggalBergabung: user.tanggalBergabung,
      penimbanganPertama: user.penimbanganPertama,
    };
  }
}
