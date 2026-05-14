import { useMemo } from "react";
import {
  Project,
  Tour,
  Program,
  ProgramStatuses,
  Location,
} from "@cooprog/core";
import { useTranslation } from "next-i18next";
import {
  distanceBetween,
  distanceBetweenLocations,
  getCenter,
  getEmissionFactor,
} from "./co2Utils";

export interface EmissionFactor {
  icon: string;
  label: string;
  emissionFactor: number;
  unit?: string;
  source?: { label: string; link: string };
}

export interface ProgramWithCO2Information extends Partial<Program> {
  route?: {
    withCoprogrammation: {
      routeLabel: string;
      kmValue: number;
    };
    withoutCoprogrammation: {
      routeLabel: string;
      kmValue: number;
    };
  };
  co2?: {
    freight: {
      emissionFactor: EmissionFactor;
      weight: number;
      avoidedCo2Kg: number;
    };
    people: {
      emissionFactor: EmissionFactor;
      count: number;
      avoidedCo2Kg: number;
    };
    total: {
      avoidedCo2Kg: number;
    };
  };
}

const getAddress = (location: Location) => {
  return [
    location?.data?.village ||
      location?.data?.town ||
      location?.data?.city ||
      location?.data?.municipality ||
      location?.data?.county ||
      location?.data?.state,
    location?.data?.country,
  ]
    .filter(Boolean)
    .join(", ");
};

// Helper function to compute avoided CO2 for a single tour
function computeTourAvoidedCO2(
  tour: Tour | undefined,
  peopleEmissionFactor: EmissionFactor,
  freightEmissionFactor: EmissionFactor,
  artisticBase: ProgramWithCO2Information
): {
  steps: ProgramWithCO2Information[];
  totalAvoidedCO2Tons: number;
} {
  if (!tour) {
    return { steps: [], totalAvoidedCO2Tons: 0 };
  }

  const schedules = (tour.schedule || [])
    .filter((program: any) => {
      if (tour.archived) {
        return program.status === ProgramStatuses.SHOW_CONFIRMED;
      } else {
        return (
          program.status === ProgramStatuses.SHOW_CONFIRMED ||
          program.status === ProgramStatuses.SHOW_PENDING
        );
      }
    })
    .sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .filter((program, index, self) => {
      return (
        index ===
        self.findIndex((p) => {
          const sameLocation =
            p.location?.geolocation?.coordinates?.[0] ===
              program.location?.geolocation?.coordinates?.[0] &&
            p.location?.geolocation?.coordinates?.[1] ===
              program.location?.geolocation?.coordinates?.[1];
          return sameLocation;
        })
      );
    })
    .map((schedule, index) => {
      return {
        ...schedule,
        location: {
          ...schedule.location!,
          address: getAddress(schedule.location!),
        },
      };
    });

  const steps = [
    artisticBase,
    ...schedules.map((schedule, index) => {
      const from = schedule.location;
      const to = schedules[index + 1]?.location;
      if (!from || !to) {
        return {
          ...schedule,
          co2: {
            freight: {
              emissionFactor: freightEmissionFactor,
              weight: tour.decorationsWeight || 0,
              avoidedCo2Kg: 0,
            },
            people: {
              emissionFactor: peopleEmissionFactor,
              count: tour.numberOfPeopleOnTour || 1,
              avoidedCo2Kg: 0,
            },
            total: {
              avoidedCo2Kg: 0,
            },
          },
        };
      }

      const withCoprogrammationKmValue = distanceBetweenLocations(from, to);
      const withoutCoprogrammationKmValue = distanceBetweenLocations(
        from,
        artisticBase.location!,
        to
      );

      const avoidedKmValue =
        withoutCoprogrammationKmValue - withCoprogrammationKmValue;
      const freightAvoidedCo2Kg =
        avoidedKmValue *
        freightEmissionFactor.emissionFactor *
        ((tour.decorationsWeight || 0) / 1000);
      const peopleAvoidedCo2Kg =
        avoidedKmValue *
        peopleEmissionFactor.emissionFactor *
        (tour.numberOfPeopleOnTour || 1);
      return {
        ...schedule,
        route: {
          withCoprogrammation: {
            routeLabel: [from.address, to.address].join(" > "),
            kmValue: withCoprogrammationKmValue,
          },
          withoutCoprogrammation: {
            routeLabel: [
              from.address,
              artisticBase.location!.address,
              to.address,
            ].join(" > "),
            kmValue: withoutCoprogrammationKmValue,
          },
        },
        co2: {
          freight: {
            emissionFactor: freightEmissionFactor,
            weight: tour.decorationsWeight || 0,
            avoidedCo2Kg: freightAvoidedCo2Kg,
          },
          people: {
            emissionFactor: peopleEmissionFactor,
            count: tour.numberOfPeopleOnTour || 1,
            avoidedCo2Kg: peopleAvoidedCo2Kg,
          },
          total: {
            avoidedCo2Kg: freightAvoidedCo2Kg + peopleAvoidedCo2Kg,
          },
        },
      };
    }),
    artisticBase,
  ];

  const totalAvoidedCO2Tons =
    steps.reduce(
      (acc: number, step) => acc + (step.co2?.total?.avoidedCo2Kg || 0),
      0
    ) / 1000;

  return { steps, totalAvoidedCO2Tons };
}

