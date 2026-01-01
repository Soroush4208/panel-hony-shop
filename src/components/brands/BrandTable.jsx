import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export function useBrandTable({ brands, onEdit, onDelete }) {
  const renderRow = brand => {
    return (
      <>
        <TableCell>{brand.name}</TableCell>
        <TableCell>
          <img src={brand.logo} alt={brand.name} style={{ height: 32 }} />
        </TableCell>
        <TableCell>{brand.order ?? 0}</TableCell>
        <TableCell>{brand.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(brand)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(brand)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

