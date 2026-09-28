<script lang="ts">
  import { FileUpload } from "@moderno-ui/svelte";
</script>

<FileUpload label="Upload fonts" accept={[".otf", ".ttf", ".woff2"]} maxFiles={4} />
