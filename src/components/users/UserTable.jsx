import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete, Send } from '@mui/icons-material';

export function useUserTable({ users, onEdit, onDelete, onSendMessage }) {
  const renderRow = user => {
    return (
      <>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell>{user.phone}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(user)}>
            <Edit />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => onSendMessage(user)}
          >
            <Send />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(user)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

