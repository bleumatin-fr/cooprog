import { Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import styled from "@emotion/styled";

interface TextWithTooltipProps {
  tooltip?: React.ReactElement;
  children?: React.ReactElement;
}

const TextContainer = styled.span`
  cursor: help;
  border-bottom: 1px dashed #000;
  display: inline-block;
  padding-left: 2px;

  > svg {
    height: 16px;
    width: 16px;
    position: relative;
    top: 2px;
  }
`;

const TextWithTooltip = ({ tooltip, children }: TextWithTooltipProps) => {
  return (
    <Tooltip title={tooltip}>
      <TextContainer>
        {children} <InfoOutlinedIcon />
      </TextContainer>
    </Tooltip>
  );
};

export default TextWithTooltip;
