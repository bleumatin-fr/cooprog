import { User } from "@cooprog/core";
import styled from "@emotion/styled";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  flex-grow: 1;
`;

interface UsersListProps {
  users: User[];
  getNextPage: () => void;
  getPreviousPage: () => void;
  totalUsers: number;
  pageSizeOptions?: number[];
  checkboxSelection?: boolean;
  onRowClick?: (params: any) => void;
  disabled?: boolean;
}

const UsersList = ({
  users,
  getNextPage,
  getPreviousPage,
  totalUsers,
  pageSizeOptions = [12],
  checkboxSelection = false,
  onRowClick,
  disabled,
}: UsersListProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: pageSizeOptions[0],
    page: 0,
  } as GridPaginationModel);

  const handlePaginationModelChange = (
    model: GridPaginationModel,
    details: GridCallbackDetails<any>,
  ) => {
    setPaginationModel(model);
    if (model.page === paginationModel.page) return;
    if (model.page < paginationModel.page) {
      return getPreviousPage();
    }
    if (model.page > paginationModel.page) {
      return getNextPage();
    }
  };

  const rows = users.map((user) => ({
    id: user._id,
    ...user,
  }));

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "firstName",
      headerName: t("users:table.firstName"),
      width: 150,
      sortable: false,
    },
    {
      field: "lastName",
      headerName: t("users:table.lastName"),
      width: 150,
      sortable: false,
    },
    {
      field: "company",
      headerName: t("users:table.company"),
      width: 150,
      sortable: false,
    },
    {
      field: "distance",
      headerName: t("users:table.distance"),
      type: "string",
      valueGetter: (value, row) => {
        return row.distance ? Math.round(row.distance) + " km" : "";
      },
      width: 110,
      sortable: false,
    },
  ];
  return (
    <Container>
      <DataGrid
        className="user-card"
        rowCount={totalUsers}
        rows={rows}
        columns={columns}
        pagination={undefined}
        disableRowSelectionOnClick
        onRowClick={(params) => {
          if (disabled) return;
          if (onRowClick) return onRowClick(params);
          router.push(`/users/${params.id}`);
        }}
        autoHeight
        checkboxSelection={checkboxSelection}
        disableColumnFilter
        disableColumnMenu
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={pageSizeOptions}
      />
    </Container>
  );
};

export default UsersList;
