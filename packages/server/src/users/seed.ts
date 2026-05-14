import { Role, Notification, Discipline } from "@cooprog/core";
import User from "./model";
import bcrypt from "bcrypt";

const salt = bcrypt.genSaltSync(Number(process.env.PASSWORD_SALT_ROUND) || 10);

const adminData = {
  email: "admin@bleumatin.fr",
  company: "Bleu Matin",
  status: "ok",
  locations: [
    {
      id: "main",
      label: "Main Location",
      isMain: true,
      location: {
        geolocation: {
          type: "Point",
          coordinates: [6.1844, 48.6921],
        },
        data: {
          city: "Nancy",
          municipality: "Nancy",
          postcode: "54000",
          country: "France",
          country_code: "fr",
        },
        address:
          "47 boulevard d'Austrasie, Nancy, France métropolitaine, 54000, France",
      },
    },
  ],
  notifications: [] as Notification[],
  hash: bcrypt.hashSync("password", salt),
  role: Role.ADMIN,
  profiles: [
    {
      firstName: "Administrateur",
      lastName: "Bleu Matin",
      role: "Administrateur",
      contactInformation: {
        types: ["phone"],
        phone: "+33674300285",
        email: "",
        instructions:
          "Please contact me only between 10:30 and 11am on odd days",
      },
    },
  ],
};

