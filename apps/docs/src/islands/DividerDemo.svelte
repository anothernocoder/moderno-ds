<!--
  Live Divider preview — the real @moderno-ui/svelte primitive: a bare rule, the
  three label alignments, and vertical rules — bare and captioned — between
  inline items. Every recipe cell the props table advertises is on the page,
  captioned × vertical included: that is the one combination where the label's
  rotated writing mode decides which axis the gap opens on. Painted by
  @moderno-ui/css from --border, so it re-skins live with the Theme Builder and
  the colour-scheme toggle. The wrappers below only lay the examples out; the
  rules themselves carry no styling of their own.
-->
<script lang="ts">
  import { Divider } from "@moderno-ui/svelte";
</script>

<div class="divider-stack">
  <Divider />
  <Divider>Or continue with</Divider>
  <Divider align="start">Recent</Divider>
  <Divider align="end">Archive</Divider>
</div>

<div class="divider-inline">
  <span>Overview</span>
  <Divider orientation="vertical" />
  <span>Activity</span>
  <Divider orientation="vertical">or</Divider>
  <span>Settings</span>
</div>

<style>
  .divider-stack {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }
  .divider-inline {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    /* A vertical rule takes the height of its row, so give the row one — tall
       enough that the captioned rule still has stroke left either side of its
       caption once the label's margins have opened the gap. */
    min-height: 3rem;
  }
</style>
