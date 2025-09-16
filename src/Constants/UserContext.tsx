// context/UserContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from "react";

type TermData = {
  attendance: {
    value: number;
    maxValue: number;
    label: string;
  };
  position: {
    rank: string;
    percentage: number;
  };
};

type User = {
  firstName: string;
  lastName: string;
  name: string;
  id: string;
  grade?: string;
  term: string;
  avatarUrl: string;
  classCategory?: string;
  terms: Record<string, TermData>;
  setTerm: (term: string) => void;
};

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [term, setTerm] = useState("1st Term");

  const [user] = useState<Omit<User, "term" | "setTerm">>({
    name: "James Doe",
    firstName: "James",
    lastName: "Doe",
    id: "TR092018",
    grade: "Grade 7",
    avatarUrl: "/img/avatar.jpg",
    classCategory: "Science",
    terms: {
      "1st Term": {
        attendance: { value: 300, maxValue: 500, label: "Attendance" },
        position: { rank: "2nd", percentage: 65 }
      },
      "2nd Term": {
        attendance: { value: 400, maxValue: 500, label: "Attendance" },
        position: { rank: "1st", percentage: 90 }
      },
      "3rd Term": {
        attendance: { value: 250, maxValue: 500, label: "Attendance" },
        position: { rank: "3rd", percentage: 40 }
      }
    }
  });

  return (
    <UserContext.Provider value={{ ...user, term, setTerm }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
