import dynamic from "next/dynamic";

const Map = dynamic(() => import("./NotDynamicMap"), {
  ssr: false,
});

export default Map;
