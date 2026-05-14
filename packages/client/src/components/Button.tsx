import { Button as BaseButton, ButtonProps } from "@mui/material";

const Button = (props: ButtonProps) => {
  return <BaseButton variant="contained" {...props} size="small" />;
};

export default Button;
