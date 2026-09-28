<script lang="ts">
  import { FileUpload } from "@moderno-ui/svelte";
</script>

<FileUpload
  label="Upload logo"
  accept={["image/svg+xml", "image/png"]}
  maxFileSize={2_000_000}
/>
