declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string | null;
        password: string;
        firstName?: string | null;
        lastName?: string | null;
        active: boolean;
        lastLogin?: Date | null;
        createdAt: Date;
        updatedAt: Date;
        profileId?: string | null;
        profile?: {
          id: string;
          name: string;
          permissions: any;
          createdAt?: Date;
          updatedAt?: Date;
        } | null;
      };
    }
  }
} 