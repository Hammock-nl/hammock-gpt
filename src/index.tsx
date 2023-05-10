import App from './components/App'
import { AppContainer } from 'react-hot-loader'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons'
import { ThemeProvider } from '@fluentui/react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components'

/* global document, Office, module, require */

initializeIcons()
initializeFileTypeIcons()

let isOfficeInitialized = false

const title = 'HAMMOCK GPT'

const render = (Component) => {
    ReactDOM.render(
        <AppContainer>
            <ThemeProvider>
                <FluentProvider theme={teamsLightTheme}>
                    <Component title={title} isOfficeInitialized={isOfficeInitialized}/>
                </FluentProvider>
            </ThemeProvider>
        </AppContainer>,
        document.getElementById('container'),
    )
}

/* Render application after Office initializes */
Office.onReady(() => {
    isOfficeInitialized = true
    render(App)
})

if ((module as any).hot) {
    (module as any).hot.accept('./components/App', () => {
        const NextApp = require('./components/App').default
        render(NextApp)
    })
}
