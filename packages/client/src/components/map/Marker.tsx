import L from "leaflet";

const createMarker = (
  backgroundColor: string,
  markerType: "default" | "circle" | "cluster" = "default",
  text?: string,
  borderColor: string = "unset",
  textColor: string = "white"
) => {
  switch (markerType) {
    case "default":
      return L.divIcon({
        html: `
    <div style="fill: ${backgroundColor};">
        <svg
            width="45"
            height="45"
            viewBox="0 0 700 700" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="m374.25 506.52c-22.051 13.379-50.785 6.3633-64.176-15.664-82.293-135.37-123.4-227.49-123.4-281.03 0-90.113 73.125-163.16 163.33-163.16s163.33 73.047 163.33 163.16c0 53.539-41.109 145.66-123.4 281.03-3.8906 6.4023-9.2695 11.777-15.684 15.664zm-24.074-226.52c38.703 0 70.078-31.34 70.078-70s-31.375-70-70.078-70c-38.699 0-70.074 31.34-70.074 70s31.375 70 70.074 70z"/>
      </svg></div>`,
        className: "svg-icon",
        iconSize: [45, 45],
        iconAnchor: [22, 40],
        popupAnchor: [3, 3],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    case "cluster":
      return L.divIcon({
        html: `
          <div style="fill: ${backgroundColor}; transition: all 0.5s;">
              <svg
                  width="45"
                  height="45"
                  viewBox="0 0 700 700" 
                  xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="350" cy="350" r="300" stroke="${borderColor}" stroke-width="40" fill-opacity="0.4"/>
                <circle cx="350" cy="350" r="250" stroke="${borderColor}" stroke-width="40" fill-opacity="0.6"/>
                <circle cx="350" cy="350" r="200" stroke="${borderColor}" stroke-width="40" fill-opacity="0.8"/>
                <circle cx="350" cy="350" r="150" stroke="${borderColor}" stroke-width="40" />
                <text font-size="15em" x="50%" y="50%" fill="${textColor}" text-anchor="middle" dominant-baseline="central">
                  ${text || ""}
                </text>
              </svg>
          </div>`,
        className: "svg-icon",
        iconSize: [45, 45],
        iconAnchor: [22, 22],
        popupAnchor: [1, 20],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
    case "circle":
      let fillStyle = "";
      let gradientDef = "";
      if (Array.isArray(backgroundColor)) {
        const gradient = generateGradient(backgroundColor);
        fillStyle = `url(#${gradient.gradientId})`;
        gradientDef = gradient.gradientDef;
      } else {
        fillStyle = backgroundColor;
      }
      return L.divIcon({
        html: `
        <div style="fill: ${backgroundColor}; transition: all 0.5s;">
            <svg
              width="45"
              height="45"
              viewBox="0 0 700 700"
              xmlns="http://www.w3.org/2000/svg"
            >
              ${gradientDef}
              <circle cx="350" cy="350" r="200" fill="${fillStyle}" stroke="${borderColor}" stroke-width="40" />
              <text font-size="15em" x="50%" y="50%" fill="white" text-anchor="middle" dominant-baseline="central">
                ${text || ""}
              </text>
            </svg>
          </div>`,
        className: "svg-icon",
        iconSize: [45, 45],
        iconAnchor: [22, 22],
        popupAnchor: [1, 20],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      });
  }
};

const generateGradient = (colors: string[]) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`; // Unique gradient ID
  const stops = colors
    .map(
      (color, index) =>
        `<stop offset="${
          (index / (colors.length - 1)) * 100
        }%" stop-color="${color}" />`
    )
    .join("");

  return {
    gradientId,
    gradientDef: `<defs><linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">${stops}</linearGradient></defs>`,
  };
};

export default createMarker;

export const ClusterIcon = ({ children, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={45}
    height={45}
    viewBox="0 0 700 700"
    {...props}
  >
    <circle
      cx={350}
      cy={350}
      r={300}
      fillOpacity={0.4}
      stroke="${borderColor}"
      strokeWidth={40}
    />
    <circle
      cx={350}
      cy={350}
      r={250}
      fillOpacity={0.6}
      stroke="${borderColor}"
      strokeWidth={40}
    />
    <circle
      cx={350}
      cy={350}
      r={200}
      fillOpacity={0.8}
      stroke="${borderColor}"
      strokeWidth={40}
    />
    <circle
      cx={350}
      cy={350}
      r={150}
      stroke="${borderColor}"
      strokeWidth={40}
    />
    <text
      x="50%"
      y="50%"
      fill="#fff"
      dominantBaseline="central"
      fontSize="15em"
      textAnchor="middle"
    >
      {children}
    </text>
  </svg>
);
