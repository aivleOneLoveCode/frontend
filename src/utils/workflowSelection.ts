
// 워크플로우 인터페이스 (폴더용) - 백엔드 스키마 호환
const selectionClearCallbacks: (() => void)[] = []

export function registerSelectionClearCallback(callback: () => void) {
  selectionClearCallbacks.push(callback)
}

export function clearAllWorkflowSelections() {
  selectionClearCallbacks.forEach(callback => callback())
}