export function useTourAvoidedCO2(tour: Tour | undefined): {
  totalAvoidedCO2Tons: number;
  steps: ProgramWithCO2Information[];
  optimizedSteps: ProgramWithCO2Information[];
  optimizationSavings: number;
} {
  const { t } = useTranslation();

  const peopleTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.people-transport-mode",
    {
      returnObjects: true,
    }
  ) as Record<
    string,
    {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    }
  >;

  const peopleEmissionFactor = useMemo(
    () =>
      getEmissionFactor(
        peopleTransportModeOptions,
        tour?.peopleTransportMode || ""
      ),
    [peopleTransportModeOptions, tour?.peopleTransportMode]
  );

  const decorationsTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.decorations-transport-mode",
    { returnObjects: true }
  ) as Record<
    string,
    {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    }
  >;
  const freightEmissionFactor = useMemo(
    () =>
      getEmissionFactor(
        decorationsTransportModeOptions,
        tour?.decorationsTransportMode || ""
      ),
    [decorationsTransportModeOptions, tour?.decorationsTransportMode]
  );

  const artisticBaseLabel = t("projects:avoided-co2-simulator.artistic-base");

  const artisticBase = useMemo(() => {
    let coordinates: [number, number] | undefined =
      tour?.artisticTeamPlace?.geolocation?.coordinates;
    if (!tour?.artisticTeamPlace?.geolocation?.coordinates) {
      coordinates = getCenter(
        (tour?.schedule || [])
          .filter(
            (schedule: any) => schedule.location?.geolocation?.coordinates
          )
          .map((schedule: any) => schedule.location!.geolocation.coordinates) ||
          []
      );
    }
    return {
      status: ProgramStatuses.SHOW_CONFIRMED,
      location: {
        geolocation: {
          type: "Point",
          coordinates: coordinates,
        },
        data: {
          city: tour?.artisticTeamPlace?.city,
          country: tour?.artisticTeamPlace?.country,
          region: tour?.artisticTeamPlace?.region,
        },
        address: artisticBaseLabel,
      },
    } as ProgramWithCO2Information;
  }, [tour?.artisticTeamPlace, tour?.schedule, artisticBaseLabel]);

  const { steps, totalAvoidedCO2Tons } = useMemo(() => {
    return computeTourAvoidedCO2(
      tour,
      peopleEmissionFactor,
      freightEmissionFactor,
      artisticBase
    );
  }, [tour, peopleEmissionFactor, freightEmissionFactor, artisticBase]);

  const optimizedSteps = useMemo(() => {
    if (!tour) return steps;

    const middleSteps = steps.slice(1, steps.length - 1);
    const optimizedMiddleSteps = optimizeTourOrder(
      middleSteps,
      tour,
      peopleEmissionFactor,
      freightEmissionFactor,
      artisticBase
    );

    // Reconstruct full array with artistic bases and recompute CO2 for the entire sequence
    const fullOptimizedSteps = [
      steps[0], // artistic base at start
      ...optimizedMiddleSteps,
      steps[steps.length - 1], // artistic base at end
    ];

    // Recompute CO2 for the full sequence to ensure routes between artistic base and optimized steps are correct
    return recomputeStepsCO2(
      fullOptimizedSteps,
      tour,
      peopleEmissionFactor,
      freightEmissionFactor,
      artisticBase
    );
  }, [steps, tour, peopleEmissionFactor, freightEmissionFactor, artisticBase]);

  const optimizationSavings = useMemo(() => {
    return (
      optimizedSteps.reduce(
        (acc: number, step) => acc + (step.co2?.total?.avoidedCo2Kg || 0),
        0
      ) -
      steps.reduce(
        (acc: number, step) => acc + (step.co2?.total?.avoidedCo2Kg || 0),
        0
      )
    );
  }, [steps, optimizedSteps]);

  return {
    totalAvoidedCO2Tons,
    steps,
    optimizedSteps,
    optimizationSavings,
  };
}

