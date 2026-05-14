import { Discipline } from "@cooprog/core";
import {
  BooleanInput,
  CheckboxGroupInput,
  Create,
  required,
  SelectInput,
  SimpleForm,
  TextInput,
} from "react-admin";

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <SelectInput
        source="programmingDisciplines"
        choices={[
          { id: Discipline.MUSIC, name: "Music" },
          { id: Discipline.PERFORMING_ARTS, name: "Performing Arts" },
        ]}
      />
      <TextInput type="email" source="email" validate={required()} />
      <TextInput source="firstName" validate={required()} />
      <TextInput source="lastName" validate={required()} />
      <TextInput source="company" validate={required()} />
      <TextInput source="userRole" label="Role in organization" />
      <BooleanInput source="optin" label="Optin mail" defaultValue={true} />
      <SelectInput
        source="role"
        choices={[
          { id: "diffusion_structure", name: "Structure de diffusion" },
          { id: "spectator", name: "Spectateur" },
          { id: "admin", name: "Administrateur" },
          { id: "artistic_team", name: "Équipe artistique" },
        ]}
        defaultValue="diffusion_structure"
        validate={required()}
      />
      <CheckboxGroupInput
        source="profiles[0].contactInformation.types"
        label="Preferred contact modes"
        choices={[
          { id: "email", name: "Email" },
          { id: "phone", name: "Phone" },
        ]}
        validate={required()}
      />
      <TextInput
        source="profiles[0].contactInformation.email"
        label="Email address"
      />
      <TextInput
        source="profiles[0].contactInformation.phone"
        label="Phone number"
      />
      <TextInput
        source="profiles[0].contactInformation.instructions"
        label="Contact instructions"
        multiline
        rows={4}
      />
    </SimpleForm>
  </Create>
);

export default UserCreate;
