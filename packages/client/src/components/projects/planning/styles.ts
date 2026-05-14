import styled from "@emotion/styled";

export const Container = styled.div`
  margin-top: 1rem;
`;

export const MonthsContainer = styled.div`
  width: 100%;
  > div {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
`;

export const MonthContainer = styled.div<{ mobile: boolean }>`
  ${({ mobile }) => (mobile ? `overflow-x: auto;` : ``)}
  tbody {
    width: 100%;
    overflow-x: auto;
  }
`;

export const MonthTitle = styled.h5<{ mobile: boolean }>`
  font-size: 1.5rem;
  position: sticky;
  left: 0;
  top: 60px;
  background-color: white;
  padding-top: 1rem;
  padding-bottom: 1rem;
  z-index: 2;
`;

export const Month = styled.table`
  width: 100%;
  border: none;

  border-collapse: collapse;
  & tr {
    border-bottom: 1px solid #dee2e6;

    &:not(.unavailable):not(.blocked) {
      & td:last-of-type,
      td:nth-last-of-type(2) {
        border-left: 1px solid #dee2e6;
      }
    }
  }
`;

export const MonthHead = styled.thead<{ mobile: boolean }>`
  text-align: left;
  position: sticky;
  top: ${({ mobile }) => (mobile ? `0` : `110px`)};

  background-color: white;
  z-index: 1;
  box-shadow: 0 4px 2px -2px rgba(0, 0, 0, 0.1);

  & th {
    padding: 0.5rem;
    padding-top: 1rem;
  }

  & th:nth-of-type(1) {
    width: 30px;
    text-align: center;
  }
  & th:nth-of-type(2) {
    width: 50px;
    text-align: center;
  }
  & th:nth-of-type(3) {
    text-align: center;
    width: 30%;
    min-width: 280px;
  }

  @media (max-width: 700px) {
    & th:nth-of-type(3) {
      min-width: 0;
    }
  }
`;

export const MonthBody = styled.tbody`
  font-size: 0.8rem;
`;

export const Day = styled.tr`
  text-align: center;

  & > td {
    padding: 0.2rem;
    height: 40px;
  }

  &.day-1,
  &.day-3,
  &.day-5 {
    background-color: #f8f9fa;
  }

  &.weekend {
    background-color: var(--weekend-background-color);
    color: var(--weekend-color);
  }

  &.blocked {
    background-color: var(--booked-background-color);
    color: var(--booked-color);
  }

  &.wished {
    background-color: var(--wished-background-color);
    color: var(--wished-color);
  }

  &.unavailable {
    background-color: var(--unavailable-background-color);
    color: var(--unavailable-color);
  }

  &.out-of-range {
    background-color: var(--out-of-range-background-color);
    color: var(--out-of-range-color);
  }
`;

export const CollapseRow = styled(Day)`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e9ecef;
  }

  &:last-of-type {
    border-bottom: none !important;
  }

  & > td {
    text-align: center;
    border: none !important;
    color: var(--color-orange);

    > div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const CaretIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-orange);
  line-height: 1;
`;

export const ButtonContent = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 1;
`;
