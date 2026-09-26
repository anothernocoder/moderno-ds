<!--
  Avatar — Ark's image-loading machine: on the server the image has not
  loaded, so the fallback shows and the image is hidden.
-->
<script lang="ts">
  import { Avatar } from "../../src/exports/avatar.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

<section aria-label="avatars">
  <Avatar.Root>
    <Avatar.Fallback>AL</Avatar.Fallback>
    <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
  </Avatar.Root>
  <Avatar.Root size="sm" shape="square">
    <Avatar.Fallback>MD</Avatar.Fallback>
  </Avatar.Root>
</section>
