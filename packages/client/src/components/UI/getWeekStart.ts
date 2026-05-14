const weekStart = (region: string, language: string) => {
  const regionSat = "AEAFBHDJDZEGIQIRJOKWLYOMQASDSY".match(/../g);
  const regionSun =
    "AGARASAUBDBRBSBTBWBZCACNCODMDOETGTGUHKHNIDILINJMJPKEKHKRLAMHMMMOMTMXMZNINPPAPEPHPKPRPTPYSASGSVTHTTTWUMUSVEVIWSYEZAZW".match(
      /../g
    );
  const languageSat = ["ar", "arq", "arz", "fa"];
  const languageSun =
    "amasbndzengnguhehiidjajvkmknkolomhmlmrmtmyneomorpapssdsmsnsutatethtnurzhzu".match(
      /../g
    );

  return region
    ? regionSun?.includes(region)
      ? 0
      : regionSat?.includes(region)
      ? 6
      : 1
    : languageSun?.includes(language)
    ? 0
    : languageSat?.includes(language)
    ? 6
    : 1;
};

const getWeekStart = (locale: string) => {
  const parts = locale.match(
    /^([a-z]{2,3})(?:-([a-z]{3})(?=$|-))?(?:-([a-z]{4})(?=$|-))?(?:-([a-z]{2}|\d{3})(?=$|-))?/i
  );
  if (!parts) return 1;
  return weekStart(parts[4], parts[1]);
};

export default getWeekStart;
