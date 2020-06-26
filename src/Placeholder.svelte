<div class="placeholder">
  <slot></slot>
</div>

<style>
  .placeholder {
    background: var(--gray-6);
    border-radius: 5px;
  }

  .placeholder > :global(*) {
    visibility: hidden;
  }
</style>