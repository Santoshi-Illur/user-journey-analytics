export interface IUser {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  lastActive: string;
  sessions: number;
  purchaseCount: number;
  totalSpend: number;
  status: "active" | "inactive";
}

export const mockUsers: IUser[] = [
  {
    id: "001",
    name: "John Doe",
    email: "john@email.com",
    registrationDate: "2025-01-01",
    lastActive: "2025-12-08",
    sessions: 15,
    purchaseCount: 3,
    totalSpend: 120,
    status: "active"
  },
  {
    id: "002",
    name: "Jane Smith",
    email: "jane@email.com",
    registrationDate: "2025-02-05",
    lastActive: "2025-12-07",
    sessions: 10,
    purchaseCount: 1,
    totalSpend: 50,
    status: "inactive"
  },
  {
    id: "003",
    name: "Alice Johnson",
    email: "alice@email.com",
    registrationDate: "2025-03-12",
    lastActive: "2025-12-08",
    sessions: 20,
    purchaseCount: 5,
    totalSpend: 300,
    status: "active"
  },
  // Add more mock users as needed
];
