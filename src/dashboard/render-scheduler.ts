export function createRenderScheduler(render: () => void): () => void {
  let frameId = 0;

  return () => {
    if (frameId) return;

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      render();
    });
  };
}
