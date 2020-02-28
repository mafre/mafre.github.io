import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

interface RocketInventory {
	id: number;
	model: string;
	year: number;
	stock: number;
}

interface RocketInventoryData {}

interface RocketInventoryVars {}

const TEST = gql`
	query test($id: String!) {
		test(id: $id) {
			result
		}
	}
`;

export default function Test() {
	const { loading, data } = useQuery<RocketInventoryData, RocketInventoryVars>(
		TEST,
		{ variables: { id: "test" } }
	);
	console.log(data);
	return (
		<div>
			<h3>Available Inventory</h3>
			{loading ? (
				<p>Loading ...</p>
			) : (
				<div></div>
			)}
		</div>
	);
}