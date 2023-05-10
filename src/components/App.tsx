import * as React from 'react'
import { ReactElement, useEffect, useState } from 'react'
import { Stack, StackItem } from '@fluentui/react'
import {
    Button,
    Field,
    makeStyles,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    MenuPopover,
    MenuTrigger, Spinner,
    Text,
    Textarea,
} from '@fluentui/react-components'
import {
    CommentMultipleCheckmark24Regular,
    EmojiMultiple24Regular,
    Pen24Regular,
    Translate24Regular,
} from '@fluentui/react-icons'
import axios from 'axios'

enum Operation {
    Proofread = 'proofread',
    Translate = 'translate',
    Sentiment = 'change sentiment'
}

const useStyles = makeStyles({
    button: {
        width: '100%',
    },
    textArea: {
        '> textArea': {
            height: '15em',
        },
    },
})

const languages = ['English', 'Dutch', 'French', 'Spanish', 'German', 'Russian']
const sentiments = ['Layman', 'Friendly', 'Formal', 'Informal', 'Assertive', 'Empathetic', 'Sarcastic', 'Emoji']

const getQuery = (op: Operation, param?: string): string => {
    switch (op) {
        case Operation.Translate:
            return `Please translate the following text to ${param}, but keep the source language:`
        case Operation.Sentiment:
            return `Please change the sentiment of the following text to be more ${param}, but keep the source language:`
        case Operation.Proofread:
            return `Please correct and improve the following text in its source language, but don't change the source language:`
    }
}
const transform = (op: Operation, text: string, setTransformation: (transformation: string) => void, param?: string): void => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    }

    const data = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'system',
                'content': getQuery(op, param),
            },
            {
                'role': 'user',
                'content': text,
            },
        ],
    }

    axios.post('https://api.openai.com/v1/chat/completions', data, {headers: headers})
        .then(response => setTransformation(response.data.choices[0].message.content))
}


export default function App(): ReactElement {
    const styles = useStyles()
    const [selection, setSelection] = useState<string>('')
    const [transformation, setTransformation] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const clickButton = (op: Operation, param?: string) => {
        setLoading(true)
        transform(op, selection, setTransformation, param)
    }

    useEffect(() => {
        setLoading(false)
    }, [transformation])

    useEffect(() => {
        const intervalId = setInterval(() => {
            Office.context.mailbox.item.getSelectedDataAsync(Office.CoercionType.Text, result => {
                setSelection(result.value?.data || '')
            })
        }, 100)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    return (
        <Stack tokens={{childrenGap: 'm'}}>
            <Text size={600}>Select any text fragment</Text>
            <Stack tokens={{childrenGap: 's1'}}>
                <StackItem grow>
                    <Button
                        className={styles.button}
                        onClick={() => clickButton(Operation.Proofread)}
                        disabled={!selection || loading}
                        icon={<Pen24Regular/>}
                    >
                        Proofread
                    </Button>
                </StackItem>
                <StackItem grow>
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                            <MenuButton
                                className={styles.button}
                                disabled={!selection || loading}
                                icon={<Translate24Regular/>}
                            >
                                Translate
                            </MenuButton>
                        </MenuTrigger>

                        <MenuPopover>
                            <MenuList>
                                {languages.map(language =>
                                    <MenuItem
                                        key={language}
                                        onClick={() => clickButton(Operation.Translate, language)}
                                    >
                                        {language}
                                    </MenuItem>,
                                )}
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                </StackItem>
                <StackItem grow>
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                            <MenuButton
                                className={styles.button}
                                disabled={!selection || loading}
                                icon={<EmojiMultiple24Regular/>}
                            >
                                Change Sentiment
                            </MenuButton>
                        </MenuTrigger>

                        <MenuPopover>
                            <MenuList>
                                {sentiments.map(sentiment =>
                                    <MenuItem
                                        key={sentiment}
                                        onClick={() => clickButton(Operation.Sentiment, sentiment)}
                                    >
                                        {sentiment}
                                    </MenuItem>,
                                )}
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                </StackItem>
            </Stack>
            {loading &&
                <StackItem>
                    <Spinner labelPosition="below" label="Querying ChatGPT..."/>
                </StackItem>
            }
            {transformation != '' &&
                <StackItem>
                    <Button
                        size="large"
                        appearance="primary"
                        className={styles.button}
                        onClick={() => {
                            Office.context.mailbox.item.body.setSelectedDataAsync(
                                transformation,
                                {coercionType: Office.CoercionType.Text},
                            )
                            setSelection('')
                            setTransformation('')
                        }}
                        icon={<CommentMultipleCheckmark24Regular/>}
                    >
                        Accept transformation
                    </Button>
                </StackItem>
            }
            {transformation == '' &&
                <StackItem>
                    <Field label="Selection">
                        <Textarea
                            value={selection}
                            readOnly size={'small'}
                            resize={'vertical'}
                            className={styles.textArea}
                        />
                    </Field>
                </StackItem>
            }
            {transformation != '' &&
                <StackItem>
                    <Field label="Transformation">
                        <Textarea
                            value={transformation}
                            readOnly size={'small'}
                            resize={'vertical'}
                            className={styles.textArea}
                        />
                    </Field>
                </StackItem>
            }
        </Stack>
    )
}
