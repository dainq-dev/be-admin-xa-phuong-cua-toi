import { Toolbox } from './Toolbox'
import { EditorCanvas } from './EditorCanvas'
import { SettingsPanel } from './SettingsPanel'

export function NewsEditor() {
  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden border rounded-lg bg-background">
      <Toolbox />
      <EditorCanvas />
      <SettingsPanel />
    </div>
  )
}