const usersData = [
  {
    email: "hlugan@yahoo.fr",
    company: "Hermann Lugan EI",
    role: Role.DIFFUSION_STRUCTURE,
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "1 rue de la Paix",
          geolocation: {
            type: "Point",
            coordinates: [3.0887356, 50.6384617],
          },
          data: {
            city: "Lille",
            municipality: "Lille",
            postcode: "59000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Hermann",
        lastName: "Lugan",
        role: "Directeur",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me anytime",
        },
      },
      {
        firstName: "Other",
        lastName: "Profile",
        role: "Truc",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me another time",
        },
      },
    ],
  },
  {
    email: "m.dupont@opera-paris.fr",
    company: "Opéra de Paris",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "8 Rue Scribe",
          geolocation: {
            type: "Point",
            coordinates: [2.331344, 48.871428],
          },
          data: {
            city: "Paris",
            municipality: "Paris",
            postcode: "75009",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Marie",
        lastName: "Dupont",
        role: "Directrice des relations artistiques",
        contactInformation: {
          types: ["phone"],
          phone: "+33140203040",
          email: "",
          instructions: "Available from 9 AM to 6 PM",
        },
      },
    ],
  },
  {
    email: "j.vanrijn@koninklijketheater.nl",
    company: "Koninklijk Theater",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Amstel 22",
          geolocation: {
            type: "Point",
            coordinates: [4.903532, 52.367975],
          },
          data: {
            city: "Amsterdam",
            municipality: "Amsterdam",
            postcode: "1017 AB",
            country: "Netherlands",
            country_code: "nl",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Jeroen",
        lastName: "Van Rijn",
        role: "Directeur artistique",
        contactInformation: {
          types: ["phone"],
          phone: "+31207012030",
          email: "",
          instructions: "Feel free to contact me during working hours",
        },
      },
    ],
  },
  {
    email: "e.jansen@stadsschouwburg-antwerpen.be",
    company: "Stadsschouwburg Antwerpen",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Vlaeykensgang 8",
          geolocation: {
            type: "Point",
            coordinates: [4.401696, 51.211777],
          },
          data: {
            city: "Antwerp",
            municipality: "Antwerp",
            postcode: "2000",
            country: "Belgium",
            country_code: "be",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Elise",
        lastName: "Jansen",
        role: "Directrice de la programmation",
        contactInformation: {
          types: ["phone"],
          phone: "+3232036400",
          email: "",
          instructions: "Available in the afternoons",
        },
      },
    ],
  },
  {
    email: "s.kaufmann@zuerichoper.ch",
    company: "Zürich Opera",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Falkenstrasse 1",
          geolocation: {
            type: "Point",
            coordinates: [8.541694, 47.378177],
          },
          data: {
            city: "Zurich",
            municipality: "Zurich",
            postcode: "8008",
            country: "Switzerland",
            country_code: "ch",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Silvia",
        lastName: "Kaufmann",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+41442123456",
          email: "",
          instructions: "Available for technical inquiries",
        },
      },
    ],
  },
  {
    email: "p.schneider@berlinerensemble.de",
    company: "Berliner Ensemble",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Bertolt-Brecht-Platz 1",
          geolocation: {
            type: "Point",
            coordinates: [13.746114, 52.514233],
          },
          data: {
            city: "Berlin",
            municipality: "Berlin",
            postcode: "10117",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Paul",
        lastName: "Schneider",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+49302345678",
          email: "",
          instructions: "Available for emergencies only",
        },
      },
    ],
  },
  {
    email: "l.martin@theatrelucerne.ch",
    company: "Theatre Lucerne",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Theaterstrasse 9",
          geolocation: {
            type: "Point",
            coordinates: [8.307085, 47.0433],
          },
          data: {
            city: "Lucerne",
            municipality: "Lucerne",
            postcode: "6003",
            country: "Switzerland",
            country_code: "ch",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Louis",
        lastName: "Martin",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+41796789012",
          email: "",
          instructions: "Call me after 10 AM",
        },
      },
    ],
  },
  {
    email: "a.lambert@lyonoperatheatre.fr",
    company: "Opéra de Lyon",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de la Comédie",
          geolocation: {
            type: "Point",
            coordinates: [4.835722, 45.75781],
          },
          data: {
            city: "Lyon",
            municipality: "Lyon",
            postcode: "69001",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Antoine",
        lastName: "Lambert",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33472845767",
          email: "",
          instructions: "Available in the evenings",
        },
      },
    ],
  },
  {
    email: "v.degraaf@amsterdamsoperatheater.nl",
    company: "Amsterdam Opera Theater",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Waterlooplein 1",
          geolocation: {
            type: "Point",
            coordinates: [4.909349, 52.366394],
          },
          data: {
            city: "Amsterdam",
            municipality: "Amsterdam",
            postcode: "1011 XX",
            country: "Netherlands",
            country_code: "nl",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Vera",
        lastName: "De Graaf",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+31202031313",
          email: "",
          instructions: "I'm available for technical support",
        },
      },
    ],
  },
  {
    email: "m.berger@parisoperatheatre.fr",
    company: "Paris Opera Theatre",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Boulevard de l'Opéra",
          geolocation: {
            type: "Point",
            coordinates: [2.331444, 48.868206],
          },
          data: {
            city: "Paris",
            municipality: "Paris",
            postcode: "75001",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Marc",
        lastName: "Berger",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33123456789",
          email: "",
          instructions: "Available in the afternoons",
        },
      },
    ],
  },
  {
    email: "t.brenk@kaserne-basel.ch",
    company: "Kaserne Basel",
    role: Role.DIFFUSION_STRUCTURE,
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "1 rue de la Paix",
          geolocation: {
            type: "Point",
            coordinates: [7.5900904, 47.5634448],
          },
          data: {
            city: "Basel",
            municipality: "Basel",
            postcode: "4058",
            country: "Switzerland",
            country_code: "ch",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Tobias",
        lastName: "Brenk",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me anytime",
        },
      },
    ],
  },
  {
    email: "arved.schultze@produktionishaeuser.de",
    company: "Bündnis internationaler Produktionshäuser",
    role: Role.DIFFUSION_STRUCTURE,
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "1 rue de la Paix",
          geolocation: {
            type: "Point",
            coordinates: [13.3859902, 52.499112],
          },
          data: {
            city: "Berlin",
            municipality: "Berlin",
            postcode: "10117",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Arved",
        lastName: "Schultze",
        role: "Directeur",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me anytime",
        },
      },
    ],
  },
  {
    email: "direction@centremalraux.com",
    company: "CCAM SCENE NATIONALE",
    role: Role.DIFFUSION_STRUCTURE,
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        label: "Main Location",
        isMain: true,
        location: {
          address: "1 rue de la Paix",
          geolocation: {
            type: "Point",
            coordinates: [6.1732593, 48.6593975],
          },
          data: {
            city: "Vandoeuvre-lès-Nancy",
            municipality: "Nancy",
            postcode: "54500",
            country: "France",
            country_code: "fr",
          },
        },
      },
      {
        label: "Festival au lac de Messein",
        isMain: false,
        location: {
          geolocation: {
            type: "Point",
            coordinates: [6.1454087, 48.6100192],
          },
          address:
            "Messein, Nancy, Meurthe-et-Moselle, Grand Est, Metropolitan France, 54850, France",
          data: {
            county: "Meurthe-et-Moselle",
            village: "Messein",
            municipality: "Nancy",
            country: "France",
            country_code: "fr",
            postcode: "54850",
            state: "Grand Est",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "OLIVIER",
        lastName: "PERRY",
        role: "Directeur",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me anytime",
        },
      },
    ],
  },
  {
    email: "celine.schall@gmail.com",
    company: "Université Luxembourg",
    role: Role.DIFFUSION_STRUCTURE,
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "1 rue de la Paix",
          geolocation: {
            type: "Point",
            coordinates: [5.9471117, 49.504147],
          },
          data: {
            city: "Luxembourg",
            municipality: "Luxembourg",
            postcode: "1453",
            country: "Luxembourg",
            country_code: "lu",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Céline",
        lastName: "Schall",
        role: "Professeur",
        contactInformation: {
          types: ["phone"],
          phone: "+33674300285",
          email: "",
          instructions: "Call me anytime",
        },
      },
    ],
  },
  {
    email: "c.roland@toulouseoperatheatre.fr",
    company: "Opéra de Toulouse",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place du Capitole",
          geolocation: {
            type: "Point",
            coordinates: [1.444209, 43.604652],
          },
          data: {
            city: "Toulouse",
            municipality: "Toulouse",
            postcode: "31000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Claire",
        lastName: "Roland",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33561234567",
          email: "",
          instructions: "Disponible pour toute question technique",
        },
      },
    ],
  },
  {
    email: "p.dubois@bordelaisoperatheatre.fr",
    company: "Opéra de Bordeaux",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place Rohan",
          geolocation: {
            type: "Point",
            coordinates: [-0.578643, 44.841225],
          },
          data: {
            city: "Bordeaux",
            municipality: "Bordeaux",
            postcode: "33000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Pierre",
        lastName: "Dubois",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33557898765",
          email: "",
          instructions: "Disponible en journée",
        },
      },
    ],
  },
  {
    email: "a.legrand@montpellieroperatheatre.fr",
    company: "Opéra de Montpellier",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de la Comédie",
          geolocation: {
            type: "Point",
            coordinates: [3.876718, 43.611351],
          },
          data: {
            city: "Montpellier",
            municipality: "Montpellier",
            postcode: "34000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Amélie",
        lastName: "Legrand",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33467543210",
          email: "",
          instructions: "Disponible après 18h",
        },
      },
    ],
  },
  {
    email: "l.schmidt@koelnoperatheatre.de",
    company: "Kölner Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Am Domhof 1",
          geolocation: {
            type: "Point",
            coordinates: [6.960278, 50.940929],
          },
          data: {
            city: "Cologne",
            municipality: "Cologne",
            postcode: "50667",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Lena",
        lastName: "Schmidt",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+492218765432",
          email: "",
          instructions: "Disponible en semaine",
        },
      },
    ],
  },
  {
    email: "a.schneider@bonnoperatheatre.de",
    company: "Bonn Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Am Hof 1-2",
          geolocation: {
            type: "Point",
            coordinates: [7.096052, 50.734831],
          },
          data: {
            city: "Bonn",
            municipality: "Bonn",
            postcode: "53113",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Andreas",
        lastName: "Schneider",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+492285634567",
          email: "",
          instructions: "Disponible pour des questions urgentes",
        },
      },
    ],
  },
  {
    email: "m.wohler@mainzoperatheatre.de",
    company: "Mainzer Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Am Schillerplatz 1",
          geolocation: {
            type: "Point",
            coordinates: [8.276116, 50.000288],
          },
          data: {
            city: "Mainz",
            municipality: "Mainz",
            postcode: "55116",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Markus",
        lastName: "Wöhler",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+496131234567",
          email: "",
          instructions: "Disponible pour le support technique",
        },
      },
    ],
  },
  {
    email: "j.meyer@hamburgoperatheatre.de",
    company: "Hamburger Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Gänsemarkt 34",
          geolocation: {
            type: "Point",
            coordinates: [9.982476, 53.550268],
          },
          data: {
            city: "Hamburg",
            municipality: "Hamburg",
            postcode: "20354",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Julia",
        lastName: "Meyer",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+494052343434",
          email: "",
          instructions: "Disponible en semaine après 16h",
        },
      },
    ],
  },
  {
    email: "k.larsen@kieloperatheatre.de",
    company: "Kieler Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Theaterstraße 1",
          geolocation: {
            type: "Point",
            coordinates: [10.134643, 54.32342],
          },
          data: {
            city: "Kiel",
            municipality: "Kiel",
            postcode: "24103",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Klaus",
        lastName: "Larsen",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+494317654321",
          email: "",
          instructions: "Disponible pour questions techniques",
        },
      },
    ],
  },
  {
    email: "t.schulz@bremenoperatheatre.de",
    company: "Bremer Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Am Theater 1",
          geolocation: {
            type: "Point",
            coordinates: [8.801216, 53.079296],
          },
          data: {
            city: "Bremen",
            municipality: "Bremen",
            postcode: "28195",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Tobias",
        lastName: "Schulz",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+494217893210",
          email: "",
          instructions: "Disponible en journée",
        },
      },
    ],
  },
  {
    email: "h.martin@munichoperatheatre.de",
    company: "Bayerische Staatsoper",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Max-Joseph-Platz 2",
          geolocation: {
            type: "Point",
            coordinates: [11.577684, 48.141334],
          },
          data: {
            city: "Munich",
            municipality: "Munich",
            postcode: "80539",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Hans",
        lastName: "Martin",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+498923456789",
          email: "",
          instructions: "Disponible en journée",
        },
      },
    ],
  },
  {
    email: "e.schneider@stuttgartoperatheatre.de",
    company: "Staatsoper Stuttgart",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Oberer Waisenhausplatz 1",
          geolocation: {
            type: "Point",
            coordinates: [9.185703, 48.783904],
          },
          data: {
            city: "Stuttgart",
            municipality: "Stuttgart",
            postcode: "70173",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Eva",
        lastName: "Schneider",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+497113456789",
          email: "",
          instructions: "Disponible en soirée",
        },
      },
    ],
  },
  {
    email: "a.fischer@augsburgoperatheatre.de",
    company: "Augsburger Opernhaus",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Theaterstraße 1",
          geolocation: {
            type: "Point",
            coordinates: [10.896565, 48.40107],
          },
          data: {
            city: "Augsburg",
            municipality: "Augsburg",
            postcode: "86150",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Andreas",
        lastName: "Fischer",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+498214567890",
          email: "",
          instructions: "Disponible après 17h",
        },
      },
    ],
  },
  {
    email: "m.durand@rennesoperatheatre.fr",
    company: "Opéra de Rennes",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de la Mairie",
          geolocation: {
            type: "Point",
            coordinates: [-1.676208, 48.117266],
          },
          data: {
            city: "Rennes",
            municipality: "Rennes",
            postcode: "35000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Marie",
        lastName: "Durand",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33299331234",
          email: "",
          instructions: "Disponible pour questions sur les équipements",
        },
      },
    ],
  },
  {
    email: "p.lefebvre@quimperoperatheatre.fr",
    company: "Opéra de Quimper",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de la République",
          geolocation: {
            type: "Point",
            coordinates: [-4.097883, 47.996869],
          },
          data: {
            city: "Quimper",
            municipality: "Quimper",
            postcode: "29000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Paul",
        lastName: "Lefebvre",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33298987654",
          email: "",
          instructions: "Disponible en matinée",
        },
      },
    ],
  },
  {
    email: "l.lemarchand@brestoperatheatre.fr",
    company: "Opéra de Brest",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de la Liberté",
          geolocation: {
            type: "Point",
            coordinates: [-4.498328, 48.390394],
          },
          data: {
            city: "Brest",
            municipality: "Brest",
            postcode: "29200",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Léo",
        lastName: "Lemarchand",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33298765432",
          email: "",
          instructions: "Disponible en journée",
        },
      },
    ],
  },
  {
    email: "c.boucher@clermontoperatheatre.fr",
    company: "Opéra de Clermont-Ferrand",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place de Jaude",
          geolocation: {
            type: "Point",
            coordinates: [3.086477, 45.777222],
          },
          data: {
            city: "Clermont-Ferrand",
            municipality: "Clermont-Ferrand",
            postcode: "63000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Catherine",
        lastName: "Boucher",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33473761234",
          email: "",
          instructions: "Disponible pour les demandes de matériel",
        },
      },
    ],
  },
  {
    email: "j.dupont@bourgesoperatheatre.fr",
    company: "Opéra de Bourges",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place Séraucourt",
          geolocation: {
            type: "Point",
            coordinates: [2.398029, 47.080387],
          },
          data: {
            city: "Bourges",
            municipality: "Bourges",
            postcode: "18000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Jacques",
        lastName: "Dupont",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33248234567",
          email: "",
          instructions: "Disponible en matinée pour les rendez-vous",
        },
      },
    ],
  },
  {
    email: "l.martin@poitiersoperatheatre.fr",
    company: "Opéra de Poitiers",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Place du Maréchal Leclerc",
          geolocation: {
            type: "Point",
            coordinates: [0.338168, 46.580073],
          },
          data: {
            city: "Poitiers",
            municipality: "Poitiers",
            postcode: "86000",
            country: "France",
            country_code: "fr",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Laurent",
        lastName: "Martin",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+33549321765",
          email: "",
          instructions: "Disponible pour les demandes urgentes",
        },
      },
    ],
  },
  {
    email: "m.schmidt@frankfurtoperatheatre.de",
    company: "Oper Frankfurt",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Untermainanlage 11",
          geolocation: {
            type: "Point",
            coordinates: [8.6785, 50.1118],
          },
          data: {
            city: "Frankfurt",
            municipality: "Frankfurt",
            postcode: "60311",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Markus",
        lastName: "Schmidt",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+496974856000",
          email: "",
          instructions: "Disponible pendant les horaires de représentation",
        },
      },
    ],
  },
  {
    email: "a.meyer@wiesbadenoperatheatre.de",
    company: "Hessisches Staatstheater Wiesbaden",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Christophstraße 12",
          geolocation: {
            type: "Point",
            coordinates: [8.2395, 50.0831],
          },
          data: {
            city: "Wiesbaden",
            municipality: "Wiesbaden",
            postcode: "65183",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Anna",
        lastName: "Meyer",
        role: "Directrice technique",
        contactInformation: {
          types: ["phone"],
          phone: "+4961178421",
          email: "",
          instructions: "Disponible pour support technique",
        },
      },
    ],
  },
  {
    email: "t.klein@kasseloperatheatre.de",
    company: "Staatstheater Kassel",
    role: "diffusion_structure",
    hash: bcrypt.hashSync("password", salt),
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          address: "Wilhelmsstraße 1",
          geolocation: {
            type: "Point",
            coordinates: [9.4305, 51.3136],
          },
          data: {
            city: "Kassel",
            municipality: "Kassel",
            postcode: "34117",
            country: "Germany",
            country_code: "de",
          },
        },
      },
    ],
    profiles: [
      {
        firstName: "Thomas",
        lastName: "Klein",
        role: "Directeur technique",
        contactInformation: {
          types: ["phone"],
          phone: "+496151990123",
          email: "",
          instructions: "Disponible pour les projets de collaboration",
        },
      },
    ],
  },
];

