/**
 * The React renderers of the Simple forms (`../library/simple-forms.ts`). Each
 * one draws the whole anatomy of its docs example from plain arguments, so a
 * model cannot get the structure wrong. The arguments the form does not name
 * (its recipe variants) go to the Root.
 */
import { useEffect, useMemo, type ReactNode } from "react";
import type { ComponentRenderer } from "@openuidev/react-lang";
import {
  Accordion,
  Checkbox,
  Combobox,
  createListCollection,
  DatePicker,
  Field,
  NumberInput,
  PinInput,
  Portal,
  Progress,
  RadioGroup,
  SegmentedControl,
  Select,
  Slider,
  Switch,
  Tabs,
  TagsInput,
  ToggleGroup,
  useFilter,
  useListCollection,
} from "@moderno-ui/react";
import { SIMPLE_FORMS } from "../library/simple-forms.ts";

type Option = { label: string; value: string };

/** `"Red"` → `{label: "Red", value: "Red"}`. Skips an entry still streaming in. */
function toOptions(options: unknown): Option[] {
  if (!Array.isArray(options)) return [];
  return options.flatMap((option): Option[] => {
    if (typeof option === "string") return [{ label: option, value: option }];
    const { label, value } = (option ?? {}) as Partial<Option>;
    return typeof label === "string" ? [{ label, value: value ?? label }] : [];
  });
}

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];

const asString = (value: unknown) => (value === undefined ? undefined : String(value));

/** Rebuilt only when the options change, so a re-render keeps the user's pick. */
function useOptions(options: unknown): Option[] {
  const key = JSON.stringify(options ?? []);
  return useMemo(() => toOptions(JSON.parse(key)), [key]);
}

const SelectForm: ComponentRenderer = ({ props: { label, options, placeholder, ...root } }) => {
  const items = useOptions(options);
  const collection = useMemo(() => createListCollection({ items }), [items]);
  return (
    <Select.Root {...root} collection={collection}>
      <Select.Label>{String(label)}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={asString(placeholder)} />
          <Select.Indicator>▼</Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
      <Select.HiddenSelect />
    </Select.Root>
  );
};

