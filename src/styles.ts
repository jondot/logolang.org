import { EditorView } from '@codemirror/view'
import { defineStyleConfig, extendTheme } from '@chakra-ui/react'
import { tags as t } from '@lezer/highlight'
import type { CreateThemeOptions } from '@uiw/codemirror-themes'
import { createTheme } from '@uiw/codemirror-themes'

export interface Theme {
  name: string
  foreground: string
  dim: string
  dimmer: string
  background: string
  codebg: string
  caret: string
}

export const defaultTheme: Theme = {
  name: '🥛 Milk and Chocolate',
  foreground: '#522a00',
  dim: '#eee',
  dimmer: '#ccc',
  background: '#fff',
  codebg: '#bbb',
  caret: '#000',
}

export const themes = [
  defaultTheme,
  {
    name: '🤮 Puke Green',
    foreground: '#00ff00',
    dim: '#009900',
    dimmer: '#002200',
    background: '#000',
    codebg: '#000',
    caret: '#fff',
  },

  {
    name: '🌌 Galaxy White',
    foreground: '#fff',
    dim: '#999',
    dimmer: '#222',
    background: '#000',
    codebg: '#000',
    caret: '#00ff00',
  },
  {
    name: '👹 Devil Red',
    foreground: '#ff0000',
    dim: '#990000',
    dimmer: '#220000',
    background: '#000',
    codebg: '#000',
    caret: '#fff',
  },
  {
    name: '🗞 Newspaper White',
    foreground: '#000',
    dim: '#eee',
    dimmer: '#ccc',
    background: '#fff',
    codebg: '#aaa',
    caret: '#00ff00',
  },
  {
    name: '🕹 Synthwave',
    foreground: '#f887ff',
    dim: '#860029',
    dimmer: '#29132e',
    background: '#29132e',
    codebg: '#321450',
    caret: '#fff',
  },
]

const codemirror = ({
  background,
  foreground,
  codebg,
  dim,
  dimmer,
  caret,
}: Theme) => {
  const baseThemeExtension = (options?: CreateThemeOptions) => {
    const { theme = 'dark', settings = {}, styles = [] } = options || {}
    return createTheme({
      theme,
      settings: {
        background: codebg,
        foreground,
        caret,
        selection: dimmer,
        selectionMatch: dimmer,
        gutterBackground: '#555',
        gutterForeground: '#FFFFFF',
        lineHighlight: '#314151',
        ...settings,
      },
      styles: [
        { tag: t.keyword, color: 'darkgoldenrod', fontWeight: 'bold' },
        { tag: t.atom, color: dim, fontWeight: 'bold' },
        //  { tag: t.comment, color: '#7a7b7c', fontStyle: 'italic' },
        {
          tag: t.number,
          background: foreground,
          borderRadius: '3px',
          padding: '0px 3px',
          color: background,
          fontWeight: 'bold',
        },
        { tag: t.definition(t.variableName), color: '#fffabc' },
        { tag: t.variableName, color: foreground },
        { tag: t.function(t.variableName), color: '#fffabc' },
        { tag: t.typeName, color: '#FFDD44' },
        { tag: t.tagName, color: '#def' },
        { tag: t.string, color: '#2b4' },
        { tag: t.meta, color: '#C9F' },
        // { tag: t.qualifier, color: '#FFF700' },
        // { tag: t.builtin, color: '#30aabc' },
        { tag: t.bracket, color: '#8a8a8a' },
        { tag: t.attributeName, color: '#DDFF00' },
        { tag: t.heading, color: 'aquamarine', fontWeight: 'bold' },
        { tag: t.link, color: 'blueviolet', fontWeight: 'bold' },
        ...styles,
      ],
    })
  }

  const theme = EditorView.theme(
    {
      '&.cm-editor.cm-focused': {
        outline: 'inherit',
      },
      '&.cm-focused .cm-cursorLayer': {
        animation: 'inherit',
      },
      '&.cm-focused .cm-cursor': {
        color: caret,
        border: 0,
        borderLeftStyle: 'solid',
        borderWidth: '0.6em',
      },
    },
    { dark: true }
  )
  return { theme, baseThemeExtension }
}

const chakra = ({ foreground, background, dimmer }: Theme) => {
  const Button = defineStyleConfig({
    // The styles all button have in common
    baseStyle: {
      fontWeight: 'bold',
      textTransform: 'uppercase',
      borderRadius: 'base', // <-- border radius is same for all variants and sizes
    },
    // Two sizes: sm and md
    sizes: {
      sm: {
        fontSize: 'sm',
        px: 4, // <-- px is short for paddingLeft and paddingRight
        py: 3, // <-- py is short for paddingTop and paddingBottom
      },
      md: {
        fontSize: 'md',
        px: 6, // <-- these values are tokens from the design system
        py: 4, // <-- these values are tokens from the design system
      },
    },
    // Two variants: outline and solid
    variants: {
      outline: {
        borderRadius: 0,
        border: '2px solid',
        borderColor: foreground,
        color: foreground,
        bg: dimmer,
        '&:hover': {
          bg: foreground,
          color: background,
        },
      },
      ghost: {
        border: 0,
        borderRadius: 0,
        _hover: {
          bg: foreground,
          color: background,
        },
      },
    },
    // The default size and variant values
    defaultProps: {
      size: 'md',
      variant: 'outline',
    },
  })
  return extendTheme({
    styles: {
      global: {
        // styles for the `body`
        html: {
          height: '100%',
        },
        '#root': { height: '100%' },
        body: {
          height: '100%',
          bg: background, // '#555',
          color: foreground,
        },
        // styles for the `a`
        a: {
          color: 'teal.500',
          _hover: {
            textDecoration: 'underline',
          },
        },
      },
    },
    colors: {
      brand: {
        100: '#f7fafc',
        // ...
        900: '#1a202c',
      },
    },
    components: {
      Select: {
        variants: {
          retro: {
            field: {
              border: '1px solid',
              borderRadius: 0,
              borderColor: foreground,
              bg: 'inherit',
              _hover: {
                borderColor: foreground,
              },
              _focusVisible: {
                borderColor: foreground,
              },
            },
          },
        },
      },
      Button,
      Modal: {
        baseStyle: () => ({
          overlay: {
            bg: 'blackAlpha.600',
            zIndex: 'modal',
          },
          dialogContainer: {
            display: 'flex',
            zIndex: 'modal',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'auto',
            overscrollBehaviorY: 'none',
          },
          dialog: {
            borderRadius: 0,
            border: '1px solid',
            borderColor: foreground,
            bg: background,
            color: 'inherit',
            my: '16',
            zIndex: 'modal',
            boxShadow: 'lg',
          },
          header: {
            px: '6',
            py: '4',
            fontSize: 'xl',
            fontWeight: 'semibold',
          },
          closeButton: {
            position: 'absolute',
            top: '2',
            insetEnd: '3',
          },
          body: {
            px: '6',
            py: '2',
            flex: '1',
          },
          footer: {
            px: '6',
            py: '4',
          },
        }),
      },
    },
  })
}
const canvas = ({ foreground, background }: Theme) => ({
  color: foreground,
  backgroundColor: background,
})

export { chakra, canvas, codemirror }
