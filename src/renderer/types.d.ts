import type { OmniFlowAPI } from '../../electron/preload'

declare global {
  interface Window {
    omniflow: OmniFlowAPI
  }
}
