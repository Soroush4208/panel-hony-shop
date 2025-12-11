import {
  Alert,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Delete, CheckCircle, Cancel } from "@mui/icons-material";
import { reviewsApi } from "../api/services";
import useToast from "../hooks/useToast";

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "pending", productId: "" });
  const { toast, showToast, handleClose } = useToast();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", filters],
    queryFn: () => reviewsApi.list(filters)
  });

  const updateMutation = useMutation({
    mutationFn: reviewsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      showToast("وضعیت نظر به‌روزرسانی شد");
    },
    onError: () => showToast("خطا در به‌روزرسانی وضعیت", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: reviewsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      showToast("نظر حذف شد");
    },
    onError: () => showToast("حذف نظر ناموفق بود", "error")
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h5" fontWeight={700}>
            مدیریت نظرات مشتریان
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <TextField
              select
              label="وضعیت"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value="pending">در انتظار تأیید</MenuItem>
              <MenuItem value="approved">تأیید شده</MenuItem>
              <MenuItem value="rejected">رد شده</MenuItem>
            </TextField>
            <TextField
              label="شناسه محصول"
              name="productId"
              value={filters.productId}
              onChange={handleFilterChange}
              size="small"
              sx={{ minWidth: 240 }}
              placeholder="Product ID"
            />
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام</TableCell>
                <TableCell>ایمیل</TableCell>
                <TableCell>محصول</TableCell>
                <TableCell>امتیاز</TableCell>
                <TableCell>متن نظر</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => {
                const reviewId = review.id || review._id;
                return (
                  <TableRow key={reviewId} hover>
                    <TableCell>{review.name}</TableCell>
                    <TableCell>{review.email}</TableCell>
                    <TableCell>{review.productId}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell>{review.comment}</TableCell>
                    <TableCell>{review.status}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="success"
                        onClick={() =>
                          updateMutation.mutate({ id: reviewId, status: "approved" })
                        }
                      >
                        <CheckCircle />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() =>
                          updateMutation.mutate({ id: reviewId, status: "rejected" })
                        }
                      >
                        <Cancel />
                      </IconButton>
                      <IconButton color="error" onClick={() => deleteMutation.mutate(reviewId)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
