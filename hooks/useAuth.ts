"use client";

import { useEffect, useState } from "react";

export interface User {
  _id: string;
  name?: string;
  email: string;
  avatar?: string;
  token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get user from localStorage or session
    try {
      const storedUser = localStorage.getItem("pet-connect-user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser({
          _id: userData.id || userData._id,
          name: userData.fullName || userData.name,
          email: userData.email,
          avatar: userData.avatarUrl || userData.avatar,
          token: userData.token,
        });
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { user, isLoading };
}
