import React, { useState } from "react";

type UserJourney = {
  userId: string;
  sessionStart: string;
  pagesVisited: number;
  itemsViewed: number;
  purchases: number;
  timeSpent: string;
  lastActivePage: string;
};

const mockData: UserJourney[] = [
  {
    "userId": "U1001",
    "sessionStart": "2025-12-09T10:01:00Z",
    "pagesVisited": 12,
    "itemsViewed": 5,
    "purchases": 1,
    "timeSpent": "14m 22s",
    "lastActivePage": "Product Details"
  },
  {
    "userId": "U1002",
    "sessionStart": "2025-12-09T10:05:00Z",
    "pagesVisited": 8,
    "itemsViewed": 3,
    "purchases": 0,
    "timeSpent": "09m 10s",
    "lastActivePage": "Search Results"
  },
  {
    "userId": "U1003",
    "sessionStart": "2025-12-09T10:10:00Z",
    "pagesVisited": 15,
    "itemsViewed": 7,
    "purchases": 2,
    "timeSpent": "21m 50s",
    "lastActivePage": "Checkout"
  },
  {
    "userId": "U1004",
    "sessionStart": "2025-12-09T10:14:00Z",
    "pagesVisited": 6,
    "itemsViewed": 2,
    "purchases": 0,
    "timeSpent": "05m 40s",
    "lastActivePage": "Home"
  },
  {
    "userId": "U1005",
    "sessionStart": "2025-12-09T10:20:00Z",
    "pagesVisited": 10,
    "itemsViewed": 4,
    "purchases": 1,
    "timeSpent": "11m 02s",
    "lastActivePage": "Cart"
  },
  {
    "userId": "U1006",
    "sessionStart": "2025-12-09T10:25:00Z",
    "pagesVisited": 18,
    "itemsViewed": 9,
    "purchases": 3,
    "timeSpent": "26m 45s",
    "lastActivePage": "Order Success"
  },
  {
    "userId": "U1007",
    "sessionStart": "2025-12-09T10:30:00Z",
    "pagesVisited": 7,
    "itemsViewed": 3,
    "purchases": 0,
    "timeSpent": "07m 20s",
    "lastActivePage": "Wishlist"
  },
  {
    "userId": "U1008",
    "sessionStart": "2025-12-09T10:40:00Z",
    "pagesVisited": 20,
    "itemsViewed": 11,
    "purchases": 2,
    "timeSpent": "29m 13s",
    "lastActivePage": "Review Page"
  },
  {
    "userId": "U1009",
    "sessionStart": "2025-12-09T10:45:00Z",
    "pagesVisited": 13,
    "itemsViewed": 6,
    "purchases": 1,
    "timeSpent": "15m 31s",
    "lastActivePage": "Product Details"
  },
  {
    "userId": "U1010",
    "sessionStart": "2025-12-09T10:50:00Z",
    "pagesVisited": 9,
    "itemsViewed": 4,
    "purchases": 0,
    "timeSpent": "08m 42s",
    "lastActivePage": "Search Results"
  },

  // Page 2 (next 10 records)

  {
    "userId": "U1011",
    "sessionStart": "2025-12-09T11:00:00Z",
    "pagesVisited": 17,
    "itemsViewed": 8,
    "purchases": 1,
    "timeSpent": "20m 40s",
    "lastActivePage": "Checkout"
  },
  {
    "userId": "U1012",
    "sessionStart": "2025-12-09T11:05:00Z",
    "pagesVisited": 11,
    "itemsViewed": 5,
    "purchases": 0,
    "timeSpent": "12m 05s",
    "lastActivePage": "Cart"
  },
  {
    "userId": "U1013",
    "sessionStart": "2025-12-09T11:10:00Z",
    "pagesVisited": 22,
    "itemsViewed": 12,
    "purchases": 2,
    "timeSpent": "30m 55s",
    "lastActivePage": "Order Success"
  },
  {
    "userId": "U1014",
    "sessionStart": "2025-12-09T11:15:00Z",
    "pagesVisited": 14,
    "itemsViewed": 7,
    "purchases": 1,
    "timeSpent": "18m 33s",
    "lastActivePage": "Review Page"
  },
  {
    "userId": "U1015",
    "sessionStart": "2025-12-09T11:20:00Z",
    "pagesVisited": 5,
    "itemsViewed": 2,
    "purchases": 0,
    "timeSpent": "04m 55s",
    "lastActivePage": "Home"
  },
  {
    "userId": "U1016",
    "sessionStart": "2025-12-09T11:25:00Z",
    "pagesVisited": 9,
    "itemsViewed": 4,
    "purchases": 1,
    "timeSpent": "09m 45s",
    "lastActivePage": "Wishlist"
  },
  {
    "userId": "U1017",
    "sessionStart": "2025-12-09T11:30:00Z",
    "pagesVisited": 19,
    "itemsViewed": 10,
    "purchases": 2,
    "timeSpent": "24m 10s",
    "lastActivePage": "Checkout"
  },
  {
    "userId": "U1018",
    "sessionStart": "2025-12-09T11:35:00Z",
    "pagesVisited": 16,
    "itemsViewed": 7,
    "purchases": 0,
    "timeSpent": "17m 50s",
    "lastActivePage": "Product Details"
  },
  {
    "userId": "U1019",
    "sessionStart": "2025-12-09T11:40:00Z",
    "pagesVisited": 23,
    "itemsViewed": 13,
    "purchases": 3,
    "timeSpent": "34m 20s",
    "lastActivePage": "Order Success"
  },
  {
    "userId": "U1020",
    "sessionStart": "2025-12-09T11:45:00Z",
    "pagesVisited": 7,
    "itemsViewed": 3,
    "purchases": 0,
    "timeSpent": "06m 40s",
    "lastActivePage": "Search Results"
  }
];

const UserJourneyTable = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const start = (page - 1) * pageSize;
  const paginatedRecords = mockData.slice(start, start + pageSize);

  return (
    <div style={{ padding: "20px" }}>
      <h2>User Journey Data</h2>

      <table border={1} cellPadding={10} width="100%">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Session Start</th>
            <th>Pages Visited</th>
            <th>Items Viewed</th>
            <th>Purchases</th>
            <th>Time Spent</th>
            <th>Last Active Page</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRecords.map((u) => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.sessionStart}</td>
              <td>{u.pagesVisited}</td>
              <td>{u.itemsViewed}</td>
              <td>{u.purchases}</td>
              <td>{u.timeSpent}</td>
              <td>{u.lastActivePage}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {Math.ceil(mockData.length / pageSize)}
        </span>

        <button
          disabled={page === Math.ceil(mockData.length / pageSize)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserJourneyTable;
