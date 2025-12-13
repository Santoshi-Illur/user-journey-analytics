import { useState, useEffect } from "react";
import { type IUser, mockUsers } from "../mock/mockUsers";

export const UserList = () => {
  const [users] = useState<IUser[]>(mockUsers); //setUsers(removed for now)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter users based on search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search)
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  useEffect(() => {
    setPage(1); // Reset to first page on search change
  }, [search]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User List</h1>
        <input
          type="text"
          placeholder="Search users by name, email, ID"
          className="border p-2 rounded w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Registered</th>
            <th className="p-2">Last Active</th>
            <th className="p-2">Sessions</th>
            <th className="p-2">Purchases</th>
            <th className="p-2">Total $</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <td className="p-2">{user.id}</td>
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.registrationDate}</td>
              <td className="p-2">{user.lastActive}</td>
              <td className="p-2">{user.sessions}</td>
              <td className="p-2">{user.purchaseCount}</td>
              <td className="p-2">${user.totalSpend}</td>
              <td className={`p-2 font-semibold ${user.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                {user.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {(page - 1) * itemsPerPage + 1}-
          {Math.min(page * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>
        <div>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="border px-3 py-1 rounded mr-2"
          >
            Prev
          </button>
          <span className="mx-2">{page}</span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="border px-3 py-1 rounded ml-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
