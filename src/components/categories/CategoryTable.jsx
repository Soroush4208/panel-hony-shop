import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export function useCategoryTable({ categories, onEdit, onDelete }) {
  const renderRow = category => {
    return (
      <>
        <TableCell>{category.name}</TableCell>
        <TableCell>{category.order ?? 0}</TableCell>
        <TableCell>{category.isActive ? 'بله' : 'خیر'}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(category)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(category)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

