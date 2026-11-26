/**
 * While the settings modal is open, its changes are applied to the dashboard
 * as a preview but not saved; they are saved only when the user clicks
 * "Save changes".
 */
let previewing = false;

export const settingsPreview = {
  start(): void {
    previewing = true;
  },
  end(): void {
    previewing = false;
  },
  get active(): boolean {
    return previewing;
  },
};
