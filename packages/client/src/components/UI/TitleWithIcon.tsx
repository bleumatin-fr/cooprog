import { Box, SvgIconProps, Typography } from "@mui/material";

type TitleWithIconProps = {
  title: string;
  icon: React.ElementType<SvgIconProps>;
  id?: string;
};

const TitleWithIcon = ({ title, icon: Icon, id }: TitleWithIconProps) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      p={1.5}
      border="1px solid"
      borderColor="grey.300"
      borderRadius={1}
      bgcolor={"var(--color-light-gray)"}
      id={id}
    >
      <Icon color="primary" />
      <Typography variant="h5">{title}</Typography>
    </Box>
  );
};

export default TitleWithIcon;
