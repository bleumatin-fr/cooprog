import React, { FormEvent } from "react";
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  DialogProps as MuiDialogProps,
  useTheme,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";

const StyledDialog = styled(MuiDialog)<{
  fullScreen?: boolean;
  hideBackdrop?: boolean;
}>`
  pointer-events: ${(props) => (props.hideBackdrop ? "none" : "auto")};
  & .MuiDialog-paper {
    max-width: ${(props) => (props.fullScreen ? "100vw" : "750px")};
    max-height: ${(props) => (props.fullScreen ? "100vh" : "none")};
    width: ${(props) => (props.fullScreen ? "100vw" : "auto")};
    height: ${(props) => (props.fullScreen ? "100vh" : "auto")};
    margin: ${(props) => (props.fullScreen ? "0" : "auto")};
    pointer-events: ${(props) => (props.hideBackdrop ? "all" : "auto")};
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid var(--color-light-gray);
  background-color: var(--color-white);
  flex-shrink: 0;
  flex-grow: 0;

  & .MuiTypography-root {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-dark-green);
  }

  .fullScreen & {
    padding: 0;
  }
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 24px;
  background-color: var(--color-white);
  flex-shrink: 1;
  overflow-y: auto;
  padding-top: 16px !important;

  .fullScreen & {
    min-width: 1024px;
    max-width: 1200px;
    margin: auto;
    padding-bottom: 216px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  padding: 8px 24px 8px 24px;
  border-top: 1px solid var(--color-light-gray);
  background-color: var(--color-very-light-gray);
  gap: 12px;
  flex-shrink: 0;
  flex-grow: 0;

  > div:first-of-type {
    width: 100%;
  }

  .fullScreen & {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3000;
    background-color: var(--content-background-color);
    padding: 8px 0 4px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    > div:first-of-type {
      min-width: 1024px;
      max-width: 1200px;
      margin: auto;
      width: 100%;

      > div {
        display: flex;
        gap: 1rem;
      }
    }
  }
`;

const CloseButton = styled(IconButton)`
  color: var(--color-gray);
  position: absolute;
  top: 16px;
  right: 16px;
  zindex: 1;

  &:hover {
    color: var(--color-dark-green);
    background-color: var(--color-very-light-gray);
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;

  > * {
    display: flex;
    flex-direction: column;
  }

  div.dialog:not(.fullScreen) & {
    max-height: calc(100dvh - 80px);
    > * {
      max-height: calc(100dvh - 80px);
    }
  }
`;

const SideActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  font-size: 0.8rem;
  margin-top: 16px;
  text-align: center;
`;

interface DialogProps extends Omit<MuiDialogProps, "children" | "onSubmit"> {
  children: React.ReactNode;
  fullScreen?: boolean;
  showCloseButton?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  children,
  fullScreen = false,
  showCloseButton = true,
  hideBackdrop = false,
  ...muiProps
}) => {
  const theme = useTheme();

  return (
    <StyledDialog
      {...muiProps}
      fullScreen={fullScreen}
      className={fullScreen ? "dialog fullScreen" : "dialog"}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: fullScreen ? "100vw" : "680px",
          maxHeight: fullScreen ? "100vh" : "none",
          width: fullScreen ? "100vw" : "auto",
          height: fullScreen ? "100vh" : "auto",
          margin: fullScreen ? "0" : "auto",
        },
        ...muiProps.sx,
      }}
      hideBackdrop={hideBackdrop}
    >
      {showCloseButton && muiProps.onClose && (
        <CloseButton
          onClick={() => muiProps.onClose?.({}, "backdropClick")}
          aria-label="close"
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": {
              backgroundColor: "var(--color-light-gray)",
            },
          }}
        >
          <CloseIcon />
        </CloseButton>
      )}
      <StyledContainer>{children}</StyledContainer>
    </StyledDialog>
  );
};

// Export styled components for direct use
export {
  StyledDialogTitle as DialogTitle,
  StyledDialogContent as DialogContent,
  StyledDialogActions as DialogActions,
  CloseButton,
  SideActionsContainer,
};

export default Dialog;
