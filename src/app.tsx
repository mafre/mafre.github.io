import { hot } from 'react-hot-loader/root'
import * as React from 'react'
import GQL from './components/gql'

const App = () => (
	<div>
		<h1>Mathias Fredriksson</h1>
		<GQL />
	</div>
)

export default hot(App)