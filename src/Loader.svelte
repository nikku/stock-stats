<div class="loader-parent">
  <div class="dot-windmill"></div>
</div>

<style>

  .loader-parent {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* adapted from https://github.com/nzbin/three-dots */

  /*!
   * three-dots - v0.2.0
   * CSS loading animation made by single element.
   * https://nzbin.github.io/three-dots/
   *
   * Copyright (c) 2018 nzbin
   * Released under MIT License
   */
  .dot-windmill {
    position: relative;
    top: -10px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--blue-1);
    color: var(--blue-1);
    transform-origin: 5px 15px;
    animation: dot-windmill 2s infinite linear;
  }

  .dot-windmill::before,
  .dot-windmill::after {
    content: '';
    display: inline-block;
    position: absolute;
  }

  .dot-windmill::before {
    left: -8.66px;
    top: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--blue-1);
    color: var(--blue-1);
  }

  .dot-windmill::after {
    left: 8.66px;
    top: 15px;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: var(--blue-1);
    color: var(--blue-1);
  }

  @keyframes dot-windmill {
    0% {
      transform: rotateZ(0deg) translate3d(0, 0, 0);
    }
    100% {
      transform: rotateZ(720deg) translate3d(0, 0, 0);
    }
  }
</style>