import {
  Box,
  Button,
  Checkbox,
  FormLabel,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from '@chakra-ui/react'
import {
  VscArrowBoth,
  VscSplitHorizontal,
  VscSplitVertical,
} from 'react-icons/vsc'
import { RiTextDirectionL, RiTextDirectionR } from 'react-icons/ri'

import { themes } from './styles'
import { shallow, useStore } from './store'
import { snippets } from './dict.json'
import { menu } from './programs'

const LayoutSwitcher = ({
  options,
  defaultValue,
  onChange,
}: {
  options: any[]
  defaultValue: string
  onChange: (string) => void
}) => {
  return (
    <HStack>
      {options.map((option) => {
        const isChecked = option.name === defaultValue
        return (
          <IconButton
            aria-label={option.name}
            variant={isChecked ? 'outline' : 'ghost'}
            key={option.name}
            icon={option.icon}
            onClick={() => onChange(option.name)}
          />
        )
      })}
    </HStack>
  )
}
export const Settings = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [theme, setTheme] = useStore((s) => [s.theme, s.setTheme], shallow)

  const [langpack, setLangpack] = useStore(
    (s) => [s.langpack, s.setLangpack],
    shallow
  )

  const [codemini, setCodemini] = useStore(
    (s) => [s.codemini, s.setCodemini],
    shallow
  )
  const [layout, setLayout] = useStore((s) => [s.layout, s.setLayout], shallow)

  const setLocalcode = useStore((s) => s.setLocalcode)

  const [direction, setDirection] = useStore(
    (s) => [s.direction, s.setDirection],
    shallow
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Layout: </Text>
          <HStack>
            <LayoutSwitcher
              defaultValue={layout}
              onChange={setLayout}
              options={[
                { name: 'auto', icon: <VscArrowBoth /> },
                { name: 'vertical', icon: <VscSplitVertical /> },
                { name: 'horizontal', icon: <VscSplitHorizontal /> },
              ]}
            />
          </HStack>
          <Box py={1}></Box>
          <Box>
            <FormLabel>Editor</FormLabel>
            <HStack>
              <LayoutSwitcher
                defaultValue={direction}
                onChange={setDirection}
                options={[
                  { name: 'ltr', icon: <RiTextDirectionL /> },
                  { name: 'rtl', icon: <RiTextDirectionR /> },
                ]}
              />
              <Box flex={1} />
              <Checkbox
                isChecked={codemini}
                onChange={(ev) => setCodemini(ev.target.checked)}
              >
                Compact
              </Checkbox>
            </HStack>
          </Box>
          <Box py={1}></Box>
          <FormLabel>Theme</FormLabel>
          <Select
            variant="retro"
            defaultValue={theme.name}
            onChange={(ev) =>
              setTheme(themes.find((t) => t.name === ev.target.value))
            }
          >
            {themes.map((theme) => (
              <option key={theme.name} value={theme.name}>
                {theme.name}
              </option>
            ))}
          </Select>
          <Box py={1}></Box>
          <FormLabel>Toolbar language pack</FormLabel>
          <Select
            variant="retro"
            defaultValue={langpack}
            onChange={(ev) => {
              setLangpack(ev.target.value)
            }}
          >
            {Object.keys(snippets).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
          <Box py={1}></Box>
          <FormLabel>Load program</FormLabel>
          <Select
            variant="retro"
            defaultValue=""
            onChange={(ev) => {
              const code = ev.target.value
              if (code.length > 0) {
                setLocalcode(code)
              }
            }}
          >
            <option key="none" value=""></option>
            {menu.map((item) => (
              <option key={item.name} value={item.code}>
                {item.name}
              </option>
            ))}
          </Select>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            OK
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
