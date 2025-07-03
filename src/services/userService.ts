import { AuthUser, LoginDto, MOCK_ROLES, MOCK_USERS, Role, User } from '@/models/user';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Authenticate user with email and password
   * Only admin users can log in
   */
  public async authenticate(loginData: LoginDto): Promise<{ user?: AuthUser; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by email
    const user = MOCK_USERS.find(u => u.email === loginData.email);
    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Check password (in real app, this would be hashed comparison)
    if (user.password !== loginData.password) {
      return { error: 'Invalid email or password' };
    }

    // Check if user is verified
    if (!user.is_verified) {
      return { error: 'Account is not verified' };
    }

    // Check if user has admin role
    const role = MOCK_ROLES.find(r => r.id === user.role_id);
    if (!role || role.name !== 'admin') {
      return { error: 'Access denied. Only administrators can access this system.' };
    }

    // Return auth user object (without sensitive data)
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
      is_verified: user.is_verified
    };

    return { user: authUser };
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = MOCK_USERS.find(u => u.id === id);
      return user || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = MOCK_USERS.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  public async getAllUsers(): Promise<User[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return MOCK_USERS.map(user => ({
        ...user,
        password: '***' // Hide password in list
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get all roles
   */
  public async getAllRoles(): Promise<Role[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return MOCK_ROLES;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  /**
   * Check if user has specific role
   */
  public hasRole(user: AuthUser, roleName: string): boolean {
    return user.role.name === roleName;
  }

  /**
   * Check if user is admin
   */
  public isAdmin(user: AuthUser): boolean {
    return this.hasRole(user, 'admin');
  }

  /**
   * Check if user is partner
   */
  public isPartner(user: AuthUser): boolean {
    return this.hasRole(user, 'partner');
  }

  /**
   * Check if user is buyer
   */
  public isBuyer(user: AuthUser): boolean {
    return this.hasRole(user, 'buyer');
  }

  /**
   * Validate user data
   */
  public validateUserData(userData: Partial<User>): string[] {
    const errors: string[] = [];

    if (!userData.name || userData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.phone_number || userData.phone_number.trim().length < 10) {
      errors.push('Valid phone number is required');
    }

    if (!userData.nik || userData.nik.trim().length !== 16) {
      errors.push('NIK must be exactly 16 characters');
    }

    if (!userData.gender || !['male', 'female'].includes(userData.gender)) {
      errors.push('Valid gender is required');
    }

    return errors;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const userService = UserService.getInstance(); 