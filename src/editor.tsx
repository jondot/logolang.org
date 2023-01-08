import debounce from 'lodash/debounce'
import React, { useCallback, useRef } from 'react'
import { Box } from '@chakra-ui/react'
import useCode from './use-code'
import Toolbar from './toolbar'
import { shallow, useStore } from './store'

const Editor = () => {
  // sets up local code state loop + firing off delayed state saving for code changes
  const setCodeRaw = useStore((s) => s.setCode)
  const direction = useStore((s) => s.direction)
  const drawResult = useStore((s) => s.result)
  const theme = useStore((s) => s.theme)
  const setCode = useCallback(debounce(setCodeRaw, 2000), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [localcode, setLocalcode] = useStore(
    (s) => [s.localcode, s.setLocalcode],
    shallow
  )
  const onChange = useCallback(
    (v) => {
      setLocalcode(v)
      setCode(v)
    },
    [setLocalcode, setCode]
  )
  const editorRef = useRef()
  const { view } = useCode({
    editor: editorRef,
    value: localcode,
    theme,
    onChange,
  })

  return (
    <>
      <Box
        flex={1}
        sx={{
          overflow: 'scroll',
          direction: direction as any,
          fontSize: '24px',
        }}
        ref={editorRef}
      ></Box>
      <Toolbar editor={editorRef.current} view={view} />
      <Box
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="clip"
        title={drawResult?.error && drawResult.error}
      >
        {drawResult?.error && `⛔️ error: ${drawResult?.error}`}{' '}
        {drawResult?.time != null && `in ${drawResult?.time.toFixed(2)}ms`}
      </Box>
    </>
  )
}

Editor.displayName = 'Editor'
Editor.whyDidYouRender = true

export default React.memo(Editor)
