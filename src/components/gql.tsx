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

const GET_ROCKET_INVENTORY = gql`
	query getRocketInventory($year: Int!) {
		testMessage(year: $year) {
			id
			model
			year
			stock
		}
	}
`;

export default function Test() {
	const { loading, data } = useQuery<RocketInventoryData, RocketInventoryVars>(
		GET_ROCKET_INVENTORY,
		{ variables: {} }
	);
	return (
		<div>
			<h3>Available Inventory</h3>
			{loading ? (
				<p>Loading ...</p>
			) : (
				<table>
					<thead>
						<tr>
						<th>Model</th>
						<th>Stock</th>
						</tr>
					</thead>
					<tbody>

					</tbody>
				</table>
			)}
		</div>
	);
}