import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useJourney } from '../store/useJourney'
import { Fallback } from './Fallback'

interface SceneBoundaryState {
  readonly failed: boolean
}

/** If the WebGL scene throws (driver bug, lost context, shader compile failure), show the CSS fallback instead. */
export class SceneBoundary extends Component<{ children: ReactNode }, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false }

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D scene failed; showing the static fallback.', error, info.componentStack)
    useJourney.getState().setLoaded(true)
  }

  render() {
    return this.state.failed ? <Fallback /> : this.props.children
  }
}
