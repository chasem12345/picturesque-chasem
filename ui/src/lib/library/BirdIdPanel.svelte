<script lang="ts">
  import Icon from "../components/Icon.svelte";
  import type { BirdIdResult, SpeciesView } from "../api";

  interface Props {
    /** Waiting for the user to draw a box. */
    drawing: boolean;
    /** The model is looking. */
    busy: boolean;
    result: BirdIdResult | null;
    error: string | null;
    /** The species chosen for the shown photo, if any. */
    current: SpeciesView | null;
    /** Photos in the shown photo's stack (0 or 1 when not in one). */
    stackSize: number;
    /** Chooses a species, for the photo or its whole stack. */
    onuse: (species: SpeciesView, wholeStack: boolean) => void;
    /** Forgets the photo's species. */
    onforget: () => void;
    /** Draws another box. */
    onredraw: () => void;
    onclose: () => void;
  }

  let {
    drawing,
    busy,
    result,
    error,
    current,
    stackSize,
    onuse,
    onforget,
    onredraw,
    onclose,
  }: Props = $props();

  /** Choosing a species for one frame of a stack names the whole stack. */
  let wholeStack = $state(true);

  const percent = (v: number) =>
    v >= 0.995 ? ">99%" : v < 0.005 ? "<1%" : `${Math.round(v * 100)}%`;
</script>

<section class="birdid" aria-label="Bird ID" data-testid="bird-id">
  <header>
    <h2>Bird ID</h2>
    <button
      class="icon"
      onclick={(e) => {
        e.currentTarget.blur();
        onclose();
      }}
      aria-label="Close Bird ID"><Icon name="x-mark" /></button
    >
  </header>

  {#if current}
    <p class="current" data-testid="bird-id-current">
      <strong>{current.common}</strong>
      <span class="sci">{current.scientific}</span>
      <button class="link" onclick={onforget} data-testid="bird-id-forget"
        >Remove</button
      >
    </p>
  {/if}

  {#if drawing}
    <p class="hint" data-testid="bird-id-draw">
      Drag a box around the bird on the photo. Esc cancels.
    </p>
  {:else if busy}
    <p class="hint" data-testid="bird-id-busy">Looking…</p>
  {:else if error}
    <p class="error-text" role="alert">{error}</p>
    <button onclick={onredraw}>Try another box</button>
  {:else if result}
    {#if result.region}
      <p class="hint">Birds of {result.region}</p>
    {/if}
    <ol data-testid="bird-id-suggestions">
      {#each result.suggestions as s (s.species.code)}
        <li>
          <button
            class="suggestion"
            class:chosen={current?.code === s.species.code}
            onclick={(e) => {
              e.currentTarget.blur();
              onuse(s.species, stackSize > 1 && wholeStack);
            }}
            title="Use this species"
            data-testid="bird-id-suggestion"
          >
            <span class="names">
              <span class="common">{s.species.common}</span>
              <span class="sci">{s.species.scientific}</span>
            </span>
            <span class="confidence">{percent(s.confidence)}</span>
          </button>
        </li>
      {/each}
    </ol>
    {#if result.elsewhere}
      <p class="hint" data-testid="bird-id-elsewhere">
        Outside {result.region}, the closest match is
        <button
          class="link"
          onclick={() =>
            result.elsewhere &&
            onuse(result.elsewhere, stackSize > 1 && wholeStack)}
          >{result.elsewhere.common}</button
        >.
      </p>
    {/if}
    {#if stackSize > 1}
      <label class="stack">
        <input
          type="checkbox"
          bind:checked={wholeStack}
          onchange={(e) => e.currentTarget.blur()}
          data-testid="bird-id-whole-stack"
        />
        Name all {stackSize} photos of the stack
      </label>
    {/if}
    <p class="hint small">
      The model always names a bird, even when there is none in the box.
      <button class="link" onclick={onredraw}>Draw another box</button>
    </p>
  {/if}
</section>

<style>
  .birdid {
    position: absolute;
    top: 4.2rem;
    right: 1rem;
    z-index: 2;
    width: 17rem;
    max-height: calc(100% - 10rem);
    overflow-y: auto;
    padding: 0.8rem;
    background: rgb(23 23 22 / 0.95);
    border: 1px solid #2a2a27;
    border-radius: 10px;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9a9a94;
    margin: 0;
  }

  p {
    margin: 0;
  }

  .hint {
    color: #b5b5ae;
  }

  .small {
    font-size: 0.78rem;
  }

  .current {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem 0.5rem;
    align-items: baseline;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .suggestion {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.5rem;
    background: transparent;
    color: inherit;
    border: 1px solid #3a3a36;
    border-radius: 6px;
    text-align: left;
  }

  .suggestion:hover {
    background: #22221f;
  }

  .suggestion.chosen {
    border-color: #8ee3ad;
  }

  .names {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .common {
    font-weight: 600;
  }

  .sci {
    font-style: italic;
    color: #9a9a94;
    font-size: 0.78rem;
  }

  .confidence {
    font-variant-numeric: tabular-nums;
    color: #b5b5ae;
    flex-shrink: 0;
  }

  .birdid > button {
    align-self: flex-start;
    background: transparent;
    color: inherit;
    border: 1px solid #3a3a36;
    padding: 0.25rem 0.6rem;
  }

  .birdid > button:hover {
    background: #22221f;
  }

  .stack {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .icon,
  .link {
    border: none;
    background: none;
    color: #b5b5ae;
    padding: 0.1rem 0.2rem;
  }

  .link {
    text-decoration: underline;
    text-underline-offset: 2px;
    font-size: inherit;
  }

  .icon:hover,
  .link:hover {
    color: #ececea;
  }
</style>
