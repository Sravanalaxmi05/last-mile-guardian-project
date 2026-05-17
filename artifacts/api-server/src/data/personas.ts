export interface Persona {
  id: string;
  name: string;
  age: number;
  description: string;
  conditions: string[];
  floor: string;
  canEvacuateAlone: boolean;
  languagePreference: string;
  internetStrength: string;
}

export const personas: Persona[] = [
  {
    id: "asha",
    name: "Asha",
    age: 68,
    description: "68-year-old woman living alone on the ground floor, diabetic, limited mobility",
    conditions: ["diabetic", "limited mobility"],
    floor: "Ground floor",
    canEvacuateAlone: false,
    languagePreference: "Hindi",
    internetStrength: "weak",
  },
  {
    id: "imran",
    name: "Imran",
    age: 35,
    description: "35-year-old wheelchair user on the first floor, cannot evacuate without help",
    conditions: ["wheelchair user", "mobility impaired"],
    floor: "First floor",
    canEvacuateAlone: false,
    languagePreference: "Hindi",
    internetStrength: "weak",
  },
  {
    id: "meena",
    name: "Meena",
    age: 30,
    description: "30-year-old mother with two young children, water visible outside but not yet inside",
    conditions: ["caregiver to two children"],
    floor: "Ground floor",
    canEvacuateAlone: true,
    languagePreference: "Hindi",
    internetStrength: "weak",
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
