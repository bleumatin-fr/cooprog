import { Discipline, ProgramStatuses } from "@cooprog/core";
import {
  ArrayInput,
  AutocompleteInput,
  CheckboxGroupInput,
  DateInput,
  Edit,
  FormDataConsumer,
  ReferenceInput,
  required,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  useRecordContext,
  NumberInput,
  BooleanInput,
  SelectArrayInput,
  RadioButtonGroupInput,
  useSimpleFormIterator,
  useSimpleFormIteratorItem,
} from "react-admin";
import genres from "./genres.json";
import targetAudiences from "./targetAudiences.json";
import { Button } from "@mui/material";
import AddTourIcon from "@mui/icons-material/AddRoad";
import RemoveTourIcon from "@mui/icons-material/RemoveRoad";
import AddScheduleIcon from "@mui/icons-material/AddLocationAlt";
import RemoveScheduleIcon from "@mui/icons-material/WrongLocation";
import AddUserIcon from "@mui/icons-material/PersonAdd";
import RemoveUserIcon from "@mui/icons-material/PersonRemove";
import gauges from "./gauges.json";
import venueConfigurationTypes from "./venueConfigurationTypes.json";
import venueConfigurationSpaces from "./venueConfigurationSpaces.json";
import venueConfigurationAudiences from "./venueConfigurationAudiences.json";
import minimumStageSizes from "./minimumStageSizes.json";
import performanceLanguages from "./performanceLanguages.json";
import averagePerformanceFees from "./averagePerformanceFees.json";
import styled from "@emotion/styled";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import CalculateIcon from "@mui/icons-material/Calculate";
import HearingDisabledOutlinedIcon from "@mui/icons-material/HearingDisabledOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { PeopleAltOutlined, RouteOutlined } from "@mui/icons-material";

const TitleBox = styled("div")({
  display: "flex",
  alignItems: "center",
  background: "#edeef2",
  borderRadius: 6,
  padding: "12px",
  margin: "0",
  marginTop: "16px",
  fontSize: 18,
  fontWeight: 500,
  color: "#222",
  width: "100%",
});

const FormIteratorRemoveButton = ({
  children,
  startIcon,
}: {
  children: React.ReactNode;
  startIcon: React.ReactNode;
}) => {
  const { remove } = useSimpleFormIteratorItem();
  return (
    <Button
      onClick={() => {
        remove();
      }}
      startIcon={startIcon}
    >
      {children}
    </Button>
  );
};

const FormIteratorAddButton = ({
  children,
  startIcon,
}: {
  children: React.ReactNode;
  startIcon: React.ReactNode;
}) => {
  const { add } = useSimpleFormIterator();
  return (
    <Button
      onClick={() => {
        add();
      }}
      startIcon={startIcon}
    >
      {children}
    </Button>
  );
};

const ProjectTitle = () => {
  const record = useRecordContext();
  return <span>{record?.name} Project</span>;
};

