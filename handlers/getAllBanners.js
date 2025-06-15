const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({ region: process.env.REGION });

exports.getAllBanners = async (event) => {
	try {
		const tableName = process.env.TABLE_NAME;

		// Scan the DynamoDB table to get all banners
		const scanCommand = new ScanCommand({ TableName: tableName });

		// Execute the scan command to retrieve all banners from the database
		const { Items } = await dynamoDbClient.send(scanCommand);

		// If no items are found, return an empty array
		if (!Items || Items.length === 0) {
			return {
				statusCode: 200,
				body: JSON.stringify({ message: 'No banners found.' }),
			};
		}

		const banners = Items.map((item) => {
			return {
				fileUrl: item.fileUrl.S,
			};
		});

		return {
			statusCode: 200,
			body: JSON.stringify(banners),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Failed to retrieve banners.', details: error.message }),
		};
	}
};