export function useProjectAvoidedCO2(project: Project): {
  totalAvoidedCO2Tons: number;
} {
  const { t } = useTranslation();
  const { tours } = project;

  const peopleTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.people-transport-mode",
    {
      returnObjects: true,
    }
  ) as Record<
    string,
    {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    }
  >;

  const decorationsTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.decorations-transport-mode",
    { returnObjects: true }
  ) as Record<
    string,
    {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    }
  >;

  const artisticBaseLabel = t("projects:avoided-co2-simulator.artistic-base");

  const totalAvoidedCO2Tons = useMemo(() => {
    if (!tours || tours.length === 0) return 0;

    let total = 0;

    tours.forEach((tour) => {
      tour.numberOfPeopleOnTour = project.numberOfPeopleOnTour;
      const peopleEmissionFactor = getEmissionFactor(
        peopleTransportModeOptions,
        tour?.peopleTransportMode || ""
      );
      const freightEmissionFactor = getEmissionFactor(
        decorationsTransportModeOptions,
        tour?.decorationsTransportMode || ""
      );

      let coordinates: [number, number] | undefined =
        tour?.artisticTeamPlace?.geolocation?.coordinates;
      if (!tour?.artisticTeamPlace?.geolocation?.coordinates) {
        coordinates = getCenter(
          (tour?.schedule || [])
            .filter(
              (schedule: any) => schedule.location?.geolocation?.coordinates
            )
            .map(
              (schedule: any) => schedule.location!.geolocation.coordinates
            ) || []
        );
      }

      const artisticBase: ProgramWithCO2Information = {
        status: ProgramStatuses.SHOW_CONFIRMED,
        location: {
          geolocation: {
            type: "Point",
            coordinates: coordinates,
          },
          data: {
            city: tour?.artisticTeamPlace?.city,
            country: tour?.artisticTeamPlace?.country,
            region: tour?.artisticTeamPlace?.region,
          },
          address: artisticBaseLabel,
        },
      } as ProgramWithCO2Information;

      const { totalAvoidedCO2Tons: tourTotal } = computeTourAvoidedCO2(
        tour,
        peopleEmissionFactor,
        freightEmissionFactor,
        artisticBase
      );

      total += tourTotal;
    });

    return total;
  }, [
    tours,
    peopleTransportModeOptions,
    decorationsTransportModeOptions,
    artisticBaseLabel,
  ]);

  return {
    totalAvoidedCO2Tons,
  };
}

