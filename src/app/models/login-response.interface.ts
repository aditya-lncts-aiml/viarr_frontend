// src/app/models/login-response.interface.ts
export interface LoginResponse {
    token: string;  // The JWT token returned by the backend after successful login
    // You can add other properties here, e.g., user details
    // For example: user: { id: number, name: string }
  }