const ComboboxForm: ComponentRenderer = ({ props: { label, options, placeholder, ...root } }) => {
  const items = useOptions(options);
  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, set } = useListCollection({ initialItems: items, filter: contains });
  // A streamed option list grows after the first render.
  useEffect(() => set(items), [items, set]);
  return (
    <Combobox.Root
      {...root}
      collection={collection}
      onInputValueChange={(details) => filter(details.inputValue)}
    >
      <Combobox.Label>{String(label)}</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder={asString(placeholder)} />
        <Combobox.Trigger>▾</Combobox.Trigger>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            {collection.items.map((item) => (
              <Combobox.Item key={item.value} item={item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator>✓</Combobox.ItemIndicator>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};

const FieldForm: ComponentRenderer = ({
  props: { label, placeholder, helperText, type, inputMode, maxLength, ...root },
}) => (
  <Field.Root {...root}>
    <Field.Label>{String(label)}</Field.Label>
    <Field.Input
      placeholder={asString(placeholder)}
      type={asString(type)}
      inputMode={inputMode as "text" | undefined}
      maxLength={maxLength as number | undefined}
    />
    {helperText === undefined ? null : <Field.HelperText>{String(helperText)}</Field.HelperText>}
  </Field.Root>
);

const NumberInputForm: ComponentRenderer = ({
  props: { label, min, max, step, defaultValue, ...root },
}) => (
  <NumberInput.Root
    {...root}
    min={min as number | undefined}
    max={max as number | undefined}
    step={step as number | undefined}
    defaultValue={asString(defaultValue)}
  >
    <NumberInput.Label>{String(label)}</NumberInput.Label>
    <NumberInput.Control>
      <NumberInput.Input />
      <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
      <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
    </NumberInput.Control>
  </NumberInput.Root>
);

const PinInputForm: ComponentRenderer = ({ props: { label, length, ...root } }) => {
  const count = Math.max(1, Number(length) || 4);
  return (
    <PinInput.Root {...root} count={count}>
      <PinInput.Label>{String(label)}</PinInput.Label>
      <PinInput.Control>
        {Array.from({ length: count }, (_, index) => (
          <PinInput.Input key={index} index={index} />
        ))}
      </PinInput.Control>
      <PinInput.HiddenInput />
    </PinInput.Root>
  );
};

const RadioGroupForm: ComponentRenderer = ({
  props: { label, options, defaultValue, ...root },
}) => (
  <RadioGroup.Root {...root} defaultValue={asString(defaultValue)}>
    <RadioGroup.Label>{String(label)}</RadioGroup.Label>
    {toOptions(options).map((option) => (
      <RadioGroup.Item key={option.value} value={option.value}>
        <RadioGroup.ItemControl />
        <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    ))}
  </RadioGroup.Root>
);

const SegmentedControlForm: ComponentRenderer = ({
  props: { label, options, defaultValue, ...root },
}) => {
  const items = toOptions(options);
  return (
    <SegmentedControl.Root
      {...root}
      aria-label={String(label)}
      defaultValue={asString(defaultValue) ?? items[0]?.value}
    >
      <SegmentedControl.Indicator />
      {items.map((option) => (
        <SegmentedControl.Item key={option.value} value={option.value}>
          <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
          <SegmentedControl.ItemHiddenInput />
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  );
};

const ToggleGroupForm: ComponentRenderer = ({ props: { label, options, multiple, ...root } }) => (
  <ToggleGroup.Root {...root} aria-label={String(label)} multiple={multiple === true}>
    {toOptions(options).map((option) => (
      <ToggleGroup.Item key={option.value} value={option.value}>
        {option.label}
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
);

const TagsInputForm: ComponentRenderer = ({
  props: { label, defaultValue, placeholder, ...root },
}) => (
  <TagsInput.Root {...root} defaultValue={strings(defaultValue)}>
    <TagsInput.Label>{String(label)}</TagsInput.Label>
    <TagsInput.Control>
      <TagsInput.Context>
        {(tagsInput) =>
          tagsInput.value.map((value, index) => (
            <TagsInput.Item key={index} index={index} value={value}>
              <TagsInput.ItemPreview>
                <TagsInput.ItemText>{value}</TagsInput.ItemText>
                <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
              </TagsInput.ItemPreview>
              <TagsInput.ItemInput />
            </TagsInput.Item>
          ))
        }
      </TagsInput.Context>
      <TagsInput.Input placeholder={asString(placeholder)} />
    </TagsInput.Control>
    <TagsInput.HiddenInput />
  </TagsInput.Root>
);

const CheckboxForm: ComponentRenderer = ({ props: { label, defaultChecked, ...root } }) => (
  <Checkbox.Root {...root} defaultChecked={defaultChecked === true}>
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>{String(label)}</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
);

const SwitchForm: ComponentRenderer = ({ props: { label, defaultChecked, ...root } }) => (
  <Switch.Root {...root} defaultChecked={defaultChecked === true}>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label>{String(label)}</Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
);

const SliderForm: ComponentRenderer = ({
  props: { label, min, max, step, defaultValue, ...root },
}) => (
  <Slider.Root
    {...root}
    min={min as number | undefined}
    max={max as number | undefined}
    step={step as number | undefined}
    defaultValue={[Number(defaultValue ?? min ?? 0)]}
  >
    <Slider.Label>{String(label)}</Slider.Label>
    <Slider.ValueText />
    <Slider.Control>
      <Slider.Track>
        <Slider.Range />
      </Slider.Track>
      <Slider.Thumb index={0}>
        <Slider.HiddenInput />
      </Slider.Thumb>
    </Slider.Control>
  </Slider.Root>
);

const ProgressForm: ComponentRenderer = ({ props: { label, value, max, ...root } }) => (
  <Progress.Root {...root} value={Number(value) || 0} max={max as number | undefined}>
    <Progress.Label>{String(label)}</Progress.Label>
    <Progress.ValueText />
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
);

const DatePickerForm: ComponentRenderer = ({ props: { label, placeholder, ...root } }) => (
  <DatePicker.Root {...root}>
    <DatePicker.Label>{String(label)}</DatePicker.Label>
    <DatePicker.Control>
      <DatePicker.Input placeholder={asString(placeholder)} />
      <DatePicker.Trigger aria-label="Open calendar">▾</DatePicker.Trigger>
    </DatePicker.Control>
    <Portal>
      <DatePicker.Positioner>
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Context>
              {(datePicker) => (
                <>
                  <DatePicker.ViewControl>
                    <DatePicker.PrevTrigger>‹</DatePicker.PrevTrigger>
                    <DatePicker.RangeText />
                    <DatePicker.NextTrigger>›</DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table>
                    <DatePicker.TableHead>
                      <DatePicker.TableRow>
                        {datePicker.weekDays.map((weekDay, index) => (
                          <DatePicker.TableHeader key={index}>
                            {weekDay.short}
                          </DatePicker.TableHeader>
                        ))}
                      </DatePicker.TableRow>
                    </DatePicker.TableHead>
                    <DatePicker.TableBody>
                      {datePicker.weeks.map((week, index) => (
                        <DatePicker.TableRow key={index}>
                          {week.map((day, dayIndex) => (
                            <DatePicker.TableCell key={dayIndex} value={day}>
                              <DatePicker.TableCellTrigger>{day.day}</DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </Portal>
  </DatePicker.Root>
);

/** The i-th panel, rendered on its own. */
function panel(children: unknown, index: number, renderNode: (value: unknown) => ReactNode) {
  return Array.isArray(children) ? renderNode(children[index]) : null;
}

const TabsForm: ComponentRenderer = ({ props: { tabs, children, ...root }, renderNode }) => {
  const labels = strings(tabs);
  return (
    <Tabs.Root {...root} defaultValue="0">
      <Tabs.List>
        {labels.map((label, index) => (
          <Tabs.Trigger key={index} value={String(index)}>
            {label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
      {labels.map((_, index) => (
        <Tabs.Content key={index} value={String(index)}>
          {panel(children, index, renderNode)}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

const AccordionForm: ComponentRenderer = ({ props: { titles, children, ...root }, renderNode }) => (
  <Accordion.Root {...root} collapsible>
    {strings(titles).map((title, index) => (
      <Accordion.Item key={index} value={String(index)}>
        <Accordion.ItemTrigger>
          {title}
          <Accordion.ItemIndicator>⌄</Accordion.ItemIndicator>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>{panel(children, index, renderNode)}</Accordion.ItemContent>
      </Accordion.Item>
    ))}
  </Accordion.Root>
);

export const SIMPLE_FORM_RENDERERS = {
  Accordion: AccordionForm,
  Checkbox: CheckboxForm,
  Combobox: ComboboxForm,
  DatePicker: DatePickerForm,
  Field: FieldForm,
  NumberInput: NumberInputForm,
  PinInput: PinInputForm,
  Progress: ProgressForm,
  RadioGroup: RadioGroupForm,
  SegmentedControl: SegmentedControlForm,
  Select: SelectForm,
  Slider: SliderForm,
  Switch: SwitchForm,
  Tabs: TabsForm,
  TagsInput: TagsInputForm,
  ToggleGroup: ToggleGroupForm,
} satisfies Record<keyof typeof SIMPLE_FORMS, ComponentRenderer>;
