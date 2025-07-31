// ObservationMakers system for iStack Buddy
import { ObservationMakers as LibraryObservationMakers } from "istack-buddy-utilities";

// Types
export interface IObservationMaker {
  name: string;
  description: string;
  getRequiredResources(): string[];
  makeObservation(formData: any, resources?: any): Promise<any> | any;
}

export interface ObservationMakerRegistration {
  id: string;
  name: string;
  description: string;
  maker: IObservationMaker;
  source: "library" | "custom";
}

// Registry to hold all available observation makers
const observationMakerRegistry: Map<string, ObservationMakerRegistration> =
  new Map();

// Register a library observation maker
export function registerLibraryObservationMaker(
  id: string,
  MakerClass: any,
  name: string,
  description: string
): void {
  const maker = new MakerClass();
  observationMakerRegistry.set(id, {
    id,
    name,
    description,
    maker,
    source: "library",
  });
}

// Register a custom observation maker
export function registerCustomObservationMaker(
  id: string,
  maker: IObservationMaker
): void {
  observationMakerRegistry.set(id, {
    id,
    name: maker.name,
    description: maker.description,
    maker,
    source: "custom",
  });
}

// Get all registered observation makers
export function getAllObservationMakers(): ObservationMakerRegistration[] {
  return Array.from(observationMakerRegistry.values());
}

// Get a specific observation maker by id
export function getObservationMaker(
  id: string
): ObservationMakerRegistration | undefined {
  return observationMakerRegistry.get(id);
}

// Run an observation maker
export async function runObservationMaker(
  id: string,
  formData: any,
  resources?: any
): Promise<any> {
  const registration = observationMakerRegistry.get(id);
  if (!registration) {
    throw new Error(`ObservationMaker with id '${id}' not found`);
  }

  try {
    const result = await registration.maker.makeObservation(
      formData,
      resources
    );
    return {
      success: true,
      data: result,
      makerId: id,
      makerName: registration.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      makerId: id,
      makerName: registration.name,
    };
  }
}

// Initialize with library observation makers
// No library observation makers currently registered (unavailable in current library version)
