import { Discipline } from "@cooprog/core";
import styled from "@emotion/styled";
import CategoryIcon from "@mui/icons-material/LocalOffer";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import TheatreMasksIcon from "@mui/icons-material/TheaterComedy";
import { Card, CardContent } from "@mui/material";
import Chip from "@mui/material/Chip";
import jsonExport from "jsonexport/dist";
import { pick } from "lodash";
import { MouseEvent, useEffect, useRef, useState } from "react";
import {
  ArrayField,
  BulkDeleteButton,
  Button,
  Count,
  Datagrid,
  DateField,
  FilterList,
  FilterListItem,
  List,
  SelectField,
  SelectInput,
  TextField,
  TextInput,
  useListFilterContext,
  useListPaginationContext,
  useNotify,
  useRecordContext,
  WithListContext,
} from "react-admin";
import httpClient from "../httpClient";
import { Role } from "@cooprog/core";
import SendIcon from "@mui/icons-material/Send";

const API_URL =
  import.meta.env.VITE_APP_API_URL ||
  "http://localhost:3000/api/authentication";

const userFilters = [
  <TextInput label="Search" source="q" alwaysOn />,
  <SelectInput
    label="Role"
    source="role"
    choices={Object.values(Role).map((role) => ({
      id: role,
      name: role,
    }))}
    alwaysOn={true}
  />,
  <SelectInput
    label="Status"
    source="status"
    choices={[
      { id: "awaiting-moderation", name: "Awaiting moderation" },
      { id: "pending-moderation", name: "Moderation pending" },
      { id: "ok", name: "OK" },
      { id: "banned", name: "Not approved" },
      { id: "invitation-pending", name: "Invitation pending" },
      {
        id: "profile-changes-to-moderate",
        name: "Profile changes to moderate",
      },
    ]}
    alwaysOn={true}
  />,
  <SelectInput
    label="Programming Discipline"
    source="programmingDisciplines"
    choices={[
      { id: Discipline.PERFORMING_ARTS, name: "Performing Arts" },
      { id: Discipline.MUSIC, name: "Music" },
    ]}
    translateChoice={false}
  />,
];

const FilterListItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const FilterWithSaveInLocalStorage = () => {
  const { filterValues, setFilters } = useListFilterContext();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const isInitialRender = useRef(true);

  // Charger les filtres depuis localStorage uniquement au montage initial
  useEffect(() => {
    if (isInitialRender.current) {
      const savedFilters = localStorage.getItem("userListFilters");
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          setFilters(parsedFilters, null, false);
        } catch (e) {
          // En cas d'erreur de parsing, on supprime les filtres invalides
          localStorage.removeItem("userListFilters");
        }
      }
      setInitialLoadDone(true);
      isInitialRender.current = false;
    }
  }, [setFilters]);

  // Sauvegarder les filtres dans localStorage uniquement après le chargement initial
  useEffect(() => {
    if (
      initialLoadDone &&
      filterValues &&
      Object.keys(filterValues).length > 0
    ) {
      localStorage.setItem("userListFilters", JSON.stringify(filterValues));
    }
  }, [filterValues, initialLoadDone]);

  // Fonction pour réinitialiser les filtres enregistrés
  const resetFilters = () => {
    localStorage.removeItem("userListFilters");
    setFilters({}, null, false);
  };

  return (
    <Card
      sx={{ order: -1, mr: 2, mt: 9, width: 300, minWidth: 300, maxWidth: 300 }}
    >
      <CardContent>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0 }}>Filtres</h3>
          <Button label="Réinitialiser" size="small" onClick={resetFilters} />
        </div>

        <FilterList label="Status" icon={<CategoryIcon />}>
          <FilterListItem
            label={
              <FilterListItemContainer>
                Awaiting moderation
                <Chip
                  label={<Count filter={{ status: "awaiting-moderation" }} />}
                  color="warning"
                  variant="outlined"
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ status: "awaiting-moderation" }}
          />
          <FilterListItem
            label={
              <FilterListItemContainer>
                Moderation pending
                <Chip
                  label={<Count filter={{ status: "pending-moderation" }} />}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ status: "pending-moderation" }}
          />
          <FilterListItem
            label={
              <FilterListItemContainer>
                Change to moderate
                <Chip
                  label={
                    <Count filter={{ status: "profile-changes-to-moderate" }} />
                  }
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ status: "profile-changes-to-moderate" }}
          />
          <FilterListItem
            label={
              <FilterListItemContainer>
                OK
                <Chip
                  label={<Count filter={{ status: "ok" }} />}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ status: "ok" }}
          />
          <FilterListItem
            label={
              <FilterListItemContainer>
                Not approved
                <Chip
                  label={<Count filter={{ status: "banned" }} />}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ status: "banned" }}
          />
        </FilterList>
        <FilterListItem
          label={
            <FilterListItemContainer>
              Invitation pending
              <Chip
                label={<Count filter={{ status: "invitation-pending" }} />}
                color="info"
                variant="outlined"
                size="small"
              />
            </FilterListItemContainer>
          }
          value={{ status: "invitation-pending" }}
        />

        <FilterList label="Programming Disciplines" icon={<TheatreMasksIcon />}>
          <FilterListItem
            label={
              <FilterListItemContainer>
                Spectacle Vivant
                <Chip
                  label={
                    <Count
                      filter={{
                        programmingDisciplines: Discipline.PERFORMING_ARTS,
                      }}
                    />
                  }
                  sx={{ backgroundColor: "#FF8A47", color: "#FFFFFF" }}
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ programmingDisciplines: Discipline.PERFORMING_ARTS }}
          />
          <FilterListItem
            label={
              <FilterListItemContainer>
                Music
                <Chip
                  label={
                    <Count
                      filter={{
                        programmingDisciplines: Discipline.MUSIC,
                      }}
                    />
                  }
                  sx={{ backgroundColor: "#6BAF48", color: "#FFFFFF" }}
                  size="small"
                />
              </FilterListItemContainer>
            }
            value={{ programmingDisciplines: Discipline.MUSIC }}
          />
        </FilterList>
        <FilterListItem
          label={
            <FilterListItemContainer>
              Both
              <Chip
                label={
                  <Count
                    filter={{
                      programmingDisciplines: [
                        Discipline.PERFORMING_ARTS,
                        Discipline.MUSIC,
                      ],
                    }}
                  />
                }
                sx={{ backgroundColor: "#aaa", color: "#FFFFFF" }}
                size="small"
              />
            </FilterListItemContainer>
          }
          value={{
            programmingDisciplines: [
              Discipline.PERFORMING_ARTS,
              Discipline.MUSIC,
            ],
          }}
        />
      </CardContent>
    </Card>
  );
};

// Component to persist pagination state in sessionStorage
const PaginationPersistence = () => {
  const { page, perPage, setPage, setPerPage } = useListPaginationContext();
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const isInitialRender = useRef(true);

  // Load pagination state from sessionStorage on initial mount
  useEffect(() => {
    if (isInitialRender.current) {
      const savedPagination = sessionStorage.getItem("userListPagination");
      if (savedPagination) {
        try {
          const parsedPagination = JSON.parse(savedPagination);
          if (parsedPagination.page) {
            // Use setTimeout to ensure the page is set after React Admin's initialization
            setTimeout(() => {
              setPage(parsedPagination.page);
            }, 100);
          }
          if (parsedPagination.perPage) {
            setPerPage(parsedPagination.perPage);
          }
        } catch (e) {
          // Remove invalid data
          sessionStorage.removeItem("userListPagination");
        }
      }
      setInitialLoadDone(true);
      isInitialRender.current = false;
    }
  }, [setPage, setPerPage]);

  // Save pagination state to sessionStorage after initial load
  useEffect(() => {
    if (initialLoadDone) {
      sessionStorage.setItem(
        "userListPagination",
        JSON.stringify({ page, perPage })
      );
    }
  }, [page, perPage, initialLoadDone]);

  return null; // This component doesn't render anything
};

