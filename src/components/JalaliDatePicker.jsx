import { TextField } from "@mui/material";
import moment from "moment-jalaali";
import PropTypes from "prop-types";
import { useState } from "react";

moment.loadPersian({ dialect: "persian-modern" });

export default function JalaliDatePicker({ label, value, onChange, fullWidth, ...props }) {
  const [displayValue, setDisplayValue] = useState(
    value ? moment(value).format("jYYYY/jMM/jDD") : ""
  );
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);

    if (!input) {
      onChange({ target: { value: "" } });
      setError(false);
      return;
    }

    // Parse Persian date (format: YYYY/MM/DD)
    const parts = input.split("/");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (year && month && day && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        try {
          const jMoment = moment(`${year}/${month}/${day}`, "jYYYY/jMM/jDD");
          if (jMoment.isValid()) {
            const gregorian = jMoment.toDate();
            onChange({ target: { value: gregorian.toISOString().split("T")[0] } });
            setError(false);
            return;
          }
        } catch (err) {
          // Invalid date
        }
      }
    }
    setError(true);
  };

  return (
    <TextField
      {...props}
      label={label}
      value={displayValue}
      onChange={handleChange}
      fullWidth={fullWidth}
      error={error}
      helperText={error ? "تاریخ معتبر نیست (فرمت: ۱۴۰۳/۰۹/۱۵)" : "فرمت: ۱۴۰۳/۰۹/۱۵"}
      placeholder="۱۴۰۳/۰۹/۱۵"
    />
  );
}

JalaliDatePicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  fullWidth: PropTypes.bool
};

