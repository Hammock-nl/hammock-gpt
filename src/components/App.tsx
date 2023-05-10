// Import necessary dependencies
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
    MenuTrigger,
    Spinner,
    Text,
    Textarea,
} from '@fluentui/react-components'
import {
    CommentMultipleCheckmark24Regular,
    EmojiMultiple24Regular,
    Pen24Regular,
    Translate24Regular,
} from '@fluentui/react-icons'
import axios from 'axios' // To make HTTP requests

// Define the operations that can be performed on the text
enum Operation {
    Proofread = 'proofread',
    Translate = 'translate',
    Sentiment = 'change sentiment'
}

// Define styles for the component
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

// Define the languages and sentiments that can be used for translation and sentiment change
const languages = ['English', 'Dutch', 'French', 'Spanish', 'German', 'Russian']
const sentiments = ['Layman', 'Friendly', 'Formal', 'Informal', 'Assertive', 'Empathetic', 'Sarcastic', 'Emoji']

// Function to construct the query based on the operation and parameter
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

// Function to perform the transformation operation using OpenAI's API
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

    // Make a POST request to the OpenAI API
    axios.post('https://api.openai.com/v1/chat/completions', data, {headers: headers})
        .then(response => setTransformation(response.data.choices[0].message.content)) // Set the transformation state with the response from the API
}

// Define the main App component
export default function App(): ReactElement {
    const styles = useStyles() // Use the styles defined above
    const [selection, setSelection] = useState<string>('') // State for the selected text
    const [transformation, setTransformation] = useState<string>('') // State for the transformed text
    const [loading, setLoading] = useState<boolean>(false) // State for the loading status

    // Function to handle button click events
    const clickButton = (op: Operation, param?: string) => {
        setLoading(true) // Set loading status to true
        transform(op, selection, setTransformation, param) // Call the transform function with the selected operation, text, transformation state setter, and parameter
    }

    // When the transformation state changes, set loading status to false
    useEffect(() => {
        setLoading(false)
    }, [transformation])

    // When the component mounts, start an interval to get the selected text in the Outlook email every 100ms
    useEffect(() => {
        const intervalId = setInterval(() => {
            Office.context.mailbox.item.getSelectedDataAsync(Office.CoercionType.Text, result => {
                setSelection(result.value?.data || '')
            })
        }, 100)

        // When the component unmounts, clear the interval
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    // Render the component
    return (
        <Stack tokens={{childrenGap: 'm'}}>
            <Text size={600}>Select any text fragment</Text>
            <Stack tokens={{childrenGap: 's1'}}>
                {/* Button to start proofreading operation */}
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
                {/* Dropdown menu to select language for translation */}
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
                {/* Dropdown menu to select sentiment for sentiment change */}
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
            {/* Show spinner when loading */}
            {loading &&
                <StackItem>
                    <Spinner labelPosition="below"
                             label="Querying ChatGPT..."/> {/* Spinner to indicate loading when querying the ChatGPT API */}
                </StackItem>
            }
            {/* Button to accept the transformation*/}
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
                            ) /* Replace the selected text in the Outlook email with the transformed text */
                            setSelection('') /* Reset selection state */
                            setTransformation('') /* Reset transformation state */
                        }}
                        icon={<CommentMultipleCheckmark24Regular/>}
                    >
                        Accept transformation
                    </Button>
                </StackItem>
            }
            {/* Show the selected text when there's no transformation */}
            {transformation == '' &&
                <StackItem>
                    <Field label="Selection">
                        <Textarea
                            value={selection} /* Display the selected text */
                            readOnly /* Make the text area read-only */
                            size={'small'}
                            resize={'vertical'}
                            className={styles.textArea}
                        />
                    </Field>
                </StackItem>
            }
            {/* Show the transformed text when there is a transformation */}
            {transformation != '' &&
                <StackItem>
                    <Field label="Transformation">
                        <Textarea
                            value={transformation} /* Display the transformed text */
                            readOnly /* Make the text area read-only */
                            size={'small'}
                            resize={'vertical'}
                            className={styles.textArea}
                        />
                    </Field>
                </StackItem>
            }
        </Stack>
    )
}