const downloadCSV = (csv: string, filename: string): void => {
  const fakeLink = document.createElement("a");
  fakeLink.style.display = "none";
  document.body.appendChild(fakeLink);
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  // @ts-ignore
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // Manage IE11+ & Edge
    // @ts-ignore
    window.navigator.msSaveOrOpenBlob(blob, `${filename}.csv`);
  } else {
    fakeLink.setAttribute("href", URL.createObjectURL(blob));
    fakeLink.setAttribute("download", `${filename}.csv`);
    fakeLink.click();
  }
};

const exporter = (users: any[]) => {
  const columns = [
    "email",
    "firstName",
    "lastName",
    "company",
    "role",
    "createdAt",
    "lastLogin",
    "lastActive",
    "status",
  ];
  const usersForExport = users.map((user: any) => {
    return pick(user, columns);
  });
  jsonExport(
    usersForExport,
    {
      headers: columns, // order fields in the export
    },
    (err, csv) => {
      downloadCSV(csv, "users"); // download as 'posts.csv` file
    }
  );
};
const ResendInvitationButton = () => {
  const notify = useNotify();
  const record = useRecordContext();

  const isInvitationPending =
    record?.hasPassword === false &&
    record?.email !== null &&
    record?.email !== undefined;

  if (!isInvitationPending) {
    return null;
  }

  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await httpClient(
      `${API_URL}/users/${record?.id}/resend-invitation`,
      {
        method: "POST",
      }
    );
    if (result.status === 200 && result.json.success) {
      notify("Invitation resent successfully", {
        type: "success",
      });
    } else {
      notify("Failed to resend invitation", {
        type: "error",
      });
    }
  };

  return (
    <Button
      label="Resend Invitation"
      startIcon={<SendIcon />}
      onClick={handleClick}
    />
  );
};

const ImpersonateButton = () => {
  const record = useRecordContext();

  const handleClick = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await httpClient(
      `${API_URL}/users/${record?.id}/impersonate`,
      {
        method: "POST",
      }
    );
    if (result.status === 200 && result.json.success) {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          success: true,
          token: result.json.token,
        })
      );
      window.open(result.json.url);
    }
  };

  return (
    <Button
      label="Impersonate"
      startIcon={<SupervisedUserCircleIcon />}
      onClick={handleClick}
    />
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
    <div style={{ display: "flex", gap: "4px" }}>
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

export const UserList = () => (
  <List
    sort={{ field: "createdAt", order: "DESC" }}
    filters={userFilters}
    aside={<FilterWithSaveInLocalStorage />}
    exporter={exporter}
  >
    <PaginationPersistence />
    <Datagrid
      rowClick="edit"
      bulkActionButtons={
        <BulkDeleteButton
          mutationMode="pessimistic"
          confirmTitle="Confirmer la suppression"
          confirmContent="Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ? Cette action est irréversible."
        />
      }
    >
      <TextField source="company" />
      <ProgrammingDisciplinesField />
      <TextField source="email" />
      {/* <TextField source="firstName" />
      <TextField source="lastName" /> */}
      <ArrayField source="profiles">
        <WithListContext
          render={({ data }) => (
            <ul style={{ paddingLeft: 15 }}>
              {data?.map((profile) => (
                <li key={profile._id}>
                  {`${profile.firstName} ${profile.lastName}`}
                  {profile.role ? ` (${profile.role})` : null}
                  {profile.contactInformation && (
                    <div style={{ marginLeft: "20px" }}>
                      {profile.contactInformation.type === "email" && (
                        <div>Email: {profile.contactInformation.email}</div>
                      )}
                      {profile.contactInformation.type === "phone" && (
                        <div>Phone: {profile.contactInformation.phone}</div>
                      )}
                      {profile.contactInformation.instructions && (
                        <div>
                          Instructions:{" "}
                          {profile.contactInformation.instructions}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        />
      </ArrayField>
      <SelectField
        source="role"
        choices={[
          { id: "diffusion_structure", name: "Structure de diffusion" },
          { id: "spectator", name: "Spectator" },
          { id: "admin", name: "Administrateur" },
          { id: "artistic_team", name: "Équipe artistique" },
        ]}
      />
      <DateField source="createdAt" showTime />
      <DateField source="lastLogin" showTime />
      <DateField source="lastActive" showTime />
      <ImpersonateButton />
      <ResendInvitationButton />
    </Datagrid>
  </List>
);

export default UserList;
