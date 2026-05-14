import { Button as BaseButton, ButtonProps, styled } from "@mui/material";
import { ElementType } from "react";

const Button = styled(BaseButton)<ButtonProps>`
  --mui-palette-${({ color }) => color}-main: var(--button-${({ color }) =>
  color}-background-color);
  --mui-palette-${({ color }) => color}-dark: var(--button-${({ color }) =>
  color}-hover-color);

  border: 1px solid transparent;

  &:hover{
  border-color: 1px solid var(--button-${({ color }) =>
    color}-background-color);
  }
`;

// const CustomButton = styled(Button)<ButtonProps>(
//   ({ color = 'secondary', theme }) => ({
//     color: '#060606',
//     background: (theme.palette as any)[color].main || '#fff',
//     boxShadow: '2px 2px 0px var(--buttonShadow)',
//     border: '2px solid #060606',
//     padding: '4px 16px',
//     borderRadius: '32px',
//     height: '32px',
//     textTransform: 'none',
//     fontSize: '16px',
//     lineHeight: '20px',
//     fontWeight: '600',
//     fontStyle: 'normal',
//     fontFamily: "'Montserrat', sans-serif",
//     '&:hover': {
//       backgroundColor: (theme.palette as any)[color].light || '#DCEEEF',
//       border: '2px solid #060606',
//     },
//     '&:disabled': {
//       border: '2px solid #06060670',
//       cursor: 'progress',
//     },
//   }),
// );

const CustomButton = ({
  color = "secondary",
  component = "button",
  className,
  children,
  ...rest
}: ButtonProps & { component?: ElementType<any> | undefined }) => {
  return (
    <Button
      variant="text"
      className={className + " " + color}
      color={color}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
