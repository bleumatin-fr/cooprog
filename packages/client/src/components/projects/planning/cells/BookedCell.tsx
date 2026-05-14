import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import CancelIcon from "@mui/icons-material/Cancel";
import { Program } from "@cooprog/core";
import {
  Autocomplete as BaseAutocomplete,
  CircularProgress,
  TextField,
  Tooltip,
} from "@mui/material";
import { useEffect, useState, MouseEvent } from "react";
import { useDebounceValue } from "usehooks-ts";
import useUser from "@/components/authentication/useUser";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  input::placeholder {
    color: black;
  }

  &:hover input::placeholder {
    color: inherit;
  }
`;

const SubContainer = styled.div`
  position: absolute;
  right: 5px;

  & svg,
  & span {
    font-size: 1rem;
    cursor: pointer;
    transition: fill 0.3s;
    fill: var(--button-secondary-background-color);

    &:hover {
      fill: var(--button-primary-hover-color);
    }
  }
`;

const Autocomplete = styled(BaseAutocomplete)`
  margin-right: 3rem;
  margin-left: 3rem;
  & fieldset {
    display: none;
  }
  & input {
    text-align: center;
    font-size: 0.8rem;
  }
`;

const Option = styled.li`
  font-size: 0.8rem;
`;

interface BookedCellProps {
  program: Program;
  unschedule: (id: string) => Promise<void> | void;
  editProgram: (
    programId: string,
    params: Partial<Program>
  ) => Promise<void> | void;
  canEdit?: boolean;
}

const BookedCell = ({
  program,
  unschedule,
  editProgram,
  canEdit = false,
}: BookedCellProps) => {
  const { t } = useTranslation();
  const [note, setNote] = useState(program.note);
  const [debouncedNote] = useDebounceValue(note, 500);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [isHovering, setIsHovering] = useState(false);
  const isOwnBookedDay = user?._id === program.user?._id;

  useEffect(() => {
    (async () => {
      if (debouncedNote === program.note || !program._id) {
        return;
      }
      await editProgram(program._id!, { note: debouncedNote });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedNote, program]);

  if (!program || !program._id) {
    return null;
  }

  const options = t("projects:tours.planning.bookedReasons", {
    returnObjects: true,
  }) as string[];

  const handleClick = async (e: MouseEvent) => {
    if (loading || !program._id) {
      return;
    }
    setLoading(true);
    await unschedule(program._id);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <td colSpan={2}>
      <Container
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Autocomplete
          fullWidth
          autoComplete
          disableClearable
          defaultValue={note}
          inputValue={
            note || (canEdit ? "" : t("projects:tours.planning.booked"))
          }
          onInputChange={(event, newInputValue) => {
            setNote(newInputValue);
          }}
          renderOption={(props, option) => {
            const optionValue = option as string;
            return <Option {...props}>{optionValue}</Option>;
          }}
          size="small"
          options={options}
          renderInput={(params) => (
            <TextField
              {...params}
              onFocus={(event) => {
                event.target.select();
              }}
              placeholder={
                isHovering
                  ? t("projects:tours.planning.booked")
                  : t("projects:tours.planning.booked-placeholder")
              }
            />
          )}
          freeSolo
          disabled={!isOwnBookedDay && !canEdit}
          componentsProps={{
            popper: { style: { width: "fit-content", fontSize: "0.8rem" } },
          }}
        />
        <SubContainer>
          {(canEdit || isOwnBookedDay) && program._id && (
            <Tooltip
              title={t("projects:tours.planning.unschedule")}
              disableInteractive
            >
              {loading ? (
                <CircularProgress size="16px" />
              ) : (
                <CancelIcon onClick={handleClick} />
              )}
            </Tooltip>
          )}
        </SubContainer>
      </Container>
    </td>
  );
};

export default BookedCell;
