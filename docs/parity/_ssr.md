## SSR (F3.3 / F3.5)

The first rows hold for the whole playground. Then one row per component: its
SSR test server-renders the component's playground section and checks what the
row names.

| Guarantee                                   | React | Vue | Svelte | Solid |
| ------------------------------------------- | :---: | :-: | :----: | :---: |
| warning-free hydration (id path)            |  ✅   | ✅¹ |   —²   |  —²   |
| static server-only island (zero `<script>`) |   —   |  —  |   ✅   |   —   |
