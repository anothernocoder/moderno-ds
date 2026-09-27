<script setup lang="ts">
import { DatePicker, Portal } from "@moderno-ui/vue";
</script>

<template>
  <DatePicker.Root locale="es-ES" :start-of-week="1">
    <DatePicker.Label>Fecha de entrega</DatePicker.Label>
    <DatePicker.Control>
      <DatePicker.Input />
      <DatePicker.Trigger aria-label="Open calendar">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </DatePicker.Trigger>
    </DatePicker.Control>
    <Portal>
      <DatePicker.Positioner>
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Context v-slot="datePicker">
              <DatePicker.ViewControl>
                <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
                <DatePicker.RangeText />
                <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
              </DatePicker.ViewControl>
              <DatePicker.Table>
                <DatePicker.TableHead>
                  <DatePicker.TableRow>
                    <DatePicker.TableHeader v-for="(weekDay, i) in datePicker.weekDays" :key="i">
                      {{ weekDay.short }}
                    </DatePicker.TableHeader>
                  </DatePicker.TableRow>
                </DatePicker.TableHead>
                <DatePicker.TableBody>
                  <DatePicker.TableRow v-for="(week, i) in datePicker.weeks" :key="i">
                    <DatePicker.TableCell v-for="(day, j) in week" :key="j" :value="day">
                      <DatePicker.TableCellTrigger>{{ day.day }}</DatePicker.TableCellTrigger>
                    </DatePicker.TableCell>
                  </DatePicker.TableRow>
                </DatePicker.TableBody>
              </DatePicker.Table>
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </Portal>
  </DatePicker.Root>
</template>