const ProjectEdit = () => {
  return (
    <Edit title={<ProjectTitle />}>
      <SimpleForm>
        <TitleBox>
          <TheaterComedyIcon
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Discipline
        </TitleBox>
        <RadioButtonGroupInput
          source="discipline"
          choices={[
            { id: Discipline.PERFORMING_ARTS, name: "Performing Arts" },
            { id: Discipline.MUSIC, name: "Music" },
          ]}
          validate={required()}
          label={false}
        />
        <TitleBox>
          <InfoOutlinedIcon
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          General Information
        </TitleBox>
        <TextInput source="artist" fullWidth validate={required()} />
        <FormDataConsumer>
          {({ formData }) => {
            if (formData.discipline === Discipline.PERFORMING_ARTS) {
              return (
                <TextInput source="work" fullWidth validate={required()} />
              );
            }
            return <TextInput source="work" fullWidth />;
          }}
        </FormDataConsumer>
        <ArrayInput source="places" fullWidth>
          <SimpleFormIterator inline>
            <TextInput source="country" />
            <TextInput source="region" />
            <TextInput source="city" />
          </SimpleFormIterator>
        </ArrayInput>
        <FormDataConsumer>
          {({ formData }) => {
            return (
              <CheckboxGroupInput
                source="genres"
                choices={genres
                  .filter((genre) => genre.discipline === formData.discipline)
                  .map((genre, index) => ({
                    id: index,
                    name: genre.name,
                  }))}
              />
            );
          }}
        </FormDataConsumer>
        <TextInput source="complementaryGenre" fullWidth />
        <CheckboxGroupInput
          source="targetAudiences"
          choices={targetAudiences.map((value, index) => ({
            id: index,
            name: value?.name,
          }))}
        />
        <TextInput source="description" fullWidth multiline />
        <TitleBox>
          <FolderIcon
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Ressources
        </TitleBox>
        <ArrayInput source="links" fullWidth>
          <SimpleFormIterator
            inline
            disableRemove
            disableClear
            disableReordering
            disableAdd
          >
            <TextInput source="name" />
            <TextInput source="url" />
          </SimpleFormIterator>
        </ArrayInput>
        <ArrayInput source="files" fullWidth>
          <SimpleFormIterator
            inline
            disableRemove
            disableClear
            disableReordering
            disableAdd
          >
            <TextInput source="name" />
            <TextInput source="originalFilename" />
          </SimpleFormIterator>
        </ArrayInput>

        <TitleBox>
          <TheaterComedyOutlinedIcon
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Conditions of representation
        </TitleBox>
        <FormDataConsumer>
          {({ formData }) => {
            return (
              <CheckboxGroupInput
                source="gauge"
                choices={gauges
                  .filter((gauge) => gauge.discipline === formData.discipline)
                  .map((gauge, index) => ({
                    id: index,
                    name: gauge.name,
                  }))}
              />
            );
          }}
        </FormDataConsumer>

        <CheckboxGroupInput
          source="venueConfigurationType"
          choices={venueConfigurationTypes.map((value, index) => ({
            id: index,
            name: value?.name,
          }))}
        />
        <CheckboxGroupInput
          source="venueConfigurationSpace"
          choices={venueConfigurationSpaces.map((value, index) => ({
            id: index,
            name: value?.name,
          }))}
        />
        <CheckboxGroupInput
          source="venueConfigurationAudience"
          choices={venueConfigurationAudiences.map((value, index) => ({
            id: index,
            name: value?.name,
          }))}
        />

        <FormDataConsumer>
          {({ formData }) => {
            return (
              <CheckboxGroupInput
                source="minimumStageSize"
                choices={minimumStageSizes
                  .filter((value) => value.discipline === formData.discipline)
                  .map((value, index) => ({
                    id: index,
                    name: value?.name,
                  }))}
              />
            );
          }}
        </FormDataConsumer>

        <SelectArrayInput
          source="performanceLanguages"
          choices={performanceLanguages.map((value, index) => ({
            id: index,
            name: value?.name,
          }))}
        />
        <BooleanInput
          source="accessibilityVisual"
          label={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <VisibilityOffOutlinedIcon fontSize="small" />
              This show is accessible to people with visual impairments
            </span>
          }
        />
        <BooleanInput
          source="accessibilityAudio"
          label={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <HearingDisabledOutlinedIcon fontSize="small" />
              This show is accessible to people with hearing impairments
            </span>
          }
        />

        <TitleBox>
          <CalculateIcon
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Budget
        </TitleBox>
        <FormDataConsumer>
          {({ formData }) => {
            return (
              <CheckboxGroupInput
                source="averagePerformanceFee"
                choices={averagePerformanceFees
                  .filter((value) => value.discipline === formData.discipline)
                  .map((value, index) => ({
                    id: index,
                    name: value?.name,
                  }))}
              />
            );
          }}
        </FormDataConsumer>
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <NumberInput source="numberOfPeopleOnTour" />
          <NumberInput source="numberOfArtistOnStage" />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <NumberInput source="numberOfMenOnStage" />
          <NumberInput source="numberOfWomenOnStage" />
          <NumberInput source="numberOfNonBinaryOnStage" />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <BooleanInput source="emergingArtist" />
          <BooleanInput source="culturalActionInterest" />
        </div>
        <TextInput source="financialSupport" fullWidth />

        <TitleBox>
          <PeopleAltOutlined
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Users
        </TitleBox>
        <ArrayInput source="users" fullWidth>
          <SimpleFormIterator
            inline
            disableClear
            disableReordering
            addButton={
              <FormIteratorAddButton startIcon={<AddUserIcon />}>
                Add user
              </FormIteratorAddButton>
            }
            removeButton={
              <FormIteratorRemoveButton startIcon={<RemoveUserIcon />}>
                Remove user
              </FormIteratorRemoveButton>
            }
          >
            <ReferenceInput
              reference="users"
              source="."
              sort={{ field: "fullname", order: "ASC" }}
            >
              <AutocompleteInput
                label="User"
                sx={{ minWidth: "250px" }}
                optionText={(user) => {
                  const profile = user.profiles[0];
                  return (
                    `${user.company}${profile ? " - " : ""}${
                      profile?.firstName
                    } ${profile?.lastName}`.trim() || user.email
                  );
                }}
              />
            </ReferenceInput>
          </SimpleFormIterator>
        </ArrayInput>

        <TitleBox>
          <RouteOutlined
            style={{ color: "#FF7446", marginRight: 16, fontSize: 32 }}
          />
          Tours
        </TitleBox>
        <ArrayInput source="tours" label="" fullWidth>
          <SimpleFormIterator
            inline
            addButton={
              <FormIteratorAddButton startIcon={<AddTourIcon />}>
                Add tour
              </FormIteratorAddButton>
            }
            removeButton={
              <FormIteratorRemoveButton startIcon={<RemoveTourIcon />}>
                Remove tour
              </FormIteratorRemoveButton>
            }
            disableClear
            disableReordering
            className="tour-form-iterator"
          >
            <TextInput source="name" validate={required()} />
            <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
              <DateInput source="start" validate={required()} />
              <DateInput source="end" />
            </div>
            <BooleanInput source="archived" label="Archived" />
            <ArrayInput source="users" fullWidth label="Tour users">
              <SimpleFormIterator
                inline
                addButton={
                  <FormIteratorAddButton startIcon={<AddUserIcon />}>
                    Add user
                  </FormIteratorAddButton>
                }
                removeButton={
                  <FormIteratorRemoveButton startIcon={<RemoveUserIcon />}>
                    Remove user
                  </FormIteratorRemoveButton>
                }
                disableClear
                disableReordering
              >
                <ReferenceInput
                  reference="users"
                  source="."
                  sort={{ field: "fullname", order: "ASC" }}
                >
                  <AutocompleteInput
                    label="User"
                    sx={{ minWidth: "250px" }}
                    optionText={(user) => {
                      const profile = user.profiles[0];
                      return (
                        `${user.company}${profile ? " - " : ""}${
                          profile?.firstName
                        } ${profile?.lastName}`.trim() || user.email
                      );
                    }}
                  />
                </ReferenceInput>
              </SimpleFormIterator>
            </ArrayInput>
            <ArrayInput source="schedule" fullWidth>
              <SimpleFormIterator
                inline
                addButton={
                  <FormIteratorAddButton startIcon={<AddScheduleIcon />}>
                    Add schedule
                  </FormIteratorAddButton>
                }
                removeButton={
                  <FormIteratorRemoveButton startIcon={<RemoveScheduleIcon />}>
                    Remove schedule
                  </FormIteratorRemoveButton>
                }
                disableClear
                disableReordering
              >
                <ReferenceInput
                  reference="users"
                  source="user"
                  sort={{ field: "fullname", order: "ASC" }}
                >
                  <AutocompleteInput
                    label="User"
                    sx={{ minWidth: "250px" }}
                    optionText={(user) => {
                      const profile = user.profiles[0];
                      return (
                        `${user.company}${profile ? " - " : ""}${
                          profile?.firstName
                        } ${profile?.lastName}`.trim() || user.email
                      );
                    }}
                  />
                </ReferenceInput>
                <DateInput source="date" sx={{ minWidth: "150px" }} />
                <SelectInput
                  source="status"
                  choices={Object.entries(ProgramStatuses).map(
                    ([key, value]) => {
                      return { id: value.toLowerCase(), name: value };
                    }
                  )}
                />
              </SimpleFormIterator>
            </ArrayInput>
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
};

export default ProjectEdit;
