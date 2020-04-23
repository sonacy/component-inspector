import React, { FC, useEffect, useState, useMemo, useRef } from 'react'

export interface IDetail {
  filename: string
  lineNumber: string
  columnNumber: string
  relativePath: string
}

export const getDataAttibutes = (element: any): IDetail | null => {
  if (element) {
    const { dataset } = element
    if (dataset) {
      const filename = dataset.inspectorFilename
      const lineNumber = dataset.inspectorLine
      const columnNumber = dataset.inspectorColumn
      const relativePath = dataset.inspectorRelativePath
      if (filename) {
        return { filename, lineNumber, columnNumber, relativePath }
      } else if (element.parentNode) {
        return getDataAttibutes(element.parentNode)
      }
    }
  }
  return null
}

const InspectorDev: FC = ({ children }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const [keys, setKeys] = useState<number[]>([])
  const [detail, setDetail] = useState<IDetail | null>(null)

  const isInInspector = useMemo(() => {
    const keystr = keys.join(',')
    return keystr === '17,16,191'
  }, [keys])

  useEffect(() => {
    const clickAction = (e: MouseEvent) => {
      const { target } = e
      if (isInInspector) {
        e.stopPropagation()
        const det = getDataAttibutes(target)
        setDetail(det)
        if (det) {
          fetch(
            `/__open-stack-frame-in-editor?fileName=${det.filename}&lineNumber=${det.lineNumber}&colNumber=${det.columnNumber}`
          )
        }
      }
    }

    const keyBind = (e: KeyboardEvent) => {
      const { keyCode } = e
      if (keyCode === 27) {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none'
        }
        setKeys([])
      } else {
        const keystate = [...keys]
        if (keystate.length > 2) {
          keystate.shift()
        }
        keystate.push(keyCode)
        setKeys(keystate)
      }
    }

    const hoverEvent = (e: any) => {
      if (isInInspector && e.target) {
        const { dataset } = e.target
        if (dataset.inspectorTooltipRef) {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none'
          }
          return
        }
        const bgc = e.target.style.backgroundColor
        const det = getDataAttibutes(e.target)

        setDetail(det)
        if (tooltipRef.current) {
          tooltipRef.current.style.top = `${e.clientY + 16}px`
          tooltipRef.current.style.left = `${e.clientX + 16}px`
          tooltipRef.current.style.display = 'block'
        }
        e.target.style.backgroundColor = '#9ac5e6'
        e.target.addEventListener('mouseout', () => {
          e.target.style.backgroundColor = bgc
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none'
          }
        })
      }
    }

    document.addEventListener('mouseover', hoverEvent, true)

    document.addEventListener('keydown', keyBind)

    document.addEventListener('click', clickAction, true)
    return () => {
      document.removeEventListener('click', clickAction, true)
      document.removeEventListener('mouseover', hoverEvent, true)
      document.removeEventListener('keydown', keyBind)
    }
  }, [isInInspector, keys])

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
        ref={tooltipRef}
      >
        {detail
          ? `${detail.relativePath}:${detail.lineNumber}:${detail.columnNumber}`
          : '找不到对应source file, 有可能这是个第三方组件'}
      </div>
    </>
  )
}

const InspectorProd: FC = ({ children }) => {
  return <>{children}</>
}

export default process.env.NODE_ENV === 'development' ? InspectorDev : InspectorProd
