import {  Edit, SimpleForm, TextInput } from 'react-admin';

const ConfigurationEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="value" fullWidth multiline />
    </SimpleForm>
  </Edit>
);

export default ConfigurationEdit;
