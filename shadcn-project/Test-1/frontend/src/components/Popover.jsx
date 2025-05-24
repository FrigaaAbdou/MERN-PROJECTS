import * as Popover from '@radix-ui/react-popover'

export default function InfoPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="px-3 py-1.5 rounded bg-green-600 text-white">
          Hover / Click me
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          className="rounded bg-white p-3 text-sm shadow-xl border border-gray-200 w-56"
        >
          <p>
            This popover uses Radix primitives and Tailwind utilities only.
          </p>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}