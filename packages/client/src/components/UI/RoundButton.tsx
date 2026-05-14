import { Button as BaseButton, ButtonProps, styled } from "@mui/material";
import { ElementType } from "react";

const Button = styled(BaseButton)<ButtonProps>`
--mui-palette-${({ color }) => color}-main: var(--button-${({ color }) =>
  color}-background-color);
--mui-palette-${({ color }) => color}-dark: var(--button-${({ color }) =>
  color}-hover-color);
  --mui-palette-${({ color }) => color}-contrastText: var(--button-${({
  color,
}) => color}-text-color);
  border-radius: 32px;
  
`;

const CustomButton = ({
  color = "secondary",
  component = "button",
  className,
  children,
  ...rest
}: ButtonProps & {
  target?: string;
  component?: ElementType<any> | undefined;
}) => {
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

export default CustomButton;
