import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { Project, Tour } from "@cooprog/core";
import Button from "../UI/Button";
import TourEditDialog from "./TourEditDialog";
import EditIcon from "@mui/icons-material/Edit";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import styled from "@emotion/styled";

interface MissingInformationListProps {
  project: Project;
  tour: Tour;
  style?: React.CSSProperties;
  onTourEdit?: (update: Partial<Tour>) => void;
}

const Block = styled.div`
  background: #f5f7fa;
  border-radius: 16px;
  border: 1.5px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 24px 24px 16px 24px;
  margin: 16px 0 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

const Illustration = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #123036;
`;

const List = styled.ul`
  margin: 0 0 8px 0;
  padding-left: 20px;
`;

const ListItem = styled.li`
  font-size: 15px;
  color: #666;
  margin-bottom: 2px;
`;

const MissingInformationList: React.FC<MissingInformationListProps> = ({
  project,
  tour,
  style,
  onTourEdit,
}) => {
  const { t } = useTranslation();
  const [tourEditDialogOpen, setTourEditDialogOpen] = useState(false);
  const hypotheses = [];
  if (!project.numberOfPeopleOnTour) {
    hypotheses.push(
      t("projects:avoided-co2-simulator.hypothesis-no-number-of-people")
    );
  }
  if (!tour.peopleTransportMode) {
    hypotheses.push(
      t("projects:avoided-co2-simulator.hypothesis-no-people-transport-mode")
    );
  }
  if (!tour.decorationsWeight) {
    hypotheses.push(t("projects:avoided-co2-simulator.hypothesis-no-weight"));
  }
  if (tour.decorationsWeight && !tour.decorationsTransportMode) {
    hypotheses.push(
      t(
        "projects:avoided-co2-simulator.hypothesis-no-decoration-transport-mode"
      )
    );
  }
  if (!tour.artisticTeamPlace) {
    hypotheses.push(
      t("projects:avoided-co2-simulator.hypothesis-no-artistic-team-place")
    );
  }
  if (hypotheses.length === 0) return null;
  return (
    <Block style={style}>
      <Illustration>
        <InfoOutlinedIcon
          sx={{ fontSize: 44, color: "#1976d2" }}
          aria-label="info"
        />
      </Illustration>
      <Content>
        <Title>
          {t("projects:avoided-co2-simulator.missing-information-title")}
        </Title>
        <List>
          {hypotheses.map((h, i) => (
            <ListItem key={i}>{h}</ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: "8px 0 0 0" }}
          onClick={() => setTourEditDialogOpen(true)}
          startIcon={<EditIcon />}
        >
          {t("projects:avoided-co2-simulator.cta-edit-tour")}
        </Button>
        <TourEditDialog
          open={tourEditDialogOpen}
          tour={tour}
          onClose={() => setTourEditDialogOpen(false)}
          onValidate={(update: Partial<Tour>) => {
            setTourEditDialogOpen(false);
            if (onTourEdit) onTourEdit(update);
          }}
        />
      </Content>
    </Block>
  );
};

export default MissingInformationList;
