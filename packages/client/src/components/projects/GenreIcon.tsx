import styled from "@emotion/styled";
import Image from "next/image";
import art from "../UI/icons/art.svg";
import book from "../UI/icons/book.svg";
import cinema from "../UI/icons/cinema.svg";
import music from "../UI/icons/music.svg";
import spectacle from "../UI/icons/spectacle.svg";
import theater from "../UI/icons/theater.svg";

interface IconProps {
  name: string;
  alt?: string;
  style?: any;
  color?: string;
  backgroundColor?: string;
}

const icons = {
  art,
  book,
  cinema,
  music,
  spectacle,
  theater,
} as { [key: string]: any };

const GenreItem = styled.div`
  font-size: 12px;
  padding: 8px;
  height: 47px;
  width: 47px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = ({ name, alt, color, backgroundColor }: IconProps) => {
  return (
    <GenreItem style={{ backgroundColor }}>
      <Image src={icons[name]} alt={alt || name} style={{ fill: color }} />
    </GenreItem>
  );
};

export default Icon;
