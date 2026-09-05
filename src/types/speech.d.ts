// Global Web Speech API type declarations
// Shared across all components that use voice input

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult:           ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror:            ((this: SpeechRecognition, ev: Event) => void) | null
  onend:              ((this: SpeechRecognition, ev: Event) => void) | null
  onstart:            ((this: SpeechRecognition, ev: Event) => void) | null
  onnomatch:          ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onaudiostart:       ((this: SpeechRecognition, ev: Event) => void) | null
  onaudioend:         ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundstart:       ((this: SpeechRecognition, ev: Event) => void) | null
  onsoundend:         ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechstart:      ((this: SpeechRecognition, ev: Event) => void) | null
  onspeechend:        ((this: SpeechRecognition, ev: Event) => void) | null
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition
  prototype: SpeechRecognition
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}
