import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { NewsBlock, NewsBlockType } from '@phuong-xa/shared'

export type ViewMode = 'desktop' | 'ipad-portrait' | 'ipad-landscape' | 'iphone-portrait' | 'iphone-landscape'

interface EditorState {
  blocks: NewsBlock[]
  selectedBlockId: string | null
  viewMode: ViewMode
  
  // Actions
  addBlock: (type: NewsBlockType, index?: number) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, data: Partial<NewsBlock>) => void
  reorderBlocks: (fromIndex: number, toIndex: number) => void
  selectBlock: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setBlocks: (blocks: NewsBlock[]) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  blocks: [],
  selectedBlockId: null,
  viewMode: 'desktop',

  addBlock: (type, index) => set((state) => {
    const newBlock: NewsBlock = {
      id: nanoid(),
      type,
      className: '',
      // Default Props based on type
      ...(type === 'text' && { content: 'Nội dung văn bản...', settings: { align: 'left' } }),
      ...(type === 'heading' && { content: 'Tiêu đề mới', level: 2, settings: { align: 'left' } }),
      ...(type === 'image' && { src: '', alt: '', settings: { width: '100%', objectFit: 'cover' } }),
      ...(type === 'youtube' && { videoId: '', settings: { aspectRatio: '16/9' } }),
      ...(type === 'carousel' && { items: [], settings: { autoplay: true, interval: 3000 } }),
      ...(type === 'divider' && { settings: { style: 'solid', color: '#e5e7eb', paddingTop: '1rem', paddingBottom: '1rem' } }),
      ...(type === 'quote' && { content: 'Trích dẫn...', author: 'Tác giả', settings: { align: 'left', backgroundColor: '#f9fafb' } }),
      ...(type === 'qr-code' && { value: 'https://example.com', settings: { size: 128, level: 'M' } }),
      ...(type === 'icon' && { iconName: 'Star', settings: { size: 48, align: 'center' } }),
      ...(type === 'collapse' && { title: 'Tiêu đề mục', content: 'Nội dung chi tiết...', settings: { isOpen: false } }),
    } as unknown as NewsBlock

    const newBlocks = [...state.blocks]
    if (typeof index === 'number') {
      newBlocks.splice(index, 0, newBlock)
    } else {
      newBlocks.push(newBlock)
    }

    return { blocks: newBlocks, selectedBlockId: newBlock.id }
  }),

  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id),
    selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
  })),

  updateBlock: (id, data) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...data } : b)) as NewsBlock[]
  })),

  reorderBlocks: (fromIndex, toIndex) => set((state) => {
    const newBlocks = [...state.blocks]
    const [movedBlock] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, movedBlock)
    return { blocks: newBlocks }
  }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setBlocks: (blocks) => set({ blocks })
}))
