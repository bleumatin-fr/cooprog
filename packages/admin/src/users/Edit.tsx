import { Discipline } from "@cooprog/core";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { Link } from "@mui/material";
import Chip from "@mui/material/Chip";
import { get } from "lodash";
import {
  ArrayField,
  ArrayInput,
  BooleanInput,
  CheckboxGroupInput,
  Datagrid,
  DateField,
  DateInput,
  DeleteButton,
  Edit,
  EditButton,
  FormDataConsumer,
  NumberField,
  NumberInput,
  required,
  sanitizeFieldRestProps,
  SaveButton,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  Toolbar,
  UrlFieldProps,
  useGetList,
  useRecordContext,
} from "react-admin";
import AddressAutoComplete from "./AddressAutocomplete";

const NearbyUsers = () => {
  const record = useRecordContext();
  const nearbyUsers = useGetList("users", {
    meta: { queryType: "nearby" },
    filter: {
      id: record?.id,
    },
  });

  return (
    <div>
      <h2>Nearby users</h2>
      <ArrayField record={{ users: nearbyUsers.data }} source="users">
        <Datagrid>
          <TextField source="firstName" />
          <TextField source="lastName" />
          <TextField source="company" />
          <TextField source="status" />
          <ArrayField source="locations">
            <Datagrid>
              <TextField source="label" />
              <TextField source="location.address" />
            </Datagrid>
          </ArrayField>
          <NumberField
            source="distance"
            options={{
              style: "unit",
              unit: "kilometer",
              unitDisplay: "short",
            }}
          />
          <EditButton label="View" icon={<RemoveRedEyeIcon />} />
        </Datagrid>
      </ArrayField>
    </div>
  );
};

const Projects = () => {
  const record = useRecordContext();
  const interestedProjects = useGetList("projects", {
    filter: {
      users: record?.id,
    },
  });

  return (
    <div>
      <ArrayField
        record={{ projects: interestedProjects.data }}
        source="projects"
      >
        <Datagrid>
          <TextField source="artist" />
          <TextField source="work" />
          <EditButton
            label="View"
            icon={<RemoveRedEyeIcon />}
            resource="projects"
          />
        </Datagrid>
      </ArrayField>
    </div>
  );
};

const UserEditToolbar = () => (
  <Toolbar sx={{ justifyContent: "space-between" }}>
    <SaveButton alwaysEnable />
    <DeleteButton
      mutationMode="pessimistic"
      confirmTitle="Confirmer la suppression"
      confirmContent="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
    />
  </Toolbar>
);

const UrlField = (props: UrlFieldProps) => {
  const { className, emptyText, source, ...rest } = props;
  const record = useRecordContext(props);
  if (!source) return null;
  const value = get(record, source);

  if (!value) return null;
  let hrefValue = value;
  if (!hrefValue.startsWith("http")) {
    hrefValue = `https://${hrefValue}`;
  }
  return (
    <Link
      className={className}
      href={hrefValue}
      onClick={(e: any) => e.stopPropagation()}
      variant="body2"
      {...sanitizeFieldRestProps(rest)}
    >
      {value}
    </Link>
  );
};