// Helper function to recompute CO2 for steps based on their order
function recomputeStepsCO2(
  orderedSteps: ProgramWithCO2Information[],
  tour: Tour,
  peopleEmissionFactor: EmissionFactor,
  freightEmissionFactor: EmissionFactor,
  artisticBase: ProgramWithCO2Information
): ProgramWithCO2Information[] {
  return orderedSteps.map((step, index) => {
    const from = step.location;
    const to = orderedSteps[index + 1]?.location;

    // If this is the last step or no next step, return as is (no route to compute)
    if (!from || !to) {
      return {
        ...step,
        co2: {
          freight: {
            emissionFactor: freightEmissionFactor,
            weight: tour.decorationsWeight || 0,
            avoidedCo2Kg: 0,
          },
          people: {
            emissionFactor: peopleEmissionFactor,
            count: tour.numberOfPeopleOnTour || 1,
            avoidedCo2Kg: 0,
          },
          total: {
            avoidedCo2Kg: 0,
          },
        },
      };
    }

    const withCoprogrammationKmValue = distanceBetweenLocations(from, to);
    const withoutCoprogrammationKmValue = distanceBetweenLocations(
      from,
      artisticBase.location!,
      to
    );

    const avoidedKmValue =
      withoutCoprogrammationKmValue - withCoprogrammationKmValue;
    const freightAvoidedCo2Kg =
      avoidedKmValue *
      freightEmissionFactor.emissionFactor *
      ((tour.decorationsWeight || 0) / 1000);
    const peopleAvoidedCo2Kg =
      avoidedKmValue *
      peopleEmissionFactor.emissionFactor *
      (tour.numberOfPeopleOnTour || 1);

    return {
      ...step,
      route: {
        withCoprogrammation: {
          routeLabel: [from.address, to.address].join(" > "),
          kmValue: withCoprogrammationKmValue,
        },
        withoutCoprogrammation: {
          routeLabel: [
            from.address,
            artisticBase.location!.address,
            to.address,
          ].join(" > "),
          kmValue: withoutCoprogrammationKmValue,
        },
      },
      co2: {
        freight: {
          emissionFactor: freightEmissionFactor,
          weight: tour.decorationsWeight || 0,
          avoidedCo2Kg: freightAvoidedCo2Kg,
        },
        people: {
          emissionFactor: peopleEmissionFactor,
          count: tour.numberOfPeopleOnTour || 1,
          avoidedCo2Kg: peopleAvoidedCo2Kg,
        },
        total: {
          avoidedCo2Kg: freightAvoidedCo2Kg + peopleAvoidedCo2Kg,
        },
      },
    };
  });
}

// Helper function to optimize tour order using nearest neighbor algorithm
// and recompute CO2 emissions based on the new order
const optimizeTourOrder = (
  middlePrograms: ProgramWithCO2Information[],
  tour: Tour,
  peopleEmissionFactor: EmissionFactor,
  freightEmissionFactor: EmissionFactor,
  artisticBase: ProgramWithCO2Information
): ProgramWithCO2Information[] => {
  if (middlePrograms.length <= 1) {
    // Still need to recompute CO2 even if order doesn't change
    return recomputeStepsCO2(
      middlePrograms,
      tour,
      peopleEmissionFactor,
      freightEmissionFactor,
      artisticBase
    );
  }

  const programs = [...middlePrograms];
  const optimized: ProgramWithCO2Information[] = [];
  const visited = new Set<number>();

  // Start from the first program
  let currentIndex = 0;
  optimized.push(programs[currentIndex]);
  visited.add(currentIndex);

  // Find nearest neighbor for each remaining program
  while (visited.size < programs.length) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < programs.length; i++) {
      if (visited.has(i)) continue;

      const current = programs[currentIndex].location?.geolocation?.coordinates;
      const candidate = programs[i].location?.geolocation?.coordinates;

      if (
        Array.isArray(current) &&
        Array.isArray(candidate) &&
        current.length === 2 &&
        candidate.length === 2
      ) {
        const distance = distanceBetween(
          [current[0], current[1]],
          [candidate[0], candidate[1]]
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
    }

    if (nearestIndex !== -1) {
      optimized.push(programs[nearestIndex]);
      visited.add(nearestIndex);
      currentIndex = nearestIndex;
    } else {
      break;
    }
  }

  // Recompute CO2 emissions based on the optimized order
  return recomputeStepsCO2(
    optimized,
    tour,
    peopleEmissionFactor,
    freightEmissionFactor,
    artisticBase
  );
};
