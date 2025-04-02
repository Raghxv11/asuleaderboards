
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  imageUrl: string;
  swipeRightPercentage: number;
  totalVotes: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-md w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-10 bg-gray-200 rounded-md col-span-1"></div>
                <div className="h-10 bg-gray-200 rounded-md col-span-2"></div>
                <div className="h-10 bg-gray-200 rounded-md col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold text-gray-500">No rankings available yet</h3>
        <p className="text-gray-400 mt-2">Check back later for updated rankings</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Jacked Rating</TableHead>
          <TableHead className="text-right">Total Votes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-app-red to-app-purple text-white">
                {user.rank}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-bold">{user.swipeRightPercentage}%</TableCell>
            <TableCell className="text-right text-muted-foreground">{user.totalVotes}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LeaderboardTable;
