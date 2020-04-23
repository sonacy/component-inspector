import React from 'react'
import { IDetail, getDataAttibutes } from './inspector'

class InspectorClsDev extends React.Component<any, { detail: IDetail | null; keys: number[] }> {
  tooltipRef = React.createRef<any>()

  state: { detail: IDetail | null; keys: number[] } = {
    detail: null,
    keys: [],
  }

  isInInspector = () => {
    const keystr = this.state.keys.join(',')
    return keystr === '17,16,191'
  }

  clickAction = (e: MouseEvent) => {
    const { target } = e
    if (this.isInInspector()) {
      e.stopPropagation()
      const det = getDataAttibutes(target)
      this.setState({
        detail: det,
      })
      if (det) {
        fetch(
          `/__open-stack-frame-in-editor?fileName=${det.filename}&lineNumber=${det.lineNumber}&colNumber=${det.columnNumber}`
        )
      }
    }
  }

  keyBind = (e: KeyboardEvent) => {
    const { keyCode } = e
    if (keyCode === 27) {
      if (this.tooltipRef.current) {
        this.tooltipRef.current.style.display = 'none'
      }
      this.setState({
        keys: [],
      })
    } else {
      const keystate = [...this.state.keys]
      if (keystate.length > 2) {
        keystate.shift()
      }
      keystate.push(keyCode)
      this.setState({
        keys: keystate,
      })
    }
  }

  hoverEvent = (e: any) => {
    if (this.isInInspector() && e.target) {
      const { dataset } = e.target
      if (dataset.inspectorTooltipRef) {
        if (this.tooltipRef.current) {
          this.tooltipRef.current.style.display = 'none'
        }
        return
      }
      const bgc = e.target.style.backgroundColor
      const det = getDataAttibutes(e.target)

      this.setState({
        detail: det,
      })
      if (this.tooltipRef.current) {
        this.tooltipRef.current.style.top = `${e.clientY + 16}px`
        this.tooltipRef.current.style.left = `${e.clientX + 16}px`
        this.tooltipRef.current.style.display = 'block'
      }
      e.target.style.backgroundColor = '#9ac5e6'
      e.target.addEventListener('mouseout', () => {
        e.target.style.backgroundColor = bgc
        if (this.tooltipRef.current) {
          this.tooltipRef.current.style.display = 'none'
        }
      })
    }
  }

  componentDidMount() {
    document.addEventListener('mouseover', this.hoverEvent, true)

    document.addEventListener('keydown', this.keyBind)

    document.addEventListener('click', this.clickAction, true)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseover', this.hoverEvent, true)

    document.removeEventListener('keydown', this.keyBind)

    document.removeEventListener('click', this.clickAction, true)
  }

  render() {
    const { children } = this.props
    const { detail } = this.state
    return (
      <>
        {children}
        <div
          data-inspector-tooltip-ref={1}
          style={{
            display: 'none',
            position: 'absolute',
            width: 200,
            height: 100,
            zIndex: 9999,
            backgroundColor: 'rgba(154, 197, 230, 0.6)',
            padding: 8,
            wordBreak: 'break-all',
          }}
          ref={this.tooltipRef}
        >
          {detail
            ? `${detail.relativePath}:${detail.lineNumber}:${detail.columnNumber}`
            : '找不到对应source file, 有可能这是个第三方组件'}
        </div>
      </>
    )
  }
}

class InspectorClsProd extends React.Component {
  render() {
    return this.props.children
  }
}

export default process.env.NODE_ENV === 'development' ? InspectorClsDev : InspectorClsProd
