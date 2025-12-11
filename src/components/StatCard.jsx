import { Box, Card, CardContent, Typography } from "@mui/material";
import PropTypes from "prop-types";

export default function StatCard({ title, value, icon, color = "primary.main" }) {
  const Icon = icon;
  return (
    <Card elevation={0} sx={{ borderRadius: 4, backgroundColor: "#fff" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {Icon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              backgroundColor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}
          >
            <Icon />
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.string
};

