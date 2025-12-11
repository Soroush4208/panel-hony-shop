import {
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Tooltip
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Delete } from "@mui/icons-material";
import { orderApi } from "../api/services";
import { formatDate, formatPrice } from "../utils/format";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast, showToast, handleClose } = useToast();
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.list()
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["order-statuses"],
    queryFn: orderApi.statuses
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("وضعیت سفارش به‌روزرسانی شد");
    },
    onError: () => showToast("خطا در به‌روزرسانی وضعیت", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: orderApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast("سفارش حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف سفارش ناموفق بود", "error")
  });

  const handleStatusChange = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteRequest = (order) => {
    setConfirmState({ open: true, target: order });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate({ id: confirmState.target.id || confirmState.target._id, restock: true });
    }
  };

  const handleConfirmClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmState({ open: false, target: null });
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>
            سفارش‌های مشتریان
          </Typography>
          <Typography color="text.secondary">
            بررسی وضعیت سفارش‌ها و تغییر وضعیت ارسال
          </Typography>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>کد سفارش</TableCell>
                  <TableCell>تاریخ</TableCell>
                  <TableCell>کاربر</TableCell>
                  <TableCell>شماره</TableCell>
                  <TableCell>ایمیل</TableCell>
                  <TableCell>مبلغ</TableCell>
                  <TableCell>تعداد اقلام</TableCell>
                  <TableCell>وضعیت</TableCell>
                  <TableCell align="right">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : orders
                ).map((order) => (
                  <TableRow key={order.id || order._id} hover>
                    <TableCell>{(order.id || order._id).slice(-6)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{order.userId?.name || "بدون نام"}</Typography>
                    </TableCell>
                    <TableCell>{order.userId?.phone || "—"}</TableCell>
                    <TableCell>{order.userId?.email || "—"}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(event) => handleStatusChange(order.id || order._id, event.target.value)}
                      >
                        {statuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="حذف سفارش">
                        <IconButton color="error" onClick={() => handleDeleteRequest(order)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="تعداد در صفحه"
            rowsPerPageOptions={[5, 10, 25, { label: "همه", value: -1 }]}
          />
        </Card>
      )}

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف سفارش"
        description="با حذف سفارش، موجودی اقلام به انبار بازگردانده می‌شود. آیا ادامه می‌دهید؟"
        confirmText="حذف سفارش"
        onConfirm={handleDeleteConfirm}
        onClose={handleConfirmClose}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

