import styled from "@emotion/styled";
import { IconButton, IconButtonProps } from "@mui/material";

export const Spacer = styled.div`
  width: 1px;
  height: 32px;
  background-color: var(--color-orange);
`;

const ActionButton = styled(IconButton)<IconButtonProps>`
  position: relative;
  background-color: var(--color-white);

  &:hover {
    background-color: var(--color-light-gray);
  }

  & svg:nth-of-type(1) {
    font-size: 22px;
  }

  & svg:nth-of-type(2) {
    position: absolute;
    top: 12px;
    font-size: 12px;
    right: 0;
    bottom: 0;
    left: 9px;
    width: 0.9rem;
  }
`;

export default ActionButton;
