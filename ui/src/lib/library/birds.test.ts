import { describe, expect, it, vi } from "vitest";
import type { SpeciesView } from "../api";
import { BirdNames } from "./birds.svelte";

const robin: SpeciesView = {
  common: "American Robin",
  scientific: "Turdus migratorius",
  code: "amerob",
};

describe("BirdNames", () => {
  it("loads each photo's species once", async () => {
    const api = {
      photoSpecies: vi.fn(async (ids: number[]) =>
        ids.includes(1) ? [{ photo_id: 1, species: robin }] : [],
      ),
      setPhotoSpecies: vi.fn(async () => {}),
    };
    const names = new BirdNames(api);

    await names.load([1, 2, 2]);
    await names.load([1, 2]);

    expect(api.photoSpecies).toHaveBeenCalledTimes(1);
    expect(api.photoSpecies).toHaveBeenCalledWith([1, 2]);
    expect(names.of(1)).toEqual(robin);
    expect(names.of(2)).toBeNull();
  });

  it("asks again after a failed load", async () => {
    const api = {
      photoSpecies: vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValue([{ photo_id: 3, species: robin }]),
      setPhotoSpecies: vi.fn(async () => {}),
    };
    const names = new BirdNames(api);

    await names.load([3]);
    expect(names.of(3)).toBeNull();
    await names.load([3]);
    expect(names.of(3)).toEqual(robin);
  });

  it("sets the species of every photo given", async () => {
    const api = {
      photoSpecies: vi.fn(async () => []),
      setPhotoSpecies: vi.fn(async () => {}),
    };
    const names = new BirdNames(api);

    await names.set([4, 5], robin);
    expect(api.setPhotoSpecies).toHaveBeenCalledWith(4, robin);
    expect(api.setPhotoSpecies).toHaveBeenCalledWith(5, robin);
    expect(names.of(5)).toEqual(robin);

    await names.set([4], null);
    expect(names.of(4)).toBeNull();
  });
});
