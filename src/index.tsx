import 'core-js/stable'
import 'regenerator-runtime/runtime'
import * as React from 'react'
import { render } from 'react-dom'
import App from './app'
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

const client = new ApolloClient({
	uri: 'https://mafre-github-io.herokuapp.com',
});

const root = document.createElement('div')
document.body.appendChild(root)

render(<ApolloProvider client={client}>
	<App />
</ApolloProvider>, root)