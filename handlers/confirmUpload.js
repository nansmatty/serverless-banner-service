const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const dynamoDbClient = new DynamoDBClient({
	region: process.env.REGION,
});

exports.confirmUploadEventTrigger = async (event) => {
	try {
		// Retrieving environment variables for DynamoDB table name and S3 bucket name
		const tableName = process.env.TABLE_NAME;
		const bucketName = process.env.BUCKET_NAME;

		// Extract file details from s3 event notification
		const record = event.Records[0];

		// Extract the file name from the S3 event record
		const fileName = record.s3.object.key;

		// Construct the public url for the uploaded file
		const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;

		// Prepare the file metadata to be stored in DynamoDB
		const fileUploadToDynamoDB = new PutItemCommand({
			TableName: tableName,
			Item: {
				fileName: { S: fileName },
				fileUrl: { S: fileUrl },
				uploadedAt: { S: new Date().toISOString() }, // Store the upload timestamp
			},
		});

		// save file metadata to DynamoDB for tracking and retrieval
		await dynamoDbClient.send(fileUploadToDynamoDB);

		// Return a success response
		return {
			statusCode: 200,
			body: JSON.stringify({
				message: 'File upload confirmed successfully.',
			}),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Failed to confirm upload.', details: error.message }),
		};
	}
};
