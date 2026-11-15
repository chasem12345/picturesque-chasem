import { SvelteMap } from "svelte/reactivity";
import type { PhotoSpeciesView, SpeciesView } from "../api";

/** What the names need from the backend (injectable for tests). */
export interface BirdNamesApi {
  photoSpecies(photoIds: number[]): Promise<PhotoSpeciesView[]>;
  setPhotoSpecies(photoId: number, species: SpeciesView | null): Promise<void>;
}

/**
 * The species chosen for photos (Bird ID), loaded as photos come into
 * view and kept current when one is chosen.
 */
export class BirdNames {
  /** Photo id → species; `null` once known to have none. */
  private readonly known = new SvelteMap<number, SpeciesView | null>();

  constructor(private readonly api: BirdNamesApi) {}

  /** The species of a photo, if one was chosen (and loaded). */
  of(photoId: number): SpeciesView | null {
    return this.known.get(photoId) ?? null;
  }

  /** Loads the species of the photos not asked about yet. */
  async load(photoIds: number[]): Promise<void> {
    const missing = photoIds.filter(
      (id, i) => !this.known.has(id) && photoIds.indexOf(id) === i,
    );
    if (missing.length === 0) return;
    // Marked first so concurrent loads do not ask twice.
    for (const id of missing) this.known.set(id, null);
    try {
      for (const { photo_id, species } of await this.api.photoSpecies(missing))
        this.known.set(photo_id, species);
    } catch {
      for (const id of missing) this.known.delete(id);
    }
  }

  /** Chooses (or with `null` forgets) the species of these photos. */
  async set(photoIds: number[], species: SpeciesView | null): Promise<void> {
    for (const id of photoIds) {
      await this.api.setPhotoSpecies(id, species);
      this.known.set(id, species);
    }
  }
}
