// app\components\ui\WholesaleContent.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

function WholesaleContent({ users }) {
  return (
    <Table
      striped
      className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]"
    >
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Role</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.handle}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="text-zinc-500">{user.access}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
