import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
const hashedAdminPassword = bcrypt.hashSync('Kale@9699', salt);

export const mockUsers = [
  {
    _id: 'mock-user-admin',
    name: 'Admin User',
    email: 'kalemahesh082003@gmail.com',
    password: hashedAdminPassword,
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockResumes = [];
export const mockResults = [];
