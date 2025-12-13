import React from "react";
import { AutoSizer, Column, Table as VirtualTable } from "react-virtualized";
import "react-virtualized/styles.css";

interface User {
  id: string;
  name: string;
  device: string;
  country: string;
  pagesVisited: number;
  purchases: number;
  timeSpent: number;
}

interface VirtualizedUsersTableProps {
  users: User[];
  height: number;
}

const VirtualizedUsersTable: React.FC<VirtualizedUsersTableProps> = ({
  users,
  height,
}) => {
  return (
    <div style={{ width: "100%", height }}>
      <AutoSizer>
        {({ width, height }) => (
          <VirtualTable
            width={width}
            height={height}
            headerHeight={40}
            rowHeight={40}
            rowCount={users.length}
            rowGetter={({ index }) => users[index]}
          >
            <Column label="Name" dataKey="name" width={200} />
            <Column label="Device" dataKey="device" width={120} />
            <Column label="Country" dataKey="country" width={120} />
            <Column label="Pages" dataKey="pagesVisited" width={100} />
            <Column label="Purchases" dataKey="purchases" width={120} />
            <Column label="Time Spent" dataKey="timeSpent" width={120} />
          </VirtualTable>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedUsersTable;
