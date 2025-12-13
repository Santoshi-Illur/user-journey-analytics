import React, { useMemo, useState } from "react";
import KPIChartCard from "../components/Dashboard/KPIChartCard";
import VirtualizedUsersTable from "../components/Dashboard/VirtualizedUsersTable";

interface User {
  id: string;
  name: string;
  device: string;
  country: string;
  pagesVisited: number;
  purchases: number;
  timeSpent: number;
}

const mockUsers: User[] = [
  { id: "1", name: "John", device: "Mobile", country: "USA", pagesVisited: 5, purchases: 2, timeSpent: 12 },
  { id: "2", name: "Sara", device: "Laptop", country: "India", pagesVisited: 9, purchases: 1, timeSpent: 21 },
  { id: "3", name: "Kumar", device: "Tablet", country: "UAE", pagesVisited: 4, purchases: 0, timeSpent: 8 },
  { id: "4", name: "Rita", device: "Mobile", country: "UK", pagesVisited: 7, purchases: 3, timeSpent: 18 }
];

const UserJourneyDashboard: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      return (
        (filter === "" || u.name.toLowerCase().includes(filter.toLowerCase())) &&
        (deviceFilter === "" || u.device === deviceFilter) &&
        (countryFilter === "" || u.country === countryFilter)
      );
    });
  }, [filter, deviceFilter, countryFilter]);

  const clearFilters = () => {
    setFilter("");
    setDeviceFilter("");
    setCountryFilter("");
  };

  // KPI Data
  const purchaseData = mockUsers.map((u) => u.purchases);
  const sessionData = mockUsers.map((u) => u.pagesVisited);
  const timeData = mockUsers.map((u) => u.timeSpent);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Journey Dashboard</h2>

      {/* KPI Section */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <KPIChartCard
          title="Total Purchases"
          value={purchaseData.reduce((a, b) => a + b, 0)}
          data={purchaseData}
        />

        <KPIChartCard
          title="Total Sessions"
          value={sessionData.reduce((a, b) => a + b, 0)}
          data={sessionData}
        />

        <KPIChartCard
          title="Total Time Spent"
          value={timeData.reduce((a, b) => a + b, 0)}
          data={timeData}
        />
      </div>

      {/* Filters */}
      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by name"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)}>
          <option value="">Device (All)</option>
          <option value="Mobile">Mobile</option>
          <option value="Laptop">Laptop</option>
          <option value="Tablet">Tablet</option>
        </select>

        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
          <option value="">Country (All)</option>
          <option value="USA">USA</option>
          <option value="India">India</option>
          <option value="UAE">UAE</option>
          <option value="UK">UK</option>
        </select>

        <button onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Table */}
      <div style={{ marginTop: "30px", height: "500px" }}>
        <VirtualizedUsersTable users={filteredUsers} height={500} />
      </div>
    </div>
  );
};

export default UserJourneyDashboard;
