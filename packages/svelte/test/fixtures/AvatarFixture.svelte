<script lang="ts">
  import { Avatar } from "../../src/index.js";
  import type { AvatarShape, AvatarSize, AvatarStatusChangeDetails } from "../../src/index.js";

  let {
    size = undefined,
    shape = undefined,
    onStatusChange = undefined,
  }: {
    size?: AvatarSize;
    shape?: AvatarShape;
    onStatusChange?: (details: AvatarStatusChangeDetails) => void;
  } = $props();
</script>

<Avatar.Root {size} {shape} {onStatusChange} class="profile">
  <Avatar.Fallback>AL</Avatar.Fallback>
  <Avatar.Image src="/ada.png" alt="Ada Lovelace" />
</Avatar.Root>
