import styled from "@emotion/styled";

const BORDER_SIZE = 15;

export const Grid = styled.div`
  display: flex;
  padding: 20px 0;
  gap: 20px;
  max-width: 100vw;
  flex-direction: column;
  border-top: ${BORDER_SIZE}px solid ${(props) => props.color};
  border-bottom: ${BORDER_SIZE}px solid ${(props) => props.color};


`;
export const Line = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  padding-bottom: 20px;
  border-bottom: ${BORDER_SIZE}px solid ${(props) => props.color};
  &:last-of-type {
    border-bottom: 0;
  }

  .mobile & {
    flex-direction: column;
  }
`;

interface CellProps {
  color: string;
  fillColor: string;
}

export const Cell = styled.div<CellProps>`
  display: flex;
  flex: 1;
  padding: 20px;
  text-align: center;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  border-right: ${BORDER_SIZE}px solid ${(props) => props.color};
  color: ${({ fillColor }) => fillColor};

  &:last-of-type {
    border-right: 0;
  }

  .mobile & {
    border-right: 0;
    border-bottom: ${BORDER_SIZE}px solid ${(props) => props.color};

    &:last-of-type {
      border-bottom: 0;
    }
  }
`;
