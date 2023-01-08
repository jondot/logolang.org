import { Box, ChakraProvider, Flex, Stack } from '@chakra-ui/react'
import Canvas from './canvas'
import { chakra } from './styles'
import { useStore } from './store'
import Editor from './editor'

function App() {
  const theme = useStore((s) => s.theme)

  const codemini = useStore((s) => s.codemini)
  const layout = useStore((s) => s.layout)

  return (
    <ChakraProvider theme={chakra(theme)}>
      <Stack
        h="100%"
        direction={
          layout === 'auto'
            ? ['column-reverse', 'row']
            : layout === 'vertical'
            ? 'column-reverse'
            : 'row'
        }
        align="stretch"
      >
        <Flex flex={codemini ? 0.3 : 1} direction="column" overflowX="scroll">
          <Editor />
        </Flex>
        <Box sx={{ overflow: 'hidden' }} flex={1}>
          <Canvas />
        </Box>
      </Stack>
    </ChakraProvider>
  )
}
App.displayName = 'App'
App.whyDidYouRender = true

export default App
