// The entry notice holds the page until the visitor agrees. Anything that
// should start "on load" (the hero intro) waits for that moment instead.
export const GATE_KEY = "knil-entry-agreed";
export const GATE_EVENT = "knil:enter";

export function isEntered() {
  return document.documentElement.hasAttribute("data-entered");
}

export function whenEntered(cb: () => void) {
  if (isEntered()) {
    cb();
    return () => {};
  }
  window.addEventListener(GATE_EVENT, cb, { once: true });
  return () => window.removeEventListener(GATE_EVENT, cb);
}

// Runs in <head> before first paint, so a visitor who already agreed in this
// session never sees the notice flash.
export const gateBootScript = `try{if(sessionStorage.getItem("${GATE_KEY}")==="1"){var d=document.documentElement;d.setAttribute("data-entered","");d.setAttribute("data-gate-skip","")}}catch(e){}`;
