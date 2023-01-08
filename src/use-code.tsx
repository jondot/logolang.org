import { useCallback, useEffect } from 'react'
import { useCodeMirror } from '@uiw/react-codemirror'
import { undo } from '@codemirror/commands'
import { StreamLanguage } from '@codemirror/language'
import { commonLisp } from '@codemirror/legacy-modes/mode/commonlisp'
import {
  BsArrow90DegLeft,
  BsArrow90DegRight,
  BsArrowDown,
  BsArrowLeft,
  BsArrowRight,
  BsArrowUp,
  BsTrash,
  BsXCircle,
} from 'react-icons/bs'
import { snippets } from './dict.json'
import interact from './cm-interact'

import { codemirror } from './styles'

const id = () => {}
const interactRules = interact({
  rules: [
    // a rule for a number dragger
    {
      // the regexp matching the value
      regexp: /-?\b\d+\.?\d*\b/g,
      // set cursor to "ew-resize" on hover
      cursor: 'ew-resize',
      // change number value based on mouse X movement on drag
      onDrag: (text, setText, e) => {
        const newVal = Number(text) + e.movementX
        if (isNaN(newVal)) {
          return
        }
        setText(newVal.toString())
      },
    },
  ],
})

const basicSetup = {
  completionKeymap: false,
  lineNumbers: false,
  highlightActiveLine: false,
  foldGutter: false,
}

export default function useCode({ editor, value, theme, onChange }) {
  const change = onChange || id

  const onEditableChange = useCallback(change, [change])
  const { theme: cmTheme, baseThemeExtension } = codemirror(theme)
  const extensions = [
    interactRules,
    StreamLanguage.define(commonLisp),
    baseThemeExtension(),
  ]

  const { setContainer, ...rest } = useCodeMirror({
    theme: cmTheme,
    basicSetup,
    container: editor.current,
    extensions,
    onChange: onEditableChange,
    value,
  })

  useEffect(() => {
    if (editor.current) {
      setContainer(editor.current)
    }
  }, [editor.current]) // eslint-disable-line react-hooks/exhaustive-deps

  return rest
}
const insert = (v) => (view) => {
  const from = view.state.selection.asSingle().ranges[0]?.from || 0
  view.dispatch({
    changes: { from, insert: v },
    selection: { anchor: from + v.length },
  })
}
export const commands = (langpack) => ({
  fd: {
    label: 'fd',
    emoji: <BsArrowUp />,
    exec: insert(snippets[langpack].fd),
  },
  bk: {
    label: 'bk',
    emoji: <BsArrowDown />,
    exec: insert(snippets[langpack].bk),
  },
  rt: {
    label: 'rt',
    emoji: <BsArrowRight />,
    exec: insert(snippets[langpack].rt),
  },
  lt: {
    label: 'lt',
    emoji: <BsArrowLeft />,
    exec: insert(snippets[langpack].lt),
  },
  rtfd: {
    label: 'rtfd',
    emoji: <BsArrow90DegRight />,
    exec: insert(snippets[langpack].rtfd),
  },
  ltfd: {
    label: 'ltfd',
    emoji: <BsArrow90DegLeft />,
    exec: insert(snippets[langpack].ltfd),
  },

  undo: {
    label: 'undo',
    emoji: <BsXCircle />,
    exec: (view) => {
      undo(view)
    },
  },
  reset: {
    label: 'reset',
    emoji: <BsTrash />,
    exec: (view) =>
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: '' },
      }),
  },
})
