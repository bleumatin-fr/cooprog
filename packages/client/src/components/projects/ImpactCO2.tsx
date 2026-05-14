import { Etiquette } from "@incubateur-ademe/impactco2-react";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

type Comparisons = React.ComponentProps<typeof Etiquette>["comparisons"];
type Language = React.ComponentProps<typeof Etiquette>["language"];

const comparisons: Comparisons = [
  // eau du robinet
  "eaudurobinet",
  // Aspirateur / lave vaisselle / four électrique
  "aspirateur",
  "lavevaisselle",
  "fourelectrique",
  // chaise
  "chaiseenbois",
  // jeans / t-shirt en coton / paire de chaussures de sport
  "jeans",
  "tshirtencoton",
  "chaussuresdesport",
  // tomate / avocat / carotte / pomme / pastèque / orange / noix de coco / kiwi / figue / citron / brocoli / aubergine / épinard / maïs / potiron
  "tomate",
  "avocat",
  "carotte",
  "pomme",
  "pasteque",
  "orange",
  "noixdecoco",
  "kiwi",
  "figue",
  "citron",
  "brocoli",
  "aubergine",
  "epinard",
  "mais",
  "potiron",
  // avion trajet court / long / scooter / voiture thermique / trotinette / vélo électrique
  "avion-courtcourrier",
  "avion-longcourrier",
  "scooter",
  "voiturethermique",
  "trottinette",
  "veloelectrique",
  // chauffage au gaz / poele à bois par m2
  "chauffagegaz",
  "poeleabois",
  // livraison à domicile
  "livraisondomicile",
  // email / Go de données / recherche sur le web
  "email",
  "stockagedonnee",
  "rechercheweb",
  // A/R Paris Marseille en TGV / A/R Paris Berlin en TGV / A/R Paris New-York en avion / intégrale de friends en streaming / maison neuve
  "tgv-paris-marseille",
  "tgv-paris-berlin",
  "avion-pny",
  "friends",
  "maisonneuve",
];

interface ImpactCO2Props {
  value: number;
}

const ImpactCO2 = ({ value }: ImpactCO2Props) => {
  const { i18n } = useTranslation();
  const language: Language = i18n.language as Language;
  const randomlySortedComparisons = useMemo(
    () => [...comparisons].sort(() => Math.random() - 0.5),
    []
  );
  return (
    <Etiquette
      value={value}
      comparisons={randomlySortedComparisons}
      animated
      language={language}
    />
  );
};

export default ImpactCO2;
