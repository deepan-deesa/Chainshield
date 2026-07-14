import { RepositoryFactory } from '../repositories/factory';
import { PasswordUtil, TokenUtil, AppError, generateId } from '../utils';
import { JWTPayload, OfficerDTO, UserRole } from '../types';

export class AuthService {
  private get repo() {
    return RepositoryFactory.getOfficerRepository();
  }

  async register(data: any): Promise<{ officer: OfficerDTO; accessToken: string; refreshToken: string }> {
    // Check if email or badge already exists
    const existingEmail = await this.repo.findByEmail(data.email);
    if (existingEmail) {
      throw new AppError('Email address is already registered in the system', 400);
    }

    const existingBadge = await this.repo.findByBadgeNumber(data.badgeNumber);
    if (existingBadge) {
      throw new AppError('Badge reference number already exists', 400);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);
    
    // Create investigator profile
    const officer = await this.repo.create({
      ...data,
      passwordHash: hashedPassword
    });

    const payload: JWTPayload = {
      userId: officer.id,
      badgeNumber: officer.badgeNumber,
      name: officer.name,
      role: officer.role,
      department: data.department || 'Federal Crime Unit'
    };

    const accessToken = TokenUtil.generateAccessToken(payload);
    const refreshToken = TokenUtil.generateRefreshToken(payload);

    return { officer, accessToken, refreshToken };
  }

  async login(badgeNumber: string, pin: string): Promise<{ officer: OfficerDTO; accessToken: string; refreshToken: string }> {
    const officer = await this.repo.findByBadgeNumber(badgeNumber);
    if (!officer) {
      throw new AppError('Invalid investigator credentials', 401);
    }

    const hash = await this.repo.getPasswordHashByBadge(badgeNumber);
    if (!hash) {
      throw new AppError('Invalid investigator credentials', 401);
    }

    // Validate Password PIN
    const isValid = await PasswordUtil.compare(pin, hash);
    if (!isValid) {
      throw new AppError('Invalid investigator credentials', 401);
    }

    const payload: JWTPayload = {
      userId: officer.id,
      badgeNumber: officer.badgeNumber,
      name: officer.name,
      role: officer.role,
      department: (officer as any).department || 'Cyber Forensics Unit'
    };

    const accessToken = TokenUtil.generateAccessToken(payload);
    const refreshToken = TokenUtil.generateRefreshToken(payload);

    return { officer, accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = TokenUtil.verifyRefreshToken(token);
    
    const officer = await this.repo.findById(decoded.userId);
    if (!officer) {
      throw new AppError('Officer associated with this token no longer exists', 401);
    }

    const payload: JWTPayload = {
      userId: officer.id,
      badgeNumber: officer.badgeNumber,
      name: officer.name,
      role: officer.role,
      department: (officer as any).department || 'Cyber Forensics Unit'
    };

    const accessToken = TokenUtil.generateAccessToken(payload);
    const refreshToken = TokenUtil.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  async getProfile(userId: string): Promise<OfficerDTO> {
    const o = await this.repo.findById(userId);
    if (!o) {
      throw new AppError('Investigator profile not found', 404);
    }
    return o;
  }

  async updateProfile(userId: string, data: any): Promise<OfficerDTO> {
    const o = await this.repo.findById(userId);
    if (!o) {
      throw new AppError('Investigator profile not found', 404);
    }

    if (data.password) {
      data.passwordHash = await PasswordUtil.hash(data.password);
      delete data.password;
    }

    return this.repo.update(userId, data);
  }
}