const ProgrammingDisciplinesField = () => {
  const record = useRecordContext();

  if (
    !record ||
    !record.programmingDisciplines ||
    record.programmingDisciplines.length === 0
  ) {
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

  return (
    <div style={{ display: "flex", gap: "4px", margin: "8px 0" }}>
      {record.programmingDisciplines.map((discipline: string) => {
        const style = disciplineStyles[discipline as Discipline] || {
          backgroundColor: "#f5f5f5",
          color: "#333333",
        };

        return (
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
        );
      })}
    </div>
  );
};

export const UserEdit = () => {
  return (
    <Edit>
      <TabbedForm toolbar={<UserEditToolbar />}>
        <TabbedForm.Tab label="General information">
          <SelectArrayInput
            source="programmingDisciplines"
            choices={[
              { id: Discipline.MUSIC, name: "Music" },
              { id: Discipline.PERFORMING_ARTS, name: "Performing Arts" },
            ]}
            label="Programmed disciplines"
          />
          <TextInput type="email" source="email" validate={required()} />
          <TextInput source="company" />
          <TextInput
            source="companyDescription"
            multiline
            rows={4}
            label="Company Description"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <TextInput source="link" />
            <UrlField source="link" target="_blank" />
          </div>
          <TextInput source="avatarUrl" label="Avatar URL" />
          <BooleanInput source="optin" label="Optin mail" defaultValue={true} />
          <SelectInput
            source="role"
            choices={[
              { id: "diffusion_structure", name: "Structure de diffusion" },
              { id: "spectator", name: "Spectator" },
              { id: "admin", name: "Administrateur" },
              { id: "artistic_team", name: "Équipe artistique" },
            ]}
            validate={required()}
          />
          <FormDataConsumer<{ role: string }>>
            {({ formData, ...rest }) => {
              return formData.role === "spectator" ? (
                <DateInput
                  source="expiresAt"
                  label="Account will be deleted at"
                  defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                />
              ) : null;
            }}
          </FormDataConsumer>
          <SelectInput
            source="status"
            choices={[
              { id: "awaiting-moderation", name: "Awaiting moderation" },
              { id: "pending-moderation", name: "Moderation pending" },
              { id: "ok", name: "OK" },
              { id: "banned", name: "Not approved" },
            ]}
            validate={required()}
          />
          <SelectInput
            source="language"
            choices={[
              { id: "fr", name: "Français" },
              { id: "en", name: "English" },
            ]}
            label="Preferred language"
          ></SelectInput>

          <NearbyUsers />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Profiles">
          <ArrayInput source="profiles">
            <SimpleFormIterator>
              <TextInput source="firstName" validate={required()} />
              <TextInput source="lastName" validate={required()} />
              <TextInput source="role" label="Role in organization" />
              <CheckboxGroupInput
                source="contactInformation.types"
                label="Preferred contact modes"
                choices={[
                  { id: "email", name: "Email" },
                  { id: "phone", name: "Phone" },
                ]}
                validate={required()}
              />
              <TextInput
                source="contactInformation.email"
                label="Email address"
              />
              <TextInput
                source="contactInformation.phone"
                label="Phone number"
              />
              <TextInput
                source="contactInformation.instructions"
                label="Contact instructions"
                multiline
                rows={4}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Address">
          <ArrayInput source="locations">
            <SimpleFormIterator>
              <TextInput source="label" validate={required()} />
              <BooleanInput source="isMain" />
              <AddressAutoComplete
                label="Full address"
                source="location.address"
              />
              <TextInput label="City" source="location.data.city" />
              <TextInput label="Country" source="location.data.country" />
              <TextInput
                label="Country code"
                source="location.data.country_code"
              />
              <TextInput label="Postal code" source="location.data.postcode" />
              <NumberInput
                source="location.geolocation.coordinates[0]"
                label="Longitude"
              />
              <NumberInput
                source="location.geolocation.coordinates[1]"
                label="Latitude"
              />
            </SimpleFormIterator>
          </ArrayInput>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Projects">
          <Projects />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Audit log">
          <ArrayField
            source="changeLog"
            sort={{ field: "createdAt", order: "DESC" }}
          >
            <Datagrid bulkActionButtons={false}>
              <DateField
                source="createdAt"
                label="Date"
                showTime
                sortable={false}
              />
              <TextField
                source="createdBy.firstName"
                label="By"
                sortable={false}
              />
              <TextField
                source="createdBy.lastName"
                label=""
                sortable={false}
              />
              <ArrayField source="changes">
                <Datagrid bulkActionButtons={false}>
                  <TextField source="field" sortable={false} />
                  <TextField source="oldValue" sortable={false} />
                  <TextField source="newValue" sortable={false} />
                </Datagrid>
              </ArrayField>
            </Datagrid>
          </ArrayField>
        </TabbedForm.Tab>
      </TabbedForm>
    </Edit>
  );
};

export default UserEdit;
