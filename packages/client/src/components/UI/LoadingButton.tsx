import {
  LoadingButton as BaseLoadingButton,
  LoadingButtonProps,
} from "@mui/lab";
import { styled } from "@mui/material";

import { ElementType } from "react";

const Button = styled(BaseLoadingButton)<LoadingButtonProps>`
--mui-palette-${({ color }) => color}-main: var(--button-${({ color }) =>
  color}-background-color);
--mui-palette-${({ color }) => color}-dark: var(--button-${({ color }) =>
  color}-hover-color);
  --mui-palette-${({ color }) => color}-contrastText: var(--button-${({
  color,
}) => color}-text-color);
  border-radius: 32px;
  
`;
const LoadingButton = ({
  color = "secondary",
  component = "button",
  className,
  children,
  ...rest
}: LoadingButtonProps & { component?: ElementType<any> | undefined }) => {
  return (
    <Button
      variant="contained"
      color={color}
      className={className + " " + color}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default LoadingButton;
