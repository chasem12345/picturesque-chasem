<script lang="ts">
  import { imageUrl, type PhotoSummary } from "../api";
  import type { LibraryStore } from "./store.svelte";

  interface Props {
    store: LibraryStore;
    /** The list entry open in the loupe. */
    index: number;
    /** Opens another entry. */
    onselect: (index: number) => void;
    /** Species names by photo id, when known (Bird ID). */
    species?: (photo: PhotoSummary) => string | null;
  }

  let { store, index, onselect, species }: Props = $props();

  /** Entries shown: the current one and the ones after it. */
  const AHEAD = 20;

  $effect(() => {
    void store.ensureLoaded(Math.min(store.total - 1, index + AHEAD));
  });

  const entries = $derived(
    Array.from(
      { length: Math.min(AHEAD + 1, store.total - index) },
      (_, k) => ({
        at: index + k,
        photo: store.photos[index + k],
      }),
    ).filter((e): e is { at: number; photo: PhotoSummary } => !!e.photo),
  );
  const remaining = $derived(Math.max(0, store.total - index - 1));
  /** Photos in the stacks still to come (the loaded ones). */
  const framesAhead = $derived(
    entries.slice(1).reduce((n, e) => n + Math.max(1, e.photo.series_size), 0),
  );

  function time(p: PhotoSummary): string {
    return p.captured_at ? p.captured_at.slice(11, 19) : "";
  }

  // Keeps the current entry at the top as the loupe moves.
  let list: HTMLElement | undefined = $state();
  $effect(() => {
    void index;
    list?.scrollTo?.({ top: 0 });
  });
</script>

<aside class="upnext" aria-label="Stacks up next" data-testid="upcoming-stacks">
  <header>
    <h2>Up next</h2>
    <p data-testid="upcoming-remaining">
      {remaining === 0
        ? "Last stack"
        : `${remaining} more ${remaining === 1 ? "stack" : "stacks"}`}{framesAhead >
        0 && remaining <= AHEAD
        ? ` · ${framesAhead} frames`
        : ""}
    </p>
  </header>
  <ol bind:this={list}>
    {#each entries as { at, photo } (photo.id)}
      {@const name = species?.(photo) ?? null}
      <li>
        <button
          class:current={at === index}
          aria-current={at === index}
          onclick={(e) => {
            e.currentTarget.blur();
            if (at !== index) onselect(at);
          }}
          title={photo.file_name}
          data-testid="upcoming-entry"
        >
          <span class="thumb">
            <img src={imageUrl(photo.id, "grid")} alt="" draggable="false" />
            {#if photo.series_size > 1}
              <span class="count" data-testid="upcoming-count"
                >×{photo.series_size}</span
              >
            {/if}
          </span>
          <span class="meta">
            <span class="title"
              >{name ??
                (photo.series_size > 1
                  ? `${photo.series_size} frames`
                  : "Single")}</span
            >
            <span class="sub"
              >{time(photo)}{#if photo.flag === "pick"}<span
                  class="pick"
                  aria-label="Pick"
                >
                  ✓</span
                >{:else if photo.flag === "reject"}<span
                  class="reject"
                  aria-label="Reject"
                >
                  ✕</span
                >{/if}</span
            >
          </span>
        </button>
      </li>
    {/each}
  </ol>
</aside>

<style>
  .upnext {
    width: 13rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: #171716;
    border-right: 1px solid #2a2a27;
    min-height: 0;
  }

  header {
    padding: 0.9rem 0.9rem 0.5rem;
  }

  h2 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9a9a94;
    margin: 0 0 0.2rem;
  }

  header p {
    margin: 0;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0 0.5rem 0.8rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  button {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    width: 100%;
    padding: 0.3rem;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  button:hover {
    background: #22221f;
  }

  button.current {
    border-color: #ececea;
    background: #22221f;
  }

  .thumb {
    position: relative;
    width: 4.5rem;
    aspect-ratio: 3 / 2;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #0d0d0c;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .count {
    position: absolute;
    right: 2px;
    bottom: 2px;
    padding: 0 0.25rem;
    border-radius: 3px;
    background: rgb(13 13 12 / 0.8);
    font-size: 0.7rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .meta {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .title {
    font-size: 0.82rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub {
    font-size: 0.75rem;
    color: #9a9a94;
    font-variant-numeric: tabular-nums;
  }

  .pick {
    color: #8ee3ad;
  }

  .reject {
    color: #ef6a5b;
  }

  @media (max-width: 700px) {
    .upnext {
      display: none;
    }
  }
</style>
