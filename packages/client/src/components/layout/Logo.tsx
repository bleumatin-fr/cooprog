import Link from "next/link";
import logo from "./logo_black.svg";
import Image from "next/image";

const Logo = () => {
  return (
    <Link href="/home">
      <Image
        src={logo}
        alt=""
        height={35}
        style={{
          alignSelf: "center",
          justifySelf: "flex-start",
          marginTop: 4,
          marginRight: 35,
          cursor: "pointer",
        }}
      />
    </Link>
  );
};

export default Logo;
