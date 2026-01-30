import { injectCopy } from "./injectCopy.js";

export function start() {
  const isPosting =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      window.location.pathname,
    );

  if (isPosting) {
    injectCopy();
  }
}
