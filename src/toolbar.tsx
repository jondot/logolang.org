/* eslint-disable no-alert */
import init from 'dom-logo'
import React from 'react'
import {
  Box,
  Button,
  HStack,
  IconButton,
  Kbd,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useClipboard,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import {
  BsClipboard,
  BsClipboardCheck,
  BsGear,
  BsQuestionSquare,
  BsShare,
} from 'react-icons/bs'
import type { EditorView } from '@codemirror/view'
import { commands as commandsBuilder } from './use-code'
import { useStore } from './store'
import { Settings } from './settings'

const CopyToClipboard = () => {
  const toast = useToast()
  const { onCopy, setValue, hasCopied } = useClipboard('')

  return (
    <IconButton
      aria-label="copy"
      title="copy to clipboard"
      icon={hasCopied ? <BsClipboardCheck /> : <BsClipboard />}
      size="lg"
      onClick={() => {
        setValue(document.location.href)
        onCopy()
        toast({ title: 'Share link copied' })
      }}
    />
  )
}
const HelpDisclosure = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        title="help"
        aria-label="help"
        icon={<BsQuestionSquare />}
        size="lg"
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Help</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="flex-start">
              <Text>
                ⬆️ Logo is a{' '}
                <a href="https://en.wikipedia.org/wiki/Logo_(programming_language)">
                  programming language
                </a>
                . These are{' '}
                <a
                  href="https://github.com/jondot/logolang.org/wiki/Command-Reference"
                  target="_blank"
                  rel="noreferrer"
                >
                  the supported commands
                </a>
                .
              </Text>
              <Text>
                🕹 <Kbd>shift</Kbd> + drag a number to change it in real-time.
              </Text>
              <br />
              <Text fontWeight="bold"> 🤖 Parents:</Text>{' '}
              <Text>
                This app is not designed to be fluffy. It feels foreign
                by-design: guide your kids through. Part of the magic is to find
                out what it does <em>the hard way</em>, the same way we did in
                the 90s. Oh, here is an{' '}
                <a
                  href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  target="_blank"
                  rel="noreferrer"
                >
                  operating system built in Logo.
                </a>
              </Text>
              <br />
              <Text>
                🎉 For updates follow{' '}
                <a href="https://twitter.com/jondot">@jondot</a>
              </Text>
              <Text>
                🤔 Having an issue?{' '}
                <a href="https://github.com/jondot/logolang.org/issues/new">
                  submit a ticket
                </a>
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
const SettingsDisclosure = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <IconButton
        title="settings"
        aria-label="settings"
        icon={<BsGear />}
        size="lg"
        onClick={onOpen}
      />

      <Settings isOpen={isOpen} onClose={onClose} />
    </>
  )
}

const Toolbar = ({ view, editor }: { view: EditorView; editor: any }) => {
  const langpack = useStore((s) => s.langpack)
  const setResult = useStore((s) => s.setResult)
  const commands = commandsBuilder(langpack)

  return (
    <>
      <HStack overflowX="scroll">
        {['ltfd', 'fd', 'rtfd', 'bk', 'lt', 'rt'].map((k) => (
          <IconButton
            key={k}
            aria-label={commands[k].label}
            title={commands[k].label}
            icon={commands[k].emoji}
            size="lg"
            onClick={() => {
              commands[k].exec(view)

              editor?.scrollTo({
                top: Number.MAX_SAFE_INTEGER,
                behavior: 'smooth',
              })
            }}
          />
        ))}
        <HStack sx={{ pl: '32px' }}>
          {['undo'].map((k) => (
            <IconButton
              key={k}
              title={commands[k].label}
              aria-label={commands[k].label}
              icon={commands[k].emoji}
              size="lg"
              onClick={() => commands[k].exec(view)}
            />
          ))}
        </HStack>
        <HelpDisclosure />

        <Box flex={1} />
        <CopyToClipboard />
        <IconButton
          title="share"
          aria-label="share"
          icon={<BsShare />}
          size="lg"
          onClick={() => {
            const url = `https://twitter.com/share?url=${encodeURIComponent(
              document.location.href
            )}`
            const text = encodeURIComponent('Made this on logolang.org ⬆️➡️⬇️')
            window.open(`${url}&text=${text}`)
          }}
        />

        {['reset'].map((k) => (
          <IconButton
            key={k}
            title={commands[k].label}
            aria-label={commands[k].label}
            icon={commands[k].emoji}
            size="lg"
            onClick={() => {
              if (confirm('Are you sure?')) {
                init()
                setResult({})
                commands[k].exec(view)
              }
            }}
          />
        ))}
        <SettingsDisclosure />
      </HStack>
    </>
  )
}

Toolbar.displayName = 'Toolbar'
Toolbar.whyDidYouRender = true

export default React.memo(Toolbar)
