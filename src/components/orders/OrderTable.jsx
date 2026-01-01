import { TableCell, IconButton, Select, MenuItem, Typography, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { formatDate, formatPrice } from '../../utils/format';

export function useOrderTable({ orders, statuses, onStatusChange, onDelete }) {
  const renderRow = order => {
    return (
      <>
        <TableCell>{(order.id || order._id).slice(-6)}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell>
          <Typography fontWeight={700}>
            {order.userId?.name || 'بدون نام'}
          </Typography>
        </TableCell>
        <TableCell>{order.userId?.phone || '—'}</TableCell>
        <TableCell>{order.userId?.email || '—'}</TableCell>
        <TableCell>{formatPrice(order.total)}</TableCell>
        <TableCell>{order.items.length}</TableCell>
        <TableCell>
          <Select
            size="small"
            value={order.status}
            onChange={event =>
              onStatusChange(order.id || order._id, event.target.value)
            }
          >
            {statuses.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell align="right">
          <Tooltip title="حذف سفارش">
            <IconButton color="error" onClick={() => onDelete(order)}>
              <Delete />
            </IconButton>
          </Tooltip>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

