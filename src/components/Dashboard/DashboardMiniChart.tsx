import React from 'react';

const DashboardMiniChart = ({ type }: { type: string }) => {
  if (type === "bar-purple") {
    return (
      <div className="flex items-end justify-between h-[50px] gap-[5px] mt-4 w-full">
        {[80, 52, 98, 46, 83, 48, 69].map((h, i) => (
          <div key={i} className="w-full bg-[#A855F7] rounded-t-[4px]" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    );
  }

  const getChartDetails = () => {
    switch (type) {
      case "line-purple":
        return {
          stroke: "#6366F1",
          fill: "url(#gradient-purple)",
          path: "M0,22 C10,25 15,36 25,36 C32,36 34,8 38,8 C42,8 46,37 52,37 C58,37 61,2 67,2 C73,2 76,35 82,35 C90,35 93,11 100,11 L100,45 L0,45 Z",
          strokePath: "M0,22 C10,25 15,36 25,36 C32,36 34,8 38,8 C42,8 46,37 52,37 C58,37 61,2 67,2 C73,2 76,35 82,35 C90,35 93,11 100,11",
          defs: (
            <linearGradient id="gradient-purple" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          )
        };
      case "line-blue":
        return {
          stroke: "#2B7FFF",
          fill: "url(#gradient-blue)",
          path: "M0,25 C10,28 12,38 20,38 C28,38 32,5 37,5 C42,5 45,33 52,33 C59,33 62,12 68,12 C74,12 77,36 83,36 C89,36 93,16 100,16 L100,45 L0,45 Z",
          strokePath: "M0,25 C10,28 12,38 20,38 C28,38 32,5 37,5 C42,5 45,33 52,33 C59,33 62,12 68,12 C74,12 77,36 83,36 C89,36 93,16 100,16",
          defs: (
            <linearGradient id="gradient-blue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2B7FFF" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#2B7FFF" stopOpacity="0" />
            </linearGradient>
          )
        };
      case "line-green":
        return {
          stroke: "#00BC7D",
          fill: "url(#gradient-green)",
          path: "M0,20 C8,20 12,32 22,32 C32,32 35,14 41,14 C47,14 49,38 55,38 C61,38 65,8 70,8 C75,8 78,28 84,28 C90,28 94,8 100,8 L100,45 L0,45 Z",
          strokePath: "M0,20 C8,20 12,32 22,32 C32,32 35,14 41,14 C47,14 49,38 55,38 C61,38 65,8 70,8 C75,8 78,28 84,28 C90,28 94,8 100,8",
          defs: (
            <linearGradient id="gradient-green" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#00BC7D" stopOpacity="0.18" />
              <stop offset="95%" stopColor="#00BC7D" stopOpacity="0" />
            </linearGradient>
          )
        };
      default:
        return null;
    }
  };

  const details = getChartDetails();
  if (!details) return null;

  return (
    <div className="h-[50px] mt-4 w-full">
      <svg viewBox="0 0 100 45" className="w-full h-full" preserveAspectRatio="none">
        {details.defs && <defs>{details.defs}</defs>}
        {details.fill !== "transparent" && (
          <path d={details.path} fill={details.fill} />
        )}
        <path d={details.strokePath} fill="none" stroke={details.stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default DashboardMiniChart;
