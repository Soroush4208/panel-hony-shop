import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { formatDate } from '../../utils/format';

export function useDealTable({ deals, onEdit, onDelete }) {
  const renderRow = deal => {
    return (
      <>
        <TableCell>{deal.productId}</TableCell>
        <TableCell>{deal.discountPercent || 0}%</TableCell>
        <TableCell>{deal.dealPrice ? `${deal.dealPrice} ریال` : '-'}</TableCell>
        <TableCell>{formatDate(deal.expiresAt)}</TableCell>
        <TableCell>{deal.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(deal)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(deal)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

