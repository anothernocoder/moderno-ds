---
ssr: PinInput `count` → correct server aria
---

### PinInput (`pinInputRecipe`: `data-size`; Ark focus/paste/mask machine)

| State                                  | React | Vue | Svelte | Solid |
| -------------------------------------- | :---: | :-: | :----: | :---: |
| size → root `data-size`                |  ✅   | ✅  |   ✅   |  ✅   |
| one cell per index, labelled, otp      |  ✅   | ✅  |   ✅   |  ✅   |
| typing fills → `data-filled`/-complete |  ✅   | ✅  |   ✅   |  ✅   |
| paste distributes across the cells     |  ✅   | ✅  |   ✅   |  ✅   |
| mask → `type="password"`               |  ✅   | ✅  |   ✅   |  ✅   |
| invalid → `data-invalid` + aria        |  ✅   | ✅  |   ✅   |  ✅   |
