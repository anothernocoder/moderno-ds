<!-- A FileUpload whose accepted files are bound, and a button that clears them. -->
<script lang="ts">
  import { FileUpload } from "../../src/index.js";

  let files = $state<File[]>([]);
</script>

<FileUpload maxFiles={3} bind:acceptedFiles={files} />
<button type="button" onclick={() => (files = [])}>Clear</button>
