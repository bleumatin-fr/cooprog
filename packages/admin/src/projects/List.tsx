import { Discipline, ProgramStatuses } from "@cooprog/core";
import styled from "@emotion/styled";
import { FileDownload } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import { cloneElement } from "react";
import {
  ArrayField,
  AutocompleteArrayInput,
  Button,
  CreateButton,
  Datagrid,
  DateField,
  FilterButton,
  FunctionField,
  List,
  RaRecord,
  ReferenceArrayInput,
  SelectInput,
  TextField,
  TextInput,
  TopToolbar,
  useGetOne,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { ColorField } from "react-admin-color-picker";
import httpClient from "../httpClient";
import genres from "./genres.json";
import targetAudiences from "./targetAudiences.json";
import ParticipantList from "./ParticipantList";

const GenreSelectInput = (props: any) => {
  const choices = genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
  }));

  return <SelectInput {...props} choices={choices} />;
};

const projectFilters = [
  <TextInput label="Search" source="q" alwaysOn />,
  <ReferenceArrayInput
    label="Users"
    reference="users"
    source="users"
    alwaysOn
    sort={{ field: "fullname", order: "ASC" }}
  >
    <AutocompleteArrayInput
      optionText={(user) => {
        const profile = user.profiles[0];
        return (
          `${user.company}${profile ? " - " : ""}${profile?.firstName} ${
            profile?.lastName
          }`.trim() || user.email
        );
      }}
    />
  </ReferenceArrayInput>,
  <SelectInput
    label="Deleted"
    source="deleted"
    choices={[
      { id: true, name: "Yes" },
      { id: false, name: "No" },
    ]}
  />,
  <GenreSelectInput label="Genre" source="genres" />,
  <SelectInput
    label="Discipline"
    source="discipline"
    choices={[
      { id: Discipline.PERFORMING_ARTS, name: "Performing Arts" },
      { id: Discipline.MUSIC, name: "Music" },
    ]}
    translateChoice={false}
  />,
];

interface StringToLabelObjectProps {
  record?: RaRecord;
  children: React.ReactElement<{
    record?: { label?: RaRecord };
    [key: string]: any;
  }>;
}
export const StringToLabelObject = ({
  record,
  children,
  ...rest
}: StringToLabelObjectProps) =>
  cloneElement(children, {
    record: { label: record },
    ...rest,
  });

const API_URL =
  import.meta.env.VITE_APP_API_URL || "http://localhost:3000/admin/api";

const exporter = async () => {
  const response = await httpClient(
    `${API_URL}/stats`,
    {
      credentials: "include",
    },
    "blob"
  );
  const url = window.URL.createObjectURL(response);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `export_${new Date().toISOString()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

const ChipListContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

interface DataItem {
  id: string;
  name: string;
}

const ChipList = ({ source, data }: { source: string; data: DataItem[] }) => {
  const record = useRecordContext();

  if (!record) {
    return null;
  }

  const items = record[source] || [];
  const maxVisible = 2;
  const visibleItems = items.slice(0, maxVisible);
  const remainingItems = items.slice(maxVisible);
  const remainingCount = remainingItems.length;

  return (
    <ChipListContainer>
      {visibleItems.map((genre: string) => {
        const datum = data.find((d) => d.id === genre);
        return (
          <Chip size="small" key={genre} label={datum ? datum.name : genre} />
        );
      })}
      {remainingCount > 0 && (
        <Tooltip
          title={
            <div>
              {remainingItems.map((genre: string) => {
                const datum = data.find((d) => d.id === genre);
                return <div key={genre}>{datum ? datum.name : genre}</div>;
              })}
            </div>
          }
          arrow
          PopperProps={{
            disablePortal: true,
          }}
        >
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            variant="outlined"
            style={{
              backgroundColor: "#f5f5f5",
              borderColor: "#e0e0e0",
              color: "#666",
            }}
          />
        </Tooltip>
      )}
    </ChipListContainer>
  );
};

const DisciplinesChipList = ({
  source = "discipline",
  label = "Discipline",
}: {
  source?: string;
  label?: string;
}) => {
  const record = useRecordContext();
  const translate = useTranslate();

  if (!record || !record.discipline) {
    return null;
  }

  const disciplineStyles = {
    [Discipline.PERFORMING_ARTS]: {
      backgroundColor: "#FF8A47",
      color: "#FFFFFF",
    },
    [Discipline.MUSIC]: {
      backgroundColor: "#6BAF48",
      color: "#FFFFFF",
    },
  };

  const disciplineLabels = {
    [Discipline.PERFORMING_ARTS]: "Performing Arts",
    [Discipline.MUSIC]: "Music",
  };

  const discipline = record.discipline;
  const style = disciplineStyles[discipline as Discipline] || {
    backgroundColor: "#f5f5f5",
    color: "#333333",
  };

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      <Chip
        key={discipline}
        label={disciplineLabels[discipline as Discipline] || discipline}
        size="small"
        style={{
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      />
    </div>
  );
};

const ExportButton = () => (
  <Button
    variant="text"
    color="primary"
    onClick={exporter}
    startIcon={<FileDownload />}
    label="Exporter"
  ></Button>
);

const ProjectListActions = () => (
  <TopToolbar>
    <FilterButton />
    <ExportButton />
  </TopToolbar>
);

const ProjectList = () => {
  return (
    <List
      filters={projectFilters}
      filterDefaultValues={{ deleted: false }}
      sort={{ field: "public", order: "DESC" }}
      actions={<ProjectListActions />}
    >
      <Datagrid rowClick="edit">
        <TextField source="artist" />
        <TextField source="work" />
        <DisciplinesChipList />
        <ChipList source="genres" data={genres} />
        <ChipList source="targetAudiences" data={targetAudiences} />
        <ParticipantList source="users" size="xsmall" />
        <ArrayField source="tours">
          <Datagrid bulkActionButtons={false}>
            <TextField source="name" />
            <DateField source="start" />
            <DateField source="end" />
            <ColorField source="color" />
            <ParticipantList source="users" size="xsmall" />
            <FunctionField
              label="# of dates"
              render={(record: any) =>
                record.schedule.filter((program: any) =>
                  [
                    ProgramStatuses.SHOW_PENDING,
                    ProgramStatuses.SHOW_CONFIRMED,
                  ].includes(program.status)
                ).length
              }
            />
          </Datagrid>
        </ArrayField>
        {/* <NumberField source="programCount" />
        <DateField source="startDate" />
        <DateField source="endDate" />
        <NumberField source="favoriteCount" />
        <NumberField source="hiddenCount" /> */}
      </Datagrid>
    </List>
  );
};

export default ProjectList;