const spectatorData = {
  email: "spectator@bleumatin.fr",
  company: "ONDA",
  status: "ok",
  locations: [
    {
      id: "main",
      label: "Main Location",
      isMain: true,
      location: {
        geolocation: {
          type: "Point",
          coordinates: [2.3587134, 48.8314648],
        },
        data: {
          city: "Paris",
          municipality: "Paris",
          postcode: "75013",
          country: "France",
          country_code: "fr",
        },
        address:
          "185, Boulevard Vincent Auriol, Quartier de la Gare, Paris 13e Arrondissement, Paris, Île-de-France, France métropolitaine, 75013, France",
      },
    },
  ],
  notifications: [] as Notification[],
  hash: bcrypt.hashSync("password", salt),
  role: Role.SPECTATOR,
  profiles: [
    {
      firstName: "Spek",
      lastName: "Tator",
      role: "Spectateur",
      contactInformation: {
        type: "phone",
        phone: "+33674300285",
        email: "",
        instructions: "",
      },
    },
  ],
};

const artisticData = [
  {
    email: "artistic.sv@bleumatin.fr",
    company: "Bleu Matin SV",
    transparency: "open",
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          geolocation: {
            type: "Point",
            coordinates: [6.199238, 48.69307],
          },
          data: {
            city: "Nancy",
            municipality: "Nancy",
            postcode: "54000",
            country: "France",
            country_code: "fr",
          },
          address: "47 Bd d'Austrasie, 54000 Nancy, France",
        },
      },
    ],
    notifications: [] as Notification[],
    hash: "$2b$10$Zq2Q6Chp53thAJnB0h0LJ.HQ6.7LmmpBSFVSUQMk1FCN8R.OXivyS",
    role: Role.ARTISTIC_TEAM,
    programmingDisciplines: [Discipline.PERFORMING_ARTS],
    profiles: [
      {
        firstName: "Artistic",
        lastName: "Team",
        role: "Équipe artistique",
        contactInformation: {
          types: ["phone"],
          value: "+33674300285",
          instructions: "",
        },
      },
    ],
  },
  {
    email: "artistic.ma@bleumatin.fr",
    company: "Bleu Matin MA",
    transparency: "open",
    status: "ok",
    locations: [
      {
        id: "main",
        label: "Main Location",
        isMain: true,
        location: {
          geolocation: {
            type: "Point",
            coordinates: [6.199238, 48.69307],
          },
          data: {
            city: "Nancy",
            municipality: "Nancy",
            postcode: "54000",
            country: "France",
            country_code: "fr",
          },
          address: "47 Bd d'Austrasie, 54000 Nancy, France",
        },
      },
    ],
    notifications: [] as Notification[],
    hash: "$2b$10$Zq2Q6Chp53thAJnB0h0LJ.HQ6.7LmmpBSFVSUQMk1FCN8R.OXivyS",
    role: Role.ARTISTIC_TEAM,
    programmingDisciplines: [Discipline.MUSIC],
    profiles: [
      {
        firstName: "Artistic",
        lastName: "Team",
        role: "Équipe artistique",
        contactInformation: {
          types: ["phone"],
          value: "+33674300285",
          instructions: "",
        },
      },
    ],
  },
];

const seed = async () => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  let admin = await User.findOne({
    email: "admin@bleumatin.fr",
  });
  if (!admin) {
    admin = new User(adminData);
  }
  admin.$set(adminData);
  await admin.save();
  console.log("User admin seeded");

  let spectator = await User.findOne({
    email: "spectator@bleumatin.fr",
  });
  if (!spectator) {
    spectator = new User(spectatorData);
  }
  spectator.$set(spectatorData);
  await spectator.save();
  console.log("User spectator seeded");

  await Promise.all([
    [...usersData, ...artisticData].map(async (userData) => {
      let user = await User.findOne({
        email: userData.email,
      });
      if (!user) {
        user = new User(userData);
      }
      user.$set(userData);
      await user.save();
    }),
  ]);
  console.log("Example users seeded");
};

export default seed;
