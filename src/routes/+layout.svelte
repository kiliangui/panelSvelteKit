<script>
  import "../app.pcss";
  import { Navbar } from "$lib/components";
</script>

<Navbar />

<div class="h-screen pt-20">
  <div class="h-full container py-6">
    <slot />
  </div>
</div>
