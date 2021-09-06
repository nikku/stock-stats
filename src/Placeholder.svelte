<div class="placeholder">
  <slot></slot>
</div>

<style>
  .placeholder {
    background: var(--gray-6);
    border-radius: var(--border-radius-large);
  }

  .placeholder > :global(*) {
    visibility: hidden;
  }
</style>