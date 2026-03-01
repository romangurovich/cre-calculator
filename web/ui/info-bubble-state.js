export function nextInfoBubbleState(state, eventType) {
  switch (eventType) {
    case "hover-in":
    case "focus-in":
      return {
        ...state,
        open: true
      };
    case "hover-out":
      return state.pinned
        ? {
            ...state,
            open: true
          }
        : {
            ...state,
            open: false
          };
    case "focus-out":
      return state.pinned
        ? {
            ...state,
            open: true
          }
        : {
            ...state,
            open: false
          };
    case "toggle-pin":
      return state.pinned
        ? {
            open: false,
            pinned: false
          }
        : {
            open: true,
            pinned: true
          };
    case "dismiss":
      return {
        open: false,
        pinned: false
      };
    default:
      return state;
  }
}
