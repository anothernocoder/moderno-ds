/**
 * Preview sizing, one stylesheet per component scope: `previews/<scope>.css`
 * holds the rules that fit that component to the Preview stage (a reading width
 * for a lone field, a centred row of spinners). A new component adds its own
 * file here instead of appending to `docs.css`, and the glob picks it up.
 *
 * BaseLayout imports this module right after `docs.css`, so these rules load
 * after it. The glob lives in a module of its own because Vite hoists an eager
 * glob's imports to the top of the file that holds it: written in BaseLayout,
 * they would load before `docs.css` instead.
 */
import.meta.glob("./previews/*.css", { eager: true });
