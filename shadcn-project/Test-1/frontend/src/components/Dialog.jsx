import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'                      // small svg icon (optional)

export default function BasicDialog({ btnLabel = 'Open dialog' }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-4 py-2 rounded bg-blue-600 text-white">
          {btnLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        {/* content */}
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 rounded-lg
                     bg-white p-6 shadow-lg focus:outline-none"
        >
          <Dialog.Title className="text-lg font-semibold">
            Radix Dialog
          </Dialog.Title>

          <Dialog.Description className="mt-2 text-sm text-gray-600">
            This dialog is built **without** ShadCN — just Radix + Tailwind.
          </Dialog.Description>

          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <button className="px-3 py-1.5 rounded bg-gray-800 text-white">
                Close
              </button>
            </Dialog.Close>
          </div>

          {/* top-right close icon */}
          <Dialog.Close
            className="absolute right-2 top-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}